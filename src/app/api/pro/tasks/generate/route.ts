import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { getAnthropicClient } from '@/lib/anthropic'
import type { TaskGenerationResponse } from '@/types'

// Allow up to 60 seconds for Claude to generate 30 days of tasks
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const { userId: bodyUserId, roadmapId } = await req.json()

    if (!roadmapId) {
      return NextResponse.json({ error: 'Missing roadmapId' }, { status: 400 })
    }

    // Resolve userId: use body value, or fall back to authenticated user
    let userId = bodyUserId
    if (!userId || userId === '_self') {
      const authClient = createClient()
      const { data: { user } } = await authClient.auth.getUser()
      if (!user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
      }
      userId = user.id
    }

    const supabase = createAdminClient()

    // Get the roadmap
    const { data: roadmap, error: rmError } = await supabase
      .from('roadmaps')
      .select('*')
      .eq('id', roadmapId)
      .eq('user_id', userId)
      .single()

    if (rmError || !roadmap) {
      return NextResponse.json({ error: 'Roadmap not found' }, { status: 404 })
    }

    // Check if tasks already exist for this roadmap
    const { count } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('roadmap_id', roadmapId)

    if (count && count > 0) {
      return NextResponse.json({ message: 'Tasks already generated', count })
    }

    const answers = roadmap.answers
    const fullPlan = roadmap.full_plan

    const claude = getAnthropicClient()
    const message = await claude.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 8192,
      messages: [
        {
          role: 'user',
          content: `Given this 30-day side hustle plan for "${roadmap.preview.hustleName}":
${fullPlan.first30Days.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')}

The user has ${answers.hoursPerWeek} available per week and their tech level is ${answers.techLevel}.

Generate exactly 30 days of tasks. Each day should have 2-4 specific, actionable tasks that a non-technical person can understand and complete.

Requirements:
- Tasks should be concrete and specific (not vague like "do research")
- Each task should feel achievable — small wins that build momentum
- Task titles should be motivating ("Set up your free Canva account" not "Create graphics tool account")
- Descriptions should be 1-2 sentences explaining exactly what to do and why it matters
- Progressively build toward the income goal of ${answers.incomeGoal}
- Never assume technical knowledge beyond their stated ${answers.techLevel}

Return ONLY valid JSON, no markdown:
{ "days": [{ "day": 1, "tasks": [{ "title": "...", "description": "..." }] }] }`,
        },
      ],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const cleaned = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
    const generated: TaskGenerationResponse = JSON.parse(cleaned)

    // Insert all tasks into the database
    const tasksToInsert = generated.days.flatMap((day) =>
      day.tasks.map((task) => ({
        roadmap_id: roadmapId,
        user_id: userId,
        day_number: day.day,
        title: task.title,
        description: task.description,
        completed: false,
      }))
    )

    const { error: insertError } = await supabase
      .from('tasks')
      .insert(tasksToInsert)

    if (insertError) {
      console.error('Task insert error:', insertError)
      return NextResponse.json({ error: 'Failed to save tasks' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Tasks generated', count: tasksToInsert.length })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Task generation error:', message, err)
    return NextResponse.json({ error: 'Failed to generate tasks', detail: message }, { status: 500 })
  }
}
