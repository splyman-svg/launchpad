import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'

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
    const { email, answers } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const stripe = getStripe()
    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    // Encode answers as a base64 string to pass through Stripe metadata
    const answersEncoded = Buffer.from(JSON.stringify(answers || {})).toString('base64')

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'HustlUp Full Roadmap',
              description: 'Your personalized 30-day side hustle action plan, 90-day income target, and top resources.',
            },
            unit_amount: 999, // $9.99
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: email,
      metadata: {
        email,
        answers: answersEncoded.slice(0, 500), // Stripe metadata limit
      },
      success_url: `${origin}/roadmap?session_id={CHECKOUT_SESSION_ID}&unlocked=true`,
      cancel_url: `${origin}/roadmap`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
