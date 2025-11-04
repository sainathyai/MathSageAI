'use client'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Plus, Settings, Trash2, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { useState, useEffect } from 'react'
import { AuthModal } from '@/components/auth/AuthModal'
import { getUserSessions, formatTimestamp, SessionData } from '@/lib/session-manager'

interface SidebarProps {
  isOpen: boolean
  onClose?: () => void
  onNewChat?: () => void
}

export function Sidebar({ isOpen, onClose, onNewChat }: SidebarProps) {
  const { isAuthenticated, user } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [sessions, setSessions] = useState<SessionData[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch user sessions when authenticated
  useEffect(() => {
    if (isAuthenticated && user?.userId) {
      setLoading(true)
      getUserSessions(user.userId)
        .then(setSessions)
        .catch(error => {
          console.error('Failed to load sessions:', error)
          setSessions([])
        })
        .finally(() => setLoading(false))
    } else {
      setSessions([])
    }
  }, [isAuthenticated, user])

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 z-40 w-72 border-r border-brand-blue-light/20 bg-gradient-to-b from-brand-blue-light/10 via-white to-brand-green-light/10 backdrop-blur-md transition-transform",
        "lg:relative lg:flex-none lg:translate-x-0",
        "h-full", // Always fill parent height (100% of flex container)
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        "flex flex-col" // Flexbox container
      )}>
        {/* New Chat Button */}
        <div className="px-4 pt-2 pb-1.5 flex-shrink-0">
          <Button 
            className="w-full bg-gradient-brand hover:opacity-90 text-white border-0 shadow-md"
            onClick={onNewChat}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Chat
          </Button>
        </div>

        <Separator className="flex-shrink-0" />

        {/* Session History - fills available space */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 px-4 pt-2 pb-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-slate-900">Recent Sessions</h3>
            {isAuthenticated && (
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Trash2 className="h-4 w-4 text-slate-500" />
              </Button>
            )}
          </div>

          <div className="space-y-1.5">
            {loading ? (
              <div className="text-center py-4">
                <p className="text-sm text-slate-500">Loading sessions...</p>
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-slate-500">No sessions yet</p>
                <p className="text-xs text-slate-400 mt-1">Start chatting to create your first session</p>
              </div>
            ) : (
              sessions.map((session, index) => (
                <button
                  key={session.sessionId}
                  className={cn(
                    "group w-full rounded-lg p-3 text-left transition-colors hover:bg-gradient-brand hover:bg-opacity-10",
                    index === 0 && "bg-gradient-brand bg-opacity-10"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {session.title}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3 text-slate-400" />
                        <p className="text-xs text-slate-500">
                          {formatTimestamp(session.updatedAt)}
                        </p>
                      </div>
                    </div>
                    {index === 0 && (
                      <Badge variant="secondary" className="ml-auto flex-shrink-0">
                        Recent
                      </Badge>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
          
          {!isAuthenticated && (
            <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-brand-blue-light/10 to-brand-green-light/10 border border-brand-blue-light/20">
              <p className="text-xs text-slate-600 text-center">
                <strong>Tip:</strong> Sign in to save your progress and access history across devices
              </p>
            </div>
          )}
        </div>

        {/* Settings - pushed to bottom with mt-auto */}
        <div className="mt-auto flex-shrink-0">
          <Separator className="flex-shrink-0" />
          <div className="px-4 pt-2 pb-0">
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>
      </aside>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </>
  )
}

