'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Sparkles, GraduationCap, Brain } from 'lucide-react'

interface WelcomeModalProps {
  onClose: () => void
  onMarkVisited?: () => void
}

export function WelcomeModal({ onClose, onMarkVisited }: WelcomeModalProps) {
  const { signIn, signUp, confirmSignUp } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [needsConfirmation, setNeedsConfirmation] = useState(false)
  const [pendingEmail, setPendingEmail] = useState('')

  // Sign In Form
  const [signInEmail, setSignInEmail] = useState('')
  const [signInPassword, setSignInPassword] = useState('')

  // Sign Up Form
  const [signUpEmail, setSignUpEmail] = useState('')
  const [signUpPassword, setSignUpPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Confirmation Form
  const [confirmCode, setConfirmCode] = useState('')

  const handleContinueAsGuest = () => {
    toast({
      title: 'Welcome!',
      description: 'You can start learning right away. Sign up later to save your progress.',
    })
    // Mark as visited when user explicitly chooses guest mode
    onMarkVisited?.()
    onClose()
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await signIn(signInEmail, signInPassword)
      toast({
        title: 'Welcome back!',
        description: 'You have successfully signed in.',
      })
      // Mark as visited when user successfully signs in
      onMarkVisited?.()
      onClose()
    } catch (error: any) {
      toast({
        title: 'Sign in failed',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (signUpPassword !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure your passwords match.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      await signUp(signUpEmail, signUpPassword)
      setPendingEmail(signUpEmail)
      setNeedsConfirmation(true)
      toast({
        title: 'Check your email',
        description: 'We sent you a verification code. Please enter it below.',
      })
    } catch (error: any) {
      toast({
        title: 'Sign up failed',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await confirmSignUp(pendingEmail, confirmCode)
      toast({
        title: 'Account verified!',
        description: 'You can now sign in with your credentials.',
      })
      // Mark as visited when user successfully confirms sign up
      onMarkVisited?.()
      setNeedsConfirmation(false)
      setConfirmCode('')
    } catch (error: any) {
      toast({
        title: 'Verification failed',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (needsConfirmation) {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-brand-blue-light/20 via-white/95 to-brand-green-light/20 backdrop-blur-md flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-2 border-brand-blue-light/30 shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-brand-blue-light/10 to-brand-green-light/10">
            <CardTitle className="text-2xl">Verify Your Email</CardTitle>
            <CardDescription className="text-base">
              Enter the verification code sent to <strong>{pendingEmail}</strong>
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleConfirmSignUp}>
            <CardContent className="space-y-4 pt-6">
              <Input
                type="text"
                placeholder="Verification code"
                value={confirmCode}
                onChange={(e) => setConfirmCode(e.target.value)}
                required
                maxLength={6}
                className="text-center text-2xl tracking-widest"
              />
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setNeedsConfirmation(false)}
                className="flex-1"
              >
                Back
              </Button>
              <Button 
                type="submit" 
                disabled={loading} 
                className="flex-1 bg-gradient-brand hover:opacity-90 text-white"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-brand-blue-light/20 via-white/95 to-brand-green-light/20 backdrop-blur-md flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-2 border-brand-blue-light/30 shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-brand-blue-light/10 via-white to-brand-green-light/10 text-center pb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-brand shadow-lg">
              <span className="text-4xl">🦉</span>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold mb-2">
            Welcome to <span className="text-brand-blue-dark">Math</span>
            <span className="text-brand-green-DEFAULT">Sage</span>
            <span className="text-brand-blue-dark">AI</span>
          </CardTitle>
          <CardDescription className="text-base text-slate-700">
            Your AI-powered math tutor using the Socratic method
          </CardDescription>
          
          {/* Feature highlights */}
          <div className="grid grid-cols-3 gap-4 mt-6 text-sm">
            <div className="flex flex-col items-center gap-2">
              <Brain className="h-8 w-8 text-brand-blue-DEFAULT" />
              <span className="text-slate-700">Guided Learning</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <GraduationCap className="h-8 w-8 text-brand-green-DEFAULT" />
              <span className="text-slate-700">Personalized Help</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Sparkles className="h-8 w-8 text-brand-purple-DEFAULT" />
              <span className="text-slate-700">Step-by-Step</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          <Tabs defaultValue="guest" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="guest">Guest</TabsTrigger>
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="guest" className="space-y-4">
              <div className="text-center py-8">
                <h3 className="text-xl font-semibold mb-3 text-slate-900">Start Learning Immediately</h3>
                <p className="text-slate-600 mb-6 max-w-md mx-auto">
                  Jump right in and start solving math problems. You can create an account later to save your progress and track your learning journey.
                </p>
                <Button 
                  onClick={handleContinueAsGuest}
                  size="lg"
                  className="bg-gradient-brand hover:opacity-90 text-white shadow-lg px-8"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Continue as Guest
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn}>
                <CardContent className="space-y-4 px-0">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Email</label>
                    <Input
                      type="email"
                      placeholder="your.email@example.com"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Password</label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2 px-0 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleContinueAsGuest}
                    className="flex-1"
                  >
                    Guest Mode
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading} 
                    className="flex-1 bg-gradient-brand hover:opacity-90 text-white"
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp}>
                <CardContent className="space-y-4 px-0">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Email</label>
                    <Input
                      type="email"
                      placeholder="your.email@example.com"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Password</label>
                    <Input
                      type="password"
                      placeholder="Min 8 characters"
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Confirm Password</label>
                    <Input
                      type="password"
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    Password must contain: uppercase, lowercase, and number
                  </p>
                </CardContent>
                <CardFooter className="flex gap-2 px-0 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleContinueAsGuest}
                    className="flex-1"
                  >
                    Guest Mode
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading} 
                    className="flex-1 bg-gradient-brand hover:opacity-90 text-white"
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign Up
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

