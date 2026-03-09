'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { Rocket, Mail, ArrowLeft, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function LoginContent() {
  const params = useSearchParams()
  const redirect = params.get('redirect') || '/dashboard'
  const authError = params.get('error')

  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(authError === 'auth_failed' ? 'Login failed. Please try again.' : '')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return

    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: authErr } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback?redirect=${redirect}`,
      },
    })

    if (authErr) {
      setError(authErr.message)
      setLoading(false)
    } else {
      setSent(true)
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="max-w-sm w-full text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent/10 flex items-center justify-center">
            <Mail className="w-10 h-10 text-accent" />
          </div>
          <h1 className="text-3xl font-bold text-dark mb-3 font-sans">Check your inbox</h1>
          <p className="text-primary/60 font-sans mb-2">
            We sent a magic link to
          </p>
          <p className="text-accent font-bold font-sans mb-6">{email}</p>
          <p className="text-primary/40 text-sm font-sans mb-8">
            Click the link in your email to sign in. No password needed!
          </p>
          <button
            onClick={() => { setSent(false); setEmail('') }}
            className="text-accent hover:text-dark font-medium font-sans transition-colors text-sm"
          >
            Use a different email
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <nav className="border-b border-primary/10 bg-background/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-xl mx-auto flex items-center justify-between">
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
        <div className="max-w-sm w-full">
          {/* Icon */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-accent" />
            </div>
            <h1 className="text-3xl font-bold text-dark mb-2 font-sans">Welcome back</h1>
            <p className="text-primary/60 font-sans">
              Sign in to access your Pro dashboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dark mb-2 font-sans">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full border border-primary/20 bg-white/50 backdrop-blur-md px-5 py-4 text-dark text-base font-sans focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/30 transition-all placeholder:text-primary/40 rounded-xl"
              />
            </div>

            {error && (
              <p className="text-accent text-sm font-sans">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full bg-accent hover:bg-dark disabled:opacity-50 text-background font-bold py-4 px-6 rounded-xl transition-colors font-sans btn relative overflow-hidden text-lg"
            >
              <span className="relative z-10">
                {loading ? 'Sending magic link\u2026' : 'Send me a magic link'}
              </span>
              <span className="hover-layer bg-dark"></span>
            </button>
          </form>

          <p className="text-center text-primary/40 text-xs font-sans mt-6">
            No password needed. We&apos;ll email you a secure sign-in link.
          </p>

          {/* Sign up prompt */}
          <div className="mt-10 pt-6 border-t border-primary/10 text-center">
            <p className="text-primary/50 text-sm font-sans mb-3">Don&apos;t have an account yet?</p>
            <Link
              href="/interview"
              className="inline-flex items-center gap-2 bg-dark text-background font-semibold px-6 py-3 rounded-xl hover:bg-primary transition-colors text-sm font-sans btn relative overflow-hidden"
            >
              <Rocket className="w-4 h-4" />
              <span className="relative z-10">Find your side hustle first</span>
              <span className="hover-layer bg-primary"></span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Rocket className="w-10 h-10 text-accent animate-bounce" />
      </main>
    }>
      <LoginContent />
    </Suspense>
  )
}
