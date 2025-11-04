/**
 * Adaptive System Types
 * 
 * Defines types for the context-aware, adaptive tutoring system
 */

export type StudentState = 
  | 'knowledge_gap'      // Student doesn't know methods/concepts
  | 'stuck'              // Student has tried but can't proceed
  | 'confused'           // Student misunderstands the problem
  | 'making_progress'    // Student is on the right track
  | 'frustrated'         // Multiple failed attempts
  | 'ready_to_learn'     // Student is engaged and ready

export type HintLevel = 'none' | 'subtle' | 'moderate' | 'concrete'

export type QuestionStyle = 'discovery' | 'probing' | 'clarifying' | 'challenging'

export type TutoringStrategy = 
  | 'method_discovery'    // List methods → student chooses → guide discovery
  | 'progressive_hints'   // Escalate hints gradually
  | 'clarification_first' // Clarify understanding before solving
  | 'encouragement_challenge' // Celebrate progress, introduce next challenge
  | 'empathy_simplification' // Acknowledge frustration, break into smaller steps
  | 'deep_exploration'    // Guide through conceptual understanding

export interface StudentStateContext {
  turnCount: number
  problemType?: string
  recentErrors: string[]
  studentSentiment: 'positive' | 'neutral' | 'negative'
  conversationLength: number
}

export interface DetectedStudentState {
  state: StudentState
  confidence: number  // 0-1, how confident we are in this state
  evidence: string[]  // What led us to this conclusion
  context: StudentStateContext
}

export interface TutoringStrategyConfig {
  name: TutoringStrategy
  approach: string  // High-level description
  instructions: string  // Specific instructions for this strategy
  hintLevel: HintLevel
  questionStyle: QuestionStyle
  tone: 'encouraging' | 'supportive' | 'challenging' | 'empathic'
}

export interface AdaptivePromptContext {
  baseInstructions: string
  strategy: TutoringStrategyConfig
  state: DetectedStudentState
  conversationSummary: string
  problemContext?: string
}

