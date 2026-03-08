'use client'

import { Suspense } from 'react'
import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
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
      <main className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-6 animate-bounce">🚀</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Building your roadmap…</h2>
          <p className="text-gray-500">
            Claude AI is analyzing your answers and crafting your personalized side hustle plan.
            This takes about 10 seconds.
          </p>
          <div className="mt-8 flex justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
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
      <main className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-6">😕</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Something went wrong</h2>
          <p className="text-gray-500 mb-6">{errorMsg}</p>
          <Link
            href="/interview"
            className="inline-block bg-green-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-green-700 transition-colors"
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
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 bg-white px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-gray-900">
            Launch<span className="text-green-600">Pad</span>
          </Link>
          <Link href="/interview" className="text-sm text-green-600 hover:underline">
            Retake assessment
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-4xl mb-4">🎯</div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
            Your Side Hustle: <span className="text-green-600">{preview.hustleName}</span>
          </h1>
          <p className="text-gray-500">{preview.hustleDescription}</p>
        </div>

        {/* Why it fits */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="font-bold text-gray-900 mb-3">Why this fits you</h2>
          <p className="text-gray-600 leading-relaxed">{preview.whyItFits}</p>
        </div>

        {/* Preview bullets */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6">
          <h2 className="font-bold text-gray-900 mb-4">Your roadmap preview</h2>
          <ul className="space-y-3">
            {preview.bulletSummary.map((bullet, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-green-600 font-bold mt-0.5">✓</span>
                <span className="text-gray-700">{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Full roadmap gate */}
        {!unlocked ? (
          <div className="relative">
            {/* Blurred teaser */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4 blur-sm select-none pointer-events-none">
              <h2 className="font-bold text-gray-900 mb-4">Your 30-day action plan</h2>
              <ul className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <li key={i} className="flex gap-3 text-gray-500 text-sm">
                    <span>📅</span>
                    <span>Step {i + 1}: Unlock to see your full plan...</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Unlock CTA */}
            <div className="bg-white rounded-2xl border-2 border-green-500 shadow-lg p-8 text-center">
              <div className="text-3xl mb-3">🔓</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Unlock your full roadmap
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                Get your complete 30-day action plan, 90-day income target, and top 3 free resources.
              </p>
              <div className="flex flex-col items-center gap-3">
                <div className="text-3xl font-extrabold text-gray-900">$9.99</div>
                <div className="text-gray-400 text-xs">One-time · Instant access · No subscription</div>
                <button
                  onClick={handleUnlock}
                  disabled={checkingOut}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold py-4 px-8 rounded-xl text-lg transition-colors shadow"
                >
                  {checkingOut ? 'Redirecting to checkout…' : 'Get Full Roadmap — $9.99'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 30-day plan */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-900 mb-4">Your 30-day action plan</h2>
              <ul className="space-y-3">
                {full.first30Days.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="text-green-500 font-bold mt-0.5">→</span>
                    <span className="text-gray-700">{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Income target */}
            <div className="bg-green-600 text-white rounded-2xl p-6">
              <h2 className="font-bold mb-2">90-day income target</h2>
              <p className="text-green-100 text-sm">{full.incomeTarget}</p>
            </div>

            {/* Resources */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-900 mb-4">Top 3 free resources</h2>
              <div className="space-y-4">
                {full.topResources.map((r, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {i + 1}
                    </div>
                    <div>
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-green-700 hover:underline"
                      >
                        {r.name}
                      </a>
                      <p className="text-gray-500 text-sm">{r.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Share card */}
            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-6 text-white text-center" id="share-card">
              <div className="text-2xl mb-2">🚀</div>
              <p className="font-bold text-lg mb-1">I found my side hustle in 10 minutes</p>
              <p className="text-green-200 text-sm mb-1">My plan: <strong className="text-white">{preview.hustleName}</strong></p>
              <p className="text-green-300 text-xs">LaunchPad — AI-powered side hustle roadmaps</p>
            </div>

            {/* Viral CTA */}
            <div className="border border-gray-200 rounded-2xl p-6 text-center">
              <p className="text-gray-500 text-sm mb-3">Know someone who needs this?</p>
              <Link
                href="/"
                className="inline-block bg-green-600 text-white font-semibold px-6 py-2 rounded-xl hover:bg-green-700 transition-colors text-sm"
              >
                Get your own roadmap →
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
        <main className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center">
          <div className="text-center">
            <div className="text-5xl mb-4 animate-bounce">🚀</div>
            <p className="text-gray-500">Loading…</p>
          </div>
        </main>
      }
    >
      <RoadmapContent />
    </Suspense>
  )
}
