/**
 * Phase 1: Enhanced Feedback System
 * 
 * This module provides step-by-step analysis of student responses,
 * error classification, and misconception detection.
 */

import { ErrorAnalysis, FeedbackAnalysis, StepAnalysis, ErrorType } from '@/app/types'

/**
 * Analyze student response for step-by-step errors
 */
export async function analyzeSteps(
  studentResponse: string,
  problemContext: string,
  correctApproach?: string
): Promise<StepAnalysis> {
  // Parse response into steps (look for numbered steps, line breaks, or logical breaks)
  const steps = parseSteps(studentResponse)
  
  // Identify which steps are correct/incorrect
  // For now, this is a placeholder - will be enhanced with OpenAI analysis
  const correctSteps: number[] = []
  const incorrectSteps: number[] = []
  
  // TODO: Use OpenAI to analyze each step
  // For MVP, we'll do basic pattern matching
  
  return {
    steps,
    correctSteps,
    incorrectSteps,
  }
}

/**
 * Parse student response into individual steps
 */
function parseSteps(response: string): string[] {
  // Split by numbered steps (1., 2., etc.)
  const numberedSteps = response.match(/\d+[.)]\s*[^\d]+/g)
  if (numberedSteps && numberedSteps.length > 1) {
    return numberedSteps.map(step => step.replace(/^\d+[.)]\s*/, '').trim())
  }
  
  // Split by line breaks if no numbered steps
  const lines = response.split('\n').filter(line => line.trim().length > 0)
  if (lines.length > 1) {
    return lines.map(line => line.trim())
  }
  
  // Single step
  return [response.trim()]
}

/**
 * Classify error type
 */
export function classifyError(
  errorLocation: string,
  studentResponse: string,
  problemContext: string
): ErrorType {
  const lowerResponse = studentResponse.toLowerCase()
  const lowerError = errorLocation.toLowerCase()
  
  // Calculation errors - numeric mistakes, arithmetic errors
  if (
    /\d+\s*[+\-*/]\s*\d+\s*=\s*\d+/.test(lowerError) ||
    /calculation|arithmetic|compute|calculate/.test(lowerError) ||
    /\b\d+\s*[+\-*/=]/.test(lowerError)
  ) {
    return 'calculation'
  }
  
  // Conceptual errors - misunderstanding of concepts
  if (
    /concept|understand|meaning|definition|principle/.test(lowerError) ||
    /doesn't make sense|confused|wrong idea/.test(lowerResponse)
  ) {
    return 'conceptual'
  }
  
  // Procedural errors - wrong method or approach
  if (
    /method|approach|procedure|process|steps|algorithm/.test(lowerError) ||
    /wrong way|incorrect method|should use/.test(lowerResponse)
  ) {
    return 'procedural'
  }
  
  return 'unknown'
}

/**
 * Detect common misconceptions
 */
export function detectMisconception(
  errorType: ErrorType,
  errorLocation: string,
  studentResponse: string,
  problemContext: string
): string | undefined {
  // Common math misconceptions database
  const misconceptions: Record<string, RegExp[]> = {
    // Algebra misconceptions
    'negative-signs': [
      /negative.*negative.*positive/i,
      /-.*-.*\+/,
      /subtracting.*negative/i,
    ],
    'order-of-operations': [
      /left.*right/i,
      /order.*operations/i,
      /pemdas/i,
      /bodmas/i,
    ],
    'fractions': [
      /add.*numerator.*denominator/i,
      /multiply.*fractions/i,
    ],
    'equations': [
      /move.*side/i,
      /change.*sign/i,
    ],
  }
  
  // Check for misconception patterns
  for (const [misconception, patterns] of Object.entries(misconceptions)) {
    for (const pattern of patterns) {
      if (pattern.test(studentResponse) || pattern.test(errorLocation)) {
        return misconception
      }
    }
  }
  
  return undefined
}

/**
 * Generate comprehensive feedback analysis
 */
