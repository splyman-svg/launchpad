'use client'

import { useState } from 'react'
import type { Mood } from '@/types'

interface DailyCheckInProps {
  onCheckIn: (mood: Mood, note?: string) => void
  currentMood: Mood | null
  isCheckedIn: boolean
}

const MOODS: { value: Mood; emoji: string; label: string; color: string }[] = [
  { value: 'great', emoji: '🚀', label: 'Crushing it!', color: 'border-green-400 bg-green-50' },
  { value: 'okay', emoji: '👍', label: 'Doing okay', color: 'border-blue-400 bg-blue-50' },
  { value: 'stuck', emoji: '🤔', label: 'Feeling stuck', color: 'border-yellow-400 bg-yellow-50' },
  { value: 'overwhelmed', emoji: '😤', label: 'Overwhelmed', color: 'border-red-400 bg-red-50' },
]

export default function DailyCheckIn({ onCheckIn, currentMood, isCheckedIn }: DailyCheckInProps) {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(currentMood)
  const [note, setNote] = useState('')
  const [submitted, setSubmitted] = useState(isCheckedIn)

  function handleSubmit() {
    if (!selectedMood) return
    onCheckIn(selectedMood, note || undefined)
    setSubmitted(true)
  }

  if (submitted && currentMood) {
    const mood = MOODS.find(m => m.value === currentMood)
    return (
      <div className="glass-panel rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{mood?.emoji}</span>
          <div>
            <p className="text-sm font-bold text-dark font-sans">Checked in today!</p>
            <p className="text-xs text-primary/50 font-sans">
              {currentMood === 'great' && "You're on fire! Keep that energy going!"}
              {currentMood === 'okay' && "Solid! Every day you show up counts."}
              {currentMood === 'stuck' && "It's normal — talk to your AI coach for ideas!"}
              {currentMood === 'overwhelmed' && "Take a breath. Your coach is here to help."}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-panel rounded-2xl p-5">
      <h3 className="font-bold text-dark mb-3 font-sans text-sm">How are you feeling today?</h3>

      <div className="grid grid-cols-2 gap-2 mb-3">
        {MOODS.map((mood) => (
          <button
            key={mood.value}
            onClick={() => setSelectedMood(mood.value)}
            className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left ${
              selectedMood === mood.value
                ? `${mood.color} shadow-md scale-[1.02]`
                : 'border-primary/10 bg-white/50 hover:border-primary/20'
            }`}
          >
            <span className="text-xl">{mood.emoji}</span>
            <span className="text-xs font-medium text-dark font-sans">{mood.label}</span>
          </button>
        ))}
      </div>

      {selectedMood && (
        <>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Quick note (optional)..."
            className="w-full border border-primary/10 bg-white/50 px-3 py-2 text-sm text-dark font-sans rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30 placeholder:text-primary/30 mb-3"
          />
          <button
            onClick={handleSubmit}
            className="w-full bg-accent hover:bg-dark text-background font-bold py-2.5 px-4 rounded-xl transition-colors font-sans text-sm btn relative overflow-hidden"
          >
            <span className="relative z-10">Check in</span>
            <span className="hover-layer bg-dark"></span>
          </button>
        </>
      )}
    </div>
  )
}
