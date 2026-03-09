'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Sparkles, CheckCircle2, ArrowRight, Rocket,
  MessageCircle, Target, TrendingUp, Clock, Zap
} from 'lucide-react'

const PRO_FEATURES = [
  {
    icon: Target,
    title: '30 Daily Task Plans',
    description: 'AI breaks your roadmap into bite-sized daily tasks you can actually complete',
  },
  {
    icon: MessageCircle,
    title: 'AI Coach Chat',
    description: 'Your personal coach who knows your hustle, your progress, and exactly what to say',
  },
  {
    icon: TrendingUp,
    title: 'Progress Tracking',
    description: 'Visual dashboard with streaks, completion stats, and milestone celebrations',
  },
  {
    icon: Clock,
    title: 'Daily Nudge Emails',
    description: 'Wake up every morning knowing exactly what to do — delivered to your inbox',
  },
  {
    icon: Zap,
    title: 'Adaptive Coaching',
    description: 'Feeling stuck? Your coach adapts and helps you find a way through',
  },
  {
    icon: Sparkles,
    title: 'Mood Check-ins',
    description: 'Track how you feel and get personalized support based on your energy',
  },
]

export default function UpgradePage() {
  const [loading, setLoading] = useState(false)

  async function handleUpgrade() {
    setLoading(true)
    try {
      const res = await fetch('/api/pro/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Failed')
      }
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-primary/10 bg-background/80 backdrop-blur-md px-6 py-4 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-dark tracking-tighter font-sans">
            HustlUp
          </Link>
          <Link href="/login" className="text-sm text-accent hover:text-dark transition-colors font-sans font-medium">
            Sign in
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent/10 flex items-center justify-center">
            <Rocket className="w-10 h-10 text-accent" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-dark mb-4 font-sans">
            Go <span className="text-accent font-drama italic text-5xl md:text-6xl">Pro</span>
          </h1>
          <p className="text-lg text-primary/60 font-sans max-w-md mx-auto">
            Your roadmap showed you the path. Pro gives you an AI coach to walk it with you — every single day.
          </p>
        </div>

        {/* What you get free vs Pro */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Free */}
          <div className="glass-panel rounded-2xl p-6">
            <h3 className="font-bold text-dark mb-1 font-sans">Free Roadmap</h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-bold text-dark font-sans">$0</span>
              <span className="text-sm text-primary/40 font-sans ml-1">forever</span>
            </div>
            <p className="text-sm text-dark/50 font-sans mb-4">You already have this!</p>
            <ul className="space-y-3">
              {['AI-generated side hustle match', 'Full 30-day action plan', '90-day income target', 'Top 3 curated resources'].map((item) => (
                <li key={item} className="flex gap-2 text-sm text-dark/60 font-sans">
                  <CheckCircle2 className="w-4 h-4 text-primary/30 mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Pro */}
          <div className="bg-dark rounded-2xl p-6 text-background relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <span className="bg-accent text-background text-xs font-bold px-3 py-1 rounded-full font-sans inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> POPULAR
              </span>
            </div>
            <h3 className="font-bold mb-1 font-sans">Pro Coach</h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-bold font-sans">$29</span>
              <span className="text-background/50 font-sans">/mo</span>
            </div>
            <ul className="space-y-3">
              {[
                'Everything in Free',
                'Deep-dive onboarding with your AI coach',
                'AI coach that knows your hustle',
                'Daily tasks broken down for you',
                'Progress tracking & streaks',
                'Daily motivation emails',
                'Mood check-ins & adaptive support',
              ].map((item) => (
                <li key={item} className="flex gap-2 text-sm text-background/80 font-sans">
                  <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full mt-6 bg-accent hover:bg-background hover:text-dark disabled:opacity-50 text-background font-bold py-4 px-8 rounded-xl text-lg transition-all font-sans"
            >
              {loading ? 'Setting up checkout...' : 'Go Pro — $29/mo'}
            </button>
            <p className="text-center text-background/40 text-xs font-sans mt-3">
              Cancel anytime. No commitment.
            </p>
          </div>
        </div>

        {/* Feature details */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-dark text-center mb-8 font-sans">
            What you get with <span className="text-accent font-drama italic">Pro</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {PRO_FEATURES.map((feature) => (
              <div key={feature.title} className="glass-panel rounded-2xl p-5 flex gap-4">
                <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-bold text-dark text-sm font-sans">{feature.title}</h3>
                  <p className="text-xs text-primary/50 font-sans mt-1">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Social proof / Bottom CTA */}
        <div className="bg-accent/5 border border-accent/20 rounded-2xl p-8 text-center">
          <p className="text-lg font-bold text-dark font-sans mb-2">
            Most people quit their side hustle in the first week.
          </p>
          <p className="text-primary/60 font-sans mb-6">
            Pro users don&apos;t — because they have a coach keeping them accountable every single day.
          </p>
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="bg-accent hover:bg-dark disabled:opacity-50 text-background font-bold py-4 px-10 rounded-xl text-lg transition-colors font-sans inline-flex items-center gap-2 btn relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              {loading ? 'Setting up...' : 'Get Pro Coach'}
              <ArrowRight className="w-5 h-5" />
            </span>
            <span className="hover-layer bg-dark"></span>
          </button>
        </div>
      </div>
    </main>
  )
}