export async function analyzeFeedback(
  studentResponse: string,
  problemContext: string,
  aiResponse?: string
): Promise<FeedbackAnalysis> {
  // Analyze steps
  const stepAnalysis = await analyzeSteps(studentResponse, problemContext)
  
  // Find errors
  const errorAnalyses: ErrorAnalysis[] = []
  
  // Check each incorrect step
  for (const stepIndex of stepAnalysis.incorrectSteps) {
    const step = stepAnalysis.steps[stepIndex]
    const errorType = classifyError(step, studentResponse, problemContext)
    const misconception = detectMisconception(errorType, step, studentResponse, problemContext)
    
    errorAnalyses.push({
      errorType,
      step: stepIndex + 1, // 1-indexed for user display
      location: step,
      misconception,
      reasoning: `Error detected in step ${stepIndex + 1}`,
    })
  }
  
  // Determine if there are errors
  const hasError = errorAnalyses.length > 0
  
  // Generate guidance based on error type
  const guidance = generateGuidance(errorAnalyses, problemContext)
  
  // Generate encouragement
  const encouragement = generateEncouragement(hasError, errorAnalyses.length)
  
  // Suggest next steps
  const nextSteps = generateNextSteps(errorAnalyses, problemContext)
  
  return {
    hasError,
    errorAnalyses,
    misconception: errorAnalyses[0]?.misconception,
    guidance,
    encouragement,
    nextSteps,
  }
}

/**
 * Generate guidance based on errors
 */
function generateGuidance(
  errorAnalyses: ErrorAnalysis[],
  problemContext: string
): string {
  if (errorAnalyses.length === 0) {
    return "Great work! You're on the right track."
  }
  
  const primaryError = errorAnalyses[0]
  
  switch (primaryError.errorType) {
    case 'calculation':
      return "I notice there might be a calculation error. Let's check your arithmetic step by step. What operation are you performing here?"
    
    case 'conceptual':
      return "It looks like there might be a misunderstanding of the concept. Let's think about what this problem is really asking. Can you explain what you understand so far?"
    
    case 'procedural':
      return "Your approach might need adjustment. Let's think about what method would work best here. What strategies have you learned for this type of problem?"
    
    default:
      return "Let's review this step together. Can you walk me through what you're thinking?"
  }
}

/**
 * Generate encouraging feedback
 */
function generateEncouragement(hasError: boolean, errorCount: number): string {
  if (!hasError) {
    return "Excellent thinking! You're making great progress."
  }
  
  const encouragements = [
    "Don't worry - mistakes help us learn! Let's work through this together.",
    "You're on the right track! Let's figure this out step by step.",
    "Great effort! Every mistake is a learning opportunity.",
    "I appreciate your persistence! Let's tackle this together.",
  ]
  
  return encouragements[Math.floor(Math.random() * encouragements.length)]
}

/**
 * Generate next steps suggestions
 */
function generateNextSteps(
  errorAnalyses: ErrorAnalysis[],
  problemContext: string
): string[] {
  const steps: string[] = []
  
  if (errorAnalyses.length === 0) {
    return ["Continue with the next step", "Review your work", "Check your final answer"]
  }
  
  const primaryError = errorAnalyses[0]
  
  switch (primaryError.errorType) {
    case 'calculation':
      steps.push("Double-check your arithmetic")
      steps.push("Review the operation you're performing")
      steps.push("Verify each calculation step")
      break
    
    case 'conceptual':
      steps.push("Review the core concept")
      steps.push("Think about what the problem is asking")
      steps.push("Consider similar problems you've solved")
      break
    
    case 'procedural':
      steps.push("Consider alternative approaches")
      steps.push("Review the steps you've learned")
      steps.push("Think about what method fits this problem")
      break
  }
  
  if (primaryError.misconception) {
    steps.push(`Address the misconception: ${primaryError.misconception}`)
  }
  
  return steps
}

