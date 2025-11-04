import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { env } from '@/lib/env'
import { analyzeFeedback } from '@/app/utils/feedback'
import { FeedbackAnalysis } from '@/app/types'

const openai = new OpenAI({
  apiKey: env.openaiApiKey,
})

/**
 * Phase 1: Enhanced Feedback System
 * 
 * This endpoint analyzes student responses for step-by-step errors,
 * misconceptions, and provides detailed feedback.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentResponse, problemContext, conversationHistory } = body

    if (!studentResponse || !problemContext) {
      return NextResponse.json(
        { error: 'Student response and problem context are required' },
        { status: 400 }
      )
    }

    // Use OpenAI to analyze the student response step-by-step
    const analysisPrompt = `Analyze this student's math response step-by-step. Identify:
1. Each step they took
2. Where errors occurred (if any)
3. The type of error (calculation, conceptual, procedural)
4. Any misconceptions revealed
5. What they did correctly

Student Response: "${studentResponse}"
Problem Context: "${problemContext}"

Provide your analysis in this format:
STEPS:
1. [step description]
2. [step description]
...

ERRORS:
- Step X: [error type] - [error description]
- Step Y: [error type] - [error description]

MISCONCEPTIONS:
- [misconception if any]

CORRECT PARTS:
- [what they did right]

Be specific and helpful. Focus on learning, not just correctness.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert math tutor analyzing student work. Provide detailed, constructive analysis that helps students learn from their mistakes.',
        },
        {
          role: 'user',
          content: analysisPrompt,
        },
      ],
      temperature: 0.3, // Lower temperature for more consistent analysis
      max_tokens: 1000,
    })

    const analysis = completion.choices[0]?.message?.content || ''

    // Parse the analysis and combine with our feedback system
    const feedbackAnalysis = await analyzeFeedback(
      studentResponse,
      problemContext,
      analysis
    )

    // Enhance feedback with OpenAI analysis
    const enhancedFeedback = enhanceFeedbackWithAI(feedbackAnalysis, analysis)

    return NextResponse.json({
      feedback: enhancedFeedback,
      analysis: analysis,
    })
  } catch (error) {
    console.error('Feedback analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze feedback' },
      { status: 500 }
    )
  }
}

/**
 * Enhance feedback with AI analysis
 */
function enhanceFeedbackWithAI(
  feedbackAnalysis: FeedbackAnalysis,
  aiAnalysis: string
): FeedbackAnalysis {
  // Parse AI analysis to extract additional insights
  const errorsMatch = aiAnalysis.match(/ERRORS?:([\s\S]*?)(?=MISCONCEPTIONS|CORRECT|$)/i)
  const misconceptionsMatch = aiAnalysis.match(/MISCONCEPTIONS?:([\s\S]*?)(?=CORRECT|$)/i)
  const correctMatch = aiAnalysis.match(/CORRECT PARTS?:([\s\S]*?)$/i)

  // Enhance guidance with AI insights
  let enhancedGuidance = feedbackAnalysis.guidance
  
  if (misconceptionsMatch) {
    const misconception = misconceptionsMatch[1].trim()
    enhancedGuidance += `\n\nI noticed a potential misconception: ${misconception}. Let's address this together.`
  }

  // Enhance encouragement with what was done correctly
  let enhancedEncouragement = feedbackAnalysis.encouragement
  
  if (correctMatch) {
    const correctParts = correctMatch[1].trim()
    if (correctParts) {
      enhancedEncouragement += ` Great job on: ${correctParts}`
    }
  }

  return {
    ...feedbackAnalysis,
    guidance: enhancedGuidance,
    encouragement: enhancedEncouragement,
  }
}

