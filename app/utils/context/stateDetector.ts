/**
 * State Detection System
 * 
 * Analyzes conversation to detect student's current learning state
 */

import OpenAI from 'openai'
import { env } from '@/lib/env'
import { DetectedStudentState, StudentState, StudentStateContext } from '@/app/types/context'
import { Message } from '@/app/types'

const openai = new OpenAI({
  apiKey: env.openaiApiKey,
})

/**
 * Detect student's current state from conversation
 */
export async function detectStudentState(
  messages: Message[],
  problemContext?: string
): Promise<DetectedStudentState> {
  // Extract conversation context
  const conversationContext = extractConversationContext(messages)
  
  // Build analysis prompt
  const analysisPrompt = buildAnalysisPrompt(messages, problemContext, conversationContext)
  
  try {
    // Use LLM to analyze conversation and detect state
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an expert educational psychologist analyzing student conversations. Your job is to detect the student's current learning state based on their responses and conversation patterns. Be precise and evidence-based.`
        },
        {
          role: 'user',
          content: analysisPrompt
        }
      ],
      temperature: 0.3, // Lower temperature for more consistent analysis
      max_tokens: 500,
    })
    
    const analysis = completion.choices[0]?.message?.content || ''
    
    // Parse the analysis to extract state
    const state = parseStateAnalysis(analysis, conversationContext)
    
    return state
  } catch (error) {
    console.error('State detection error:', error)
    
    // Fallback to pattern-based detection
    return fallbackStateDetection(messages, conversationContext)
  }
}

/**
 * Extract conversation context for analysis
 */
function extractConversationContext(messages: Message[]): StudentStateContext {
  const userMessages = messages.filter(msg => msg.role === 'user')
  const turnCount = userMessages.length
  
  // Extract recent errors (from assistant messages mentioning errors)
  const recentErrors: string[] = []
  messages.slice(-5).forEach(msg => {
    if (msg.role === 'assistant' && msg.content.toLowerCase().includes('error')) {
      recentErrors.push(msg.content)
    }
  })
  
  // Detect sentiment from user messages
  const lastUserMessage = userMessages[userMessages.length - 1]?.content || ''
  const sentiment = detectSentiment(lastUserMessage)
  
  // Try to detect problem type from conversation
  const problemType = detectProblemType(messages)
  
  return {
    turnCount,
    problemType,
    recentErrors,
    studentSentiment: sentiment,
    conversationLength: messages.length,
  }
}

/**
 * Build analysis prompt for LLM
 */
function buildAnalysisPrompt(
  messages: Message[],
  problemContext: string | undefined,
  context: StudentStateContext
): string {
  const recentMessages = messages.slice(-6).map(msg => ({
    role: msg.role,
    content: msg.content.substring(0, 200), // Truncate for context
  }))
  
  return `Analyze this math tutoring conversation and determine the student's current learning state.

CONVERSATION CONTEXT:
- Turn Count: ${context.turnCount}
- Conversation Length: ${context.conversationLength} messages
- Student Sentiment: ${context.studentSentiment}
- Problem Type: ${context.problemType || 'unknown'}

RECENT MESSAGES:
${JSON.stringify(recentMessages, null, 2)}

${problemContext ? `PROBLEM CONTEXT: ${problemContext}` : ''}

STUDENT STATES TO CHOOSE FROM:
1. knowledge_gap - Student doesn't know methods/concepts (e.g., "I don't know the methods", "I haven't learned this", "no" in response to "Do you remember/know...")
2. stuck - Student has tried but can't proceed (e.g., "I'm stuck", "I don't know what to do next")
3. confused - Student misunderstands the problem (e.g., "I don't understand", "What does this mean?")
4. making_progress - Student is on the right track (e.g., correct steps, showing understanding)
5. frustrated - Multiple failed attempts, repeated "I don't know" or "tell me" requests, explicit frustration language (e.g., "This is too hard", "I can't do this", "frustrated", "frustrating", "tell me now", "just tell", repeated "I don't know" after 2+ turns)
6. ready_to_learn - Student is engaged and ready (e.g., asking questions, showing curiosity)

KNOWLEDGE GAP DETECTION:
- If student says "no" or "nope" in response to "Do you remember/know...?" → knowledge_gap
- If student says "I don't know", "not sure", "no idea" → knowledge_gap
- If student says "I haven't learned this" or "not aware" → knowledge_gap

FRUSTRATION DETECTION PRIORITY:
- If student has said "I don't know" or "tell me" 2+ times in recent messages → likely frustrated
- If student explicitly says "frustrated" or "frustrating" → definitely frustrated
- If turn count >= 3 and sentiment is negative → likely frustrated
- If student says "tell me now" or "just tell" → likely frustrated

ANALYZE AND RESPOND IN THIS FORMAT:
STATE: [state name]
CONFIDENCE: [0.0-1.0]
EVIDENCE: [list 2-3 key pieces of evidence from the conversation]
`
}

