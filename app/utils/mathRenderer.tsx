import { InlineMath, BlockMath } from 'react-katex'
import React from 'react'

/**
 * Renders message content with LaTeX math expressions properly rendered
 * Supports:
 * - Inline math: \(...\) or $...$
 * - Block math: \[...\] or $$...$$
 */
export function renderMathContent(content: string): React.ReactNode[] {
  // Handle null, undefined, or empty content
  if (!content || typeof content !== 'string') {
    return [content || '']
  }

  const parts: React.ReactNode[] = []
  let lastIndex = 0

  // Pattern to match:
  // - LaTeX inline: \(...\) (actual backslash-parentheses in the string)
  // - LaTeX block: \[...\] (actual backslash-brackets in the string)
  // - Dollar signs: $...$ (inline) or $$...$$ (block)
  // Note: In JavaScript strings, \( is written as '\\(', but in the actual content it's just \(
  const mathPattern = /(\\(?:\(|\[)|\$\$?)([\s\S]*?)(\\(?:\)|\])|\$\$?)/g

  let match
  while ((match = mathPattern.exec(content)) !== null) {
    const [fullMatch, startDelim, mathContent, endDelim] = match
    const matchStart = match.index
    const matchEnd = matchStart + fullMatch.length

    // Add text before the math expression
    if (matchStart > lastIndex) {
      const textBefore = content.substring(lastIndex, matchStart)
      if (textBefore) {
        parts.push(textBefore)
      }
    }

    // Determine if it's block math or inline math
    // Block math: \[...\] or $$...$$
    // Inline math: \(...\) or $...$
    const isBlockMath = 
      (startDelim === '\\[' && endDelim === '\\]') ||
      (startDelim === '$$' && endDelim === '$$')

    // Clean the math content (remove any extra whitespace)
    const cleanMath = mathContent.trim()

    // Render the math expression
    try {
      if (isBlockMath) {
        parts.push(
          <div key={`math-${matchStart}`} className="my-2">
            <BlockMath math={cleanMath} />
          </div>
        )
      } else {
        parts.push(<InlineMath key={`math-${matchStart}`} math={cleanMath} />)
      }
    } catch (error) {
      // If KaTeX fails to render, fall back to displaying the original
      console.warn('KaTeX rendering error:', error)
      parts.push(<span key={`math-error-${matchStart}`}>{fullMatch}</span>)
    }

    lastIndex = matchEnd
  }

  // Add remaining text after the last math expression
  if (lastIndex < content.length) {
    const remainingText = content.substring(lastIndex)
    if (remainingText) {
      parts.push(remainingText)
    }
  }

  // If no math expressions were found, return the original content
  if (parts.length === 0) {
    return [content]
  }

  return parts
}

