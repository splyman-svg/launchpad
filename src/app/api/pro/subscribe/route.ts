import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-02-25.clover',
  })
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { roadmapId } = await req.json()
    const stripe = getStripe()
    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    // Check if user already has a Stripe customer ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    let customerId = profile?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      })
      customerId = customer.id

      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    // Create or get the Pro subscription price
    const priceId = process.env.STRIPE_PRO_PRICE_ID

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      metadata: {
        supabase_user_id: user.id,
        roadmap_id: roadmapId || '',
      },
      success_url: `${origin}/dashboard?subscribed=true`,
      cancel_url: `${origin}/upgrade`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Pro subscription error:', err)
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 })
  }
}
