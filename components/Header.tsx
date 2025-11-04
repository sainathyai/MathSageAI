'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BookOpen, Menu, LogIn, LogOut, User } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { AuthModal } from '@/components/auth/AuthModal'

interface HeaderProps {
  className?: string
}

export function Header({ className = '' }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [logoError, setLogoError] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { user, signOut, isAuthenticated } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <>
    <header className={`sticky top-0 z-50 w-full border-b border-brand-blue-light/20 bg-gradient-to-r from-brand-blue-light/10 via-white to-brand-green-light/10 backdrop-blur-md supports-[backdrop-filter]:bg-gradient-to-r supports-[backdrop-filter]:from-brand-blue-light/20 supports-[backdrop-filter]:via-white/90 supports-[backdrop-filter]:to-brand-green-light/20 ${className}`}>
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full overflow-hidden shadow-lg bg-gradient-brand">
            {logoError ? (
              <span className="text-2xl">🦉</span>
            ) : (
              <img 
                src="/logo.png" 
                alt="MathSageAI Logo" 
                className="h-full w-full object-contain"
                onError={() => {
                  console.error('Logo failed to load from /logo.png');
                  setLogoError(true);
                }}
              />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-slate-900 leading-tight">
              Math<span className="text-brand-blue-dark">Sage</span>
              <span className="text-brand-green-DEFAULT">AI</span>
            </span>
            <span className="text-xs text-slate-600 -mt-0.5">
              Your Personalized Math Companion
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link 
            href="/examples" 
            className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
          >
            Examples
          </Link>
          <Link 
            href="/how-it-works" 
            className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
          >
            How It Works
          </Link>
          <Link 
            href="/about" 
            className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
          >
            About
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-3">
          {isAuthenticated ? (
            <>
              <Button variant="ghost" size="sm" className="gap-2">
                <User className="h-4 w-4" />
                <span className="text-sm">{user?.email}</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSignOut}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </>
          ) : (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowAuthModal(true)}
              className="gap-2"
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button 
          variant="ghost" 
          size="icon"
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <nav className="container flex flex-col space-y-3 px-4 py-4">
            <Link 
              href="/examples" 
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Examples
            </Link>
            <Link 
              href="/how-it-works" 
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              How It Works
            </Link>
            <Link 
              href="/about" 
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              About
            </Link>
            {isAuthenticated ? (
              <>
                <div className="text-sm text-slate-600 py-2">
                  {user?.email}
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowAuthModal(true)}
              >
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>

    {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </>
  )
}

