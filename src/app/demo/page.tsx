'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { Rocket, Settings, LogOut, Sparkles } from 'lucide-react'
import ProgressRing from '@/components/pro/ProgressRing'
import StreakCounter from '@/components/pro/StreakCounter'
import DayNavigator from '@/components/pro/DayNavigator'
import TaskList from '@/components/pro/TaskList'
import DailyCheckIn from '@/components/pro/DailyCheckIn'
import ChatPanel from '@/components/pro/ChatPanel'
import ProBadge from '@/components/pro/ProBadge'
import type { Task, ChatMessage, Mood } from '@/types'

// ── Mock Data ───────────────────────────────────────────────────
const MOCK_TASKS: Record<number, Task[]> = {
  1: [
    { id: '1a', roadmap_id: 'r1', user_id: 'u1', day_number: 1, title: 'Set up your free Canva account', description: 'Go to canva.com and create a free account. This is the tool you\'ll use to create all your social content — no design skills needed.', completed: true, completed_at: '2026-03-01T10:00:00Z', created_at: '2026-03-01T00:00:00Z' },
    { id: '1b', roadmap_id: 'r1', user_id: 'u1', day_number: 1, title: 'Choose your 3 content pillars', description: 'Pick 3 topics you\'ll post about consistently. Example: AI tips, productivity hacks, tool reviews. Write them down!', completed: true, completed_at: '2026-03-01T11:00:00Z', created_at: '2026-03-01T00:00:00Z' },
    { id: '1c', roadmap_id: 'r1', user_id: 'u1', day_number: 1, title: 'Create your brand color palette in Canva', description: 'Pick 3-4 colors that feel like "you". Save them as a brand kit in Canva so every post looks consistent.', completed: true, completed_at: '2026-03-01T14:00:00Z', created_at: '2026-03-01T00:00:00Z' },
  ],
  2: [
    { id: '2a', roadmap_id: 'r1', user_id: 'u1', day_number: 2, title: 'Write your first carousel post outline', description: 'Pick one of your content pillars and outline a 5-slide carousel. Focus on teaching something useful.', completed: true, completed_at: '2026-03-02T09:00:00Z', created_at: '2026-03-01T00:00:00Z' },
    { id: '2b', roadmap_id: 'r1', user_id: 'u1', day_number: 2, title: 'Design the carousel in Canva', description: 'Use a carousel template in Canva. Add your content, brand colors, and a clear call-to-action on the last slide.', completed: true, completed_at: '2026-03-02T11:00:00Z', created_at: '2026-03-01T00:00:00Z' },
    { id: '2c', roadmap_id: 'r1', user_id: 'u1', day_number: 2, title: 'Post it on LinkedIn or Instagram', description: 'Hit publish! Don\'t overthink it. Your first post doesn\'t need to be perfect — it needs to exist.', completed: true, completed_at: '2026-03-02T15:00:00Z', created_at: '2026-03-01T00:00:00Z' },
  ],
  3: [
    { id: '3a', roadmap_id: 'r1', user_id: 'u1', day_number: 3, title: 'Research 5 accounts in your niche', description: 'Find 5 creators doing what you want to do. Study what works — their hooks, visuals, and posting frequency.', completed: true, completed_at: '2026-03-03T10:00:00Z', created_at: '2026-03-01T00:00:00Z' },
    { id: '3b', roadmap_id: 'r1', user_id: 'u1', day_number: 3, title: 'Leave thoughtful comments on 10 posts', description: 'Engage genuinely with others in your niche. Real comments (not "great post!") — add value and you\'ll get noticed.', completed: true, completed_at: '2026-03-03T12:00:00Z', created_at: '2026-03-01T00:00:00Z' },
  ],
  4: [
    { id: '4a', roadmap_id: 'r1', user_id: 'u1', day_number: 4, title: 'Write 3 post ideas for this week', description: 'Batch your content planning. Write down 3 post ideas based on your content pillars — you\'ll thank yourself later.', completed: true, completed_at: '2026-03-04T09:00:00Z', created_at: '2026-03-01T00:00:00Z' },
    { id: '4b', roadmap_id: 'r1', user_id: 'u1', day_number: 4, title: 'Create and schedule post #2', description: 'Design your second post in Canva and schedule it. Consistency is what separates hobbyists from hustlers.', completed: true, completed_at: '2026-03-04T13:00:00Z', created_at: '2026-03-01T00:00:00Z' },
    { id: '4c', roadmap_id: 'r1', user_id: 'u1', day_number: 4, title: 'Set up a simple link-in-bio page', description: 'Use Linktree or Bento.me (both free) to create a page where people can find all your links in one place.', completed: true, completed_at: '2026-03-04T16:00:00Z', created_at: '2026-03-01T00:00:00Z' },
  ],
  5: [
    { id: '5a', roadmap_id: 'r1', user_id: 'u1', day_number: 5, title: 'Engage for 20 minutes in your niche', description: 'Set a timer. Comment on posts, reply to comments on yours, and connect with 3 new people.', completed: true, completed_at: '2026-03-05T08:00:00Z', created_at: '2026-03-01T00:00:00Z' },
    { id: '5b', roadmap_id: 'r1', user_id: 'u1', day_number: 5, title: 'Create a short-form video or reel', description: 'Record a 30-60 second video sharing one quick tip. Use your phone — don\'t worry about fancy equipment.', completed: true, completed_at: '2026-03-05T11:00:00Z', created_at: '2026-03-01T00:00:00Z' },
  ],
  6: [
    { id: '6a', roadmap_id: 'r1', user_id: 'u1', day_number: 6, title: 'Review your analytics from the week', description: 'Look at which posts got the most engagement. What topics resonated? Double down on what works.', completed: true, completed_at: '2026-03-06T10:00:00Z', created_at: '2026-03-01T00:00:00Z' },
    { id: '6b', roadmap_id: 'r1', user_id: 'u1', day_number: 6, title: 'Draft your first newsletter issue', description: 'Sign up for Beehiiv (free) and write your first email. Share what you learned this week — be real and personal.', completed: true, completed_at: '2026-03-06T14:00:00Z', created_at: '2026-03-01T00:00:00Z' },
  ],
  7: [
    { id: '7a', roadmap_id: 'r1', user_id: 'u1', day_number: 7, title: 'Plan next week\'s content calendar', description: 'Map out 5 posts for next week. Mix formats: 2 carousels, 2 text posts, 1 video. Variety keeps people engaged.', completed: false, completed_at: null, created_at: '2026-03-01T00:00:00Z' },
    { id: '7b', roadmap_id: 'r1', user_id: 'u1', day_number: 7, title: 'Send your first newsletter', description: 'Hit send on that newsletter draft from yesterday. Add a link to subscribe in your bio. You\'re building an audience!', completed: false, completed_at: null, created_at: '2026-03-01T00:00:00Z' },
    { id: '7c', roadmap_id: 'r1', user_id: 'u1', day_number: 7, title: 'Celebrate your first week!', description: 'Seriously — take a moment. You showed up for 7 days straight. Most people quit by day 3. You\'re different.', completed: false, completed_at: null, created_at: '2026-03-01T00:00:00Z' },
  ],
}

