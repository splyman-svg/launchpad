'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { CheckCircle2, Sparkles, ArrowLeft, Rocket, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function UpgradeContent() {
  const params = useSearchParams()
  const canceled = params.get('canceled')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleUpgrade() {
    setLoading(true)
    setError('')

    // Check if user is logged in
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      // Redirect to login, then come back to upgrade
      window.location.href = '/login?redirect=/upgrade'
      return
    }

    try {
      const res = await fetch('/api/pro/subscribe', { method: 'POST' })
      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || 'Something went wrong')
        setLoading(false)
      }
    } catch {
      setError('Failed to start checkout')
      setLoading(false)
    }
  }

  const proFeatures = [
    'Everything in the free roadmap',
    'Deep-dive onboarding session',
    'AI coach that knows your hustle',
    'Daily tasks broken down for you',
    'Progress tracking & streaks',
    'Daily motivation emails',
    'Mood check-ins & adaptive support',
  ]

  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <nav className="border-b border-primary/10 bg-background/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-dark tracking-tighter font-sans">
            HustlUp
          </Link>
          <Link href="/" className="flex items-center gap-1 text-sm text-primary/50 hover:text-accent transition-colors font-sans">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-lg w-full">
          {canceled && (
            <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 mb-8 text-center">
              <p className="text-dark font-sans text-sm">No worries — you can upgrade whenever you&apos;re ready.</p>
            </div>
          )}

          {/* Pro Card */}
          <div className="bg-dark rounded-[2rem] p-8 md:p-10 text-background relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-accent text-background text-[10px] font-mono font-bold px-3 py-1 rounded-full inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> PRO
            </div>

            <div className="mb-8">
              <h1 className="font-sans font-bold text-3xl md:text-4xl mb-3">Level up your hustle</h1>
              <p className="font-sans text-background/60">
                Your AI coach walks you through the plan — every single day.
              </p>
            </div>

            <div className="flex items-baseline gap-1 mb-8">
              <span className="font-sans font-bold text-5xl">$29</span>
              <span className="text-background/50 text-lg font-sans">/mo</span>
            </div>

            <ul className="flex flex-col gap-3 mb-8">
              {proFeatures.map((item) => (
                <li key={item} className="flex items-start gap-3 text-background/80 text-sm font-sans">
                  <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            {error && (
              <p className="text-accent text-sm font-sans mb-4">{error}</p>
            )}

            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full bg-accent hover:bg-background hover:text-dark disabled:opacity-50 text-background font-bold py-4 px-6 rounded-full transition-all font-sans text-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Setting up checkout...
                </>
              ) : (
                <>
                  <Rocket className="w-5 h-5" />
                  Go Pro — $29/mo
                </>
              )}
            </button>

            <p className="text-center text-background/30 text-xs font-sans mt-4">
              Cancel anytime. No commitment. 100% secure checkout via Stripe.
            </p>
          </div>

          {/* Free option */}
          <div className="text-center mt-8">
            <p className="text-primary/50 text-sm font-sans">
              Not ready yet?{' '}
              <Link href="/interview" className="text-accent hover:text-dark transition-colors font-medium">
                Get your free roadmap first
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function UpgradePage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Rocket className="w-10 h-10 text-accent animate-bounce" />
      </main>
    }>
      <UpgradeContent />
    </Suspense>
  )
}
