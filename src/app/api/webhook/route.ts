import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'
import { sendPurchaseConfirmation, scheduleAccountabilitySeries } from '@/lib/email'

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-02-25.clover',
  })
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('[Webhook] STRIPE_WEBHOOK_SECRET not configured')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  const stripe = getStripe()
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const email = session.customer_email || session.metadata?.email
    const sessionId = session.id
    const purchasedAt = new Date(session.created * 1000)

    console.log(`[Webhook] Payment completed for ${email}, session: ${sessionId}`)

    if (email && process.env.RESEND_API_KEY) {
      const origin = process.env.NEXT_PUBLIC_BASE_URL || 'https://launchpad.app'
      const roadmapUrl = `${origin}/roadmap?session_id=${sessionId}&unlocked=true`

      // Decode answers from metadata to get hustle name (best effort)
      let hustleName = 'your side hustle'
      if (session.metadata?.answers) {
        try {
          const answers = JSON.parse(
            Buffer.from(session.metadata.answers, 'base64').toString('utf-8')
          )
          if (answers.skills) hustleName = `your ${answers.passion || answers.skills}-based hustle`
        } catch {
          // ignore
        }
      }

      await Promise.allSettled([
        sendPurchaseConfirmation({ email, hustleName, roadmapUrl }),
        scheduleAccountabilitySeries({ email, purchasedAt }),
      ])
    } else {
      console.log(`[Webhook] Email skipped — no RESEND_API_KEY or email address`)
    }
  }

  return NextResponse.json({ received: true })
}
