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
  const { isAuthenticated, loading } = useAuth()

  // Show welcome modal on first visit (check localStorage)
  useEffect(() => {
    if (!loading) {
      const hasVisited = localStorage.getItem('mathsage_visited')
      if (!hasVisited && !isAuthenticated) {
        setShowWelcomeModal(true)
        localStorage.setItem('mathsage_visited', 'true')
      }
    }
  }, [loading, isAuthenticated])

  const handleNewChat = () => {
    // Force ChatContainer to reset by changing key
    setNewChatKey(prev => prev + 1)
  }

  return (
    <div className="flex flex-col min-h-screen w-full bg-slate-50">
      {/* Header - fixed height */}
      <Header className="flex-none" />
      
      {/* Main content area - exactly 100vh minus header */}
      <div className="flex overflow-hidden w-full" style={{ height: 'calc(100vh - 4rem)' }}>
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)}
          onNewChat={handleNewChat}
        />
        
        {/* Chat area - takes all remaining horizontal space */}
        <main className="flex-1 overflow-hidden w-full">
          <ChatContainer key={newChatKey} />
        </main>
      </div>

      {/* Footer - positioned below the viewport, visible on scroll */}
      <Footer className="flex-none" />
      <Toaster />
      
      {/* Welcome Modal - shown on first visit */}
      {showWelcomeModal && <WelcomeModal onClose={() => setShowWelcomeModal(false)} />}
    </div>
  )
}

