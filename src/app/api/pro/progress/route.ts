import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { DashboardProgress, Mood } from '@/types'

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get active roadmap
    const { data: roadmap } = await supabase
      .from('roadmaps')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!roadmap) {
      return NextResponse.json({ error: 'No active roadmap found' }, { status: 404 })
    }

    // Get profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // Get all tasks for this roadmap
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('roadmap_id', roadmap.id)
      .eq('user_id', user.id)

    // Get today's check-in
    const startDate = new Date(roadmap.created_at)
    const now = new Date()
    const currentDay = Math.min(30, Math.max(1, Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))))

    const { data: todayCheckIn } = await supabase
      .from('check_ins')
      .select('mood')
      .eq('roadmap_id', roadmap.id)
      .eq('user_id', user.id)
      .eq('day_number', currentDay)
      .single()

    const allTasks = tasks || []
    const completedTasks = allTasks.filter(t => t.completed).length
    const totalTasks = allTasks.length

    // Calculate streak (consecutive days with all tasks completed, counting back from current day)
    let streak = 0
    for (let d = currentDay; d >= 1; d--) {
      const dayTasks = allTasks.filter(t => t.day_number === d)
      if (dayTasks.length > 0 && dayTasks.every(t => t.completed)) {
        streak++
      } else {
        break
      }
    }

    const firstName = profile?.display_name?.split(' ')[0] ||
      profile?.email?.split('@')[0] || 'there'

    const progress: DashboardProgress = {
      currentDay,
      totalTasks,
      completedTasks,
      completionPercent: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      streak,
      todayCheckedIn: !!todayCheckIn,
      todayMood: (todayCheckIn?.mood as Mood) || null,
      hustleName: roadmap.preview.hustleName,
      roadmapId: roadmap.id,
      firstName,
    }

    return NextResponse.json(progress)
  } catch (err) {
    console.error('Progress error:', err)
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 })
  }
}