const MOCK_CHAT: ChatMessage[] = [
  { id: 'c1', user_id: 'u1', roadmap_id: 'r1', role: 'assistant', content: 'Hey Sarah! 👋 Welcome to your AI Technology Content Creator journey! I\'m your coach and I\'m SO pumped to be on this ride with you.\n\nYou\'ve got an amazing combination — writing, marketing, and web design skills, plus a passion for technology and AI. That\'s a goldmine for content creation.\n\nYour first task today is setting up Canva. It\'s going to be your best friend for the next 30 days. Ready to dive in?', created_at: '2026-03-01T08:00:00Z' },
  { id: 'c2', user_id: 'u1', roadmap_id: 'r1', role: 'user', content: 'I just finished day 6! The newsletter draft is done but I\'m nervous about sending it.', created_at: '2026-03-06T15:00:00Z' },
  { id: 'c3', user_id: 'u1', roadmap_id: 'r1', role: 'assistant', content: 'Sarah, 6 DAYS!! You\'re on a 6-day streak — that\'s incredible momentum! 🔥\n\nI totally get the newsletter nerves. Here\'s the thing — your first newsletter doesn\'t need to be perfect. It needs to be SENT. The people who signed up want to hear from you. They literally asked for it!\n\nHere\'s a quick confidence boost: look at your analytics from the week. People are already engaging with your content. The newsletter is just the next step. Hit send tomorrow morning and then come tell me how it went. You\'ve got this! 💪', created_at: '2026-03-06T15:01:00Z' },
]

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function DashboardDemo() {
  const [selectedDay, setSelectedDay] = useState(7)
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS[7] || [])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(MOCK_CHAT)
  const [chatLoading, setChatLoading] = useState(false)
  const [checkedIn, setCheckedIn] = useState(false)
  const [currentMood, setCurrentMood] = useState<Mood | null>(null)

  const completedDays = new Set([1, 2, 3, 4, 5, 6])

  // Count all completed tasks across all days
  const totalTasks = Object.values(MOCK_TASKS).flat().length
  const completedTasks = Object.values(MOCK_TASKS).flat().filter(t => t.completed).length
  const completionPercent = Math.round((completedTasks / totalTasks) * 100)

  function handleDaySelect(day: number) {
    setSelectedDay(day)
    setTasks(MOCK_TASKS[day] || [])
  }

  const handleTaskToggle = useCallback((taskId: string, completed: boolean) => {
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, completed, completed_at: completed ? new Date().toISOString() : null } : t
    ))
  }, [])

  const handleCheckIn = useCallback((mood: Mood) => {
    setCurrentMood(mood)
    setCheckedIn(true)
  }, [])

  const handleChatSend = useCallback(async (message: string) => {
    const userMsg: ChatMessage = {
      id: `demo-${Date.now()}`,
      user_id: 'u1',
      roadmap_id: 'r1',
      role: 'user',
      content: message,
      created_at: new Date().toISOString(),
    }
    setChatMessages(prev => [...prev, userMsg])
    setChatLoading(true)

    // Simulate AI response
    await new Promise(resolve => setTimeout(resolve, 1500))

    const responses = [
      `That's a great question, Sarah! Based on where you are on Day 7 of your AI Technology Content Creator journey, here's what I'd suggest:\n\nFocus on getting that newsletter sent today. You've already written it — that was the hard part. Now just hit publish and celebrate! 🎉\n\nTomorrow we'll start week 2, where things get really exciting. You'll start reaching out to other creators for collaboration.`,
      `YES! I love the energy, Sarah! You're already ahead of schedule with ${completionPercent}% of tasks done.\n\nThe key right now is consistency over perfection. Your content is already connecting with people — the analytics prove it. Keep showing up, keep posting, and the audience will grow.\n\nWhat specific part are you most excited about for next week?`,
      `Sarah, you're doing something that 95% of people only talk about. You're ACTUALLY building a content business, one day at a time.\n\nFor today, I'd prioritize planning next week's content calendar first — it sets you up for a productive Week 2. Then send that newsletter. Then celebrate! 🚀\n\nYou've got this. I believe in you!`,
    ]

    const assistantMsg: ChatMessage = {
      id: `demo-${Date.now()}-resp`,
      user_id: 'u1',
      roadmap_id: 'r1',
      role: 'assistant',
      content: responses[Math.floor(Math.random() * responses.length)],
      created_at: new Date().toISOString(),
    }
    setChatMessages(prev => [...prev, assistantMsg])
    setChatLoading(false)
  }, [completionPercent])

  return (
    <main className="min-h-screen bg-background">
      {/* Demo banner */}
      <div className="bg-accent text-background text-center py-2 text-sm font-sans font-medium">
        ✨ This is a live demo of the Pro Dashboard — data is simulated
      </div>

      {/* Nav */}
      <nav className="border-b border-primary/10 bg-background/80 backdrop-blur-md px-6 py-4 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-lg font-bold text-dark tracking-tighter font-sans">
              HustlUp
            </Link>
            <ProBadge />
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-primary/40 hover:text-accent transition-colors rounded-lg hover:bg-primary/5" title="Manage subscription">
              <Settings className="w-5 h-5" />
            </button>
            <button className="p-2 text-primary/40 hover:text-accent transition-colors rounded-lg hover:bg-primary/5" title="Sign out">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-dark font-sans">
            {getGreeting()}, Sarah! 👋
          </h1>
          <p className="text-primary/60 font-sans mt-1">
            <span className="text-accent font-drama italic text-xl">AI Technology Content Creator</span>
            {' '}&mdash; Day 7 of 30
          </p>
          <p className="text-sm text-primary/40 font-sans mt-2">
            One week down — you&apos;re already ahead of 90% of people.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="glass-panel rounded-2xl p-6 flex flex-col items-center justify-center">
            <ProgressRing percent={completionPercent} label="complete" />
            <p className="text-xs text-primary/40 font-mono mt-2">
              {completedTasks}/{totalTasks} tasks
            </p>
          </div>

          <div className="md:col-span-2 space-y-4">
            <StreakCounter streak={6} />
            <DailyCheckIn
              onCheckIn={handleCheckIn}
              currentMood={currentMood}
              isCheckedIn={checkedIn}
            />
          </div>
        </div>

        {/* Day Navigator */}
        <div className="glass-panel rounded-2xl p-5 mb-6">
          <DayNavigator
            currentDay={7}
            selectedDay={selectedDay}
            onSelectDay={handleDaySelect}
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
            firstName="Sarah"
            hustleName="AI Technology Content Creator"
          />
        </div>

        {/* Week 1 milestone */}
        <div className="bg-dark rounded-2xl p-8 text-background text-center mb-8">
          <div className="text-4xl mb-3">🌟</div>
          <h3 className="text-xl font-bold font-sans mb-1">Week 1 Complete!</h3>
          <p className="text-background/60 text-sm font-sans">
            You&apos;re 23% through your journey. Keep going!
          </p>
        </div>
      </div>
    </main>
  )
}
