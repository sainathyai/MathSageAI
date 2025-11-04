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

export function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId] = useState<string>(() => uuidv4())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()

  const scrollToBottom = () => {
    // Use scrollTop instead of scrollIntoView to avoid layout shifts
    const container = messagesContainerRef.current
    if (container) {
      container.scrollTop = container.scrollHeight
    }
  }

  useEffect(() => {
    // Only scroll if there are multiple messages (user + AI response)
    // Don't scroll on the first user message - let them see what they typed
    // Count user and assistant messages separately
    const userMessages = messages.filter(msg => msg.role === 'user')
    const assistantMessages = messages.filter(msg => msg.role === 'assistant')
    
    // Only scroll if we have both a user message AND an assistant response
    // This prevents scrolling when the first user message is added
    if (userMessages.length >= 1 && assistantMessages.length >= 1) {
      // Wait for DOM to update before scrolling
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollToBottom()
        })
      })
    }
  }, [messages])

  // Save session whenever messages change
  useEffect(() => {
    if (messages.length === 0) return

    const saveCurrentSession = async () => {
      const title = generateSessionTitle(messages)
      const now = new Date().toISOString()

      await saveSession({
        sessionId,
        userId: user?.userId,
        title,
        messages,
        createdAt: now,
        updatedAt: now,
        isGuest: !isAuthenticated,
      })
    }

    saveCurrentSession()
  }, [messages, sessionId, user, isAuthenticated])

  const handleSendMessage = async (content: string, image?: File) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
      imageUrl: undefined // Will be set after S3 upload
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      // If image is provided, upload to S3 and parse it
      let problemContent = content
      if (image) {
        try {
          // Upload to S3 first
          const s3Url = await uploadImageToS3(image, sessionId, user?.userId)
          console.log('✅ Image uploaded to S3:', s3Url)
          
          // Update user message with S3 URL
          userMessage.imageUrl = s3Url
          setMessages(prev => prev.map(msg => 
            msg.id === userMessage.id ? { ...msg, imageUrl: s3Url } : msg
          ))
          
          // Parse image with OpenAI Vision
          const imageBase64 = await fileToBase64(image)
          
          // Log base64 data info (first 100 chars to avoid spam)
          console.log('📦 Base64 data prepared:', {
            length: imageBase64.length,
            prefix: imageBase64.substring(0, 100),
            hasDataPrefix: imageBase64.startsWith('data:'),
          })
          
          const parseResponse = await fetch('/api/parse-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: imageBase64 }),
          })
          
          console.log('📥 Parse response status:', parseResponse.status, parseResponse.statusText)
          
          if (parseResponse.ok) {
            const { problem } = await parseResponse.json()
            problemContent = problem
            // Update user message with parsed problem
            userMessage.content = problemContent
            setMessages(prev => prev.map(msg =>
              msg.id === userMessage.id ? userMessage : msg
            ))
          } else {
            // Handle image parsing errors gracefully
            const errorData = await parseResponse.json().catch(() => ({ 
              error: 'Image parsing failed',
              message: 'Could not parse the image. Please type your math problem manually or try uploading a clearer image.'
            }))
            
            // If vision is not available, show a helpful message
            if (parseResponse.status === 403 || errorData.message?.includes('vision')) {
              const visionErrorMessage: Message = {
                id: (Date.now() - 1).toString(),
                role: 'system',
                content: 'Note: Image parsing is not available with your current API plan. Please type your math problem manually.',
                timestamp: new Date()
              }
              setMessages(prev => [...prev, visionErrorMessage])
            } else {
              // Other errors - show error but continue with manual entry
              const errorMessage: Message = {
                id: (Date.now() - 1).toString(),
                role: 'system',
                content: errorData.message || 'Could not parse the image. Please type your math problem manually.',
                timestamp: new Date()
              }
              setMessages(prev => [...prev, errorMessage])
            }
            // Continue with the original content (user can still type manually)
            // If user provided text, use it; otherwise don't send anything (let user type)
            if (content && content.trim()) {
              problemContent = content
            } else {
              // Don't send a message to chat API - just show the error and stop
              // The error message is already shown as a system message above
              setIsLoading(false)
              return
            }
          }
        } catch (error) {
          console.error('Image parsing error:', error)
          // Show error but continue with manual entry if user provided text
          const errorMessage: Message = {
            id: (Date.now() - 1).toString(),
            role: 'system',
            content: 'Could not parse the image. Please type your math problem manually.',
            timestamp: new Date()
          }
          setMessages(prev => [...prev, errorMessage])
          
          // If user provided text, continue with it; otherwise stop
          if (content && content.trim()) {
            problemContent = content
          } else {
            setIsLoading(false)
            return
          }
        }
      }

      // Prepare messages for API (include conversation history + current user message)
      // Note: We include the current user message here because React state updates are async
      // Only send if we have actual content (not empty placeholder)
      if (!problemContent || !problemContent.trim()) {
        setIsLoading(false)
        return
      }
      
      const apiMessages = [
        ...messages
          .filter(msg => msg.role !== 'system')
          .map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
        {
          role: 'user' as const,
          content: problemContent, // Use the potentially parsed problem content
        },
      ]

      // Call chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          sessionId: null, // TODO: Implement session management
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.message || errorData.error || 'Failed to get response from AI')
      }

      const data = await response.json()
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message || data.error || "I apologize, but I couldn't generate a response. Please try again.",
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, aiMessage])
      
      // Scroll to bottom after AI response is added
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollToBottom()
        })
      })
    } catch (error) {
      console.error('Error sending message:', error)
      
      // Provide more specific error messages to the user
      let errorContent = "I apologize, but I encountered an error. Please try again or rephrase your question."
      
      if (error instanceof Error) {
        if (error.message.includes('API key') || error.message.includes('Authentication')) {
          errorContent = "I'm having trouble connecting. Please check that your OpenAI API key is configured correctly in the .env.local file."
        } else if (error.message.includes('rate limit') || error.message.includes('429')) {
          errorContent = "I'm receiving too many requests right now. Please wait a moment and try again."
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorContent = "I'm having trouble connecting to the server. Please check your internet connection and try again."
        } else {
          errorContent = `I encountered an error: ${error.message}. Please try again.`
        }
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorContent,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
      
      // Scroll to bottom after error message is added
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollToBottom()
        })
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function to convert File to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        // Remove data:image/...;base64, prefix if present
        const base64 = result.includes(',') ? result.split(',')[1] : result
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleSelectExample = (problem: string) => {
    handleSendMessage(problem)
  }

  return (
    <div className="flex flex-col w-full h-full bg-gradient-chat">
      {/* Messages Area - scrollable, takes remaining space */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto overflow-x-hidden chat-scrollbar">
        {messages.length === 0 ? (
          <WelcomeScreen onSelectExample={handleSelectExample} />
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
          onSendMessage={handleSendMessage}
          disabled={isLoading}
        />
      </div>
    </div>
  )
}

