import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { answers, preview, full_plan } = await req.json()

    if (!answers || !preview || !full_plan) {
      return NextResponse.json({ error: 'answers, preview, and full_plan required' }, { status: 400 })
    }

    // Deactivate any existing active roadmaps
    await supabase
      .from('roadmaps')
      .update({ is_active: false })
      .eq('user_id', user.id)
      .eq('is_active', true)

    // Insert the new roadmap
    const { data: roadmap, error } = await supabase
      .from('roadmaps')
      .insert({
        user_id: user.id,
        answers,
        preview,
        full_plan,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      console.error('Roadmap save error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ roadmap })
  } catch (err) {
    console.error('Roadmap save error:', err)
    return NextResponse.json({ error: 'Failed to save roadmap' }, { status: 500 })
  }
}
