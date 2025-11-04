import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Card } from '@/components/ui/card'
import { BookOpen, Target, Users, Sparkles } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      
      <main className="container max-w-4xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full overflow-hidden shadow-lg mb-6">
            <img 
              src="/logo.png" 
              alt="MathSageAI Logo" 
              className="h-full w-full object-contain"
            />
          </div>
          
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            About Math<span className="text-brand-blue-dark">Sage</span>
            <span className="text-brand-green-DEFAULT">AI</span>
          </h1>
          
          <p className="text-lg text-slate-600 mb-4">
            Your Personalized Math Companion
          </p>
          
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Your AI-powered mathematics tutor that teaches using the Socratic method,
            helping you discover solutions through guided questioning.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <Card className="p-6">
            <div className="p-3 rounded-lg bg-gradient-brand bg-opacity-10 text-brand-blue-dark w-fit mb-4">
              <Target className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Socratic Method
            </h3>
            <p className="text-slate-600">
              We never give direct answers. Instead, we guide you through questions
              that help you discover the solution yourself.
            </p>
          </Card>

          <Card className="p-6">
            <div className="p-3 rounded-lg bg-purple-50 text-purple-600 w-fit mb-4">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Personalized Learning
            </h3>
            <p className="text-slate-600">
              Our AI adapts to your understanding level, providing hints and guidance
              tailored to your needs.
            </p>
          </Card>

          <Card className="p-6">
            <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600 w-fit mb-4">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Multiple Input Methods
            </h3>
            <p className="text-slate-600">
              Type your problem directly or upload a photo of your homework.
              We support both printed and handwritten problems.
            </p>
          </Card>

          <Card className="p-6">
            <div className="p-3 rounded-lg bg-amber-50 text-amber-600 w-fit mb-4">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Encouraging Support
            </h3>
            <p className="text-slate-600">
              Learn in a positive, encouraging environment that builds confidence
              and develops problem-solving skills.
            </p>
          </Card>
        </div>

        {/* Mission Section */}
        <Card className="p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Our Mission
          </h2>
          <p className="text-slate-600 mb-4">
            MathSageAI was created to make quality math education accessible to everyone.
            We believe that the best way to learn mathematics is not through memorization,
            but through understanding the underlying concepts and developing problem-solving skills.
          </p>
          <p className="text-slate-600">
            By using the Socratic method, we help students develop critical thinking skills
            and gain confidence in their mathematical abilities. Our AI tutor is available
            24/7, providing patient, personalized guidance whenever you need it.
          </p>
        </Card>

        {/* Project Info */}
        <div className="text-center mt-12 text-sm text-slate-500">
          <p>Built for Gauntlet C3 • Powered by OpenAI • Deployed on AWS</p>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

