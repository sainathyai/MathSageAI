/**
 * Extract math expressions from text content
 * Returns array of LaTeX expressions found in the text
 */

export function extractMathExpressions(content: string): string[] {
  const expressions: string[] = []
  
  // Pattern to match:
  // - LaTeX inline: \(...\) or $...$
  // - LaTeX block: \[...\] or $$...$$
  const mathPattern = /(\\(?:\(|\[)|\$\$?)([\s\S]*?)(\\(?:\)|\])|\$\$?)/g
  
  let match
  while ((match = mathPattern.exec(content)) !== null) {
    const [, , mathContent] = match
    const cleanMath = mathContent.trim()
    if (cleanMath) {
      expressions.push(cleanMath)
    }
  }
  
  return expressions
}

/**
 * Extract equations and key math information from text
 * Looks for patterns like "x = 5", "2x + 3 = 7", etc.
 */
export function extractEquations(content: string): string[] {
  const equations: string[] = []
  
  // Pattern for simple equations: variable = number or expression
  const equationPatterns = [
    /([a-zA-Z]\s*=\s*[0-9+\-*/().]+)/g, // x = 5, y = 2x + 3
    /([0-9]+\s*[+\-*/]\s*[0-9]+\s*=\s*[0-9]+)/g, // 2 + 3 = 5
    /([a-zA-Z]+\s*[+\-*/]\s*[0-9]+\s*=\s*[0-9]+)/g, // x + 5 = 13
    /([0-9]+\s*[+\-*/]\s*[a-zA-Z]+\s*=\s*[0-9]+)/g, // 2x + 5 = 13
  ]
  
  equationPatterns.forEach(pattern => {
    let match
    while ((match = pattern.exec(content)) !== null) {
      const equation = match[1].trim()
      if (equation && !equations.includes(equation)) {
        equations.push(equation)
      }
    }
  })
  
  return equations
}

/**
 * Extract all math content (LaTeX + equations) from text
 */
export function extractAllMath(content: string): string[] {
  const latexExpressions = extractMathExpressions(content)
  const equations = extractEquations(content)
  
  // Combine and deduplicate
  const allMath = [...latexExpressions, ...equations]
  return [...new Set(allMath)]
}


