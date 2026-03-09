'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Rocket, Settings, LogOut, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import ProgressRing from '@/components/pro/ProgressRing'
import StreakCounter from '@/components/pro/StreakCounter'
import DayNavigator from '@/components/pro/DayNavigator'
import TaskList from '@/components/pro/TaskList'
import DailyCheckIn from '@/components/pro/DailyCheckIn'
import ChatPanel from '@/components/pro/ChatPanel'
import ProBadge from '@/components/pro/ProBadge'
import type { DashboardProgress, Task, ChatMessage, Mood } from '@/types'

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function getMotivationalLine(day: number, percent: number, streak: number): string {
  if (day === 1) return "Day 1 — this is where it all begins. Let's go!"
  if (percent === 100) return "Every single task done. You're a machine! 🏆"
  if (streak >= 14) return `${streak} days straight — you're unstoppable!`
  if (streak >= 7) return "A full week of hustle. That's real commitment!"
  if (percent >= 75) return "Almost there — you're in the home stretch!"
  if (percent >= 50) return "Halfway through — the momentum is building!"
  if (day >= 21) return "Week 4 — the finish line is in sight!"
  if (day >= 14) return "Two weeks in — you're doing something most people never will."
  if (day >= 7) return "One week down — you're already ahead of 90% of people."
  return "Every task you complete is a step toward your goal."
}

