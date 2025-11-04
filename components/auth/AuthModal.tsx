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
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Verify Your Email</CardTitle>
            <CardDescription>
              Enter the verification code sent to {pendingEmail}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleConfirmSignUp}>
            <CardContent className="space-y-4">
              <Input
                type="text"
                placeholder="Verification code"
                value={confirmCode}
                onChange={(e) => setConfirmCode(e.target.value)}
                required
                maxLength={6}
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
              <Button type="submit" disabled={loading} className="flex-1">
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
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome to MathSageAI</CardTitle>
          <CardDescription>
            Sign in to save your learning history and track progress
          </CardDescription>
        </CardHeader>
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form onSubmit={handleSignIn}>
              <CardContent className="space-y-4">
                <Input
                  type="email"
                  placeholder="Email"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  required
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  required
                />
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
              </CardFooter>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignUp}>
              <CardContent className="space-y-4">
                <Input
                  type="email"
                  placeholder="Email"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  required
                />
                <Input
                  type="password"
                  placeholder="Password (min 8 characters)"
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <Input
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <p className="text-xs text-slate-500">
                  Password must contain: uppercase, lowercase, and number
                </p>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
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