/**
 * Parse LLM analysis to extract state
 */
function parseStateAnalysis(
  analysis: string,
  context: StudentStateContext
): DetectedStudentState {
  // Extract state from analysis
  const stateMatch = analysis.match(/STATE:\s*(\w+)/i)
  const confidenceMatch = analysis.match(/CONFIDENCE:\s*([0-9.]+)/i)
  const evidenceMatch = analysis.match(/EVIDENCE:\s*([^\n]+(?:\n[^\n]+)*)/i)
  
  const stateName = stateMatch?.[1]?.toLowerCase() || 'ready_to_learn'
  const confidence = parseFloat(confidenceMatch?.[1] || '0.7')
  const evidence = evidenceMatch?.[1]?.split('\n').filter(Boolean) || ['No specific evidence provided']
  
  // Validate state
  const validStates: StudentState[] = [
    'knowledge_gap',
    'stuck',
    'confused',
    'making_progress',
    'frustrated',
    'ready_to_learn',
  ]
  
  const state = validStates.includes(stateName as StudentState)
    ? (stateName as StudentState)
    : 'ready_to_learn'
  
  return {
    state,
    confidence: Math.max(0, Math.min(1, confidence)),
    evidence,
    context,
  }
}

  /**
   * Fallback pattern-based state detection
   */
  function fallbackStateDetection(
    messages: Message[],
    context: StudentStateContext
  ): DetectedStudentState {
    const userMessages = messages.filter(msg => msg.role === 'user')
    const lastUserMessage = userMessages.slice(-1)[0]?.content.toLowerCase() || ''
    const recentUserMessages = userMessages.slice(-3).map(msg => msg.content.toLowerCase())
    
    // Get previous AI message to check context
    const previousAIMessage = messages
      .filter(msg => msg.role === 'assistant')
      .slice(-1)[0]?.content.toLowerCase() || ''
    
    // Check for frustration signals (multiple "I don't know" or "tell me" requests)
    const dontKnowCount = recentUserMessages.reduce((count, msg) => 
      count + (msg.match(/don'?t know|dont know|not sure|no idea/i) || []).length, 0
    )
    const tellMeCount = recentUserMessages.reduce((count, msg) => 
      count + (msg.match(/tell me|just tell|please tell|tell me now/i) || []).length, 0
    )
    
    // Frustration detection: multiple attempts + explicit frustration language
    if (lastUserMessage.includes("frustrated") || lastUserMessage.includes("frustrating") ||
        lastUserMessage.includes("tell me now") || lastUserMessage.includes("just tell") ||
        (context.turnCount >= 3 && (dontKnowCount >= 2 || tellMeCount >= 2)) ||
        (context.turnCount >= 4 && context.studentSentiment === 'negative')) {
      return {
        state: 'frustrated',
        confidence: 0.85,
        evidence: [
          `Turn count: ${context.turnCount}`,
          `Multiple "I don't know" or "tell me" requests: ${dontKnowCount + tellMeCount}`,
          `Sentiment: ${context.studentSentiment}`
        ],
        context,
      }
    }
    
    // Check for simple "no" response to knowledge questions
    // This catches cases like "Do you remember...?" -> "no"
    const isSimpleNo = lastUserMessage.trim() === 'no' || lastUserMessage.trim() === 'nope' || lastUserMessage.trim() === 'not really'
    const aiAskedAboutKnowledge = previousAIMessage.includes('do you remember') || 
                                   previousAIMessage.includes('do you know') ||
                                   previousAIMessage.includes('are you familiar') ||
                                   previousAIMessage.includes('have you learned') ||
                                   previousAIMessage.includes('recall')
    
    if (isSimpleNo && aiAskedAboutKnowledge) {
      return {
        state: 'knowledge_gap',
        confidence: 0.85,
        evidence: ['Student responded "no" to knowledge question'],
        context,
      }
    }
    
    // Pattern-based detection
    if (lastUserMessage.includes("don't know") || lastUserMessage.includes("not aware") || 
        lastUserMessage.includes("dont know") || lastUserMessage.includes("no idea") ||
        lastUserMessage.includes("not sure") || lastUserMessage.includes("i don't remember")) {
      // If it's been multiple turns, might be frustration
      if (context.turnCount >= 3) {
        return {
          state: 'frustrated',
          confidence: 0.75,
          evidence: ['Multiple turns with "I don\'t know" responses'],
          context,
        }
      }
      return {
        state: 'knowledge_gap',
        confidence: 0.8,
        evidence: ['Student expressed lack of knowledge'],
        context,
      }
    }
    
    if (lastUserMessage.includes("stuck") || lastUserMessage.includes("can't proceed")) {
      return {
        state: 'stuck',
        confidence: 0.8,
        evidence: ['Student expressed being stuck'],
        context,
      }
    }
    
    if (lastUserMessage.includes("don't understand") || lastUserMessage.includes("confused")) {
      return {
        state: 'confused',
        confidence: 0.8,
        evidence: ['Student expressed confusion'],
        context,
      }
    }
    
    // Default: ready to learn
    return {
      state: 'ready_to_learn',
      confidence: 0.6,
      evidence: ['No specific indicators detected'],
      context,
    }
  }

  /**
   * Detect sentiment from message
   */
  function detectSentiment(message: string): 'positive' | 'neutral' | 'negative' {
    const lowerMessage = message.toLowerCase()
    
    // Expanded negative words including frustration signals
    const negativeWords = [
      'can\'t', 'too hard', 'impossible', 'frustrated', 'frustrating', 'frustrate',
      'don\'t understand', 'stuck', 'not sure', 'i don\'t know', 'dont know',
      'tell me', 'just tell', 'please tell', 'tell me now', 'give me',
      'i dont know', 'dont know', 'no idea', 'give up'
    ]
    
    const positiveWords = ['great', 'thanks', 'yes', 'got it', 'understand', 'makes sense', 'i see', 'ah']
    
    // Check for repeated "I don't know" patterns
    const dontKnowCount = (lowerMessage.match(/don'?t know|dont know|not sure|no idea/gi) || []).length
    const tellMeCount = (lowerMessage.match(/tell me|just tell|please tell/g) || []).length
    
    // If multiple "I don't know" or "tell me" patterns, it's frustration
    if (dontKnowCount >= 2 || tellMeCount >= 2) {
      return 'negative'
    }
    
    if (negativeWords.some(word => lowerMessage.includes(word))) {
      return 'negative'
    }
    
    if (positiveWords.some(word => lowerMessage.includes(word))) {
      return 'positive'
    }
    
    return 'neutral'
  }

/**
 * Detect problem type from conversation
 */
function detectProblemType(messages: Message[]): string | undefined {
  const allText = messages.map(msg => msg.content).join(' ').toLowerCase()
  
  if (allText.includes('quadratic') || allText.includes('x²')) {
    return 'quadratic_equation'
  }
  
  if (allText.includes('linear') || allText.includes('slope')) {
    return 'linear_equation'
  }
  
  if (allText.includes('area') || allText.includes('perimeter')) {
    return 'geometry'
  }
  
  if (allText.includes('fraction') || allText.includes('divide')) {
    return 'fractions'
  }
  
  return undefined
}