export default function DashboardPage() {
  const [progress, setProgress] = useState<DashboardProgress | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [selectedDay, setSelectedDay] = useState(1)
  const [loading, setLoading] = useState(true)
  const [chatLoading, setChatLoading] = useState(false)
  const [completedDays, setCompletedDays] = useState<Set<number>>(new Set())

  // Fetch dashboard progress
  useEffect(() => {
    async function loadProgress() {
      try {
        const res = await fetch('/api/pro/progress')
        if (!res.ok) throw new Error('Failed to load')
        const data: DashboardProgress = await res.json()
        setProgress(data)
        setSelectedDay(data.currentDay)

        // Load chat history
        const chatRes = await fetch(`/api/pro/chat/history?roadmapId=${data.roadmapId}`)
        if (chatRes.ok) {
          const chatData = await chatRes.json()
          setChatMessages(chatData.messages || [])
        }

        // Load all tasks to find completed days
        const allTasksRes = await fetch(`/api/pro/tasks?roadmapId=${data.roadmapId}`)
        if (allTasksRes.ok) {
          const allTasksData = await allTasksRes.json()
          const allTasks: Task[] = allTasksData.tasks || []

          // Calculate completed days
          const dayMap = new Map<number, Task[]>()
          allTasks.forEach(t => {
            if (!dayMap.has(t.day_number)) dayMap.set(t.day_number, [])
            dayMap.get(t.day_number)!.push(t)
          })
          const completed = new Set<number>()
          dayMap.forEach((dayTasks, dayNum) => {
            if (dayTasks.every(t => t.completed)) completed.add(dayNum)
          })
          setCompletedDays(completed)
        }
      } catch (err) {
        console.error('Dashboard load error:', err)
      } finally {
        setLoading(false)
      }
    }
    loadProgress()
  }, [])

  // Fetch tasks when day changes
  useEffect(() => {
    if (!progress?.roadmapId) return
    async function loadTasks() {
      const res = await fetch(`/api/pro/tasks?roadmapId=${progress!.roadmapId}&day=${selectedDay}`)
      if (res.ok) {
        const data = await res.json()
        setTasks(data.tasks || [])
      }
    }
    loadTasks()
  }, [selectedDay, progress?.roadmapId])

  const handleTaskToggle = useCallback(async (taskId: string, completed: boolean) => {
    // Optimistic update
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, completed, completed_at: completed ? new Date().toISOString() : null } : t
    ))

    try {
      await fetch('/api/pro/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, completed }),
      })

      // Update completed days
      setCompletedDays(prev => {
        const next = new Set(prev)
        // Re-check this day
        const updatedTasks = tasks.map(t =>
          t.id === taskId ? { ...t, completed } : t
        )
        if (updatedTasks.every(t => t.completed)) {
          next.add(selectedDay)
        } else {
          next.delete(selectedDay)
        }
        return next
      })

      // Refresh progress
      const res = await fetch('/api/pro/progress')
      if (res.ok) setProgress(await res.json())
    } catch (err) {
      console.error('Task toggle error:', err)
      // Revert on error
      setTasks(prev => prev.map(t =>
        t.id === taskId ? { ...t, completed: !completed } : t
      ))
    }
  }, [tasks, selectedDay])

  const handleCheckIn = useCallback(async (mood: Mood, note?: string) => {
    if (!progress?.roadmapId) return
    try {
      await fetch('/api/pro/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roadmapId: progress.roadmapId, mood, note }),
      })
      setProgress(prev => prev ? { ...prev, todayCheckedIn: true, todayMood: mood } : prev)
    } catch (err) {
      console.error('Check-in error:', err)
    }
  }, [progress?.roadmapId])

  const handleChatSend = useCallback(async (message: string) => {
    if (!progress?.roadmapId) return

    // Optimistic: add user message
    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      user_id: '',
      roadmap_id: progress.roadmapId,
      role: 'user',
      content: message,
      created_at: new Date().toISOString(),
    }
    setChatMessages(prev => [...prev, tempUserMsg])
    setChatLoading(true)

    try {
      const res = await fetch('/api/pro/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, roadmapId: progress.roadmapId }),
      })
      const data = await res.json()

      const assistantMsg: ChatMessage = {
        id: `temp-${Date.now()}-resp`,
        user_id: '',
        roadmap_id: progress.roadmapId,
        role: 'assistant',
        content: data.message || 'Sorry, I had trouble responding. Try again!',
        created_at: new Date().toISOString(),
      }
      setChatMessages(prev => [...prev, assistantMsg])
    } catch {
      const errorMsg: ChatMessage = {
        id: `temp-${Date.now()}-err`,
        user_id: '',
        roadmap_id: progress.roadmapId,
        role: 'assistant',
        content: "Hmm, I'm having a moment. Can you try that again?",
        created_at: new Date().toISOString(),
      }
      setChatMessages(prev => [...prev, errorMsg])
    } finally {
      setChatLoading(false)
    }
  }, [progress?.roadmapId])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  async function handleManageSubscription() {
    try {
      const res = await fetch('/api/pro/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch (err) {
      console.error('Portal error:', err)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/20 flex items-center justify-center">
            <Rocket className="w-8 h-8 text-accent animate-bounce" />
          </div>
          <p className="text-dark/60 font-sans">Loading your dashboard...</p>
        </div>
      </main>
    )
  }

  if (!progress) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <Sparkles className="w-12 h-12 text-accent/30 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-dark mb-2 font-sans">No roadmap yet</h2>
          <p className="text-primary/50 font-sans mb-6">Take the quiz first to generate your personalized roadmap.</p>
          <Link
            href="/interview"
            className="inline-block bg-accent text-background font-bold px-8 py-3 rounded-xl hover:bg-dark transition-colors font-sans"
          >
            Take the quiz
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-primary/10 bg-background/80 backdrop-blur-md px-6 py-4 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-lg font-bold text-dark tracking-tighter font-sans">
              LaunchPad
            </Link>
            <ProBadge />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleManageSubscription}
              className="p-2 text-primary/40 hover:text-accent transition-colors rounded-lg hover:bg-primary/5"
              title="Manage subscription"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={handleSignOut}
              className="p-2 text-primary/40 hover:text-accent transition-colors rounded-lg hover:bg-primary/5"
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Greeting + Hustle Name */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-dark font-sans">
            {getGreeting()}, {progress.firstName}! 👋
          </h1>
          <p className="text-primary/60 font-sans mt-1">
            <span className="text-accent font-drama italic text-xl">{progress.hustleName}</span>
            {' '}&mdash; Day {progress.currentDay} of 30
          </p>
          <p className="text-sm text-primary/40 font-sans mt-2">
            {getMotivationalLine(progress.currentDay, progress.completionPercent, progress.streak)}
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Progress Ring */}
          <div className="glass-panel rounded-2xl p-6 flex flex-col items-center justify-center">
            <ProgressRing percent={progress.completionPercent} label="complete" />
            <p className="text-xs text-primary/40 font-mono mt-2">
              {progress.completedTasks}/{progress.totalTasks} tasks
            </p>
          </div>

          {/* Streak + Check-in */}
          <div className="md:col-span-2 space-y-4">
            <StreakCounter streak={progress.streak} />
            <DailyCheckIn
              onCheckIn={handleCheckIn}
              currentMood={progress.todayMood}
              isCheckedIn={progress.todayCheckedIn}
            />
          </div>
        </div>

        {/* Day Navigator */}
        <div className="glass-panel rounded-2xl p-5 mb-6">
          <DayNavigator
            currentDay={progress.currentDay}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
            completedDays={completedDays}
          />
        </div>

        {/* Tasks */}
        <div className="mb-6">
          <TaskList
            tasks={tasks}
            onToggle={handleTaskToggle}
            dayNumber={selectedDay}
          />
        </div>

        {/* AI Coach */}
        <div className="mb-8">
          <ChatPanel
            messages={chatMessages}
            onSend={handleChatSend}
            isLoading={chatLoading}
            firstName={progress.firstName}
            hustleName={progress.hustleName}
          />
        </div>

        {/* Milestone celebrations */}
        {[7, 14, 21, 30].includes(progress.currentDay) && progress.completionPercent > 0 && (
          <div className="bg-dark rounded-2xl p-8 text-background text-center mb-8">
            <div className="text-4xl mb-3">
              {progress.currentDay === 7 ? '🌟' : progress.currentDay === 14 ? '🔥' : progress.currentDay === 21 ? '🚀' : '🏆'}
            </div>
            <h3 className="text-xl font-bold font-sans mb-1">
              {progress.currentDay === 7 && 'Week 1 Complete!'}
              {progress.currentDay === 14 && 'Two Weeks Strong!'}
              {progress.currentDay === 21 && 'Three Weeks In!'}
              {progress.currentDay === 30 && 'You Did It! 30 Days!'}
            </h3>
            <p className="text-background/60 text-sm font-sans">
              {progress.currentDay === 30
                ? `You completed your ${progress.hustleName} journey. What you've built is real.`
                : `You're ${Math.round((progress.currentDay / 30) * 100)}% through your journey. Keep going!`
              }
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
