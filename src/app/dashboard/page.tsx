import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import UpgradePoller from '@/components/pro/UpgradePoller'
import ProDashboardClient from '@/components/pro/ProDashboardClient'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/dashboard')
  }

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // If no profile exists yet, create one
  if (!profile) {
    await supabase.from('profiles').insert({
      id: user.id,
      email: user.email,
      tier: 'free',
    })
  }

  const tier = profile?.tier || 'free'
  const firstName = user.email?.split('@')[0] || 'there'
  const justUpgraded = params.upgraded === 'true'

  // Get time-of-day greeting
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <main className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-primary/10 bg-background/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-dark tracking-tighter font-sans">
            HustlUp
          </Link>
          <div className="flex items-center gap-4">
            {tier === 'pro' && (
              <span className="bg-accent text-background text-[10px] font-mono font-bold px-3 py-1 rounded-full">
                PRO
              </span>
            )}
            <form action="/api/auth/signout" method="POST">
              <button type="submit" className="text-sm text-primary/50 hover:text-accent transition-colors font-sans">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="font-sans font-bold text-3xl text-dark mb-2">
          {greeting}, {firstName}!
        </h1>

        {tier === 'pro' ? (
          <ProDashboardClient firstName={firstName} />
        ) : justUpgraded ? (
          <Suspense fallback={null}>
            <UpgradePoller />
          </Suspense>
        ) : (
          <div className="mt-8">
            <div className="glass-panel rounded-2xl p-8 border border-primary/10 text-center">
              <h2 className="font-sans font-bold text-xl text-dark mb-3">
                Ready to go Pro?
              </h2>
              <p className="font-sans text-dark/60 mb-6 max-w-md mx-auto">
                Get an AI coach, daily tasks, progress tracking, and motivation emails —
                all personalized to your hustle.
              </p>
              <Link
                href="/upgrade"
                className="inline-flex items-center gap-2 bg-accent hover:bg-dark text-background font-bold py-3 px-8 rounded-full transition-colors font-sans"
              >
                Upgrade to Pro — $29/mo
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
