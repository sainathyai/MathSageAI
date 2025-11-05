'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Sidebar } from '@/components/Sidebar'
import { ChatContainer } from '@/components/ChatContainer'
import { WhiteboardChatCombined } from '@/components/WhiteboardChatCombined'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Toaster } from '@/components/ui/toaster'
import { WelcomeModal } from '@/components/auth/WelcomeModal'
import { useAuth } from '@/contexts/AuthContext'
import { MessageSquare, PenTool } from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [newChatKey, setNewChatKey] = useState(0)
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)
  const [currentSession, setCurrentSession] = useState<{
    sessionId: string
    title: string
    messageCount: number
  } | null>(null)
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'chat' | 'whiteboard'>('chat')
  const { isAuthenticated, loading } = useAuth()

  // Redirect guest users to /how-it-works by default (only on initial page load, not when clicking logo)
  useEffect(() => {
    if (!loading && !isAuthenticated && typeof window !== 'undefined') {
      // Check if user has already been redirected or if they navigated here intentionally
      const hasBeenRedirected = sessionStorage.getItem('redirected_to_how_it_works')
      const isNavigatingFromLogo = document.referrer && 
        document.referrer.includes(window.location.origin) &&
        !hasBeenRedirected
      
      // Only redirect on initial page load (not when clicking logo or navigating internally)
      if (window.location.pathname === '/' && !isNavigatingFromLogo && !hasBeenRedirected) {
        sessionStorage.setItem('redirected_to_how_it_works', 'true')
        router.push('/how-it-works')
      }
    }
  }, [loading, isAuthenticated, router])

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
    // Also update currentSession so whiteboard view can access it
    // We'll load the session details in ChatContainer, but for now set a basic structure
    setCurrentSession({
      sessionId,
      title: '', // Will be updated when session loads
      messageCount: 0,
    })
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
        
        {/* Chat/Whiteboard area - takes all remaining horizontal space */}
        <main className="flex-1 overflow-hidden w-full flex flex-col">
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'chat' | 'whiteboard')} className="flex-1 flex flex-col overflow-hidden">
            <div className="border-b border-slate-200/50 bg-white/90 backdrop-blur-sm">
              <div className="container max-w-7xl mx-auto px-4">
                <TabsList className="bg-transparent h-12 p-0">
                  <TabsTrigger 
                    value="chat" 
                    className="flex items-center gap-2 px-4 py-2 data-[state=active]:bg-gradient-brand data-[state=active]:text-white data-[state=active]:shadow-md"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Chat
                  </TabsTrigger>
                  <TabsTrigger 
                    value="whiteboard"
                    className="flex items-center gap-2 px-4 py-2 data-[state=active]:bg-gradient-brand data-[state=active]:text-white data-[state=active]:shadow-md"
                  >
                    <PenTool className="h-4 w-4" />
                    Whiteboard
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>
            
            <TabsContent value="chat" className="flex-1 overflow-hidden m-0 mt-0">
              <ChatContainer 
                key={newChatKey} 
                selectedSessionId={selectedSessionId}
                onSessionUpdate={setCurrentSession}
              />
            </TabsContent>
            
            <TabsContent value="whiteboard" className="flex-1 overflow-hidden m-0 mt-0">
              <WhiteboardChatCombined 
                sessionId={selectedSessionId || currentSession?.sessionId}
                onStateChange={(state) => {
                  // Save whiteboard state with session if needed
                  console.log('Whiteboard state changed:', state)
                }}
              />
            </TabsContent>
          </Tabs>
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

