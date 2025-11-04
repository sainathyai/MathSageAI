'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

interface AuthModalProps {
  onClose: () => void
}

export function AuthModal({ onClose }: AuthModalProps) {
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

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await signIn(signInEmail, signInPassword)
      toast({
        title: 'Welcome back!',
        description: 'You have successfully signed in.',
      })
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
      <Card className="w-full max-w-md border-2 border-brand-blue-light/30 shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-brand-blue-light/10 via-white to-brand-green-light/10 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-brand shadow-lg">
              <span className="text-2xl">🦉</span>
            </div>
          </div>
          <CardTitle className="text-2xl">
            Welcome to <span className="text-brand-blue-dark">Math</span>
            <span className="text-brand-green-DEFAULT">Sage</span>
            <span className="text-brand-blue-dark">AI</span>
          </CardTitle>
          <CardDescription className="text-base text-slate-700">
            Sign in to save your learning history and track progress
          </CardDescription>
        </CardHeader>
        <Tabs defaultValue="signin" className="w-full">
          <div className="flex justify-center mt-4 mb-2">
            <TabsList className="grid grid-cols-2 w-64">
              <TabsTrigger value="signin" className="text-sm">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="text-sm">Sign Up</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="signin" className="px-6 pb-6">
            <form onSubmit={handleSignIn}>
              <CardContent className="space-y-4 px-0 pt-4 pb-3 bg-gradient-to-br from-brand-blue-light/5 via-white to-brand-green-light/5 rounded-lg">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <span className="text-brand-blue-DEFAULT">📧</span>
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="your.email@example.com"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    required
                    className="border-2 border-slate-200 focus:border-brand-blue-DEFAULT focus:ring-2 focus:ring-brand-blue-light/20 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <span className="text-brand-green-DEFAULT">🔒</span>
                    Password
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    required
                    className="border-2 border-slate-200 focus:border-brand-green-DEFAULT focus:ring-2 focus:ring-brand-green-light/20 transition-all"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex gap-2 px-0 pt-4 pb-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
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

          <TabsContent value="signup" className="px-6 pb-6">
            <form onSubmit={handleSignUp}>
              <CardContent className="space-y-3 px-0 pt-4 pb-3 bg-gradient-to-br from-brand-green-light/5 via-white to-brand-blue-light/5 rounded-lg">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <span className="text-brand-blue-DEFAULT">📧</span>
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="your.email@example.com"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    required
                    className="border-2 border-slate-200 focus:border-brand-blue-DEFAULT focus:ring-2 focus:ring-brand-blue-light/20 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <span className="text-brand-green-DEFAULT">🔒</span>
                    Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Min 8 characters"
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    required
                    minLength={8}
                    className="border-2 border-slate-200 focus:border-brand-green-DEFAULT focus:ring-2 focus:ring-brand-green-light/20 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <span className="text-brand-teal-DEFAULT">✓</span>
                    Confirm Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    className="border-2 border-slate-200 focus:border-brand-teal-DEFAULT focus:ring-2 focus:ring-brand-teal-light/20 transition-all"
                  />
                </div>
                <div className="flex items-start gap-2 bg-brand-blue-light/10 border border-brand-blue-light/30 rounded-md p-2">
                  <span className="text-sm">ℹ️</span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Password must contain: uppercase, lowercase, and number
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2 px-0 pt-4 pb-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
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
      </Card>
    </div>
  )
}

