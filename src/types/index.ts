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
