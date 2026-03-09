'use client'

interface DayNavigatorProps {
  currentDay: number
  selectedDay: number
  onSelectDay: (day: number) => void
  completedDays: Set<number>
}

export default function DayNavigator({ currentDay, selectedDay, onSelectDay, completedDays }: DayNavigatorProps) {
  // Show a window of 7 days centered around selectedDay
  const start = Math.max(1, selectedDay - 3)
  const end = Math.min(30, start + 6)
  const days = Array.from({ length: end - start + 1 }, (_, i) => start + i)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-dark font-sans">Day {selectedDay} of 30</h3>
        <div className="flex gap-1">
          <button
            onClick={() => onSelectDay(Math.max(1, selectedDay - 1))}
            disabled={selectedDay <= 1}
            className="w-8 h-8 rounded-lg bg-primary/5 hover:bg-primary/10 disabled:opacity-30 flex items-center justify-center text-dark transition-colors"
          >
            &larr;
          </button>
          <button
            onClick={() => onSelectDay(Math.min(30, selectedDay + 1))}
            disabled={selectedDay >= 30}
            className="w-8 h-8 rounded-lg bg-primary/5 hover:bg-primary/10 disabled:opacity-30 flex items-center justify-center text-dark transition-colors"
          >
            &rarr;
          </button>
        </div>
      </div>

      <div className="flex gap-1.5 justify-center">
        {days.map((day) => {
          const isSelected = day === selectedDay
          const isCurrent = day === currentDay
          const isCompleted = completedDays.has(day)
          const isFuture = day > currentDay

          return (
            <button
              key={day}
              onClick={() => onSelectDay(day)}
              className={`relative w-10 h-10 rounded-xl text-sm font-bold font-sans transition-all duration-300 ${
                isSelected
                  ? 'bg-accent text-background shadow-lg scale-110'
                  : isCompleted
                  ? 'bg-accent/20 text-accent hover:bg-accent/30'
                  : isCurrent
                  ? 'bg-dark text-background'
                  : isFuture
                  ? 'bg-primary/5 text-primary/30'
                  : 'bg-primary/10 text-dark/50 hover:bg-primary/20'
              }`}
            >
              {day}
              {isCompleted && !isSelected && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full flex items-center justify-center">
                  <span className="text-[8px] text-background">✓</span>
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Quick jump */}
      <div className="flex gap-2 justify-center mt-1">
        {[1, 7, 14, 21, 30].map((day) => (
          <button
            key={day}
            onClick={() => onSelectDay(day)}
            className={`text-xs font-mono px-2 py-1 rounded-md transition-colors ${
              selectedDay === day
                ? 'text-accent font-bold'
                : 'text-primary/40 hover:text-primary/60'
            }`}
          >
            {day === 1 ? 'Start' : day === 30 ? 'End' : `D${day}`}
          </button>
        ))}
      </div>
    </div>
  )
}
