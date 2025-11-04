import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { env, validateEnv } from '@/lib/env'
import { detectStudentState } from '@/app/utils/context/stateDetector'
import { selectStrategy } from '@/app/utils/context/strategySelector'
import { buildAdaptivePrompt } from '@/app/utils/context/promptBuilder'
import { validateResponseQuality } from '@/app/utils/responseValidator'
import { Message } from '@/app/types'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: env.openaiApiKey,
})

// Validate environment variables on module load
// Note: This validation is non-blocking - errors are logged but don't prevent server startup
// Actual validation happens in the POST handler where we can return proper error responses
try {
  validateEnv()
} catch (error) {
  // Log warning but don't throw - allows server to start
  // The actual API call will fail gracefully if OPENAI_API_KEY is missing
  console.warn('Environment validation warning (non-fatal):', error instanceof Error ? error.message : error)
}

export async function POST(request: NextRequest) {
  try {
    // Validate environment variables at runtime (not just module load)
    try {
      validateEnv()
    } catch (error) {
      return NextResponse.json(
        { 
          error: 'Server configuration error',
          message: error instanceof Error ? error.message : 'Missing required environment variables. Please check .env.local file.'
        },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { messages, sessionId, problemContext } = body

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      )
    }

    // Adaptive System: Detect student state and select strategy
    let adaptivePrompt: string
    try {
      // Detect student's current state
      const state = await detectStudentState(messages as Message[], problemContext)
      
      // Select appropriate tutoring strategy
      const strategy = selectStrategy(state)
      
      // Build adaptive prompt based on state and strategy
      adaptivePrompt = buildAdaptivePrompt(
        state,
        strategy,
        messages as Message[],
        problemContext
      )
      
      // Log for debugging (remove in production)
      console.log('🎯 Adaptive System:', {
        state: state.state,
        confidence: state.confidence,
        strategy: strategy.name,
        hintLevel: strategy.hintLevel,
      })
    } catch (error) {
      console.error('Adaptive system error, falling back to base prompt:', error)
      // Fallback to base prompt if adaptive system fails
      adaptivePrompt = `You are MathSageAI, a patient and encouraging math tutor that uses the Socratic method. Your role is to guide students through math problems by asking questions, NEVER giving direct answers or formulas.

ABSOLUTE RULES - NEVER VIOLATE THESE:
1. NEVER give direct answers - always guide through questions
2. NEVER state formulas or methods directly - ask students to recall or discover them
3. NEVER say "multiply this by that" or "the formula is..." - ask "What do you think we need to do?" or "What information do we have?"
4. NEVER solve the problem - guide students to solve it themselves
5. Use encouraging, warm language - normalize mistakes as learning opportunities
6. Focus on understanding "why" before "how"
7. Celebrate effort and progress, not just correctness`
    }
    
    // Prepare messages for OpenAI (including adaptive system message)
    const openaiMessages = [
      { role: 'system' as const, content: adaptivePrompt },
      ...messages.map((msg: { role: string; content: string }) => ({
        role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content,
      })),
    ]

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: openaiMessages,
      temperature: 0.7,
      max_tokens: 1000,
    })

    let response = completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response. Please try again.'

    // Validate response doesn't contain direct answer
    const validationResult = validateResponse(response)
    
    // Validate mathematical accuracy
    const accuracyResult = validateResponseQuality(response)
    
    // If mathematical inaccuracy detected, regenerate with correction instruction
    if (!accuracyResult.isValid && accuracyResult.issues.length > 0) {
      console.warn('⚠️ Mathematical inaccuracy detected:', accuracyResult.issues)
      
      // Check if student pointed out an inaccuracy (look for correction language in recent messages)
      const lastUserMessage = messages
        .filter((msg: { role: string }) => msg.role === 'user')
        .slice(-1)[0]?.content || ''
      
      const studentCorrected = /inaccurate|wrong|not.*equal|not.*same|not.*correct/i.test(lastUserMessage)
      
      // Regenerate with accuracy correction
      const correctionPrompt = studentCorrected
        ? `A student correctly pointed out that your previous response was inaccurate. They said: "${lastUserMessage}". Acknowledge their correction immediately and provide an accurate explanation. Be precise and mathematically correct.`
        : `Your response contains a mathematically inaccurate analogy or definition. The issue: ${accuracyResult.issues[0]}. Please correct this and provide an accurate explanation. Use precise mathematical definitions.`
      
      const correctedCompletion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          ...openaiMessages,
          { role: 'assistant' as const, content: response },
          { role: 'user' as const, content: correctionPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      })
      
      response = correctedCompletion.choices[0]?.message?.content || response
      
      // Re-validate accuracy after correction
      const recheckAccuracy = validateResponseQuality(response)
      if (!recheckAccuracy.isValid) {
        console.warn('⚠️ Still contains inaccuracies after correction attempt')
      }
    }

    if (!validationResult.isValid) {
      // If direct answer detected, regenerate with more strict prompt
      const strictCompletion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          ...openaiMessages,
          { role: 'assistant' as const, content: response },
          { role: 'user' as const, content: 'Please rephrase your response to ask guiding questions instead of providing direct answers. Focus on helping the student discover the solution themselves.' },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      })

      const correctedResponse = strictCompletion.choices[0]?.message?.content || response

      return NextResponse.json({
        message: correctedResponse,
        sessionId: sessionId || null,
      })
    }

    return NextResponse.json({
      message: response,
      sessionId: sessionId || null,
    })
  } catch (error) {
    console.error('Chat API error:', error)
    
    // Provide more specific error messages
    if (error instanceof Error) {
      // Check for OpenAI API errors
      if (error.message.includes('API key') || error.message.includes('authentication')) {
        return NextResponse.json(
          { 
            error: 'Authentication failed',
            message: 'Invalid OpenAI API key. Please check your .env.local file.'
          },
          { status: 401 }
        )
      }
      
      // Check for rate limit errors
      if (error.message.includes('rate limit') || error.message.includes('429')) {
        return NextResponse.json(
          { 
            error: 'Rate limit exceeded',
            message: 'Too many requests. Please try again in a moment.'
          },
          { status: 429 }
        )
      }
      
      // Check for network errors
      if (error.message.includes('network') || error.message.includes('fetch')) {
        return NextResponse.json(
          { 
            error: 'Network error',
            message: 'Failed to connect to OpenAI API. Please check your internet connection.'
          },
          { status: 503 }
        )
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to process chat request',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      },
      { status: 500 }
    )
  }
}

