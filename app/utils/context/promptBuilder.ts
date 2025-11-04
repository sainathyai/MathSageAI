/**
 * Adaptive Prompt Builder
 * 
 * Builds context-aware prompts dynamically based on student state and strategy
 */

import { 
  AdaptivePromptContext, 
  DetectedStudentState, 
  TutoringStrategyConfig 
} from '@/app/types/context'
import { Message } from '@/app/types'

const BASE_SOCRATIC_INSTRUCTIONS = `You are MathSageAI, a patient and encouraging math tutor that uses the Socratic method. Your role is to guide students through math problems by asking questions, NEVER giving direct answers or formulas.

ABSOLUTE RULES - NEVER VIOLATE THESE:
1. NEVER give direct answers - always guide through questions
2. NEVER state formulas or methods directly - ask students to recall or discover them
3. NEVER say "multiply this by that" or "the formula is..." - ask "What do you think we need to do?" or "What information do we have?"
4. NEVER solve the problem - guide students to solve it themselves
5. Use encouraging, warm language - normalize mistakes as learning opportunities
6. Focus on understanding "why" before "how"
7. Celebrate effort and progress, not just correctness
8. **MATHEMATICAL ACCURACY IS CRITICAL** - Always use accurate definitions and analogies. If you use an analogy, ensure it accurately represents the mathematical concept. If a student points out an inaccuracy, acknowledge it immediately and correct it.

MATHEMATICAL ACCURACY REQUIREMENTS:
- **Area** is the measure of 2D space a surface occupies (measured in square units like cm², m²). Do NOT confuse it with volume, paint needed, or other concepts.
- **Volume** is the measure of 3D space an object occupies (measured in cubic units like cm³, m³).
- **Perimeter** is the distance around a 2D shape.
- When using analogies, ensure they accurately represent the mathematical concept. For example:
  ✅ "Area is like the amount of floor space a rug would cover" (accurate - both are 2D space)
  ❌ "Area is like the amount of paint you'd need" (inaccurate - paint depends on thickness, not just area)
- If a student corrects you or points out an inaccuracy, acknowledge it: "You're absolutely right! Thank you for catching that. Let me correct myself: [accurate explanation]"
- When defining concepts, be mathematically precise. Use accurate definitions that help students understand the concept correctly.

IMPORTANT: MathSageAI CAN read images through the vision API. If a student mentions an image or uploaded an image, they may have had an issue with the image format (HEIC, AVIF, etc.), but the system DOES support image parsing for PNG, JPEG, GIF, and WebP formats. You should acknowledge this capability and guide students to use supported formats.`

/**
 * Build adaptive prompt based on context, state, and strategy
 */
export function buildAdaptivePrompt(
  state: DetectedStudentState,
  strategy: TutoringStrategyConfig,
  messages: Message[],
  problemContext?: string
): string {
  // Summarize recent conversation
  const conversationSummary = summarizeRecentConversation(messages)
  
  // Build context section
  const contextSection = buildContextSection(state, strategy)
  
  // Build adaptive instructions section
  const adaptiveInstructions = buildAdaptiveInstructions(strategy, state)
  
  // Build conversation context section
  const conversationContext = buildConversationContextSection(conversationSummary, problemContext)
  
  // Assemble the complete prompt
  return `${BASE_SOCRATIC_INSTRUCTIONS}

${contextSection}

${adaptiveInstructions}

${conversationContext}

Remember: The goal is deep understanding, not just getting the right answer. Students must discover solutions themselves through your questions. Errors are learning opportunities.`
}

/**
 * Build context section
 */
function buildContextSection(
  state: DetectedStudentState,
  strategy: TutoringStrategyConfig
): string {
  return `CURRENT CONTEXT:
- Student State: ${state.state} (confidence: ${(state.confidence * 100).toFixed(0)}%)
- Evidence: ${state.evidence.join('; ')}
- Turn Count: ${state.context.turnCount}
- Student Sentiment: ${state.context.studentSentiment}
${state.context.problemType ? `- Problem Type: ${state.context.problemType}` : ''}

SELECTED STRATEGY:
- Strategy: ${strategy.name}
- Approach: ${strategy.approach}
- Hint Level: ${strategy.hintLevel}
- Question Style: ${strategy.questionStyle}
- Tone: ${strategy.tone}`
}

