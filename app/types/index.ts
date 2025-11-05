/**
 * Core type definitions for MathSageAI
 */

export type MessageRole = 'user' | 'assistant' | 'system'

import { DrawingCommand } from './drawing'

export interface Message {
  id: string
  role: MessageRole
  content: string
  timestamp: Date
  imageUrl?: string
  isCorrect?: boolean // True if the user's answer is correct
  isPartiallyCorrect?: boolean // True if the answer is on the right track
  drawingCommands?: DrawingCommand[]
  clearCanvas?: boolean
}

export interface Session {
  id: string
  userId?: string // Cognito user ID (optional for guest sessions)
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
  problem?: string
  isGuest?: boolean // True if session belongs to unauthenticated user
}

/**
 * Phase 1: Enhanced Feedback System Types
 */

export type ErrorType = 'calculation' | 'conceptual' | 'procedural' | 'unknown'

export interface ErrorAnalysis {
  errorType: ErrorType
  step: number
  location: string // Where in the response the error occurred
  misconception?: string
  reasoning: string
}

export interface FeedbackAnalysis {
  hasError: boolean
  errorAnalyses: ErrorAnalysis[]
  misconception?: string
  guidance: string
  encouragement: string
  nextSteps: string[]
}

export interface StepAnalysis {
  steps: string[]
  errorStep?: number
  correctSteps: number[]
  incorrectSteps: number[]
}

/**
 * Phase 2: Concept Tracking Types (for future implementation)
 */

export interface MathConcept {
  id: string
  name: string
  category: string
  prerequisites: string[]
  difficulty: number
  description: string
}

export interface ConceptMastery {
  conceptId: string
  mastery: number // 0-1
  attempts: number
  successRate: number
  lastInteraction: Date
  nextReview?: Date
}

