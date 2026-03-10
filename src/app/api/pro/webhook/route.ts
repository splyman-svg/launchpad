import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_PRO_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createAdminClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.mode !== 'subscription') break

      const userId = session.metadata?.supabase_user_id
      if (!userId) break

      // Activate Pro tier
      await supabase
        .from('profiles')
        .update({
          tier: 'pro',
          stripe_customer_id: session.customer as string,
        })
        .eq('id', userId)

      // Save subscription record (period_end updated by subscription.updated events)
      await supabase.from('subscriptions').upsert({
        user_id: userId,
        stripe_subscription_id: session.subscription as string,
        status: 'active',
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      }, { onConflict: 'user_id' })

      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription & { current_period_end?: number }
      const userId = sub.metadata?.supabase_user_id
      if (!userId) break

      const status = sub.status === 'active' ? 'active'
        : sub.status === 'past_due' ? 'past_due'
        : 'canceled'

      const updateData: Record<string, string> = { status }
      if (sub.current_period_end) {
        updateData.current_period_end = new Date(sub.current_period_end * 1000).toISOString()
      }

      await supabase
        .from('subscriptions')
        .update(updateData)
        .eq('user_id', userId)

      if (sub.status === 'canceled' || sub.cancel_at_period_end) {
        await supabase
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('user_id', userId)
      }

      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const userId = subscription.metadata?.supabase_user_id
      if (!userId) break

      await supabase
        .from('profiles')
        .update({ tier: 'one_time' })
        .eq('id', userId)

      await supabase
        .from('subscriptions')
        .update({ status: 'canceled' })
        .eq('user_id', userId)

      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice & { subscription?: string }
      const subscriptionId = invoice.subscription
      if (!subscriptionId) break

      const { data: sub } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('stripe_subscription_id', subscriptionId)
        .single()

      if (sub) {
        await supabase
          .from('subscriptions')
          .update({ status: 'past_due' })
          .eq('user_id', sub.user_id)
      }

      break
    }
  }

  return NextResponse.json({ received: true })
}