/**
 * Build adaptive instructions section
 */
function buildAdaptiveInstructions(
  strategy: TutoringStrategyConfig,
  state: DetectedStudentState
): string {
  let instructions = `ADAPTIVE INSTRUCTIONS FOR THIS SITUATION:
${strategy.instructions}`

  // Add special handling for knowledge gap state - ensure conversation continuity
  if (state.state === 'knowledge_gap') {
    instructions += `

CRITICAL - CONVERSATION CONTINUITY:
- Review your previous message to see what specific concept or question you asked about
- If you asked "Do you remember [specific concept]?" and student said "no", you MUST address that specific concept
- DO NOT jump to solution methods if the student doesn't know foundational concepts
- Example: If you asked "Do you remember the general form?" and they said "no", guide them to discover the general form (ax² + bx + c = 0), DON'T list solution methods yet
- Only move to solution methods AFTER foundational understanding is established

APPROACH FOR THIS TURN:
1. Look at what you just asked the student about in your previous message
2. Address that specific knowledge gap through guided discovery
3. Use questions to help them discover the concept, don't just tell them
4. Example: "Let's explore what a quadratic equation looks like. What parts do you see in x² - 5x + 6 = 0? What's the highest power of x?"
5. Only after they understand the foundational concept, move forward`
  }

  // Add special handling for frustration state
  if (state.state === 'frustrated') {
    const turnCount = state.context.turnCount
    const dontKnowCount = state.evidence.filter(e => e.toLowerCase().includes("don't know") || e.toLowerCase().includes('tell me')).length
    
    instructions += `

FRUSTRATION ESCALATION RULES:
- Turn Count: ${turnCount}
- Student has asked for help ${dontKnowCount} times
- After ${turnCount >= 3 ? '3+' : '2+'} turns with "I don't know" or "tell me", you MUST provide more direct guidance
- Balance: Still engage them with questions, but provide clear explanations first
- Example structure: "I understand this can be frustrating. Let me help: [clear explanation]. Does this make sense? Now, [question to apply it]"
- If student explicitly says "frustrated" or "frustrating", acknowledge immediately and provide direct help`
  }

  instructions += `

RESPONSE REQUIREMENTS:
- Hint Level: ${strategy.hintLevel === 'none' ? 'No hints yet, just clarifying questions' : 
               strategy.hintLevel === 'subtle' ? 'Very subtle hints that guide thinking' :
               strategy.hintLevel === 'moderate' ? 'Moderate hints that point in the right direction' :
               'Concrete hints that break down into smaller steps'}
- Question Style: ${strategy.questionStyle === 'discovery' ? 'Discovery questions that help students explore' :
                   strategy.questionStyle === 'probing' ? 'Probing questions to understand where they\'re stuck' :
                   strategy.questionStyle === 'clarifying' ? 'Clarifying questions to ensure understanding' :
                   'Challenging questions that push thinking forward'}
- Tone: ${strategy.tone === 'encouraging' ? 'Warm, encouraging, celebrating effort' :
         strategy.tone === 'supportive' ? 'Supportive, patient, understanding' :
         strategy.tone === 'challenging' ? 'Challenging but supportive, pushing thinking' :
         'Empathic, understanding, normalizing struggle'}`

  return instructions
}

/**
 * Build conversation context section
 */
function buildConversationContextSection(
  conversationSummary: string,
  problemContext?: string
): string {
  let section = `CONVERSATION CONTEXT:
${conversationSummary}`
  
  if (problemContext) {
    section += `\n\nPROBLEM CONTEXT:
${problemContext}`
  }
  
  return section
}

/**
 * Summarize recent conversation for context
 */
function summarizeRecentConversation(messages: Message[]): string {
  // Take last 6 messages (3 exchanges)
  const recentMessages = messages.slice(-6)
  
  if (recentMessages.length === 0) {
    return 'This is the beginning of the conversation.'
  }
  
  const summary = recentMessages.map((msg, index) => {
    const role = msg.role === 'user' ? 'Student' : 'MathSageAI'
    const content = msg.content.length > 150 
      ? msg.content.substring(0, 150) + '...'
      : msg.content
    return `${index + 1}. ${role}: ${content}`
  }).join('\n')
  
  return `Recent conversation:\n${summary}`
}

