/**
 * Response Validator
 * 
 * Validates AI responses for mathematical accuracy and common inaccuracies
 */

/**
 * Check if response contains mathematically inaccurate analogies or definitions
 */
export function validateMathematicalAccuracy(response: string): {
  isAccurate: boolean
  issues: string[]
} {
  const issues: string[] = []
  const lowerResponse = response.toLowerCase()

  // Common inaccurate analogies to flag
  const inaccuratePatterns = [
    {
      pattern: /area.*paint|paint.*area/i,
      issue: 'Area is NOT the amount of paint needed. Area is a measure of 2D space (cm², m²). Paint amount depends on thickness, which is volume (cm³, m³).',
    },
    {
      pattern: /area.*equals.*paint|paint.*equals.*area/i,
      issue: 'Area ≠ paint needed. Area measures 2D space, not material quantity.',
    },
    {
      pattern: /area.*amount of paint|amount of paint.*area/i,
      issue: 'Inaccurate: Area measures 2D space, not paint quantity.',
    },
    {
      pattern: /volume.*weight|weight.*volume/i,
      issue: 'Volume ≠ weight. Volume measures 3D space (cm³), weight measures mass (kg).',
    },
    {
      pattern: /perimeter.*area|area.*perimeter/i,
      context: /confuse|same|equal|like/i,
      issue: 'Perimeter and area are different concepts. Perimeter is distance around, area is space inside.',
    },
  ]

  // Check for inaccurate patterns
  for (const { pattern, issue, context } of inaccuratePatterns) {
    if (pattern.test(lowerResponse)) {
      // If there's a context pattern, check if it's in a confusing context
      if (context) {
        if (context.test(lowerResponse)) {
          issues.push(issue)
        }
      } else {
        issues.push(issue)
      }
    }
  }

  return {
    isAccurate: issues.length === 0,
    issues,
  }
}

/**
 * Check if response corrects an inaccuracy when student points it out
 */
export function checksForCorrections(response: string): boolean {
  const lowerResponse = response.toLowerCase()
  
  const correctionPatterns = [
    /you're right|you're correct|thank you for|good catch|you caught/i,
    /let me correct|i was wrong|that was inaccurate|i made an error/i,
    /actually.*area|actually.*volume|actually.*perimeter/i,
  ]

  return correctionPatterns.some(pattern => pattern.test(lowerResponse))
}

/**
 * Comprehensive validation of response
 */
export function validateResponseQuality(response: string): {
  isValid: boolean
  issues: string[]
  suggestions: string[]
} {
  const issues: string[] = []
  const suggestions: string[] = []

  // Check mathematical accuracy
  const accuracyCheck = validateMathematicalAccuracy(response)
  if (!accuracyCheck.isAccurate) {
    issues.push(...accuracyCheck.issues)
    suggestions.push('Response contains mathematically inaccurate analogies. Use accurate definitions that precisely represent the mathematical concept.')
  }

  // Check if student correction is acknowledged
  // (This would be checked against conversation history, but for now we just check the response)
  const hasCorrection = checksForCorrections(response)
  if (!hasCorrection && accuracyCheck.issues.length > 0) {
    suggestions.push('Student may have pointed out an inaccuracy. Acknowledge and correct it explicitly.')
  }

  return {
    isValid: issues.length === 0,
    issues,
    suggestions,
  }
}

