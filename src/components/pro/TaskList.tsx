'use client'

import { useState } from 'react'
import { CheckCircle2, Circle, Sparkles } from 'lucide-react'
import type { Task } from '@/types'

interface TaskListProps {
  tasks: Task[]
  onToggle: (taskId: string, completed: boolean) => void
  dayNumber: number
}

export default function TaskList({ tasks, onToggle, dayNumber }: TaskListProps) {
  const [celebrating, setCelebrating] = useState(false)
  const allComplete = tasks.length > 0 && tasks.every(t => t.completed)
  const completedCount = tasks.filter(t => t.completed).length

  async function handleToggle(taskId: string, currentCompleted: boolean) {
    const newCompleted = !currentCompleted
    onToggle(taskId, newCompleted)

    // Check if all tasks are now complete
    const wouldBeComplete = tasks.every(t =>
      t.id === taskId ? newCompleted : t.completed
    )
    if (wouldBeComplete && !allComplete) {
      setCelebrating(true)
      setTimeout(() => setCelebrating(false), 3000)
    }
  }

  if (tasks.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-6 text-center">
        <p className="text-primary/50 font-sans">No tasks for Day {dayNumber} yet.</p>
        <p className="text-primary/40 text-sm font-sans mt-1">Tasks are being generated...</p>
      </div>
    )
  }

  return (
    <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
      {/* Celebration overlay */}
      {celebrating && (
        <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center bg-accent/5 animate-pulse">
          <div className="text-center">
            <Sparkles className="w-12 h-12 text-accent mx-auto mb-2 animate-bounce" />
            <p className="text-xl font-bold text-accent font-sans">All tasks done! 🎉</p>
            <p className="text-sm text-dark/60 font-sans">You&apos;re crushing it!</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-dark font-sans">
          Day {dayNumber} Tasks
        </h3>
        <span className="text-sm font-mono text-primary/50">
          {completedCount}/{tasks.length} done
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-primary/10 rounded-full h-2 mb-5">
        <div
          className="bg-accent h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0}%` }}
        />
      </div>

      <ul className="space-y-3">
        {tasks.map((task) => (
          <li key={task.id}>
            <button
              onClick={() => handleToggle(task.id, task.completed)}
              className={`w-full text-left flex gap-3 p-4 rounded-xl border-2 transition-all duration-300 group ${
                task.completed
                  ? 'border-accent/20 bg-accent/5'
                  : 'border-primary/10 bg-white/50 hover:border-accent/30 hover:bg-white/80'
              }`}
            >
              <div className="mt-0.5 flex-shrink-0">
                {task.completed ? (
                  <CheckCircle2 className="w-6 h-6 text-accent" />
                ) : (
                  <Circle className="w-6 h-6 text-primary/30 group-hover:text-accent/50 transition-colors" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold font-sans text-sm ${
                  task.completed ? 'text-dark/40 line-through' : 'text-dark'
                }`}>
                  {task.title}
                </p>
                <p className={`text-xs mt-1 font-sans ${
                  task.completed ? 'text-primary/30' : 'text-primary/50'
                }`}>
                  {task.description}
                </p>
              </div>
            </button>
          </li>
        ))}
      </ul>

      {allComplete && !celebrating && (
        <div className="mt-4 bg-accent/10 rounded-xl p-4 text-center">
          <p className="text-sm font-bold text-accent font-sans">
            ✨ Day {dayNumber} complete! You&apos;re building something real.
          </p>
        </div>
      )}
    </div>
  )
}
