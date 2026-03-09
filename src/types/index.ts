// ── Interview & Roadmap (existing) ──────────────────────────────
export interface InterviewAnswers {
  skills: string
  hoursPerWeek: string
  incomeGoal: string
  contentComfort: string
  workStyle: string
  techLevel: string
  audience: string
  passion: string
  riskTolerance: string
  email: string
}

export interface RoadmapPreview {
  hustleName: string
  hustleDescription: string
  whyItFits: string
  bulletSummary: string[]
}

export interface RoadmapFull {
  first30Days: string[]
  incomeTarget: string
  topResources: { name: string; url: string; description: string }[]
}

export interface RoadmapResponse {
  preview: RoadmapPreview
  full: RoadmapFull
}

// ── Pro Tier Types ──────────────────────────────────────────────
export type UserTier = 'free' | 'one_time' | 'pro'
export type Mood = 'great' | 'okay' | 'stuck' | 'overwhelmed'
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due'

export interface Profile {
  id: string
  email: string
  display_name: string | null
  tier: UserTier
  stripe_customer_id: string | null
  created_at: string
  updated_at: string
}

export interface Roadmap {
  id: string
  user_id: string
  answers: InterviewAnswers
  preview: RoadmapPreview
  full_plan: RoadmapFull
  is_active: boolean
  created_at: string
}

export interface Task {
  id: string
  roadmap_id: string
  user_id: string
  day_number: number
  title: string
  description: string
  completed: boolean
  completed_at: string | null
  created_at: string
}

export interface ChatMessage {
  id: string
  user_id: string
  roadmap_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export interface CheckIn {
  id: string
  user_id: string
  roadmap_id: string
  day_number: number
  mood: Mood
  note: string | null
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  stripe_subscription_id: string
  status: SubscriptionStatus
  current_period_end: string
  created_at: string
  updated_at: string
}

// ── API Response Types ──────────────────────────────────────────
export interface DashboardProgress {
  currentDay: number
  totalTasks: number
  completedTasks: number
  completionPercent: number
  streak: number
  todayCheckedIn: boolean
  todayMood: Mood | null
  hustleName: string
  roadmapId: string
  firstName: string
}

export interface GeneratedDay {
  day: number
  tasks: { title: string; description: string }[]
}

export interface TaskGenerationResponse {
  days: GeneratedDay[]
}
