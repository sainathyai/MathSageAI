'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { InlineMath, BlockMath } from 'react-katex'
import { X, Send, Type } from 'lucide-react'
import { cn } from '@/lib/utils'
import 'katex/dist/katex.min.css'

interface MathFormulaInputProps {
  onInsert: (latex: string) => void
  onClose: () => void
}

export function MathFormulaInput({ onInsert, onClose }: MathFormulaInputProps) {
  const [latex, setLatex] = useState('')
  const [error, setError] = useState('')

  const commonFormulas = [
    { label: 'Quadratic', latex: 'x^2 + bx + c = 0' },
    { label: 'Linear', latex: 'y = mx + b' },
    { label: 'Pythagorean', latex: 'a^2 + b^2 = c^2' },
    { label: 'Area Circle', latex: 'A = \\pi r^2' },
    { label: 'Slope', latex: 'm = \\frac{y_2 - y_1}{x_2 - x_1}' },
    { label: 'Distance', latex: 'd = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}' },
  ]

  const handleInsert = () => {
    if (!latex.trim()) return

    try {
      // Test if LaTeX is valid by attempting to render
      onInsert(latex.trim())
      setLatex('')
      setError('')
    } catch (err) {
      setError('Invalid LaTeX syntax')
    }
  }

  const handleFormulaClick = (formulaLatex: string) => {
    setLatex(formulaLatex)
  }

  return (
    <Card className="absolute top-16 left-4 z-30 w-96 bg-white/95 backdrop-blur-sm border border-slate-200/50 shadow-lg">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Type className="h-4 w-4 text-brand-blue-DEFAULT" />
            <h3 className="text-sm font-semibold text-slate-900">Math Formula Input</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-6 w-6"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* LaTeX Input */}
        <div className="mb-4">
          <label className="text-xs font-medium text-slate-600 mb-2 block">
            LaTeX Formula
          </label>
          <Input
            value={latex}
            onChange={(e) => {
              setLatex(e.target.value)
              setError('')
            }}
            placeholder="e.g., x^2 + 5x + 6 = 0"
            className="font-mono text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                handleInsert()
              }
            }}
          />
          <p className="text-xs text-slate-500 mt-1">
            Press Ctrl+Enter to insert
          </p>
        </div>

        {/* Live Preview */}
        {latex && (
          <div className="mb-4 p-3 bg-slate-50 rounded-md border border-slate-200">
            <p className="text-xs font-medium text-slate-600 mb-2">Preview:</p>
            <div className="min-h-[40px] flex items-center justify-center">
              {error ? (
                <p className="text-xs text-red-500">{error}</p>
              ) : (
                <BlockMath math={latex} />
              )}
            </div>
          </div>
        )}

        {/* Common Formulas */}
        <div className="mb-4">
          <p className="text-xs font-medium text-slate-600 mb-2">Common Formulas:</p>
          <div className="grid grid-cols-2 gap-2">
            {commonFormulas.map((formula, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                onClick={() => handleFormulaClick(formula.latex)}
                className="text-xs justify-start h-auto py-2 px-2"
              >
                <div className="text-left">
                  <p className="font-medium text-slate-700">{formula.label}</p>
                  <p className="text-xs text-slate-500 font-mono truncate">
                    {formula.latex}
                  </p>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleInsert}
            disabled={!latex.trim()}
            className="flex-1 bg-gradient-brand text-white hover:opacity-90"
          >
            <Send className="h-4 w-4 mr-2" />
            Insert
          </Button>
        </div>
      </div>
    </Card>
  )
}


