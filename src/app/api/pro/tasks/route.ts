import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/pro/tasks?roadmapId=...&day=...
export async function GET(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const roadmapId = searchParams.get('roadmapId')
    const day = searchParams.get('day')

    if (!roadmapId) {
      return NextResponse.json({ error: 'roadmapId required' }, { status: 400 })
    }

    let query = supabase
      .from('tasks')
      .select('*')
      .eq('roadmap_id', roadmapId)
      .eq('user_id', user.id)
      .order('day_number', { ascending: true })
      .order('created_at', { ascending: true })

    if (day) {
      query = query.eq('day_number', parseInt(day))
    }

    const { data: tasks, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ tasks })
  } catch (err) {
    console.error('Tasks fetch error:', err)
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}

// PATCH /api/pro/tasks — toggle task completion
export async function PATCH(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { taskId, completed } = await req.json()

    if (!taskId || typeof completed !== 'boolean') {
      return NextResponse.json({ error: 'taskId and completed required' }, { status: 400 })
    }

    const { data: task, error } = await supabase
      .from('tasks')
      .update({
        completed,
        completed_at: completed ? new Date().toISOString() : null,
      })
      .eq('id', taskId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ task })
  } catch (err) {
    console.error('Task update error:', err)
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}
