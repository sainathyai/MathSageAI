/**
 * Session management utilities for saving and loading chat sessions
 */

import { Message } from '@/app/types'

export interface SessionData {
  sessionId: string
  userId?: string
  title: string
  messages: Message[]
  createdAt: string
  updatedAt: string
  isGuest: boolean
}

/**
 * Save session to DynamoDB via API
 */
export async function saveSession(sessionData: SessionData): Promise<void> {
  try {
    const response = await fetch('/api/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sessionData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to save session')
    }
  } catch (error) {
    console.error('Error saving session:', error)
    // Don't throw - we don't want to block the chat if session save fails
  }
}

/**
 * Get a specific session by ID
 */
export async function getSession(sessionId: string): Promise<SessionData | null> {
  try {
    const response = await fetch(`/api/sessions?sessionId=${sessionId}`)
    
    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error('Failed to fetch session')
    }

    const data = await response.json()
    return data.session
  } catch (error) {
    console.error('Error fetching session:', error)
    return null
  }
}

/**
 * Get all sessions for a user
 */
export async function getUserSessions(userId: string): Promise<SessionData[]> {
  try {
    const response = await fetch(`/api/sessions?userId=${userId}`)
    
    if (!response.ok) {
      // Try to get error details from response
      let errorMessage = 'Failed to fetch user sessions'
      try {
        const errorData = await response.json()
        errorMessage = errorData.error || errorMessage
        if (errorData.details) {
          errorMessage += `: ${errorData.details}`
        }
        console.error('❌ API Error Response:', errorData)
      } catch (e) {
        // If response is not JSON, use status text
        errorMessage = `Failed to fetch user sessions: ${response.status} ${response.statusText}`
      }
      throw new Error(errorMessage)
    }

    const data = await response.json()
    return data.sessions || []
  } catch (error) {
    console.error('❌ Error fetching user sessions:', error)
    // Re-throw to allow caller to handle it
    throw error
  }
}

/**
 * Generate a session title from the first user message
 */
export function generateSessionTitle(messages: Message[]): string {
  const firstUserMessage = messages.find(m => m.role === 'user')
  
  if (!firstUserMessage) {
    return 'New Conversation'
  }

  // Truncate to 50 characters and add ellipsis if needed
  const content = firstUserMessage.content.trim()
  return content.length > 50 ? content.substring(0, 50) + '...' : content
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(isoString: string): string {
  const date = new Date(isoString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  
  return date.toLocaleDateString()
}

