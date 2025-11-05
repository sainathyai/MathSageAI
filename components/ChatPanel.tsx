'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageBubble } from './MessageBubble'
import { Message } from '@/app/types'
import { ChatInput } from './ChatInput'
import { WelcomeScreen } from './WelcomeScreen'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/contexts/AuthContext'
import { v4 as uuidv4 } from 'uuid'
import { saveSession, generateSessionTitle } from '@/lib/session-manager'
import { uploadImageToS3 } from '@/lib/image-upload'
import { useToast } from '@/hooks/use-toast'
import { getSession, SessionData } from '@/lib/session-manager'
import { DrawingCommand } from '@/app/types/drawing'
import { renderMathContent } from '@/app/utils/mathRenderer'
import { extractAllMath } from '@/app/utils/mathExtractor'
import 'katex/dist/katex.min.css'

interface ChatPanelProps {
  sessionId?: string
  onMessageSent?: (message: Message) => void
  onMathExtracted?: (mathExpressions: string[]) => void
}

export function ChatPanel({ sessionId, onMessageSent, onMathExtracted }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadingSession, setLoadingSession] = useState(false)
  const [currentSessionId, setCurrentSessionId] = useState<string>(() => sessionId || uuidv4())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  
  // Track which messages have been processed for math extraction
  const processedMessageIdsRef = useRef<Set<string>>(new Set())
  const onMathExtractedRef = useRef(onMathExtracted)
  const lastProcessedCountRef = useRef(0)
  const messagesRef = useRef(messages)
  
  // Keep messages ref in sync
  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  const scrollToBottom = () => {
    const container = messagesContainerRef.current
    if (container) {
      container.scrollTop = container.scrollHeight
    }
  }

  // Track previous sessionId to detect actual changes
  const prevSessionIdRef = useRef<string | undefined>(sessionId)
  const isInitialMountRef = useRef(true)

  // Load session when sessionId changes
  useEffect(() => {
    const prevSessionId = prevSessionIdRef.current
    const isInitialMount = isInitialMountRef.current
    isInitialMountRef.current = false
    
    // Only load if sessionId is provided and different from current
    if (sessionId && sessionId !== currentSessionId) {
      prevSessionIdRef.current = sessionId
      const loadSession = async () => {
        setLoadingSession(true)
        try {
          const sessionData = await getSession(sessionId)
          if (sessionData) {
            setCurrentSessionId(sessionData.sessionId)
            const loadedMessages: Message[] = sessionData.messages.map(msg => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
            }))
            setMessages(loadedMessages)
            
            // Extract and restore drawing commands from all messages
            // This ensures whiteboard state is restored when loading a session
            const allDrawingCommands: DrawingCommand[] = []
            loadedMessages.forEach(msg => {
              if (msg.drawingCommands && msg.drawingCommands.length > 0) {
                allDrawingCommands.push(...msg.drawingCommands)
              }
            })
            
            // Notify parent to restore drawing commands on whiteboard
            if (allDrawingCommands.length > 0 && onMessageSent) {
              console.log(`🔄 Restoring ${allDrawingCommands.length} drawing commands from loaded session`)
              // Create a synthetic message to trigger drawing restoration
              const restorationMessage: Message = {
                id: 'session-restore',
                role: 'assistant',
                content: '',
                timestamp: new Date(),
                drawingCommands: allDrawingCommands,
                clearCanvas: false, // Don't clear - just add all commands
              }
              onMessageSent(restorationMessage)
            }
            
            // Reset processed messages tracking for new session
            processedMessageIdsRef.current.clear()
            lastProcessedCountRef.current = 0
          }
        } catch (error) {
          console.error('Error loading session:', error)
        } finally {
          setLoadingSession(false)
        }
      }
      loadSession()
    } 
    // Only clear messages if sessionId changed from defined to undefined (intentional reset)
    // Don't clear on initial mount or if sessionId is just undefined
    else if (!sessionId && !isInitialMount && prevSessionId !== undefined && prevSessionId !== sessionId) {
      prevSessionIdRef.current = sessionId
      setMessages([])
      setCurrentSessionId(uuidv4())
      // Reset processed messages tracking when clearing messages
      processedMessageIdsRef.current.clear()
      lastProcessedCountRef.current = 0
    } else {
      // Update ref even if no action taken
      prevSessionIdRef.current = sessionId
    }
    // If sessionId is undefined initially and we have messages, don't clear them
    // This prevents clearing messages when clicking examples
  }, [sessionId, currentSessionId])
  
  // Keep ref in sync with prop
  useEffect(() => {
    onMathExtractedRef.current = onMathExtracted
  }, [onMathExtracted])

  // Extract math from a message and notify parent
  const extractMathFromMessage = (message: Message) => {
    // DISABLED: Automatic math extraction from chat is now disabled
    // The AI's drawing commands handle all visual teaching on the whiteboard
    // This prevents incorrect extractions like "y = 1" from "x + y = 1"
    return
    
    /* Original code - kept for reference but disabled
    if (!onMathExtractedRef.current || processedMessageIdsRef.current.has(message.id)) {
      return
    }
    
    // Mark as processed
    processedMessageIdsRef.current.add(message.id)
    
    // Extract math expressions
    const mathExpressions = extractAllMath(message.content)
    
    // Only call if there are actual expressions
    if (mathExpressions.length > 0) {
      // Use setTimeout to defer to next event loop and prevent synchronous update loops
      setTimeout(() => {
        if (onMathExtractedRef.current) {
          try {
            onMathExtractedRef.current(mathExpressions)
          } catch (error) {
            console.error('Error calling onMathExtracted:', error)
          }
        }
      }, 0)
    }
    */
  }

  useEffect(() => {
    if (messages.length > 1) {
      scrollToBottom()
    }
  }, [messages.length])

  const handleSendMessage = async (content: string, imageFile?: File) => {
    if (!content.trim() && !imageFile) return

    let imageUrl: string | undefined

    // Handle image upload if present
    if (imageFile) {
      try {
        setIsLoading(true)
        imageUrl = await uploadImageToS3(imageFile, currentSessionId, user?.userId)

        // Parse image if it's a math problem
        try {
          const parseResponse = await fetch('/api/parse-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageUrl }),
          })

          if (parseResponse.ok) {
            const parseData = await parseResponse.json()
            if (parseData.problem) {
              content = parseData.problem
            }
          }
        } catch (error) {
          console.error('Error parsing image:', error)
        }
      } catch (error) {
        console.error('Error uploading image:', error)
        toast({
          title: 'Image upload failed',
          description: 'Could not upload image. Please try again.',
          variant: 'destructive',
        })
        setIsLoading(false)
        return
      }
    }

    // Create user message
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
      imageUrl,
    }

    setMessages(prev => [...prev, userMessage])
    
    // Extract math from user message immediately
    extractMathFromMessage(userMessage)

    // Notify parent
    if (onMessageSent) {
      onMessageSent(userMessage)
    }

    // Call API
    try {
      setIsLoading(true)
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content,
            imageUrl: msg.imageUrl,
          })),
          sessionId: currentSessionId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      
      // Debug logging
      console.log('📨 Received API response:', {
        hasMessage: !!data.message,
        hasCommands: !!data.commands,
        commandCount: data.commands?.length || 0,
        clearCanvas: data.clearCanvas
      })
      
      if (data.commands && data.commands.length > 0) {
        console.log('🎨 Drawing commands in response:', JSON.stringify(data.commands, null, 2))
      }
      
      const aiMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: data.message || data.response || 'I apologize, but I could not generate a response. Please try again.',
        timestamp: new Date(),
        isCorrect: data.isCorrect,
        isPartiallyCorrect: data.isPartiallyCorrect,
        drawingCommands: data.commands,
        clearCanvas: data.clearCanvas,
      }
      
      console.log('💬 Created AI message with commands:', {
        hasCommands: !!aiMessage.drawingCommands,
        commandCount: aiMessage.drawingCommands?.length || 0
      })

      setMessages(prev => [...prev, aiMessage])

      // Extract math from AI response immediately
      extractMathFromMessage(aiMessage)
      
      // Notify parent with drawing commands
      if (onMessageSent) {
        console.log('📤 Calling onMessageSent with AI message')
        onMessageSent(aiMessage)
      } else {
        console.warn('⚠️ onMessageSent callback not provided!')
      }

      // Save session if authenticated
      if (isAuthenticated && user?.userId) {
        const allMessages = [...messages, userMessage, aiMessage]
        const title = await generateSessionTitle(allMessages)
        await saveSession({
          sessionId: currentSessionId,
          userId: user.userId,
          title,
          messages: allMessages,
          isGuest: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Extract the problem statement (first user message)
  const problemStatement = messages.find(msg => msg.role === 'user')?.content || null

  const handleSelectExample = (problem: string) => {
    handleSendMessage(problem)
  }

  return (
    <div className="flex flex-col w-full h-full bg-gradient-chat relative">
      {/* Pinned Problem Statement - fixed at top when chat has started */}
      {problemStatement && messages.length > 0 && (
        <div className="sticky top-0 z-20 bg-gradient-to-b from-white to-slate-50/90 backdrop-blur-sm border-b border-slate-200/50 shadow-sm">
          <div className="container max-w-4xl mx-auto px-4 py-3">
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0 text-brand-blue-dark mt-1">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-500 mb-1">Problem Statement</p>
                <div className="text-lg font-semibold text-slate-900 leading-snug line-clamp-2">
                  {renderMathContent(problemStatement)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages Area - scrollable, takes remaining space */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto overflow-x-hidden chat-scrollbar">
        {loadingSession ? (
          <div className="container max-w-4xl mx-auto px-4 py-8">
            <div className="flex items-center justify-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="w-full">
            <WelcomeScreen onSelectExample={handleSelectExample} />
          </div>
        ) : (
          <div className="container max-w-4xl mx-auto px-4 py-2">
            {messages.map((message, index) => (
              <MessageBubble 
                key={message.id} 
                message={message}
                isAnimated={index === messages.length - 1}
              />
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-3 mb-6">
                <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                <div className="flex-1 max-w-[75%]">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <div className="rounded-2xl rounded-tl-sm bg-white border border-slate-200 px-4 py-3">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="h-2 w-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="h-2 w-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area - fixed at bottom */}
      <div className="flex-none w-full z-10">
        <ChatInput
          ref={inputRef}
          onSendMessage={handleSendMessage}
          disabled={isLoading || loadingSession}
          showSuggestions={messages.length > 0}
        />
      </div>
    </div>
  )
}

