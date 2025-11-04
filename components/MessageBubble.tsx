'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { Bot, User } from 'lucide-react'
import { Message } from '@/app/types'
import { useState } from 'react'
import { renderMathContent } from '@/app/utils/mathRenderer'
import 'katex/dist/katex.min.css'

interface MessageBubbleProps {
  message: Message
  isAnimated?: boolean
}

export function MessageBubble({ message, isAnimated = false }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const [logoError, setLogoError] = useState(false)
  const isSystem = message.role === 'system'

  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <div className="rounded-full bg-slate-100 px-4 py-2 text-xs text-slate-600">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div 
      className={cn(
        "flex gap-3 mb-6",
        isUser ? "flex-row-reverse" : "flex-row",
        isAnimated && "animate-in fade-in slide-in-from-bottom-4 duration-500"
      )}
    >
      {/* Avatar */}
      <Avatar className={cn(
        "h-8 w-8 flex-shrink-0 overflow-hidden",
        isUser ? "bg-gradient-brand" : "bg-gradient-ai"
      )}>
        <AvatarFallback className="bg-transparent">
          {isUser ? (
            <User className="h-5 w-5 text-white" />
          ) : logoError ? (
            <span className="text-lg">🦉</span>
          ) : (
            <img 
              src="/logo.png" 
              alt="MathSage AI" 
              className="h-full w-full object-contain"
              onError={() => {
                console.error('Logo failed to load from /logo.png');
                setLogoError(true);
              }}
            />
          )}
        </AvatarFallback>
      </Avatar>

      {/* Message Content */}
      <div className={cn(
        "flex flex-col",
        isUser ? "items-end" : "items-start",
        "max-w-[85%] sm:max-w-[75%]"
      )}>
        {/* Name & Timestamp */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-slate-900">
            {isUser ? 'You' : 'MathSage AI 🦉'}
          </span>
          <span className="text-xs text-slate-500">
            {message.timestamp.toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit' 
            })}
          </span>
        </div>

        {/* Image if present */}
        {message.imageUrl && (
          <div className="mb-2 rounded-lg overflow-hidden border border-slate-200">
            <img 
              src={message.imageUrl} 
              alt="Uploaded problem" 
              className="max-w-full h-auto"
            />
          </div>
        )}

        {/* Message Bubble */}
        <div className={cn(
          "rounded-2xl px-4 py-3 shadow-sm",
          isUser 
            ? "bg-gradient-brand rounded-tr-sm" 
            : "bg-gradient-ai rounded-tl-sm border border-slate-200/50"
        )}>
          <div 
            className={cn(
              "text-sm leading-relaxed whitespace-pre-wrap",
              isUser ? "user-message-text" : "text-slate-900"
            )}
            style={isUser ? { color: '#ffffff' } : undefined}
          >
            {renderMathContent(message.content)}
          </div>
        </div>
      </div>
    </div>
  )
}

