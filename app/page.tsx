'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Sidebar } from '@/components/Sidebar'
import { ChatContainer } from '@/components/ChatContainer'
import { Toaster } from '@/components/ui/toaster'
import { WelcomeModal } from '@/components/auth/WelcomeModal'
import { useAuth } from '@/contexts/AuthContext'

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [newChatKey, setNewChatKey] = useState(0)
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)
  const [currentSession, setCurrentSession] = useState<{
    sessionId: string
    title: string
    messageCount: number
  } | null>(null)
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const { isAuthenticated, loading } = useAuth()

  // Show welcome modal on first visit (check localStorage)
  // Only show if user hasn't visited before and is not authenticated
  useEffect(() => {
    if (!loading && typeof window !== 'undefined') {
      try {
        const hasVisited = localStorage.getItem('mathsage_visited')
        if (!hasVisited && !isAuthenticated) {
          setShowWelcomeModal(true)
          // Don't set localStorage here - only set it when user interacts with the modal
        }
      } catch (error) {
        // If localStorage is not available (e.g., private browsing), show modal anyway
        if (!isAuthenticated) {
          setShowWelcomeModal(true)
        }
      }
    }
  }, [loading, isAuthenticated])

  const handleNewChat = () => {
    // Force ChatContainer to reset by changing key
    setNewChatKey(prev => prev + 1)
    setCurrentSession(null) // Clear current session
    setSelectedSessionId(null) // Clear selected session
  }

  const handleSessionSelect = (sessionId: string) => {
    setSelectedSessionId(sessionId)
    // Force ChatContainer to reload with new session
    setNewChatKey(prev => prev + 1)
  }

  const handleAuthClick = () => {
    // Check if user has visited before
    if (typeof window !== 'undefined') {
      try {
        const hasVisited = localStorage.getItem('mathsage_visited')
        if (!hasVisited && !isAuthenticated) {
          // Show WelcomeModal if not visited yet
          setShowWelcomeModal(true)
          return
        }
      } catch (error) {
        // If localStorage is not available, show WelcomeModal anyway
        if (!isAuthenticated) {
          setShowWelcomeModal(true)
          return
        }
      }
    }
    // Otherwise, Header will show AuthModal (handled internally)
  }

  return (
    <div className="flex flex-col min-h-screen w-full bg-slate-50">
      {/* Header - fixed height */}
      <Header className="flex-none" onAuthClick={handleAuthClick} />
      
      {/* Main content area - exactly 100vh minus header */}
      <div className="flex overflow-hidden w-full" style={{ height: 'calc(100vh - 4rem)' }}>
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)}
          onNewChat={handleNewChat}
          onSessionSelect={handleSessionSelect}
          currentSession={currentSession}
        />
        
        {/* Chat area - takes all remaining horizontal space */}
        <main className="flex-1 overflow-hidden w-full">
          <ChatContainer 
            key={newChatKey} 
            selectedSessionId={selectedSessionId}
            onSessionUpdate={setCurrentSession}
          />
        </main>
      </div>

      {/* Footer - positioned below the viewport, visible on scroll */}
      <Footer className="flex-none" />
      <Toaster />
      
      {/* Welcome Modal - shown on first visit */}
      {showWelcomeModal && (
        <WelcomeModal 
          onClose={() => {
            setShowWelcomeModal(false)
          }}
          onMarkVisited={() => {
            // Mark as visited only when user explicitly chooses an option
            if (typeof window !== 'undefined') {
              try {
                localStorage.setItem('mathsage_visited', 'true')
              } catch (error) {
                // If localStorage is not available, silently fail
                console.warn('Could not save visited state to localStorage:', error)
              }
            }
          }}
        />
      )}
    </div>
  )
}

