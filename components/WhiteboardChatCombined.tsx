'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { WhiteboardContainer } from './WhiteboardContainer'
import { ChatPanel } from './ChatPanel'
import { Message } from '@/app/types'
import { extractAllMath } from '@/app/utils/mathExtractor'
import { DrawingCommand } from '@/app/types/drawing'

interface WhiteboardChatCombinedProps {
  sessionId?: string
  onStateChange?: (state: any) => void
}

export function WhiteboardChatCombined({ sessionId, onStateChange }: WhiteboardChatCombinedProps) {
  const [mathElements, setMathElements] = useState<Array<{ id: string; latex: string; x: number; y: number }>>([])
  const [drawingCommands, setDrawingCommands] = useState<DrawingCommand[]>([])
  const [shouldClearCanvas, setShouldClearCanvas] = useState(false)
  const whiteboardRef = useRef<HTMLDivElement>(null)
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 1000, height: 800 })
  const canvasDimensionsRef = useRef({ width: 1000, height: 800 })
  const drawnCommandsHistoryRef = useRef<Set<string>>(new Set()) // Track what's been drawn

  // Three-segment positioning system: left, middle, right
  // Elements are arranged vertically, starting from left, then middle, then right
  const calculatePosition = (index: number, canvasWidth: number, canvasHeight: number) => {
    const elementHeight = 80 // Approximate height of each math element
    const verticalSpacing = 20 // Space between elements
    const startXLeft = 80 // Starting X position from left edge (left segment)
    const startXMiddle = canvasWidth / 2 // Middle segment X position
    const startXRight = canvasWidth - 80 // Right segment X position
    const startY = 60 // Starting Y position from top
    const maxY = canvasHeight - 100 // Maximum Y position (leave space at bottom)
    
    // Calculate how many elements fit in one column
    const elementsPerColumn = Math.floor((maxY - startY) / (elementHeight + verticalSpacing))
    
    // Determine which segment (0 = left, 1 = middle, 2 = right)
    const segment = Math.floor(index / elementsPerColumn)
    
    // Calculate position within segment
    const indexInSegment = index % elementsPerColumn
    
    // Calculate X position based on segment
    let x: number
    if (segment === 0) {
      // Left segment
      x = startXLeft
    } else if (segment === 1) {
      // Middle segment
      x = startXMiddle
    } else {
      // Right segment
      x = startXRight
    }
    
    // Calculate Y position (vertical stacking within segment)
    const y = startY + (indexInSegment * (elementHeight + verticalSpacing))
    
    return { x, y }
  }

  // Update canvas dimensions when whiteboard container size changes
  useEffect(() => {
    const updateDimensions = () => {
      if (whiteboardRef.current) {
        const rect = whiteboardRef.current.getBoundingClientRect()
        const newDimensions = {
          width: rect.width,
          height: rect.height,
        }
        canvasDimensionsRef.current = newDimensions
        setCanvasDimensions(newDimensions)
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  const handleMathExtracted = useCallback((mathExpressions: string[]) => {
    // Add math expressions to whiteboard with three-segment positioning
    setMathElements(prev => {
      const newElements: Array<{ id: string; latex: string; x: number; y: number }> = []
      
      // Use ref to get current dimensions without recreating callback
      const dimensions = canvasDimensionsRef.current
      
      mathExpressions.forEach((latex, index) => {
        // Convert simple equations to LaTeX if needed
        let formattedLatex = latex
        
        // If it's a simple equation like "x = 5", convert to LaTeX
        if (!latex.includes('\\') && !latex.startsWith('$')) {
          // Try to format as LaTeX
          formattedLatex = latex
            .replace(/\s+/g, ' ')
            .replace(/\*/g, ' \\times ')
            .replace(/\//g, ' \\div ')
            .replace(/\^(\d+)/g, '^{$1}')
            .replace(/_(\d+)/g, '_{$1}')
        }

        // Remove $ delimiters if present
        formattedLatex = formattedLatex.replace(/^\$+|\$+$/g, '')

        // Check if similar expression already exists
        const exists = prev.some(el => el.latex === formattedLatex)
        if (!exists && formattedLatex.trim()) {
          // Calculate position using three-segment system
          const totalIndex = prev.length + newElements.length
          const { x, y } = calculatePosition(totalIndex, dimensions.width, dimensions.height)
          
          newElements.push({
            id: `math-${Date.now()}-${index}`,
            latex: formattedLatex,
            x,
            y,
          })
        }
      })
      
      // Only update state if there are new elements to avoid unnecessary re-renders
      if (newElements.length === 0) {
        return prev // Return same reference if no new elements
      }
      
      return [...prev, ...newElements]
    })
  }, []) // No dependencies - stable callback that uses ref for dimensions

  const handleMessageSent = useCallback((message: Message) => {
    console.log('📬 handleMessageSent called:', {
      messageId: message.id,
      hasCommands: !!message.drawingCommands,
      commandCount: message.drawingCommands?.length || 0,
      clearCanvas: message.clearCanvas,
      isSessionRestore: message.id === 'session-restore'
    })
    
    // Handle drawing commands if present
    if (message.drawingCommands && message.drawingCommands.length > 0) {
      // Check if this is a session restore
      const isSessionRestore = message.id === 'session-restore'
      
      if (isSessionRestore) {
        // Session restore: clear history and restore all commands
        console.log('🔄 Session restore: clearing history and restoring all drawing commands')
        drawnCommandsHistoryRef.current.clear()
        setShouldClearCanvas(true) // Clear canvas first, then restore all drawings
        
        // Add all commands to history
        message.drawingCommands.forEach(cmd => {
          const commandHash = JSON.stringify({
            type: cmd.type,
            ...(cmd.type === 'circle' && { x: cmd.x, y: cmd.y, radius: cmd.radius }),
            ...(cmd.type === 'rectangle' && { x: cmd.x, y: cmd.y, width: cmd.width, height: cmd.height }),
            ...(cmd.type === 'triangle' && { x1: cmd.x1, y1: cmd.y1, x2: cmd.x2, y2: cmd.y2, x3: cmd.x3, y3: cmd.y3 }),
            ...(cmd.type === 'line' && { x1: cmd.x1, y1: cmd.y1, x2: cmd.x2, y2: cmd.y2 }),
            ...(cmd.type === 'text' && { x: cmd.x, y: cmd.y, text: cmd.text }),
            ...(cmd.type === 'parabola' && { a: (cmd as any).a, b: (cmd as any).b, c: (cmd as any).c }),
          })
          drawnCommandsHistoryRef.current.add(commandHash)
        })
        
        // Set all commands for restoration
        console.log(`🎨 Restoring ${message.drawingCommands.length} drawing commands from session`)
        setDrawingCommands(message.drawingCommands)
      } else {
        // Normal message flow: filter out duplicates
        const newCommands = message.drawingCommands.filter(cmd => {
          // Create a hash of the command to detect duplicates
          const commandHash = JSON.stringify({
            type: cmd.type,
            // Include position/size but not labels to catch true duplicates
            ...(cmd.type === 'circle' && { x: cmd.x, y: cmd.y, radius: cmd.radius }),
            ...(cmd.type === 'rectangle' && { x: cmd.x, y: cmd.y, width: cmd.width, height: cmd.height }),
            ...(cmd.type === 'triangle' && { x1: cmd.x1, y1: cmd.y1, x2: cmd.x2, y2: cmd.y2, x3: cmd.x3, y3: cmd.y3 }),
            ...(cmd.type === 'line' && { x1: cmd.x1, y1: cmd.y1, x2: cmd.x2, y2: cmd.y2 }),
            ...(cmd.type === 'text' && { x: cmd.x, y: cmd.y, text: cmd.text }),
            ...(cmd.type === 'parabola' && { a: (cmd as any).a, b: (cmd as any).b, c: (cmd as any).c }),
          })
          
          // Check if we've drawn this before
          if (drawnCommandsHistoryRef.current.has(commandHash)) {
            console.log('⏭️ Skipping duplicate command:', cmd.type)
            return false // Skip duplicate
          }
          
          // Add to history
          drawnCommandsHistoryRef.current.add(commandHash)
          return true // Include this command
        })
        
        if (newCommands.length > 0) {
          console.log(`🎨 Setting ${newCommands.length} new drawing commands (${message.drawingCommands.length - newCommands.length} duplicates skipped)`)
          console.log('📦 Commands to be drawn:', JSON.stringify(newCommands, null, 2))
          setDrawingCommands(newCommands)
          
          if (message.clearCanvas) {
            console.log('🧹 Clearing canvas and resetting history')
            setShouldClearCanvas(true)
            drawnCommandsHistoryRef.current.clear() // Clear history when canvas is cleared
          }
        } else {
          console.log('⚠️ All commands were duplicates, skipping')
        }
      }
    } else {
      console.log('⚠️ No drawing commands in message')
    }
  }, [])

  return (
    <div className="flex h-full w-full">
      {/* Whiteboard - takes 70% of width */}
      <div ref={whiteboardRef} className="flex-1" style={{ width: '70%', minWidth: 0 }}>
        <WhiteboardContainer
          sessionId={sessionId}
          mathElements={mathElements}
          drawingCommands={drawingCommands}
          clearCanvas={shouldClearCanvas}
          onStateChange={onStateChange}
        />
      </div>

      {/* Resizer */}
      <div className="w-1 bg-slate-300 hover:bg-brand-blue-DEFAULT cursor-col-resize transition-colors flex-shrink-0" />

      {/* Chat Panel - takes 30% of width */}
      <div className="flex-shrink-0" style={{ width: '30%', minWidth: '300px' }}>
        <ChatPanel
          sessionId={sessionId}
          onMessageSent={handleMessageSent}
          onMathExtracted={handleMathExtracted}
        />
      </div>
    </div>
  )
}

