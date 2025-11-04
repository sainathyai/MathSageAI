'use client'

import Link from 'next/link'
import { Heart, Github, Mail, BookOpen } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-brand-blue-light/20 bg-gradient-to-r from-brand-blue-light/10 via-white to-brand-green-light/10 backdrop-blur-md">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full overflow-hidden shadow-lg bg-gradient-brand">
                <img 
                  src="/logo.png" 
                  alt="MathSageAI Logo" 
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Math<span className="text-brand-blue-dark">Sage</span>
                  <span className="text-brand-green-DEFAULT">AI</span>
                </h3>
                <p className="text-xs text-slate-600">
                  Your Personalized Math Companion
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-600 max-w-md">
              An intelligent math tutoring application that guides students through 
              math problems using the Socratic method, helping you discover solutions 
              through guided questioning.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/" 
                  className="text-sm text-slate-600 hover:text-brand-blue-dark transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  href="/examples" 
                  className="text-sm text-slate-600 hover:text-brand-blue-dark transition-colors"
                >
                  Examples
                </Link>
              </li>
              <li>
                <Link 
                  href="/how-it-works" 
                  className="text-sm text-slate-600 hover:text-brand-blue-dark transition-colors"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link 
                  href="/about" 
                  className="text-sm text-slate-600 hover:text-brand-blue-dark transition-colors"
                >
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/help" 
                  className="text-sm text-slate-600 hover:text-brand-blue-dark transition-colors flex items-center gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  Help & FAQ
                </Link>
              </li>
              <li>
                <a 
                  href="mailto:support@mathsageai.com" 
                  className="text-sm text-slate-600 hover:text-brand-blue-dark transition-colors flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-brand-blue-light/20 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-slate-600">
            © {currentYear} MathSageAI. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600 flex items-center gap-1">
              Made with <Heart className="h-4 w-4 text-red-500" /> for education
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

