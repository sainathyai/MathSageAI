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
import { renderMathContent } from '@/app/utils/mathRenderer'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import 'katex/dist/katex.min.css'

interface SidebarProps {
  isOpen: boolean
  onClose?: () => void
  onNewChat?: () => void
  onSessionSelect?: (sessionId: string) => void
  currentSession?: {
    sessionId: string
    title: string
    messageCount: number
  } | null
}

export function Sidebar({ isOpen, onClose, onNewChat, onSessionSelect, currentSession }: SidebarProps) {
  const { isAuthenticated, user } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [sessions, setSessions] = useState<SessionData[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch user sessions when authenticated
  useEffect(() => {
    if (isAuthenticated && user?.userId) {
      setLoading(true)
      console.log('🔍 Fetching sessions for userId:', user.userId)
      getUserSessions(user.userId)
        .then(sessions => {
          console.log('✅ Loaded sessions:', sessions.length, sessions)
          setSessions(sessions)
        })
        .catch(error => {
          console.error('❌ Failed to load sessions:', error)
          console.error('Error details:', {
            message: error instanceof Error ? error.message : String(error),
            userId: user.userId,
          })
          // Still set empty array to show "No sessions" message
          setSessions([])
          // TODO: Show user-friendly error toast
        })
        .finally(() => setLoading(false))
    } else {
      setSessions([])
    }
  }, [isAuthenticated, user])

  // Merge current session with fetched sessions
  const displaySessions = () => {
    if (!currentSession) return sessions

    // Filter out current session from fetched sessions (if it exists)
    const otherSessions = sessions.filter(s => s.sessionId !== currentSession.sessionId)
    
    // Create current session display object
    const currentSessionDisplay: SessionData = {
      sessionId: currentSession.sessionId,
      title: currentSession.title,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isGuest: !isAuthenticated,
    }

    // Return current session at top, followed by others
    return [currentSessionDisplay, ...otherSessions]
  }

  const sessionsToDisplay = displaySessions()

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
          {!isAuthenticated ? (
            // Guest user: Show sign-up message
            <div className="flex flex-col items-center justify-center h-full text-center py-8 px-4">
              <div className="mb-6">
                <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Sign up to save sessions
                </h3>
                <p className="text-sm text-slate-600 mb-6 max-w-xs">
                  Create an account to save your math conversations and access them across all your devices
                </p>
              </div>
              <Button 
                className="bg-gradient-brand hover:opacity-90 text-white border-0 shadow-md"
                onClick={() => setShowAuthModal(true)}
              >
                Sign Up
              </Button>
              <p className="text-xs text-slate-500 mt-4">
                Already have an account?{' '}
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="text-brand-blue-DEFAULT hover:underline font-medium"
                >
                  Sign In
                </button>
              </p>
            </div>
          ) : (
            // Authenticated user: Show sessions
            <>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-900">Recent Sessions</h3>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Trash2 className="h-4 w-4 text-slate-500" />
                </Button>
              </div>

              <TooltipProvider>
                <div className="space-y-1.5">
                  {loading ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-slate-500">Loading sessions...</p>
                    </div>
                  ) : sessionsToDisplay.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-slate-500">No sessions yet</p>
                      <p className="text-xs text-slate-400 mt-1">Start chatting to create your first session</p>
                    </div>
                  ) : (
                    sessionsToDisplay.map((session, index) => {
                    const isCurrentSession = currentSession && session.sessionId === currentSession.sessionId
                    return (
                      <button
                        key={session.sessionId}
                        onClick={() => onSessionSelect?.(session.sessionId)}
                        className={cn(
                          "group w-full rounded-lg p-3 text-left transition-colors hover:bg-gradient-brand hover:bg-opacity-10 cursor-pointer",
                          isCurrentSession && "bg-gradient-brand bg-opacity-10 border-2 border-brand-blue-DEFAULT/30"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <MessageSquare className={cn(
                            "h-4 w-4 mt-0.5 flex-shrink-0",
                            isCurrentSession ? "text-brand-blue-DEFAULT" : "text-slate-400"
                          )} />
                          <div className="flex-1 min-w-0">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="text-sm font-medium text-slate-900 break-words line-clamp-2 cursor-default">
                                  {renderMathContent(session.title)}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent 
                                side="top" 
                                sideOffset={2}
                                align="start"
                                className="max-w-xs bg-slate-800 text-white border-slate-700 p-2"
                              >
                                <div className="text-sm">
                                  {renderMathContent(session.title)}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                            <div className="flex items-center gap-1 mt-1">
                              <Clock className="h-3 w-3 text-slate-400" />
                              <p className="text-xs text-slate-500">
                                {isCurrentSession ? 'Active now' : formatTimestamp(session.updatedAt)}
                              </p>
                            </div>
                          </div>
                          {isCurrentSession && (
                            <Badge className="ml-auto flex-shrink-0 bg-gradient-brand text-white border-0">
                              Active
                            </Badge>
                          )}
                        </div>
                      </button>
                    )
                  })
                  )}
                </div>
              </TooltipProvider>
            </>
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

