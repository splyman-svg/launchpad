'use client'

interface StreakCounterProps {
  streak: number
}

export default function StreakCounter({ streak }: StreakCounterProps) {
  // Flame grows with streak
  const flameSize = streak >= 14 ? 'text-4xl' : streak >= 7 ? 'text-3xl' : streak >= 3 ? 'text-2xl' : 'text-xl'
  const glowClass = streak >= 7 ? 'animate-pulse' : ''

  if (streak === 0) {
    return (
      <div className="flex items-center gap-2 bg-primary/5 rounded-xl px-4 py-3">
        <span className="text-xl">💪</span>
        <div>
          <p className="text-sm font-bold text-dark font-sans">Start your streak!</p>
          <p className="text-xs text-primary/50 font-sans">Complete today&apos;s tasks to begin</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 bg-accent/5 border border-accent/20 rounded-xl px-4 py-3">
      <span className={`${flameSize} ${glowClass}`} role="img" aria-label="fire">
        🔥
      </span>
      <div>
        <p className="text-lg font-bold text-dark font-sans">
          {streak} day{streak !== 1 ? 's' : ''} streak!
        </p>
        <p className="text-xs text-primary/50 font-sans">
          {streak >= 14
            ? 'Unstoppable! You\'re on fire!'
            : streak >= 7
            ? 'One whole week — incredible!'
            : streak >= 3
            ? 'Building real momentum!'
            : 'Great start — keep it going!'}
        </p>
      </div>
    </div>
  )
}