/**
 * Validate that response doesn't contain direct answers or formulas
 * Returns validation result with feedback
 */
function validateResponse(response: string): { isValid: boolean; reason?: string } {
  const lowerResponse = response.toLowerCase()

  // Patterns that indicate direct answers
  const directAnswerPatterns = [
    /the answer is\s+\d+/,
    /the solution is\s+\d+/,
    /equals\s+\d+\s*$/,
    /the result is\s+\d+/,
    /^x\s*=\s*\d+/,
    /final answer:\s*\d+/,
    /the answer\s+is/,
  ]

  // Patterns that indicate direct formulas or methods (FORBIDDEN)
  const formulaPatterns = [
    /\b(formula|equation|is|equals|multiply|divide|add|subtract)\s+(length|width|height|base|radius|diameter|area|perimeter|volume)\s*(times|by|multiplied|×|\*)/,
    /\barea\s+(of|is|equals)\s+(length|width|height|base|radius|diameter)\s*(times|by|multiplied|×|\*)/,
    /\bperimeter\s+(of|is|equals)\s+.*\s*(times|by|multiplied|×|\*)/,
    /\bvolume\s+(of|is|equals)\s+.*\s*(times|by|multiplied|×|\*)/,
    /\bthe\s+(area|perimeter|volume|formula|equation)\s+is/,
    /\bfound\s+by\s+(multiplying|dividing|adding|subtracting)/,
    /\bmultiply\s+\d+\s+by\s+\d+/,
    /\bdivide\s+\d+\s+by\s+\d+/,
    /\badd\s+\d+\s+and\s+\d+/,
    /\bsubtract\s+\d+\s+from\s+\d+/,
    /\b(recall|remember|think about|do you know)\s+(how|what)\s+(to|we|you)\s+(calculate|find|compute|multiply|divide)/i,
    /\bhow\s+(do|might|can)\s+(we|you)\s+(calculate|find|compute|multiply|divide)/i,
    /\busing\s+(its|the)\s+(length|width|height|base|radius|diameter)/i,
  ]

  // Check for direct answer patterns
  for (const pattern of directAnswerPatterns) {
    if (pattern.test(lowerResponse)) {
      return {
        isValid: false,
        reason: 'Direct answer detected',
      }
    }
  }

  // Check for formula/method patterns (STRICTER)
  for (const pattern of formulaPatterns) {
    if (pattern.test(lowerResponse)) {
      return {
        isValid: false,
        reason: 'Direct formula or method stated',
      }
    }
  }

  // Check if response contains questions (required for Socratic method)
  const questionCount = (response.match(/\?/g) || []).length
  const sentenceCount = (response.match(/[.!?]/g) || []).length

  // If response is mostly declarative statements without questions, flag it
  if (sentenceCount > 1 && questionCount === 0) {
    return {
      isValid: false,
      reason: 'No guiding questions found - must use Socratic method',
    }
  }

  // Check for imperative statements that give directions (not allowed)
  const imperativePatterns = [
    /^(multiply|divide|add|subtract|calculate|compute|find|solve)/i,
  ]
  
  for (const pattern of imperativePatterns) {
    if (pattern.test(response.trim())) {
      return {
        isValid: false,
        reason: 'Imperative statement detected - must ask questions instead',
      }
    }
  }

  return { isValid: true }
}

