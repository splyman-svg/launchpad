import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const roadmapId = searchParams.get('roadmapId')

    if (!roadmapId) {
      return NextResponse.json({ error: 'roadmapId required' }, { status: 400 })
    }

    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('roadmap_id', roadmapId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(50)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ messages })
  } catch (err) {
    console.error('Chat history error:', err)
    return NextResponse.json({ error: 'Failed to fetch chat history' }, { status: 500 })
  }
}
