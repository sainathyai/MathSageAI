'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, Sigma, Pi, Infinity } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MathSymbolsPaletteProps {
  onInsert: (symbol: string) => void
  onClose: () => void
}

export function MathSymbolsPalette({ onInsert, onClose }: MathSymbolsPaletteProps) {
  const symbolCategories = [
    {
      name: 'Operators',
      symbols: [
        { latex: '+', label: 'Plus' },
        { latex: '-', label: 'Minus' },
        { latex: '\\times', label: 'Times' },
        { latex: '\\div', label: 'Divide' },
        { latex: '=', label: 'Equals' },
        { latex: '\\neq', label: 'Not Equal' },
        { latex: '\\pm', label: 'Plus/Minus' },
        { latex: '\\cdot', label: 'Dot' },
      ],
    },
    {
      name: 'Relations',
      symbols: [
        { latex: '<', label: 'Less Than' },
        { latex: '>', label: 'Greater Than' },
        { latex: '\\leq', label: 'Less or Equal' },
        { latex: '\\geq', label: 'Greater or Equal' },
        { latex: '\\approx', label: 'Approximately' },
        { latex: '\\equiv', label: 'Equivalent' },
        { latex: '\\propto', label: 'Proportional' },
      ],
    },
    {
      name: 'Greek Letters',
      symbols: [
        { latex: '\\alpha', label: 'Alpha' },
        { latex: '\\beta', label: 'Beta' },
        { latex: '\\gamma', label: 'Gamma' },
        { latex: '\\delta', label: 'Delta' },
        { latex: '\\theta', label: 'Theta' },
        { latex: '\\pi', label: 'Pi' },
        { latex: '\\lambda', label: 'Lambda' },
        { latex: '\\mu', label: 'Mu' },
        { latex: '\\sigma', label: 'Sigma' },
        { latex: '\\omega', label: 'Omega' },
      ],
    },
    {
      name: 'Functions',
      symbols: [
        { latex: '\\sqrt{x}', label: 'Square Root' },
        { latex: '\\sqrt[n]{x}', label: 'Nth Root' },
        { latex: '\\sum', label: 'Summation' },
        { latex: '\\prod', label: 'Product' },
        { latex: '\\int', label: 'Integral' },
        { latex: '\\lim', label: 'Limit' },
        { latex: '\\sin', label: 'Sine' },
        { latex: '\\cos', label: 'Cosine' },
        { latex: '\\tan', label: 'Tangent' },
        { latex: '\\log', label: 'Logarithm' },
        { latex: '\\ln', label: 'Natural Log' },
      ],
    },
    {
      name: 'Special',
      symbols: [
        { latex: '\\infty', label: 'Infinity' },
        { latex: '\\pi', label: 'Pi' },
        { latex: 'e', label: 'Euler Number' },
        { latex: '\\emptyset', label: 'Empty Set' },
        { latex: '\\in', label: 'Element Of' },
        { latex: '\\notin', label: 'Not Element Of' },
        { latex: '\\subset', label: 'Subset' },
        { latex: '\\cup', label: 'Union' },
        { latex: '\\cap', label: 'Intersection' },
      ],
    },
    {
      name: 'Fractions & Powers',
      symbols: [
        { latex: '\\frac{a}{b}', label: 'Fraction' },
        { latex: 'x^{n}', label: 'Power' },
        { latex: 'x_{n}', label: 'Subscript' },
        { latex: '\\binom{n}{k}', label: 'Binomial' },
      ],
    },
  ]

  return (
    <Card className="absolute top-16 right-4 z-30 w-80 max-h-[600px] bg-white/95 backdrop-blur-sm border border-slate-200/50 shadow-lg overflow-hidden flex flex-col">
      <div className="p-4 border-b border-slate-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sigma className="h-4 w-4 text-brand-blue-DEFAULT" />
            <h3 className="text-sm font-semibold text-slate-900">Math Symbols</h3>
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
      </div>

      <div className="overflow-y-auto flex-1 p-4">
        {symbolCategories.map((category, catIdx) => (
          <div key={catIdx} className="mb-6 last:mb-0">
            <p className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">
              {category.name}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {category.symbols.map((symbol, symIdx) => (
                <Button
                  key={symIdx}
                  variant="outline"
                  size="sm"
                  onClick={() => onInsert(symbol.latex)}
                  className="h-12 flex flex-col items-center justify-center gap-1 hover:bg-gradient-brand hover:bg-opacity-10 hover:border-brand-blue-DEFAULT"
                  title={symbol.label}
                >
                  <span className="text-xs font-mono text-slate-600 line-clamp-1">
                    {symbol.latex}
                  </span>
                  <span className="text-[10px] text-slate-500 line-clamp-1">
                    {symbol.label}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}


