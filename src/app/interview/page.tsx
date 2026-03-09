'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { InterviewAnswers } from '@/types'

type AnswerKey = keyof InterviewAnswers

const QUESTIONS: {
  key: AnswerKey
  question: string
  type: 'text' | 'email' | 'radio' | 'slider'
  options?: string[]
  placeholder?: string
  min?: number
  max?: number
}[] = [
  {
    key: 'skills',
    question: "What are your top 3 skills?",
    type: 'text',
    placeholder: 'e.g. writing, coding, teaching, design, cooking\u2026',
  },
  {
    key: 'hoursPerWeek',
    question: "How many hours per week can you dedicate to a side hustle?",
    type: 'radio',
    options: ['< 5 hours', '5\u201310 hours', '10\u201320 hours', '20+ hours'],
  },
  {
    key: 'incomeGoal',
    question: "What\u2019s your income goal in the next 90 days?",
    type: 'radio',
    options: ['< $500', '$500\u2013$2,000', '$2,000\u2013$5,000', '$5,000+'],
  },
  {
    key: 'contentComfort',
    question: "How comfortable are you creating content (writing, video, social)?",
    type: 'radio',
    options: ['1 \u2014 Not at all', '2 \u2014 A little', '3 \u2014 Somewhat', '4 \u2014 Quite comfortable', '5 \u2014 Love it'],
  },
  {
    key: 'workStyle',
    question: "Do you prefer working with people or independently?",
    type: 'radio',
    options: ['With people', 'Alone', 'Either works for me'],
  },
  {
    key: 'techLevel',
    question: "How would you describe your tech comfort level?",
    type: 'radio',
    options: ['Beginner', 'Intermediate', 'Advanced'],
  },
  {
    key: 'audience',
    question: "Do you already have an online audience or followers?",
    type: 'radio',
    options: ['None yet', 'Under 1,000', '1,000\u201310,000', '10,000+'],
  },
  {
    key: 'passion',
    question: "What industry or topic are you most passionate about?",
    type: 'text',
    placeholder: 'e.g. fitness, personal finance, travel, cooking, gaming\u2026',
  },
  {
    key: 'riskTolerance',
    question: "What\u2019s your risk tolerance?",
    type: 'radio',
    options: [
      'Low \u2014 I need income fast',
      'Medium \u2014 I can invest a few months',
      'High \u2014 I\'m playing the long game',
    ],
  },
  {
    key: 'email',
    question: "Last one! Where should we send your roadmap?",
    type: 'email',
    placeholder: 'you@example.com',
  },
]

const TOTAL = QUESTIONS.length

export default function InterviewPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Partial<InterviewAnswers>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const q = QUESTIONS[step]
  const current = answers[q.key] ?? ''
  const progress = ((step) / TOTAL) * 100

  function handleSelect(val: string) {
    setAnswers((prev) => ({ ...prev, [q.key]: val }))
    setError('')
  }

  function handleNext() {
    if (!current.trim()) {
      setError('Please answer before continuing.')
      return
    }
    if (step < TOTAL - 1) {
      setStep((s) => s + 1)
      setError('')
    } else {
      handleSubmit()
    }
  }

  function handleBack() {
    if (step > 0) {
      setStep((s) => s - 1)
      setError('')
    }
  }

  async function handleSubmit() {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      Object.entries(answers).forEach(([k, v]) => {
        if (v) params.set(k, v)
      })
      router.push(`/roadmap?${params.toString()}`)
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="px-6 py-5 border-b border-primary/10 bg-background/80 backdrop-blur-md">
        <div className="max-w-xl mx-auto flex items-center gap-4">
          <Link href="/" className="text-lg font-bold text-dark tracking-tighter font-sans">
            HustlUp
          </Link>
          <div className="flex-1">
            <div className="flex justify-between text-xs text-primary/50 mb-1 font-mono">
              <span>Step {step + 1} of {TOTAL}</span>
              <span>{Math.round((step / TOTAL) * 100)}% complete</span>
            </div>
            <div className="w-full bg-primary/10 rounded-full h-1.5">
              <div
                className="bg-accent h-1.5 rounded-full transition-all duration-500 ease-in-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-xl w-full">
          <div className="text-sm font-semibold text-accent mb-3 font-mono uppercase tracking-widest">
            Question {step + 1} of {TOTAL}
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-dark mb-8 font-sans">{q.question}</h2>

          {(q.type === 'text' || q.type === 'email') && (
            <input
              type={q.type}
              value={current}
              onChange={(e) => handleSelect(e.target.value)}
              placeholder={q.placeholder}
              className="w-full border border-primary/20 rounded-2rem bg-white/50 backdrop-blur-md px-5 py-4 text-dark text-base font-sans focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/30 transition-all placeholder:text-primary/40"
              style={{ borderRadius: '1rem' }}
              onKeyDown={(e) => e.key === 'Enter' && handleNext()}
            />
          )}

          {q.type === 'radio' && q.options && (
            <div className="flex flex-col gap-3">
              {q.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleSelect(opt)}
                  className={`w-full text-left px-5 py-4 rounded-xl border-2 font-medium font-sans transition-all duration-300 ${
                    current === opt
                      ? 'border-accent bg-accent/10 text-dark shadow-md'
                      : 'border-primary/10 bg-white/50 text-dark/70 hover:border-accent/30 hover:bg-white/80'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {error && <p className="mt-3 text-sm text-accent font-sans">{error}</p>}

          {/* Nav */}
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <button
                onClick={handleBack}
                className="px-6 py-3 rounded-xl border border-primary/20 text-primary font-medium font-sans hover:bg-primary/5 transition-colors"
              >
                &larr; Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={loading}
              className="flex-1 bg-accent hover:bg-dark text-background font-bold py-3 px-6 rounded-xl transition-colors disabled:opacity-50 font-sans btn relative overflow-hidden"
            >
              <span className="relative z-10">
                {loading
                  ? 'Generating your roadmap\u2026'
                  : step === TOTAL - 1
                  ? 'Generate My Roadmap \u2192'
                  : 'Next \u2192'}
              </span>
              <span className="hover-layer bg-dark"></span>
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
