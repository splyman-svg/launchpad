import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (!profile?.stripe_customer_id) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 })
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-02-25.clover',
    })

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${origin}/dashboard`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Portal error:', err)
    return NextResponse.json({ error: 'Failed to create portal session' }, { status: 500 })
  }
}
