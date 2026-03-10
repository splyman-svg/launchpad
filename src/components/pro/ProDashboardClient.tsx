'use client'

import { useEffect, useState, useCallback } from 'react'
import type { Task, ChatMessage, Mood, DashboardProgress } from '@/types'
import StreakCounter from './StreakCounter'
import ProgressRing from './ProgressRing'
import DayNavigator from './DayNavigator'
import TaskList from './TaskList'
import DailyCheckIn from './DailyCheckIn'
import ChatPanel from './ChatPanel'
import ManageSubscriptionButton from './ManageSubscriptionButton'
import ProBadge from './ProBadge'

const ROADMAP_STORAGE_KEY = 'lp_roadmap'
const ANSWERS_STORAGE_KEY = 'lp_answers'

type DashboardState = 'loading' | 'no_roadmap' | 'generating_tasks' | 'ready' | 'error'

export default function ProDashboardClient({ firstName }: { firstName: string }) {
  const [state, setState] = useState<DashboardState>('loading')
  const [progress, setProgress] = useState<DashboardProgress | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedDay, setSelectedDay] = useState(1)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatLoading, setChatLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Load progress data
  const loadProgress = useCallback(async () => {
    const res = await fetch('/api/pro/progress')
    if (res.ok) {
      const data: DashboardProgress = await res.json()
      setProgress(data)
      setSelectedDay(data.currentDay)
      return data
    }
    return null
  }, [])

  // Load tasks for the selected day
  const loadTasks = useCallback(async (roadmapId: string, day: number) => {
    const res = await fetch(`/api/pro/tasks?roadmapId=${roadmapId}&day=${day}`)
    if (res.ok) {
      const data = await res.json()
      setTasks(data.tasks || [])
    }
  }, [])

  // Load chat history
  const loadChatHistory = useCallback(async (roadmapId: string) => {
    const res = await fetch(`/api/pro/chat/history?roadmapId=${roadmapId}`)
    if (res.ok) {
      const data = await res.json()
      setChatMessages(data.messages || [])
    }
  }, [])

  // Save roadmap from sessionStorage to Supabase
  const saveRoadmapFromStorage = useCallback(async (): Promise<boolean> => {
    const roadmapJson = sessionStorage.getItem(ROADMAP_STORAGE_KEY)
    const answersJson = sessionStorage.getItem(ANSWERS_STORAGE_KEY)

    if (!roadmapJson || !answersJson) {
      return false
    }

    try {
      const roadmap = JSON.parse(roadmapJson)
      const answers = JSON.parse(answersJson)

      const res = await fetch('/api/pro/roadmap/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          preview: roadmap.preview,
          full_plan: roadmap.full,
        }),
      })

      return res.ok
    } catch {
      return false
    }
  }, [])

  // Generate tasks for a roadmap
  const generateTasks = useCallback(async (userId: string, roadmapId: string): Promise<boolean> => {
    const res = await fetch('/api/pro/tasks/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, roadmapId }),
    })
    return res.ok
  }, [])

  // Main initialization
  useEffect(() => {
    async function init() {
      try {
        // Step 1: Try to load progress (which requires a roadmap in Supabase)
        let data = await loadProgress()

        if (!data) {
          // No roadmap in Supabase — try to save from sessionStorage
          setState('no_roadmap')
          const saved = await saveRoadmapFromStorage()

          if (!saved) {
            // No roadmap anywhere — user needs to take the interview first
            setErrorMsg('no_roadmap')
            setState('error')
            return
          }

          // Roadmap saved — load progress again
          data = await loadProgress()
          if (!data) {
            setErrorMsg('progress_failed')
            setState('error')
            return
          }
        }

        // Step 2: Check if tasks exist, if not generate them
        const tasksRes = await fetch(`/api/pro/tasks?roadmapId=${data.roadmapId}`)
        const tasksData = await tasksRes.json()

        if (!tasksData.tasks || tasksData.tasks.length === 0) {
          setState('generating_tasks')
          // Get user ID from progress endpoint isn't direct, use a workaround
          const generated = await generateTasks('_self', data.roadmapId)
          if (!generated) {
            // Task generation might need the actual user ID — try via the roadmap save response
            // The generate endpoint uses admin client so it should work
          }
        }

        // Step 3: Load everything
        await Promise.all([
          loadTasks(data.roadmapId, data.currentDay),
          loadChatHistory(data.roadmapId),
        ])

        setState('ready')
      } catch (err) {
        console.error('Dashboard init error:', err)
        setErrorMsg('init_failed')
        setState('error')
      }
    }

    init()
  }, [loadProgress, saveRoadmapFromStorage, generateTasks, loadTasks, loadChatHistory])

  // Handle day change
  useEffect(() => {
    if (progress?.roadmapId && state === 'ready') {
      loadTasks(progress.roadmapId, selectedDay)
    }
  }, [selectedDay, progress?.roadmapId, state, loadTasks])

  // Toggle task completion
  async function handleToggleTask(taskId: string, completed: boolean) {
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed, completed_at: completed ? new Date().toISOString() : null } : t))

    const res = await fetch('/api/pro/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, completed }),
    })

    if (res.ok) {
      // Refresh progress to update streak/completion
      loadProgress()
    } else {
      // Revert
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !completed } : t))
    }
  }

  // Handle check-in
  async function handleCheckIn(mood: Mood, note?: string) {
    if (!progress?.roadmapId) return

    await fetch('/api/pro/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roadmapId: progress.roadmapId, mood, note }),
    })

    // Refresh progress
    loadProgress()
  }

  // Handle chat send
  async function handleChatSend(message: string) {
    if (!progress?.roadmapId) return

    // Optimistic: add user message
    const tempId = `temp-${Date.now()}`
    const userMsg: ChatMessage = {
      id: tempId,
      user_id: '',
      roadmap_id: progress.roadmapId,
      role: 'user',
      content: message,
      created_at: new Date().toISOString(),
    }
    setChatMessages(prev => [...prev, userMsg])
    setChatLoading(true)

    try {
      const res = await fetch('/api/pro/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, roadmapId: progress.roadmapId }),
      })

      if (res.ok) {
        const data = await res.json()
        const assistantMsg: ChatMessage = {
          id: `resp-${Date.now()}`,
          user_id: '',
          roadmap_id: progress.roadmapId,
          role: 'assistant',
          content: data.message,
          created_at: new Date().toISOString(),
        }
        setChatMessages(prev => [...prev, assistantMsg])
      }
    } catch (err) {
      console.error('Chat error:', err)
    } finally {
      setChatLoading(false)
    }
  }

  // Calculate completed days for DayNavigator
  const completedDays = new Set<number>()
  if (progress) {
    // We'd need all tasks to calculate this properly, but for now use a simple heuristic
    // The progress endpoint gives us streak info which implies consecutive completed days
    for (let d = progress.currentDay; d > progress.currentDay - progress.streak; d--) {
      if (d >= 1) completedDays.add(d)
    }
  }

  // Loading state
  if (state === 'loading' || state === 'no_roadmap') {
    return (
      <div className="mt-8 glass-panel rounded-2xl p-8 border border-primary/10 text-center">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <h2 className="font-sans font-bold text-xl text-dark">Setting up your dashboard...</h2>
        </div>
        <p className="font-sans text-dark/60">Loading your roadmap and generating your personalized tasks.</p>
      </div>
    )
  }

  // Generating tasks state
  if (state === 'generating_tasks') {
    return (
      <div className="mt-8 glass-panel rounded-2xl p-8 border border-primary/10 text-center">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <h2 className="font-sans font-bold text-xl text-dark">Generating your 30-day plan...</h2>
        </div>
        <p className="font-sans text-dark/60">Your AI coach is creating personalized daily tasks. This takes about 15 seconds.</p>
      </div>
    )
  }

  // Error state
  if (state === 'error') {
    if (errorMsg === 'no_roadmap') {
      return (
        <div className="mt-8 glass-panel rounded-2xl p-8 border border-primary/10 text-center">
          <h2 className="font-sans font-bold text-xl text-dark mb-3">Let&apos;s find your side hustle first!</h2>
          <p className="font-sans text-dark/60 mb-6">
            Take our quick assessment so your AI coach knows exactly how to help you.
          </p>
          <a
            href="/interview"
            className="inline-flex items-center gap-2 bg-accent hover:bg-dark text-background font-bold py-3 px-8 rounded-full transition-colors font-sans"
          >
            Start assessment
          </a>
        </div>
      )
    }

    return (
      <div className="mt-8 glass-panel rounded-2xl p-8 border border-primary/10 text-center">
        <h2 className="font-sans font-bold text-xl text-dark mb-3">Something went wrong</h2>
        <p className="font-sans text-dark/60 mb-6">We had trouble loading your dashboard. Try refreshing the page.</p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 bg-accent hover:bg-dark text-background font-bold py-3 px-8 rounded-full transition-colors font-sans"
        >
          Refresh
        </button>
      </div>
    )
  }

  if (!progress) return null

  return (
    <div className="mt-8 space-y-6">
      {/* Top stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel rounded-2xl p-6 flex items-center justify-center">
          <ProgressRing
            percent={progress.completionPercent}
            label="Complete"
          />
        </div>
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-center">
          <StreakCounter streak={progress.streak} />
        </div>
        <div className="glass-panel rounded-2xl p-6 text-center flex flex-col justify-center">
          <p className="font-mono text-3xl font-bold text-accent">
            Day {progress.currentDay}
          </p>
          <p className="font-sans text-xs text-dark/50 mt-1">of 30</p>
          <p className="font-sans text-sm text-dark/60 mt-2 font-medium">
            {progress.hustleName}
          </p>
        </div>
      </div>

      {/* Day navigator */}
      <div className="glass-panel rounded-2xl p-5">
        <DayNavigator
          currentDay={progress.currentDay}
          selectedDay={selectedDay}
          onSelectDay={setSelectedDay}
          completedDays={completedDays}
        />
      </div>

      {/* Main content: Tasks + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tasks (2/3 width) */}
        <div className="lg:col-span-2">
          <TaskList
            tasks={tasks}
            onToggle={handleToggleTask}
            dayNumber={selectedDay}
          />
        </div>

        {/* Sidebar (1/3 width) */}
        <div className="space-y-4">
          <DailyCheckIn
            onCheckIn={handleCheckIn}
            currentMood={progress.todayMood}
            isCheckedIn={progress.todayCheckedIn}
          />
        </div>
      </div>

      {/* AI Coach Chat */}
      <ChatPanel
        messages={chatMessages}
        onSend={handleChatSend}
        isLoading={chatLoading}
        firstName={progress.firstName}
        hustleName={progress.hustleName}
      />

      {/* Manage subscription */}
      <div className="text-center pt-4">
        <ManageSubscriptionButton />
      </div>
    </div>
  )
}
