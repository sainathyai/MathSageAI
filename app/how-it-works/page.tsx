import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Card } from '@/components/ui/card'
import { MessageSquare, Brain, Lightbulb, CheckCircle2 } from 'lucide-react'

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      
      <main className="container max-w-4xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full overflow-hidden shadow-lg mb-4">
            <img 
              src="/logo.png" 
              alt="MathSageAI Logo" 
              className="h-full w-full object-contain"
            />
          </div>
          
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            How It Works
          </h1>
          
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Learn how MathSageAI uses the Socratic method to help you
            understand and solve math problems.
          </p>
        </div>

        {/* The Socratic Method */}
        <Card className="p-8 mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            The Socratic Method
          </h2>
          <p className="text-slate-600 mb-4">
            Named after the Greek philosopher Socrates, this teaching method uses
            questions to guide students to discover answers themselves. Instead of
            being told the solution, you work through the problem step by step.
          </p>
          <p className="text-slate-600">
            This approach helps you develop critical thinking skills and truly
            understand the concepts, rather than just memorizing formulas.
          </p>
        </Card>

        {/* Process Steps */}
        <div className="space-y-6 mb-12">
          <div className="flex gap-4">
            <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-gradient-brand bg-opacity-20 text-brand-blue-dark">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                1. Submit Your Problem
              </h3>
              <p className="text-slate-600">
                Type your math problem directly or upload a photo. Our AI will
                extract the problem from images automatically.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-gradient-brand bg-opacity-20 text-brand-teal-DEFAULT">
              <Brain className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                2. Analyze the Problem
              </h3>
              <p className="text-slate-600">
                The AI asks you questions to identify what information you have
                and what you need to find. This helps you understand the problem structure.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 text-emerald-600">
              <Lightbulb className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                3. Guided Discovery
              </h3>
              <p className="text-slate-600">
                Through carefully crafted questions, the AI guides you toward the
                solution. If you&apos;re stuck, you&apos;ll receive hints to keep you moving forward.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 text-amber-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                4. Verify Your Solution
              </h3>
              <p className="text-slate-600">
                Once you reach an answer, the AI helps you verify it&apos;s correct
                and ensures you understand the complete solution process.
              </p>
            </div>
          </div>
        </div>

        {/* Example Conversation */}
        <Card className="p-8 mb-12 bg-gradient-brand bg-opacity-10 border-brand-blue-light">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Example Conversation
          </h2>
          
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm font-medium text-indigo-600 mb-1">You</p>
              <p className="text-slate-900">Solve: 2x + 5 = 13</p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm font-medium text-purple-600 mb-1">MathSage AI</p>
              <p className="text-slate-900">What are we trying to find in this equation?</p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm font-medium text-indigo-600 mb-1">You</p>
              <p className="text-slate-900">The value of x</p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm font-medium text-purple-600 mb-1">MathSage AI</p>
              <p className="text-slate-900">
                Excellent! To isolate x, we need to undo the +5 and the ×2. Which operation should we undo first?
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm font-medium text-indigo-600 mb-1">You</p>
              <p className="text-slate-900">The +5?</p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm font-medium text-purple-600 mb-1">MathSage AI</p>
              <p className="text-slate-900">
                Perfect! How do we undo adding 5?
              </p>
            </div>
          </div>
        </Card>

        {/* Key Principles */}
        <Card className="p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Key Principles
          </h2>
          <ul className="space-y-3 text-slate-600">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <span><strong>No Direct Answers:</strong> We never just tell you the solution</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <span><strong>Progressive Hints:</strong> If you&apos;re stuck, hints become more specific</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <span><strong>Encouraging Tone:</strong> Positive reinforcement builds confidence</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <span><strong>Adaptive Learning:</strong> Questions adjust to your understanding level</span>
            </li>
          </ul>
        </Card>
      </main>
      
      <Footer />
    </div>
  )
}

