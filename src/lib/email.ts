import { Resend } from 'resend'

function getResend() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured')
  }
  return new Resend(process.env.RESEND_API_KEY)
}

const FROM = process.env.RESEND_FROM_EMAIL || 'HustlUp <noreply@hustlup.io>'

const ACCOUNTABILITY_EMAILS: { day: number; subject: string; body: string }[] = [
  {
    day: 1,
    subject: 'Day 1 check-in: did you complete Step 1 of your roadmap?',
    body: `Hey,

Yesterday you unlocked your HustlUp roadmap — that was the first step.

Today is about action. Your roadmap starts with Day 1–3. Did you complete it?

If you haven't started yet, now is the time. The hardest part is starting.

Open your roadmap and do one thing today.

— HustlUp`,
  },
  {
    day: 2,
    subject: 'Day 2: keep the momentum going',
    body: `Hey,

Two days in. Your 30-day goal is within reach — but only if you keep moving.

A quick reminder of why you started: you're building toward a real income goal. Every step compounds.

What's your one action for today?

— HustlUp`,
  },
  {
    day: 3,
    subject: 'Day 3: how to push through the obstacles',
    body: `Hey,

Day 3 is when most people hit their first wall. The initial excitement fades, and the work feels harder than expected.

Here's what actually works: don't try to do everything at once. Focus on just one task from your roadmap today.

Small, consistent actions beat bursts of effort every time.

You've got this.

— HustlUp`,
  },
  {
    day: 4,
    subject: 'Day 4: someone with your profile made it work',
    body: `Hey,

People start side hustles every day with the same skills, hours, and goals as you.

The ones who succeed share one trait: they keep going when it gets boring. Not when it gets hard — when it gets boring.

Your roadmap is your edge. Trust the plan.

— HustlUp`,
  },
  {
    day: 5,
    subject: "Day 5: halfway there — how's your progress?",
    body: `Hey,

You're 5 days into your roadmap. Halfway through the first phase.

Take 2 minutes today to check in:
- What have you completed so far?
- What's the one thing still holding you back?
- What's your plan for the next 5 days?

Honest reflection is how you accelerate.

— HustlUp`,
  },
  {
    day: 6,
    subject: 'Day 6: your income milestone is closer than you think',
    body: `Hey,

Your 90-day income target isn't a fantasy — it's a plan.

The people who hit their targets don't have more talent. They have more consistency.

You've been at this for 6 days. That's 6 days more than most people who say "I should start a side hustle."

Keep going. The milestone is real.

— HustlUp`,
  },
]

export async function sendPurchaseConfirmation({
  email,
  hustleName,
  roadmapUrl,
}: {
  email: string
  hustleName: string
  roadmapUrl: string
}) {
  const resend = getResend()

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Your HustlUp Roadmap is Ready 🚀',
    text: `Hey,

Your side hustle roadmap is ready.

Your recommended hustle: ${hustleName}

Access your full roadmap here:
${roadmapUrl}

Start with Step 1 in your 30-day action plan today. The sooner you begin, the sooner you see results.

— HustlUp`,
  })
}

export async function scheduleAccountabilitySeries({
  email,
  purchasedAt,
}: {
  email: string
  purchasedAt: Date
}) {
  const resend = getResend()

  await Promise.allSettled(
    ACCOUNTABILITY_EMAILS.map(({ day, subject, body }) => {
      const sendAt = new Date(purchasedAt)
      sendAt.setDate(sendAt.getDate() + day)
      sendAt.setHours(9, 0, 0, 0) // 9am on the day

      return resend.emails.send({
        from: FROM,
        to: email,
        subject,
        text: body,
        scheduledAt: sendAt.toISOString(),
      })
    })
  )
}
