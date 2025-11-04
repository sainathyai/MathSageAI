/**
 * Strategy Selection System
 * 
 * Maps detected student state to appropriate tutoring strategy
 */

import { 
  DetectedStudentState, 
  TutoringStrategyConfig, 
  TutoringStrategy,
  HintLevel,
  QuestionStyle 
} from '@/app/types/context'

/**
 * Select appropriate tutoring strategy based on detected state
 */
export function selectStrategy(state: DetectedStudentState): TutoringStrategyConfig {
  // Map state to strategy
  const strategyMap: Record<string, TutoringStrategy> = {
    'knowledge_gap': 'method_discovery',
    'stuck': 'progressive_hints',
    'confused': 'clarification_first',
    'making_progress': 'encouragement_challenge',
    'frustrated': 'empathy_simplification',
    'ready_to_learn': 'deep_exploration',
  }
  
  const strategyName = strategyMap[state.state] || 'deep_exploration'
  
  // Get strategy configuration
  return getStrategyConfig(strategyName, state)
}

/**
 * Get detailed strategy configuration
 */
function getStrategyConfig(
  strategy: TutoringStrategy,
  state: DetectedStudentState
): TutoringStrategyConfig {
  const configs: Record<TutoringStrategy, Omit<TutoringStrategyConfig, 'name'>> = {
    method_discovery: {
      approach: 'Address the specific knowledge gap through guided discovery, maintaining conversation continuity',
      instructions: `The student has indicated they don't know something specific that you just asked about.

CRITICAL - MAINTAIN CONVERSATION CONTINUITY:
1. Review your previous message - what specific concept or question did you ask about?
2. If you asked "Do you remember [concept]?" and they said "no", address that SPECIFIC concept first
3. DO NOT skip to solution methods if foundational concepts aren't understood
4. Use guided discovery to help them understand the concept you asked about

APPROACH:
1. If you asked about a foundational concept (like "general form"), guide them to discover it:
   - Break it down: "Let's look at your equation. What parts do you see?"
   - Pattern recognition: "What's the highest power of x? What about the other terms?"
   - Build understanding: "So we have x², a term with x, and a constant. That's the pattern!"
2. Only after foundational understanding, move to solution methods if relevant
3. If student doesn't know solution methods specifically, THEN list them and let them choose

WRONG APPROACH:
- Asking about concept A, student says "no", then jumping to concept B
- Example: "Do you remember the general form?" → "no" → "Here are solution methods"

RIGHT APPROACH:
- Asking about concept A, student says "no", then helping them understand concept A
- Example: "Do you remember the general form?" → "no" → "Let's discover it together. Looking at x² - 5x + 6 = 0, what parts do you see?"`,
      hintLevel: 'subtle',
      questionStyle: 'discovery',
      tone: 'encouraging',
    },
    
    progressive_hints: {
      approach: 'Escalate hints gradually, ask probing questions to understand where they\'re stuck',
      instructions: `The student is stuck and has tried but can't proceed.

APPROACH:
1. Ask probing questions to understand where exactly they're stuck
2. Provide subtle hints that guide thinking without giving answers
3. Escalate hint level based on turn count (turn ${state.context.turnCount} - use ${state.context.turnCount >= 3 ? 'moderate' : 'subtle'} hints)
4. Break down the problem into smaller steps if needed

QUESTION STYLE:
- Ask "What have you tried so far?"
- "Where do you think you might be getting stuck?"
- "What information do we have that we haven't used yet?"`,
      hintLevel: state.context.turnCount >= 3 ? 'moderate' : 'subtle',
      questionStyle: 'probing',
      tone: 'supportive',
    },
    
    clarification_first: {
      approach: 'Clarify problem understanding before attempting to solve',
      instructions: `The student is confused about the problem itself.

APPROACH:
1. First, clarify what the problem is asking
2. Ask them to explain what they understand so far
3. Identify any misconceptions about the problem setup
4. Only after understanding is clear, guide toward solution

QUESTION STYLE:
- "Can you tell me what you think this problem is asking?"
- "What do you think we need to find?"
- "What information is given in the problem?"`,
      hintLevel: 'none',
      questionStyle: 'clarifying',
      tone: 'supportive',
    },
    
    encouragement_challenge: {
      approach: 'Celebrate progress, then introduce next challenge',
      instructions: `The student is making progress and is on the right track.

APPROACH:
1. Acknowledge and celebrate what they've done correctly
2. Encourage them to continue
3. Introduce the next challenge or step
4. Maintain momentum with positive reinforcement

TONE:
- Use encouraging language: "Great thinking!", "You're on the right track!"
- Celebrate effort, not just correctness
- Build confidence for next step`,
      hintLevel: 'subtle',
      questionStyle: 'challenging',
      tone: 'encouraging',
    },
    
    empathy_simplification: {
      approach: 'Acknowledge frustration, provide more direct guidance while still engaging student',
      instructions: `The student is frustrated after multiple attempts and has asked to be told the answer multiple times.

CRITICAL: When a student is frustrated and has asked multiple times (e.g., "tell me", "I don't know", "just tell me"), you MUST provide more direct guidance while still engaging them. The Socratic method is important, but when frustration is high, you need to balance guidance with support.

APPROACH:
1. Acknowledge their frustration empathetically: "I understand this can be frustrating. Let's work through this together."
2. Normalize struggle as part of learning
3. Provide more concrete guidance - explain the concept more directly, then ask them to apply it
4. Break the problem into much smaller, manageable steps
5. Use very encouraging, supportive language
6. After 3+ failed attempts or explicit frustration, provide more direct explanation followed by practice questions

IMPORTANT ESCALATION RULES:
- If student has asked "tell me" or "I don't know" 2+ times: Provide a clear explanation of the concept, then ask them to apply it
- If student says "frustrated" or "frustrating": Immediately acknowledge, provide direct guidance, then check understanding
- Example: "I understand this can be frustrating. Let me help: When we move a number from one side of an equation to the other, we do the opposite operation. Since 5 is being added, we subtract 5 from both sides. So 2x + 5 - 5 = 13 - 5, which gives us 2x = 8. Does this make sense? Now, what do you think we should do next?"

TONE:
- Empathic: "I understand this can be frustrating. Let's take a step back."
- Supportive: "Mistakes help us learn. Let's try a different approach."
- Normalizing: "Many students find this challenging. You're not alone."
- Direct but still engaging: Provide clear explanation, then immediately ask them to apply it`,
      hintLevel: 'concrete',
      questionStyle: 'clarifying',
      tone: 'empathic',
    },
    
    deep_exploration: {
      approach: 'Guide through conceptual understanding with discovery questions',
      instructions: `The student is engaged and ready to learn.

APPROACH:
1. Guide through conceptual understanding first
2. Ask discovery questions that help them understand "why"
3. Connect to underlying concepts
4. Build deep understanding before procedural steps

QUESTION STYLE:
- Focus on "why" before "how"
- "What do you think this means?"
- "How does this relate to what we know?"
- "What patterns do you notice?"`,
      hintLevel: 'subtle',
      questionStyle: 'discovery',
      tone: 'encouraging',
    },
  }
  
  return {
    name: strategy,
    ...configs[strategy],
  }
}

