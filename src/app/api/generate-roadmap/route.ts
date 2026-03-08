import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import type { InterviewAnswers, RoadmapResponse } from '@/types'

function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not configured')
  }
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
}

function buildPrompt(answers: InterviewAnswers): string {
  return `You are a side hustle coach. Based on the following interview answers, generate a personalized side hustle roadmap as valid JSON only — no markdown, no explanation, just the JSON object.

Interview answers:
- Top 3 skills: ${answers.skills}
- Hours available per week: ${answers.hoursPerWeek}
- Income goal in 90 days: ${answers.incomeGoal}
- Content creation comfort (1-5): ${answers.contentComfort}
- Work style preference: ${answers.workStyle}
- Tech comfort level: ${answers.techLevel}
- Existing audience: ${answers.audience}
- Passion/industry: ${answers.passion}
- Risk tolerance: ${answers.riskTolerance}

Return exactly this JSON structure:
{
  "preview": {
    "hustleName": "Name of the recommended side hustle",
    "hustleDescription": "One-line description of the side hustle",
    "whyItFits": "2-3 sentences explaining why this side hustle matches this person specifically",
    "bulletSummary": ["First key insight about this opportunity", "Second key insight", "Third key insight"]
  },
  "full": {
    "first30Days": [
      "Day 1-3: Specific action step",
      "Day 4-7: Specific action step",
      "Day 8-14: Specific action step",
      "Day 15-21: Specific action step",
      "Day 22-30: Specific action step",
      "Week 2 focus: ...",
      "Week 3 focus: ...",
      "Week 4 focus: ...",
      "End of month goal: ...",
      "Key metric to track: ..."
    ],
    "incomeTarget": "Realistic income target for 90 days with brief rationale",
    "topResources": [
      { "name": "Resource name", "url": "https://...", "description": "Why this resource helps" },
      { "name": "Resource name", "url": "https://...", "description": "Why this resource helps" },
      { "name": "Resource name", "url": "https://...", "description": "Why this resource helps" }
    ]
  }
}

Be specific to their skills and situation. Make the first30Days actionable day-by-day. Use only free resources. Return only valid JSON.`
}

export async function POST(req: NextRequest) {
  try {
    const answers: InterviewAnswers = await req.json()

    if (!answers.skills || !answers.email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const client = getClient()
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: buildPrompt(answers),
        },
      ],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''

    let roadmap: RoadmapResponse
    try {
      // Strip any accidental markdown code fences
      const cleaned = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
      roadmap = JSON.parse(cleaned)
    } catch {
      console.error('Failed to parse Claude response:', text)
      return NextResponse.json({ error: 'Failed to parse roadmap' }, { status: 500 })
    }

    return NextResponse.json(roadmap)
  } catch (err) {
    console.error('Roadmap generation error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
