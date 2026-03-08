'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
    placeholder: 'e.g. writing, coding, teaching, design, cooking…',
  },
  {
    key: 'hoursPerWeek',
    question: "How many hours per week can you dedicate to a side hustle?",
    type: 'radio',
    options: ['< 5 hours', '5–10 hours', '10–20 hours', '20+ hours'],
  },
  {
    key: 'incomeGoal',
    question: "What's your income goal in the next 90 days?",
    type: 'radio',
    options: ['< $500', '$500–$2,000', '$2,000–$5,000', '$5,000+'],
  },
  {
    key: 'contentComfort',
    question: "How comfortable are you creating content (writing, video, social)?",
    type: 'radio',
    options: ['1 — Not at all', '2 — A little', '3 — Somewhat', '4 — Quite comfortable', '5 — Love it'],
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
    options: ['None yet', 'Under 1,000', '1,000–10,000', '10,000+'],
  },
  {
    key: 'passion',
    question: "What industry or topic are you most passionate about?",
    type: 'text',
    placeholder: 'e.g. fitness, personal finance, travel, cooking, gaming…',
  },
  {
    key: 'riskTolerance',
    question: "What's your risk tolerance?",
    type: 'radio',
    options: [
      'Low — I need income fast',
      'Medium — I can invest a few months',
      'High — I\'m playing the long game',
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
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-white flex flex-col">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100 bg-white">
        <div className="max-w-xl mx-auto flex items-center gap-4">
          <span className="text-lg font-bold text-gray-900">
            Launch<span className="text-green-600">Pad</span>
          </span>
          <div className="flex-1">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Step {step + 1} of {TOTAL}</span>
              <span>{Math.round((step / TOTAL) * 100)}% complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-xl w-full">
          <div className="text-sm font-semibold text-green-600 mb-3">
            Question {step + 1} of {TOTAL}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">{q.question}</h2>

          {(q.type === 'text' || q.type === 'email') && (
            <input
              type={q.type}
              value={current}
              onChange={(e) => handleSelect(e.target.value)}
              placeholder={q.placeholder}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              onKeyDown={(e) => e.key === 'Enter' && handleNext()}
            />
          )}

          {q.type === 'radio' && q.options && (
            <div className="flex flex-col gap-3">
              {q.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleSelect(opt)}
                  className={`w-full text-left px-5 py-4 rounded-xl border-2 font-medium transition-all ${
                    current === opt
                      ? 'border-green-500 bg-green-50 text-green-800'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-green-300'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          {/* Nav */}
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <button
                onClick={handleBack}
                className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                ← Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-colors disabled:opacity-50"
            >
              {loading
                ? 'Generating your roadmap…'
                : step === TOTAL - 1
                ? 'Generate My Roadmap →'
                : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
