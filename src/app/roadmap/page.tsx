'use client'

import { Suspense } from 'react'
import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Lock, ArrowRight, Rocket, AlertCircle, Sparkles, MessageCircle, Target } from 'lucide-react'
import type { InterviewAnswers, RoadmapResponse } from '@/types'

const STORAGE_KEY = 'lp_roadmap'
const ANSWERS_KEY = 'lp_answers'

type State = 'loading' | 'preview' | 'error'

function RoadmapContent() {
  const params = useSearchParams()
  const router = useRouter()
  const [state, setState] = useState<State>('loading')
  const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(null)
  const [unlocked, setUnlocked] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [checkingOut, setCheckingOut] = useState(false)
  const fetched = useRef(false)

  useEffect(() => {
    if (fetched.current) return
    fetched.current = true

    const isUnlocked = params.get('unlocked') === 'true'
    setUnlocked(isUnlocked)

    // Try loading cached roadmap first (needed after Stripe redirect)
    const cached = sessionStorage.getItem(STORAGE_KEY)
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as RoadmapResponse
        setRoadmap(parsed)
        setState('preview')
        return
      } catch {
        sessionStorage.removeItem(STORAGE_KEY)
      }
    }

    // Build answers from URL params (first load from interview)
    const answers: Partial<InterviewAnswers> = {}
    params.forEach((val, key) => {
      answers[key as keyof InterviewAnswers] = val
    })

    // Fall back to sessionStorage answers (post-Stripe redirect without cache)
    const storedAnswers = sessionStorage.getItem(ANSWERS_KEY)
    if (!answers.skills && storedAnswers) {
      try {
        Object.assign(answers, JSON.parse(storedAnswers))
      } catch {
        sessionStorage.removeItem(ANSWERS_KEY)
      }
    }

    if (!answers.skills) {
      router.replace('/interview')
      return
    }

    // Persist answers so they survive the Stripe redirect
    sessionStorage.setItem(ANSWERS_KEY, JSON.stringify(answers))

    fetch('/api/generate-roadmap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(answers),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || 'Failed to generate roadmap')
        }
        return res.json() as Promise<RoadmapResponse>
      })
      .then((data) => {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
        setRoadmap(data)
        setState('preview')
      })
      .catch((err) => {
        setErrorMsg(err.message || 'Something went wrong')
        setState('error')
      })
  }, [params, router])

  async function handleUnlock() {
    if (!roadmap) return
    setCheckingOut(true)

    const answers = sessionStorage.getItem(ANSWERS_KEY)
    const email = answers ? (JSON.parse(answers) as Partial<InterviewAnswers>).email : undefined

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, answers: answers ? JSON.parse(answers) : {} }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Checkout failed')
      }
    } catch (err) {
      console.error(err)
      setCheckingOut(false)
      // Fallback: show roadmap anyway (dev/no Stripe key mode)
      setUnlocked(true)
    }
  }

  if (state === 'loading') {
    return (
      <main className="min-h-screen bg-dark flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-accent/20 flex items-center justify-center">
            <Rocket className="w-8 h-8 text-accent animate-bounce" />
          </div>
          <h2 className="text-2xl font-bold text-background mb-3 font-sans">Building your roadmap&hellip;</h2>
          <p className="text-background/60 font-sans">
            Our AI is analyzing your answers and crafting your personalized side hustle plan.
            This takes about 10 seconds.
          </p>
          <div className="mt-8 flex justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2.5 h-2.5 bg-accent rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </main>
    )
  }

  if (state === 'error') {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-accent/10 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-accent" />
          </div>
          <h2 className="text-2xl font-bold text-dark mb-3 font-sans">Something went wrong</h2>
          <p className="text-primary/60 mb-6 font-sans">{errorMsg}</p>
          <Link
            href="/interview"
            className="inline-block bg-accent text-background font-bold px-8 py-3 rounded-xl hover:bg-dark transition-colors font-sans"
          >
            Try again
          </Link>
        </div>
      </main>
    )
  }

  if (!roadmap) return null

  const { preview, full } = roadmap

  return (
    <main className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-primary/10 bg-background/80 backdrop-blur-md px-6 py-4 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-dark tracking-tighter font-sans">
            LaunchPad
          </Link>
          <Link href="/interview" className="text-sm text-accent hover:text-dark transition-colors font-sans font-medium">
            Retake assessment
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-dark mb-2 font-sans">
            Your Side Hustle:{' '}
            <span className="text-accent font-drama italic text-4xl md:text-5xl">{preview.hustleName}</span>
          </h1>
          <p className="text-primary/60 font-sans mt-3">{preview.hustleDescription}</p>
        </div>

        {/* Why it fits */}
        <div className="glass-panel rounded-[2rem] p-6 mb-6">
          <h2 className="font-bold text-dark mb-3 font-sans">Why this fits you</h2>
          <p className="text-dark/70 leading-relaxed font-sans">{preview.whyItFits}</p>
        </div>

        {/* Preview bullets */}
        <div className="bg-primary/5 border border-primary/10 rounded-[2rem] p-6 mb-6">
          <h2 className="font-bold text-dark mb-4 font-sans">Your roadmap preview</h2>
          <ul className="space-y-3">
            {preview.bulletSummary.map((bullet, i) => (
              <li key={i} className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                <span className="text-dark/70 font-sans">{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Full roadmap gate */}
        {!unlocked ? (
          <div className="relative">
            {/* Blurred teaser */}
            <div className="glass-panel rounded-[2rem] p-6 mb-4 blur-sm select-none pointer-events-none">
              <h2 className="font-bold text-dark mb-4 font-sans">Your 30-day action plan</h2>
              <ul className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <li key={i} className="flex gap-3 text-primary/40 text-sm font-sans">
                    <ArrowRight className="w-4 h-4 mt-0.5" />
                    <span>Step {i + 1}: Unlock to see your full plan...</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Unlock CTA */}
            <div className="glass-panel rounded-[2rem] border-2 border-accent/30 shadow-xl p-8 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
                <Lock className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-dark mb-2 font-sans">
                Unlock your full roadmap
              </h3>
              <p className="text-primary/60 text-sm mb-6 font-sans">
                Get your complete 30-day action plan, 90-day income target, and top 3 free resources.
              </p>
              <div className="flex flex-col items-center gap-3">
                <div className="text-4xl font-bold text-dark font-sans">$9<span className="text-lg text-dark/50">.99</span></div>
                <div className="text-primary/40 text-xs font-mono uppercase tracking-widest">One-time &middot; Instant access &middot; No subscription</div>
                <button
                  onClick={handleUnlock}
                  disabled={checkingOut}
                  className="w-full bg-accent hover:bg-dark disabled:opacity-60 text-background font-bold py-4 px-8 rounded-xl text-lg transition-colors shadow-lg font-sans btn relative overflow-hidden"
                >
                  <span className="relative z-10">
                    {checkingOut ? 'Redirecting to checkout\u2026' : 'Get Full Roadmap \u2014 $9.99'}
                  </span>
                  <span className="hover-layer bg-dark"></span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 30-day plan */}
            <div className="glass-panel rounded-[2rem] p-6">
              <h2 className="font-bold text-dark mb-4 font-sans">Your 30-day action plan</h2>
              <ul className="space-y-3">
                {full.first30Days.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <ArrowRight className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                    <span className="text-dark/70 font-sans">{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Income target */}
            <div className="bg-primary text-background rounded-[2rem] p-6">
              <h2 className="font-bold mb-2 font-sans">90-day income target</h2>
              <p className="text-background/80 text-sm font-sans">{full.incomeTarget}</p>
            </div>

            {/* Resources */}
            <div className="glass-panel rounded-[2rem] p-6">
              <h2 className="font-bold text-dark mb-4 font-sans">Top 3 free resources</h2>
              <div className="space-y-4">
                {full.topResources.map((r, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-8 h-8 bg-accent/10 text-accent rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 font-mono">
                      {i + 1}
                    </div>
                    <div>
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-accent hover:text-dark transition-colors font-sans"
                      >
                        {r.name}
                      </a>
                      <p className="text-primary/60 text-sm font-sans">{r.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Go Pro CTA */}
            <div className="bg-accent/5 border-2 border-accent/30 rounded-[2rem] p-8 relative overflow-hidden">
              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-accent" />
                </div>
                <h3 className="text-2xl font-bold text-dark mb-2 font-sans">
                  Ready to <span className="text-accent font-drama italic">actually</span> do this?
                </h3>
                <p className="text-primary/60 font-sans mb-6 max-w-md mx-auto">
                  Your roadmap is the plan. <strong>Pro</strong> gives you an AI coach, daily tasks, and accountability to make it happen.
                </p>

                <div className="flex flex-wrap justify-center gap-4 mb-6 text-sm">
                  <div className="flex items-center gap-2 text-dark/60 font-sans">
                    <Target className="w-4 h-4 text-accent" />
                    Daily tasks
                  </div>
                  <div className="flex items-center gap-2 text-dark/60 font-sans">
                    <MessageCircle className="w-4 h-4 text-accent" />
                    AI coach chat
                  </div>
                  <div className="flex items-center gap-2 text-dark/60 font-sans">
                    <Rocket className="w-4 h-4 text-accent" />
                    Progress tracking
                  </div>
                </div>

                <Link
                  href="/upgrade"
                  className="inline-block bg-accent hover:bg-dark text-background font-bold py-4 px-10 rounded-xl text-lg transition-colors font-sans btn relative overflow-hidden"
                >
                  <span className="relative z-10">Go Pro &mdash; $29/mo</span>
                  <span className="hover-layer bg-dark"></span>
                </Link>
                <p className="text-primary/40 text-xs font-sans mt-3">Cancel anytime. No commitment.</p>
              </div>
            </div>

            {/* Share card */}
            <div className="bg-dark rounded-[2rem] p-8 text-background text-center relative overflow-hidden" id="share-card">
              <div className="relative z-10">
                <Rocket className="w-8 h-8 text-accent mx-auto mb-3" />
                <p className="font-bold text-lg mb-1 font-sans">I found my side hustle in 10 minutes</p>
                <p className="text-background/60 text-sm font-sans">My plan: <strong className="text-accent">{preview.hustleName}</strong></p>
                <p className="text-background/40 text-xs mt-2 font-mono uppercase tracking-widest">LaunchPad &mdash; AI-powered side hustle roadmaps</p>
              </div>
            </div>

            {/* Viral CTA */}
            <div className="border border-primary/10 rounded-[2rem] p-6 text-center">
              <p className="text-primary/60 text-sm mb-3 font-sans">Know someone who needs this?</p>
              <Link
                href="/"
                className="inline-block bg-accent text-background font-semibold px-6 py-3 rounded-xl hover:bg-dark transition-colors text-sm font-sans btn relative overflow-hidden"
              >
                <span className="relative z-10">Get your own roadmap &rarr;</span>
                <span className="hover-layer bg-dark"></span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default function RoadmapPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-dark flex items-center justify-center">
          <div className="text-center">
            <Rocket className="w-10 h-10 text-accent mx-auto mb-4 animate-bounce" />
            <p className="text-background/60 font-sans">Loading&hellip;</p>
          </div>
        </main>
      }
    >
      <RoadmapContent />
    </Suspense>
  )
}
