'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export default function UpgradePoller() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [polling, setPolling] = useState(false)

  const upgraded = searchParams.get('upgraded')

  useEffect(() => {
    if (upgraded !== 'true') return

    setPolling(true)
    let attempts = 0
    const maxAttempts = 20 // ~20 seconds

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const interval = setInterval(async () => {
      attempts++

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('tier')
        .eq('id', user.id)
        .single()

      if (profile?.tier === 'pro' || attempts >= maxAttempts) {
        clearInterval(interval)
        setPolling(false)
        // Hard refresh to re-render the server component with the new tier
        router.replace('/dashboard')
        router.refresh()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [upgraded, router])

  if (!polling) return null

  return (
    <div className="mt-8">
      <div className="glass-panel rounded-2xl p-8 border border-primary/10 text-center">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <h2 className="font-sans font-bold text-xl text-dark">
            Activating your Pro account...
          </h2>
        </div>
        <p className="font-sans text-dark/60">
          Payment received! Setting up your dashboard — this takes just a moment.
        </p>
      </div>
    </div>
  )
}
