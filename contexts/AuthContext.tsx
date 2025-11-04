'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { getCurrentUser, signIn, signOut, signUp, confirmSignUp, fetchAuthSession, type SignInInput, type SignUpInput } from 'aws-amplify/auth'
import { Hub } from 'aws-amplify/utils'
import { configureAmplify } from '@/lib/amplify-config'

// Configure Amplify once
if (typeof window !== 'undefined') {
  configureAmplify()
}

interface User {
  userId: string
  email: string
  emailVerified: boolean
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  confirmSignUp: (email: string, code: string) => Promise<void>
  signOut: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      const session = await fetchAuthSession()
      
      setUser({
        userId: currentUser.userId,
        email: currentUser.signInDetails?.loginId || '',
        emailVerified: true,
      })
    } catch (error) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkUser()

    // Listen to auth events
    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      switch (payload.event) {
        case 'signedIn':
          checkUser()
          break
        case 'signedOut':
          setUser(null)
          break
      }
    })

    return () => unsubscribe()
  }, [])

  const handleSignIn = async (email: string, password: string) => {
    try {
      await signIn({ username: email, password })
      await checkUser()
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign in')
    }
  }

  const handleSignUp = async (email: string, password: string) => {
    try {
      await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
          },
        },
      })
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign up')
    }
  }

  const handleConfirmSignUp = async (email: string, code: string) => {
    try {
      await confirmSignUp({ username: email, confirmationCode: code })
    } catch (error: any) {
      throw new Error(error.message || 'Failed to confirm sign up')
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      setUser(null)
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign out')
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn: handleSignIn,
        signUp: handleSignUp,
        confirmSignUp: handleConfirmSignUp,
        signOut: handleSignOut,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

