import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAnthropicClient } from '@/lib/anthropic'

export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { message, roadmapId } = await req.json()

    if (!message || !roadmapId) {
      return NextResponse.json({ error: 'message and roadmapId required' }, { status: 400 })
    }

    // Get roadmap, profile, tasks, and check-ins in parallel
    const [roadmapRes, profileRes, tasksRes, checkInsRes, historyRes] = await Promise.all([
      supabase.from('roadmaps').select('*').eq('id', roadmapId).eq('user_id', user.id).single(),
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('tasks').select('*').eq('roadmap_id', roadmapId).eq('user_id', user.id),
      supabase.from('check_ins').select('*').eq('roadmap_id', roadmapId).eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
      supabase.from('chat_messages').select('*').eq('roadmap_id', roadmapId).eq('user_id', user.id).order('created_at', { ascending: true }).limit(20),
    ])

    if (!roadmapRes.data) {
      return NextResponse.json({ error: 'Roadmap not found' }, { status: 404 })
    }

    const roadmap = roadmapRes.data
    const profile = profileRes.data
    const tasks = tasksRes.data || []
    const checkIns = checkInsRes.data || []
    const history = historyRes.data || []

    // Calculate progress
    const completedTasks = tasks.filter((t) => t.completed).length
    const totalTasks = tasks.length
    const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    // Calculate streak
    const completedDays = new Set(tasks.filter(t => t.completed).map(t => t.day_number))
    let streak = 0
    const startDate = new Date(roadmap.created_at)
    const now = new Date()
    const currentDay = Math.min(30, Math.max(1, Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))))

    for (let d = currentDay; d >= 1; d--) {
      const dayTasks = tasks.filter(t => t.day_number === d)
      if (dayTasks.length > 0 && dayTasks.every(t => t.completed)) {
        streak++
      } else {
        break
      }
    }

    // Determine if behind or ahead
    const expectedCompleted = Math.floor((currentDay / 30) * totalTasks)
    const status = completedTasks >= expectedCompleted ? 'on track or ahead' : 'behind schedule'

    const firstName = profile?.display_name?.split(' ')[0] ||
      profile?.email?.split('@')[0] || 'there'

    const todayCheckIn = checkIns.find(c => c.day_number === currentDay)

    // Build system prompt with full context
    const systemPrompt = `You are the HustlUp AI Coach — a supportive, inspiring, and energetic guide helping ${firstName} build their "${roadmap.preview.hustleName}" side hustle.

VOICE & TONE:
- You are their biggest fan. Celebrate every win, no matter how small.
- Be warm, friendly, and conversational — like a smart best friend who happens to be great at business.
- NEVER talk down to them. NEVER use jargon. NEVER assume technical knowledge.
- If they missed tasks or fell behind: "No stress — life happens. Let's figure out how to get back on track. You've got this."
- If they completed tasks: "YES! You're building real momentum. Keep that energy going."
- Always end with forward momentum — what's next, why it matters, how it connects to their bigger goal.
- Use their first name. Keep it personal.
- Short, punchy responses. 2-3 paragraphs max. Use line breaks for readability.

CONTEXT:
Profile: ${roadmap.answers.skills} skills, ${roadmap.answers.hoursPerWeek} hours/week, ${roadmap.answers.incomeGoal} goal, ${roadmap.answers.riskTolerance} risk tolerance, ${roadmap.answers.techLevel} tech level.

Their side hustle: ${roadmap.preview.hustleName} — ${roadmap.preview.hustleDescription}

Their 30-day plan:
${roadmap.full_plan.first30Days.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')}

Current progress:
- Day ${currentDay} of 30
- Tasks completed: ${completedTasks}/${totalTasks} (${percentage}%)
- Current streak: ${streak} days
- Today's mood: ${todayCheckIn?.mood || 'not checked in yet'}
- Status: ${status}

Recent check-ins:
${checkIns.slice(0, 3).map(c => `Day ${c.day_number}: ${c.mood}${c.note ? ` — "${c.note}"` : ''}`).join('\n') || 'None yet'}

RULES:
- Give specific, actionable advice tied to THEIR plan and hustle
- If they're stuck, break the current task into tiny steps they can do RIGHT NOW
- Reference their specific hustle "${roadmap.preview.hustleName}" by name — make it personal
- Never suggest they need skills they don't have (their tech level is ${roadmap.answers.techLevel})
- If they ask something outside your scope, be honest but encouraging`

    // Detect if this is the very first message (Pro onboarding)
    const isFirstMessage = history.length === 0

    // Build message history for context
    const messages: { role: 'user' | 'assistant'; content: string }[] = history.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))
    messages.push({ role: 'user', content: message })

    // If first message, enhance system prompt with onboarding instructions
    const onboardingAddendum = isFirstMessage ? `

ONBOARDING MODE — THIS IS YOUR FIRST CONVERSATION WITH ${firstName.toUpperCase()}:
This is the moment to make them feel like signing up for Pro was the best decision they've made.
Your job in this first response is to:
1. Welcome them warmly by name — make them feel like a VIP, not a customer
2. Acknowledge their hustle choice ("${roadmap.preview.hustleName}") and get genuinely excited about it
3. Ask 2-3 thoughtful follow-up questions to understand them DEEPER than the initial quiz:
   - What specifically drew them to this hustle? Is there a personal story?
   - What's their biggest fear or concern about actually doing this?
   - Do they have any existing audience, network, or assets that could give them a head start?
   - What does "success" look like for them at the end of 30 days — beyond just money?
4. Let them know you'll use their answers to personalize their entire coaching experience
5. Keep it conversational and warm — this should feel like meeting a mentor for coffee, not filling out a form

DO NOT just dump all the questions at once — weave them naturally into your welcome message.
Make them feel SEEN and HEARD. This is the conversation that turns a subscriber into a believer.` : ''

    // Save user message to DB
    await supabase.from('chat_messages').insert({
      user_id: user.id,
      roadmap_id: roadmapId,
      role: 'user',
      content: message,
    })

    // Call Claude
    const claude = getAnthropicClient()
    const response = await claude.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: isFirstMessage ? 2048 : 1024,
      system: systemPrompt + onboardingAddendum,
      messages,
    })

    const assistantMessage = response.content[0].type === 'text' ? response.content[0].text : ''

    // Save assistant message to DB
    await supabase.from('chat_messages').insert({
      user_id: user.id,
      roadmap_id: roadmapId,
      role: 'assistant',
      content: assistantMessage,
    })

    return NextResponse.json({ message: assistantMessage })
  } catch (err) {
    console.error('Chat error:', err)
    return NextResponse.json({ error: 'Failed to get coach response' }, { status: 500 })
  }
}
