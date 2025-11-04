import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calculator, Grid3x3, PieChart, FileText, TrendingUp, Triangle } from 'lucide-react'
import Link from 'next/link'

const examples = [
  {
    category: 'Arithmetic',
    icon: <Calculator className="h-6 w-6" />,
    problems: [
      '15 + 27 = ?',
      '144 ÷ 12 = ?',
      'What is 25% of 80?'
    ]
  },
  {
    category: 'Linear Equations',
    icon: <TrendingUp className="h-6 w-6" />,
    problems: [
      '2x + 5 = 13',
      '3(x - 4) = 15',
      '2x/3 + 1 = 7'
    ]
  },
  {
    category: 'Quadratic Equations',
    icon: <Grid3x3 className="h-6 w-6" />,
    problems: [
      'x² - 5x + 6 = 0',
      'x² = 16',
      'x² + 4x - 12 = 0'
    ]
  },
  {
    category: 'Geometry',
    icon: <Triangle className="h-6 w-6" />,
    problems: [
      'Find the area of a circle with radius 5cm',
      'What is the perimeter of a rectangle 8cm × 5cm?',
      'Find the area of a triangle with base 10cm and height 6cm'
    ]
  },
  {
    category: 'Word Problems',
    icon: <FileText className="h-6 w-6" />,
    problems: [
      'If 3 apples cost $2, how much do 10 apples cost?',
      'A train travels 60 km/h for 2.5 hours. How far does it go?',
      'John has twice as many books as Mary. Together they have 36 books. How many does each have?'
    ]
  },
  {
    category: 'Percentages',
    icon: <PieChart className="h-6 w-6" />,
    problems: [
      'What is 15% of 200?',
      'A $50 item is 20% off. What is the sale price?',
      'If a value increases from 80 to 100, what is the percentage increase?'
    ]
  }
]

export default function ExamplesPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      
      <main className="container max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Example Problems
          </h1>
          
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Explore different types of math problems you can solve with MathSageAI.
            Click any problem to start a guided learning session.
          </p>
        </div>

        {/* Examples Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {examples.map((category) => (
            <Card key={category.category} className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-gradient-brand bg-opacity-10 text-brand-blue-dark">
                  {category.icon}
                </div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {category.category}
                </h2>
              </div>

              <div className="space-y-3">
                {category.problems.map((problem, index) => (
                  <Link 
                    key={index}
                    href="/"
                    className="block p-3 rounded-lg bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 border border-transparent transition-all"
                  >
                    <p className="text-sm text-slate-700 hover:text-indigo-900">
                      {problem}
                    </p>
                  </Link>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <Card className="p-8 text-center bg-gradient-brand bg-opacity-10 border-brand-blue-light">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Ready to try your own problem?
          </h2>
          <p className="text-slate-600 mb-6 max-w-xl mx-auto">
            Start a conversation with MathSageAI and experience personalized
            guided learning through the Socratic method.
          </p>
          <Button asChild size="lg" className="bg-gradient-brand hover:opacity-90 text-white border-0 shadow-md">
            <Link href="/">Start Learning</Link>
          </Button>
        </Card>
      </main>
      
      <Footer />
    </div>
  )
}

