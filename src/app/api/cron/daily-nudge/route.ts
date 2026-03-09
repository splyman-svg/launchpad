import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase/server'

const MOTIVATIONAL_LINES = [
  "You're building something most people only dream about.",
  "Every task you check off is proof you're serious about this.",
  "The hardest part was starting — you already did that.",
  "Consistency beats talent every single time. You've got this.",
  "Today's tasks are small. But they compound into something huge.",
  "You're not just doing tasks — you're building a business.",
  "Most people quit by now. You're still here. That says everything.",
  "One day at a time. One task at a time. That's how empires are built.",
  "Your future self will thank you for showing up today.",
  "The momentum you're building right now? It's unstoppable.",
]

function getMotivationalLine(dayNumber: number): string {
  return MOTIVATIONAL_LINES[dayNumber % MOTIVATIONAL_LINES.length]
}

function getSubjectLine(dayNumber: number, hustleName: string): string {
  const subjects: Record<number, string> = {
    1: `Day 1: Let's kick off your ${hustleName} journey!`,
    7: `One week in! You're doing amazing`,
    14: `Two weeks strong — the momentum is real`,
    21: `Three weeks! The finish line is in sight`,
    30: `Day 30! You did it! Time to celebrate`,
  }
  return subjects[dayNumber] || `Day ${dayNumber}: Your ${hustleName} tasks are ready`
}

export async function GET(req: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const from = process.env.RESEND_FROM_EMAIL || 'HustlUp <noreply@hustlup.io>'
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hustlup.io'
  const supabase = createAdminClient()

  try {
    // Get all active Pro users with active roadmaps
    const { data: proUsers } = await supabase
      .from('profiles')
      .select('id, email, display_name')
      .eq('tier', 'pro')

    if (!proUsers || proUsers.length === 0) {
      return NextResponse.json({ message: 'No Pro users to notify', sent: 0 })
    }

    let sent = 0
    const errors: string[] = []

    for (const user of proUsers) {
      try {
        // Get their active roadmap
        const { data: roadmap } = await supabase
          .from('roadmaps')
          .select('id, created_at, preview')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (!roadmap) continue

        // Calculate current day
        const startDate = new Date(roadmap.created_at)
        const now = new Date()
        const dayNumber = Math.min(30, Math.max(1, Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))))

        // Skip if past day 30
        if (dayNumber > 30) continue

        // Get today's tasks
        const { data: tasks } = await supabase
          .from('tasks')
          .select('title, completed')
          .eq('roadmap_id', roadmap.id)
          .eq('user_id', user.id)
          .eq('day_number', dayNumber)

        if (!tasks || tasks.length === 0) continue

        // Get streak
        const { data: allTasks } = await supabase
          .from('tasks')
          .select('day_number, completed')
          .eq('roadmap_id', roadmap.id)
          .eq('user_id', user.id)

        let streak = 0
        if (allTasks) {
          for (let d = dayNumber - 1; d >= 1; d--) {
            const dayTasks = allTasks.filter(t => t.day_number === d)
            if (dayTasks.length > 0 && dayTasks.every(t => t.completed)) {
              streak++
            } else {
              break
            }
          }
        }

        const firstName = user.display_name?.split(' ')[0] || user.email?.split('@')[0] || 'there'
        const hustleName = roadmap.preview?.hustleName || 'your side hustle'
        const incompleteTasks = tasks.filter(t => !t.completed)

        const taskList = incompleteTasks.length > 0
          ? incompleteTasks.map(t => `  ▫️ ${t.title}`).join('\n')
          : '  ✅ All tasks already done! You\'re ahead of the game!'

        const streakText = streak > 0 ? ` You're on a ${streak}-day streak! 🔥` : ''

        const emailBody = `Hey ${firstName}! 👋

It's Day ${dayNumber} of your ${hustleName} journey!${streakText}

Here's what's on your plate today:

${taskList}

${getMotivationalLine(dayNumber)}

→ Open your dashboard: ${baseUrl}/dashboard

You've got this!
Your HustlUp AI Coach`

        await resend.emails.send({
          from,
          to: user.email,
          subject: getSubjectLine(dayNumber, hustleName),
          text: emailBody,
        })

        sent++
      } catch (err) {
        errors.push(`${user.email}: ${(err as Error).message}`)
      }
    }

    return NextResponse.json({
      message: `Daily nudge sent to ${sent} Pro users`,
      sent,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (err) {
    console.error('Daily nudge error:', err)
    return NextResponse.json({ error: 'Failed to send daily nudges' }, { status: 500 })
  }
}
