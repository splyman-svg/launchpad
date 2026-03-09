import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-02-25.clover',
  })
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!
  const webhookSecret = process.env.STRIPE_PRO_WEBHOOK_SECRET!

  let event: Stripe.Event

  try {
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createAdminClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode !== 'subscription') break

        const userId = session.metadata?.supabase_user_id
        const subscriptionId = session.subscription as string

        if (!userId) break

        // Get subscription details
        const stripe = getStripe()
        const subResponse = await stripe.subscriptions.retrieve(subscriptionId)
        const subData = subResponse as unknown as { current_period_end: number }

        // Upsert subscription record
        await supabase.from('subscriptions').upsert({
          user_id: userId,
          stripe_subscription_id: subscriptionId,
          status: 'active',
          current_period_end: new Date(subData.current_period_end * 1000).toISOString(),
        }, { onConflict: 'user_id' })

        // Upgrade user tier
        await supabase
          .from('profiles')
          .update({ tier: 'pro', updated_at: new Date().toISOString() })
          .eq('id', userId)

        // Generate tasks if roadmap exists
        const roadmapId = session.metadata?.roadmap_id
        if (roadmapId) {
          // Trigger task generation asynchronously
          const origin = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
          fetch(`${origin}/api/pro/tasks/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, roadmapId }),
          }).catch(console.error) // Fire and forget
        }
        break
      }

      case 'customer.subscription.updated': {
        const subObj = event.data.object as unknown as {
          customer: string; status: string; current_period_end: number
        }
        const customerId = subObj.customer

        // Find user by stripe customer ID
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (!profile) break

        const status = subObj.status === 'active' ? 'active'
          : subObj.status === 'past_due' ? 'past_due'
          : 'canceled'

        await supabase.from('subscriptions').update({
          status,
          current_period_end: new Date(subObj.current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        }).eq('user_id', profile.id)

        // If canceled, downgrade tier
        if (status === 'canceled') {
          await supabase
            .from('profiles')
            .update({ tier: 'one_time', updated_at: new Date().toISOString() })
            .eq('id', profile.id)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const delSub = event.data.object as unknown as { customer: string }
        const customerId = delSub.customer

        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (!profile) break

        await supabase.from('subscriptions').update({
          status: 'canceled',
          updated_at: new Date().toISOString(),
        }).eq('user_id', profile.id)

        await supabase
          .from('profiles')
          .update({ tier: 'one_time', updated_at: new Date().toISOString() })
          .eq('id', profile.id)
        break
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
