import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Card } from '@/components/ui/card'
import { HelpCircle, MessageSquare, Image, Keyboard, CheckCircle2 } from 'lucide-react'

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      
      <main className="container max-w-4xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full overflow-hidden shadow-lg mb-6">
            <img 
              src="/logo.png" 
              alt="MathSageAI Logo" 
              className="h-full w-full object-contain"
            />
          </div>
          
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Help & Support
          </h1>
          
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Learn how to get the most out of MathSageAI
          </p>
        </div>

        {/* Quick Tips */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Quick Tips
          </h2>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-gradient-brand bg-opacity-20 text-brand-blue-dark">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">
                  Be Specific with Your Questions
                </h3>
                <p className="text-slate-600 text-sm">
                The more specific your problem description, the better guidance you&apos;ll receive.
                Include all relevant information from the problem.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-purple-100 text-purple-600">
                <Image className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">
                  Upload Clear Images
                </h3>
                <p className="text-slate-600 text-sm">
                  For best results, take photos in good lighting with the problem
                  clearly visible. Both printed and handwritten problems work!
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-emerald-100 text-emerald-600">
                <Keyboard className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">
                  Keyboard Shortcuts
                </h3>
                <p className="text-slate-600 text-sm">
                  Press <kbd className="px-2 py-1 bg-slate-100 rounded border border-slate-300 text-xs">Enter</kbd> to send your message, 
                  or <kbd className="px-2 py-1 bg-slate-100 rounded border border-slate-300 text-xs">Shift + Enter</kbd> for a new line.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-amber-100 text-amber-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">
                  Think Through the Questions
                </h3>
                <p className="text-slate-600 text-sm">
                  Take your time to think through each question. The goal is understanding,
                  not just getting the answer quickly.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* FAQs */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">
                Why doesn&apos;t MathSageAI give me direct answers?
              </h3>
              <p className="text-slate-600 text-sm">
                We use the Socratic method because research shows that students learn best
                when they discover solutions themselves with guidance. This builds deeper
                understanding and problem-solving skills.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">
                What if I&apos;m completely stuck?
              </h3>
              <p className="text-slate-600 text-sm">
                After a few turns, if you&apos;re still stuck, MathSageAI will provide more
                concrete hints to help you move forward. The AI adapts to your needs.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">
                Can I upload handwritten problems?
              </h3>
              <p className="text-slate-600 text-sm">
                Yes! Our AI can read both printed and handwritten math problems. Just make
                sure the image is clear and well-lit for best results.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">
                What types of math problems are supported?
              </h3>
              <p className="text-slate-600 text-sm">
                MathSageAI supports arithmetic, algebra, geometry, word problems, and more.
                From basic calculations to complex equations, we&apos;re here to help you learn.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">
                Is my conversation history saved?
              </h3>
              <p className="text-slate-600 text-sm">
                Yes, your recent conversations are saved so you can review them later.
                Sessions automatically expire after 30 days for privacy.
              </p>
            </div>
          </div>
        </Card>

        {/* Contact Section */}
        <Card className="p-8 text-center bg-gradient-brand bg-opacity-10 border-brand-blue-light">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Still Need Help?
          </h2>
          <p className="text-slate-600 mb-4">
            If you have questions or feedback, we&apos;d love to hear from you!
          </p>
          <p className="text-sm text-slate-500">
            Contact: john.chen@superbuilders.school
          </p>
        </Card>
      </main>
      
      <Footer />
    </div>
  )
}

