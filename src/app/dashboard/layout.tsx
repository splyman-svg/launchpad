import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/dashboard')
  }

  // Check if user is Pro
  const { data: profile } = await supabase
    .from('profiles')
    .select('tier')
    .eq('id', user.id)
    .single()

  if (!profile || profile.tier !== 'pro') {
    redirect('/upgrade')
  }

  return <>{children}</>
}
