import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Mood } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { roadmapId, mood, note } = await req.json() as {
      roadmapId: string
      mood: Mood
      note?: string
    }

    if (!roadmapId || !mood) {
      return NextResponse.json({ error: 'roadmapId and mood required' }, { status: 400 })
    }

    const validMoods: Mood[] = ['great', 'okay', 'stuck', 'overwhelmed']
    if (!validMoods.includes(mood)) {
      return NextResponse.json({ error: 'Invalid mood' }, { status: 400 })
    }

    // Calculate current day number
    const { data: roadmap } = await supabase
      .from('roadmaps')
      .select('created_at')
      .eq('id', roadmapId)
      .eq('user_id', user.id)
      .single()

    if (!roadmap) {
      return NextResponse.json({ error: 'Roadmap not found' }, { status: 404 })
    }

    const startDate = new Date(roadmap.created_at)
    const now = new Date()
    const dayNumber = Math.min(30, Math.max(1, Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))))

    // Upsert check-in (one per day per roadmap)
    const { data: checkIn, error } = await supabase
      .from('check_ins')
      .upsert({
        user_id: user.id,
        roadmap_id: roadmapId,
        day_number: dayNumber,
        mood,
        note: note || null,
      }, { onConflict: 'user_id,roadmap_id,day_number' })
      .select()
      .single()

    if (error) {
      // If unique constraint doesn't exist, try insert
      const { data: inserted, error: insertErr } = await supabase
        .from('check_ins')
        .insert({
          user_id: user.id,
          roadmap_id: roadmapId,
          day_number: dayNumber,
          mood,
          note: note || null,
        })
        .select()
        .single()

      if (insertErr) {
        return NextResponse.json({ error: insertErr.message }, { status: 500 })
      }
      return NextResponse.json({ checkIn: inserted })
    }

    return NextResponse.json({ checkIn })
  } catch (err) {
    console.error('Check-in error:', err)
    return NextResponse.json({ error: 'Failed to save check-in' }, { status: 500 })
  }
}
