'use client'

import { Card } from '@/components/ui/card'
import { Calculator, Grid3x3, PieChart, FileText } from 'lucide-react'
import { useState } from 'react'

interface ExampleProblem {
  id: string
  title: string
  problem: string
  icon: React.ReactNode
  difficulty: 'Easy' | 'Medium' | 'Hard'
}

const exampleProblems: ExampleProblem[] = [
  {
    id: '1',
    title: 'Linear Equation',
    problem: 'Solve: 2x + 5 = 13',
    icon: <Calculator className="h-5 w-5" />,
    difficulty: 'Easy'
  },
  {
    id: '2',
    title: 'Geometry',
    problem: 'Find the area of a circle with radius 5cm',
    icon: <PieChart className="h-5 w-5" />,
    difficulty: 'Medium'
  },
  {
    id: '3',
    title: 'Algebra',
    problem: 'Solve: x² - 5x + 6 = 0',
    icon: <Grid3x3 className="h-5 w-5" />,
    difficulty: 'Medium'
  },
  {
    id: '4',
    title: 'Word Problem',
    problem: 'If 3 apples cost $2, how much do 10 apples cost?',
    icon: <FileText className="h-5 w-5" />,
    difficulty: 'Easy'
  }
]

interface WelcomeScreenProps {
  onSelectExample: (problem: string) => void
}

export function WelcomeScreen({ onSelectExample }: WelcomeScreenProps) {
  const [logoError, setLogoError] = useState(false)

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-20rem)] px-4 py-12 pb-8">
      {/* Welcome Message */}
      <div className="text-center mb-12 max-w-2xl">
        <div className="inline-flex h-32 w-32 items-center justify-center rounded-full overflow-hidden shadow-2xl mb-6 animate-pulse">
          {logoError ? (
            <span className="text-6xl">🦉</span>
          ) : (
            <img 
              src="/logo.png" 
              alt="MathSageAI Logo" 
              className="h-full w-full object-contain"
              onError={(e) => {
                console.error('Logo failed to load from /logo.png');
                setLogoError(true);
              }}
            />
          )}
        </div>
        
        <h1 className="text-4xl font-bold text-slate-900 mb-2">
          Welcome to Math<span className="text-brand-blue-dark">Sage</span>
          <span className="text-brand-green-DEFAULT">AI</span>
        </h1>
        
        <p className="text-lg text-slate-600 mb-3 font-medium">
          Your Personalized Math Companion
        </p>
        
        <p className="text-base text-slate-600 mb-2">
          I&apos;m your friendly AI tutor, here to guide you through math problems
        </p>
        
        <p className="text-sm text-slate-500">
          Using the Socratic method, I&apos;ll ask questions to help you discover solutions yourself
        </p>
      </div>

      {/* Example Problems */}
      <div className="w-full max-w-4xl mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 text-center">
          Try an example problem
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {exampleProblems.map((example) => (
            <Card 
              key={example.id}
              className="p-6 hover:shadow-lg transition-all cursor-pointer border-2 hover:border-indigo-200 group"
              onClick={() => onSelectExample(example.problem)}
            >
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-gradient-brand bg-opacity-10 text-brand-blue-dark group-hover:bg-opacity-20 transition-colors">
                  {example.icon}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-slate-900">
                      {example.title}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      example.difficulty === 'Easy' 
                        ? 'bg-emerald-50 text-emerald-700'
                        : example.difficulty === 'Medium'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-red-50 text-red-700'
                    }`}>
                      {example.difficulty}
                    </span>
                  </div>
                  
                  <p className="text-sm text-slate-600">
                    {example.problem}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Or Message */}
      <div className="text-center">
        <p className="text-sm text-slate-500 mb-6">
          Or type your own problem below, or upload an image
        </p>
      </div>
    </div>
  )
}

