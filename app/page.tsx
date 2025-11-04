'use client'

import { useState } from 'react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Sidebar } from '@/components/Sidebar'
import { ChatContainer } from '@/components/ChatContainer'
import { Toaster } from '@/components/ui/toaster'

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [newChatKey, setNewChatKey] = useState(0)

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
    </div>
  )
}

