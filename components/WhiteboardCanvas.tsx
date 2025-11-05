'use client'

import { forwardRef, useEffect, useRef, useState, useCallback } from 'react'
import { ToolType, CanvasMode } from './WhiteboardContainer'
import { cn } from '@/lib/utils'
import { BlockMath } from 'react-katex'
import 'katex/dist/katex.min.css'

interface MathElement {
  id: string
  latex: string
  x: number
  y: number
}

interface WhiteboardCanvasProps {
  tool: ToolType
  color: string
  strokeWidth: number
  showGrid: boolean
  canvasMode: CanvasMode
  mathElements?: MathElement[]
  sessionId?: string
  onStateChange?: (state: any) => void
}

export const WhiteboardCanvas = forwardRef<HTMLCanvasElement, WhiteboardCanvasProps>(
  ({ tool, color, strokeWidth, showGrid, canvasMode, mathElements = [], sessionId, onStateChange }, ref) => {
    const internalCanvasRef = useRef<HTMLCanvasElement>(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [startPos, setStartPos] = useState({ x: 0, y: 0 })
    const [history, setHistory] = useState<ImageData[]>([])
    const savedDrawingRef = useRef<ImageData | null>(null) // Persist drawings through resize

    // Use forwarded ref if provided, otherwise use internal ref
    const canvas = ref && typeof ref === 'object' && 'current' in ref 
      ? (ref as React.MutableRefObject<HTMLCanvasElement>)
      : internalCanvasRef
    
    // Sync forwarded ref with internal ref
    useEffect(() => {
      if (ref && typeof ref === 'object' && 'current' in ref && internalCanvasRef.current) {
        ;(ref as React.MutableRefObject<HTMLCanvasElement | null>).current = internalCanvasRef.current
      }
    }, [ref])

    const drawGrid = useCallback((drawOnTop: boolean = false) => {
      const canvasEl = canvas.current
      if (!canvasEl || canvasEl.width === 0 || canvasEl.height === 0) return

      const ctx = canvasEl.getContext('2d')
      if (!ctx) return

      // If NOT drawing on top, clear the canvas first (like other background functions)
      // This ensures we don't have overlapping backgrounds
      if (!drawOnTop) {
        ctx.clearRect(0, 0, canvasEl.width, canvasEl.height)
      } else {
        // If drawing on top, save current content first
        const imageData = ctx.getImageData(0, 0, canvasEl.width, canvasEl.height)
        // Restore later after drawing
        const restoreAfter = () => {
          ctx.putImageData(imageData, 0, 0)
        }
        // Store restore function for later (we'll call it after drawing)
        // Actually, we'll restore inline after drawing
      }
      
      // Draw grid with solid lines - not dots (lighter)
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.5)' // Lighter for better contrast
      ctx.lineWidth = 1.5 // Thicker for better visibility
      ctx.lineCap = 'butt' // Straight line endings
      ctx.lineJoin = 'miter' // Sharp corners
      const gridSize = 20

      // Draw vertical grid lines - continuous solid lines
      for (let x = 0; x <= canvasEl.width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvasEl.height)
        ctx.stroke()
      }

      // Draw horizontal grid lines - continuous solid lines
      for (let y = 0; y <= canvasEl.height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvasEl.width, y)
        ctx.stroke()
      }

      // If drawing on top, restore content after drawing
      // Note: This is handled differently - we save before drawing above
      // For now, if drawOnTop is true, we don't clear, so we don't need to restore
    }, [canvas])

    const drawCoordinatePlane = useCallback((preserveDrawings = false) => {
      const canvasEl = canvas.current
      if (!canvasEl || canvasEl.width === 0 || canvasEl.height === 0) return

      const ctx = canvasEl.getContext('2d')
      if (!ctx) return

      // Only clear if not preserving drawings (i.e., initial draw, not mode switch)
      if (!preserveDrawings) {
        ctx.clearRect(0, 0, canvasEl.width, canvasEl.height)
      }
      
      const centerX = canvasEl.width / 2
      const centerY = canvasEl.height / 2
      const gridSize = 20

      // Draw grid lines - solid continuous lines (horizontal and vertical) - lighter
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.5)' // Lighter for better contrast
      ctx.lineWidth = 1.5 // Thicker for better visibility
      ctx.lineCap = 'butt' // Straight line endings
      ctx.lineJoin = 'miter' // Sharp corners

      // Vertical grid lines - continuous solid lines
      for (let x = centerX % gridSize; x <= canvasEl.width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvasEl.height)
        ctx.stroke()
      }

      // Horizontal grid lines - continuous solid lines
      for (let y = centerY % gridSize; y <= canvasEl.height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvasEl.width, y)
        ctx.stroke()
      }

      // Draw axes (darker for visibility)
      ctx.strokeStyle = 'rgba(71, 85, 105, 0.8)' // Darker slate - more visible
      ctx.lineWidth = 1.5 // Keep original thickness
      ctx.fillStyle = 'rgba(71, 85, 105, 0.8)' // For arrows

      // X-axis
      ctx.beginPath()
      ctx.moveTo(0, centerY)
      ctx.lineTo(canvasEl.width, centerY)
      ctx.stroke()

      // Y-axis
      ctx.beginPath()
      ctx.moveTo(centerX, 0)
      ctx.lineTo(centerX, canvasEl.height)
      ctx.stroke()

      // Draw arrows on both ends of X-axis
      // Right arrow (pointing right)
      ctx.beginPath()
      ctx.moveTo(canvasEl.width - 20, centerY - 5)
      ctx.lineTo(canvasEl.width, centerY)
      ctx.lineTo(canvasEl.width - 20, centerY + 5)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
      
      // Left arrow (pointing left)
      ctx.beginPath()
      ctx.moveTo(20, centerY - 5)
      ctx.lineTo(0, centerY)
      ctx.lineTo(20, centerY + 5)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      // Draw arrows on both ends of Y-axis
      // Top arrow (pointing up)
      ctx.beginPath()
      ctx.moveTo(centerX - 5, 20)
      ctx.lineTo(centerX, 0)
      ctx.lineTo(centerX + 5, 20)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
      
      // Bottom arrow (pointing down)
      ctx.beginPath()
      ctx.moveTo(centerX - 5, canvasEl.height - 20)
      ctx.lineTo(centerX, canvasEl.height)
      ctx.lineTo(centerX + 5, canvasEl.height - 20)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      // Draw axis labels and tick marks
      ctx.strokeStyle = 'rgba(71, 85, 105, 1)'
      ctx.lineWidth = 1.5
      ctx.font = '12px Arial, sans-serif'
      ctx.fillStyle = 'rgba(71, 85, 105, 1)'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'

      // X-axis ticks and labels
      for (let x = centerX + gridSize; x < canvasEl.width; x += gridSize) {
        const unit = (x - centerX) / gridSize
        // Tick mark
        ctx.beginPath()
        ctx.moveTo(x, centerY - 5)
        ctx.lineTo(x, centerY + 5)
        ctx.stroke()
        // Label
        if (unit % 5 === 0 && unit !== 0) {
          ctx.fillText(unit.toString(), x, centerY + 8)
        }
      }
      for (let x = centerX - gridSize; x > 0; x -= gridSize) {
        const unit = (x - centerX) / gridSize
        // Tick mark
        ctx.beginPath()
        ctx.moveTo(x, centerY - 5)
        ctx.lineTo(x, centerY + 5)
        ctx.stroke()
        // Label
        if (unit % 5 === 0 && unit !== 0) {
          ctx.fillText(unit.toString(), x, centerY + 8)
        }
      }

      // Y-axis ticks and labels
      ctx.textAlign = 'right'
      ctx.textBaseline = 'middle'
      for (let y = centerY - gridSize; y > 0; y -= gridSize) {
        const unit = (centerY - y) / gridSize
        // Tick mark
        ctx.beginPath()
        ctx.moveTo(centerX - 5, y)
        ctx.lineTo(centerX + 5, y)
        ctx.stroke()
        // Label
        if (unit % 5 === 0 && unit !== 0) {
          ctx.fillText(unit.toString(), centerX - 8, y)
        }
      }
      for (let y = centerY + gridSize; y < canvasEl.height; y += gridSize) {
        const unit = (centerY - y) / gridSize
        // Tick mark
        ctx.beginPath()
        ctx.moveTo(centerX - 5, y)
        ctx.lineTo(centerX + 5, y)
        ctx.stroke()
        // Label
        if (unit % 5 === 0 && unit !== 0) {
          ctx.fillText(unit.toString(), centerX - 8, y)
        }
      }

      // Origin label
      ctx.textAlign = 'right'
      ctx.textBaseline = 'top'
      ctx.font = '12px Arial, sans-serif'
      ctx.fillText('O', centerX - 8, centerY + 8)

      // Axis labels
      ctx.font = 'bold 14px Arial, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('x', canvasEl.width - 20, centerY + 8)
      ctx.textAlign = 'right'
      ctx.textBaseline = 'top'
      ctx.fillText('y', centerX - 8, 10)
    }, [canvas])

    const drawNumberLine = useCallback((preserveDrawings = false) => {
      const canvasEl = canvas.current
      if (!canvasEl || canvasEl.width === 0 || canvasEl.height === 0) return

      const ctx = canvasEl.getContext('2d')
      if (!ctx) return

      // Only clear if not preserving drawings (i.e., initial draw, not mode switch)
      if (!preserveDrawings) {
        ctx.clearRect(0, 0, canvasEl.width, canvasEl.height)
      }
      
      const centerY = canvasEl.height / 2
      const gridSize = 20
      const centerX = canvasEl.width / 2

      // Draw grid lines - solid continuous lines (horizontal and vertical, like coordinate plane) - lighter
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.5)' // Lighter for better contrast
      ctx.lineWidth = 1.5 // Thicker for better visibility
      ctx.lineCap = 'butt' // Straight line endings
      ctx.lineJoin = 'miter' // Sharp corners

      // Draw vertical grid lines
      for (let x = centerX % gridSize; x <= canvasEl.width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvasEl.height)
        ctx.stroke()
      }
      for (let x = (centerX % gridSize) - gridSize; x >= 0; x -= gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvasEl.height)
        ctx.stroke()
      }

      // Draw horizontal grid lines
      for (let y = centerY % gridSize; y <= canvasEl.height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvasEl.width, y)
        ctx.stroke()
      }
      for (let y = (centerY % gridSize) - gridSize; y >= 0; y -= gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvasEl.width, y)
        ctx.stroke()
      }

      // Draw horizontal number line - solid line (darker)
      ctx.strokeStyle = 'rgba(71, 85, 105, 1)' // Dark slate - fully opaque for maximum visibility
      ctx.lineWidth = 1.5 // Keep original thickness
      ctx.lineCap = 'butt' // Straight line endings
      ctx.lineJoin = 'miter' // Sharp corners
      ctx.beginPath()
      ctx.moveTo(0, centerY)
      ctx.lineTo(canvasEl.width, centerY)
      ctx.stroke()

      // Draw tick marks and labels (darker)
      ctx.strokeStyle = 'rgba(71, 85, 105, 1)' // Dark slate - fully opaque for tick marks
      ctx.lineWidth = 1.5
      ctx.lineCap = 'butt'
      ctx.lineJoin = 'miter'
      ctx.font = '12px Arial, sans-serif'
      ctx.fillStyle = 'rgba(71, 85, 105, 1)' // Dark slate - fully opaque for labels
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'

      for (let x = centerX % gridSize; x <= canvasEl.width; x += gridSize) {
        const unit = Math.round((x - centerX) / gridSize)
        // Tick mark
        ctx.beginPath()
        ctx.moveTo(x, centerY - 8)
        ctx.lineTo(x, centerY + 8)
        ctx.stroke()
        // Label
        if (unit % 5 === 0 || unit === 0) {
          ctx.fillText(unit.toString(), x, centerY + 12)
        }
      }
      for (let x = (centerX % gridSize) - gridSize; x >= 0; x -= gridSize) {
        const unit = Math.round((x - centerX) / gridSize)
        // Tick mark
        ctx.beginPath()
        ctx.moveTo(x, centerY - 8)
        ctx.lineTo(x, centerY + 8)
        ctx.stroke()
        // Label
        if (unit % 5 === 0 || unit === 0) {
          ctx.fillText(unit.toString(), x, centerY + 12)
        }
      }

      // Draw arrows at both ends (darker)
      ctx.strokeStyle = 'rgba(71, 85, 105, 1)' // Dark slate - fully opaque for arrow
      ctx.lineWidth = 1.5
      ctx.fillStyle = 'rgba(71, 85, 105, 1)' // Fill arrow for better visibility
      
      // Right arrow (pointing right)
      ctx.beginPath()
      ctx.moveTo(canvasEl.width - 20, centerY - 5)
      ctx.lineTo(canvasEl.width, centerY)
      ctx.lineTo(canvasEl.width - 20, centerY + 5)
      ctx.closePath()
      ctx.fill() // Fill the arrow
      ctx.stroke() // Stroke the arrow
      
      // Left arrow (pointing left)
      ctx.beginPath()
      ctx.moveTo(20, centerY - 5)
      ctx.lineTo(0, centerY)
      ctx.lineTo(20, centerY + 5)
      ctx.closePath()
      ctx.fill() // Fill the arrow
      ctx.stroke() // Stroke the arrow
    }, [canvas])

    useEffect(() => {
      const canvasEl = canvas.current
      if (!canvasEl) return

      // Set canvas size to match container
      const resizeCanvas = () => {
        const container = canvasEl.parentElement
        if (container) {
          // 💾 Save current drawing BEFORE resize
          const ctx = canvasEl.getContext('2d', { willReadFrequently: true })
          if (ctx && canvasEl.width > 0 && canvasEl.height > 0) {
            try {
              savedDrawingRef.current = ctx.getImageData(0, 0, canvasEl.width, canvasEl.height)
              console.log('💾 Saved drawing before resize:', {
                width: canvasEl.width,
                height: canvasEl.height
              })
            } catch (e) {
              console.error('Failed to save drawing:', e)
            }
          }
          
          // Resize canvas
          canvasEl.width = container.clientWidth
          canvasEl.height = container.clientHeight
          console.log('📐 Canvas resized to:', {
            width: canvasEl.width,
            height: canvasEl.height
          })
          
          // Clear and redraw background
          if (ctx) {
            ctx.clearRect(0, 0, canvasEl.width, canvasEl.height)
          }
          
          // Redraw based on canvas mode
          if (canvasMode === 'coordinate') {
            drawCoordinatePlane()
          } else if (canvasMode === 'numberline') {
            drawNumberLine()
          } else if (showGrid && canvasMode === 'grid') {
            drawGrid()
          }
          
          // ♻️ Restore drawing ON TOP of background
          if (savedDrawingRef.current && ctx) {
            try {
              ctx.putImageData(savedDrawingRef.current, 0, 0)
              console.log('♻️ Restored drawing after resize')
            } catch (e) {
              console.error('Failed to restore drawing:', e)
            }
          }
        }
      }

      resizeCanvas()
      window.addEventListener('resize', resizeCanvas)
      return () => window.removeEventListener('resize', resizeCanvas)
    }, [showGrid, canvasMode, canvas, drawGrid, drawCoordinatePlane, drawNumberLine])

    // This effect handles background mode switching
    // Only ONE background should be visible at a time
    // SIMPLIFIED: Clear everything and draw only the new background
    // User drawings from pen/brush will persist via savedDrawingRef in resize handler
    useEffect(() => {
      const canvasEl = canvas.current
      if (!canvasEl || canvasEl.width === 0 || canvasEl.height === 0) return
      
      const ctx = canvasEl.getContext('2d')
      if (!ctx) return
      
      console.log('🔄 Canvas mode changed to:', canvasMode, 'showGrid:', showGrid)
      
      // Simple strategy: Clear everything and draw ONLY the new background
      // Don't try to preserve drawings - that was causing overlapping backgrounds
      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height)
      
      // Draw ONLY the new background (only one at a time)
      if (canvasMode === 'coordinate') {
        console.log('📐 Drawing coordinate plane')
        drawCoordinatePlane(false) // Clears and draws
      } else if (canvasMode === 'numberline') {
        console.log('📏 Drawing number line')
        drawNumberLine(false) // Clears and draws
      } else if (showGrid && canvasMode === 'grid') {
        console.log('🔲 Drawing grid')
        drawGrid(false) // Clears and draws
      }
      // Else: leave canvas clear (white background from parent div)
      
      console.log('✅ Background mode switched - clean slate')
    }, [showGrid, canvasMode, canvas, drawGrid, drawCoordinatePlane, drawNumberLine])

    const getCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      const canvasEl = canvas.current
      if (!canvasEl) return { x: 0, y: 0 }

      const rect = canvasEl.getBoundingClientRect()
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      }
    }

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      if (tool === 'text') return // Text tool handled separately

      const point = getCanvasPoint(e)
      setIsDrawing(true)
      setStartPos(point)

      const canvasEl = canvas.current
      if (!canvasEl) return

      const ctx = canvasEl.getContext('2d')
      if (!ctx) return

      // Save state for undo
      const imageData = ctx.getImageData(0, 0, canvasEl.width, canvasEl.height)
      setHistory((prev) => [...prev, imageData])

      ctx.beginPath()
      ctx.moveTo(point.x, point.y)
    }

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      if (!isDrawing) return

      const canvasEl = canvas.current
      if (!canvasEl) return

      const ctx = canvasEl.getContext('2d')
      if (!ctx) return

      const point = getCanvasPoint(e)

      ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color
      ctx.lineWidth = tool === 'brush' ? strokeWidth * 2 : strokeWidth // Brush is thicker
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      
      // Brush has softer edges (globalAlpha for brush effect)
      if (tool === 'brush') {
        ctx.globalAlpha = 0.7
        ctx.lineWidth = strokeWidth * 3
      } else {
        ctx.globalAlpha = 1.0
      }

      if (tool === 'pen' || tool === 'brush' || tool === 'eraser') {
        ctx.lineTo(point.x, point.y)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(point.x, point.y)
        
        // Redraw grid on top during drawing if needed (for visual feedback)
        // Note: This might cause flickering, so we'll only do it on stopDrawing
      } else if (tool === 'rectangle') {
        // Save current state
        const currentState = history.length > 0 ? history[history.length - 1] : null
        
        // Clear and redraw background
        ctx.clearRect(0, 0, canvasEl.width, canvasEl.height)
        if (canvasMode === 'coordinate') {
          drawCoordinatePlane()
        } else if (canvasMode === 'numberline') {
          drawNumberLine()
        } else if (showGrid && canvasMode === 'grid') {
          drawGrid()
        }
        
        // Restore drawing history
        if (currentState) {
          ctx.putImageData(currentState, 0, 0)
        }
        
        // Draw rectangle
        ctx.strokeRect(startPos.x, startPos.y, point.x - startPos.x, point.y - startPos.y)
      } else if (tool === 'circle') {
        // Save current state
        const currentState = history.length > 0 ? history[history.length - 1] : null
        
        // Clear and redraw background
        ctx.clearRect(0, 0, canvasEl.width, canvasEl.height)
        if (canvasMode === 'coordinate') {
          drawCoordinatePlane()
        } else if (canvasMode === 'numberline') {
          drawNumberLine()
        } else if (showGrid && canvasMode === 'grid') {
          drawGrid()
        }
        
        // Restore drawing history
        if (currentState) {
          ctx.putImageData(currentState, 0, 0)
        }
        
        // Draw circle
        const radius = Math.sqrt(
          Math.pow(point.x - startPos.x, 2) + Math.pow(point.y - startPos.y, 2)
        )
        ctx.beginPath()
        ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI)
        ctx.stroke()
      } else if (tool === 'line') {
        // Save current state
        const currentState = history.length > 0 ? history[history.length - 1] : null
        
        // Clear and redraw background
        ctx.clearRect(0, 0, canvasEl.width, canvasEl.height)
        if (canvasMode === 'coordinate') {
          drawCoordinatePlane()
        } else if (canvasMode === 'numberline') {
          drawNumberLine()
        } else if (showGrid && canvasMode === 'grid') {
          drawGrid()
        }
        
        // Restore drawing history
        if (currentState) {
          ctx.putImageData(currentState, 0, 0)
        }
        
        // Draw line
        ctx.beginPath()
        ctx.moveTo(startPos.x, startPos.y)
        ctx.lineTo(point.x, point.y)
        ctx.stroke()
      }
    }

    const stopDrawing = () => {
      if (!isDrawing) return

      setIsDrawing(false)
      const canvasEl = canvas.current
      if (!canvasEl) return

      const ctx = canvasEl.getContext('2d')
      if (!ctx) return

      // Save final state
      const imageData = ctx.getImageData(0, 0, canvasEl.width, canvasEl.height)
      setHistory((prev) => [...prev.slice(0, -1), imageData])

      // Redraw grid/background after drawing if needed
      // We need to redraw the background UNDER the current drawing
      if (canvasMode === 'coordinate') {
        // Save current drawing, redraw coordinate plane, then restore drawing on top
        const currentDrawing = ctx.getImageData(0, 0, canvasEl.width, canvasEl.height)
        drawCoordinatePlane()
        ctx.putImageData(currentDrawing, 0, 0)
      } else if (canvasMode === 'numberline') {
        // Save current drawing, redraw number line, then restore drawing on top
        const currentDrawing = ctx.getImageData(0, 0, canvasEl.width, canvasEl.height)
        drawNumberLine()
        ctx.putImageData(currentDrawing, 0, 0)
      } else if (showGrid && canvasMode === 'grid') {
        // Save current drawing, redraw grid, then restore drawing on top
        const currentDrawing = ctx.getImageData(0, 0, canvasEl.width, canvasEl.height)
        // Clear canvas (transparent background)
        ctx.clearRect(0, 0, canvasEl.width, canvasEl.height)
        // Draw grid
        drawGrid(false) // Draw grid directly (not on top)
        // Restore drawing on top
        ctx.putImageData(currentDrawing, 0, 0)
      }

      // Notify parent of state change
      if (onStateChange) {
        onStateChange({
          imageData: canvasEl.toDataURL(),
          sessionId,
        })
      }
    }

    return (
      <div className="relative w-full h-full bg-white">
        <canvas
          ref={internalCanvasRef}
          className={cn(
            'w-full h-full cursor-crosshair touch-none absolute inset-0'
          )}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          style={{
            cursor: tool === 'pen' ? 'crosshair' : tool === 'eraser' ? 'grab' : tool === 'brush' ? 'cell' : 'default',
            touchAction: 'none',
            zIndex: 1,
            pointerEvents: 'auto',
          }}
        />
        
        {/* Math Elements Overlay - only blocks clicks where math elements exist */}
        {mathElements && mathElements.length > 0 && (
          <div className="absolute inset-0 pointer-events-none z-10">
            {mathElements.map((element) => (
              <div
                key={element.id}
                className="absolute pointer-events-auto"
                style={{
                  left: `${element.x}px`,
                  top: `${element.y}px`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 10,
                }}
              >
                <div className="bg-white/95 backdrop-blur-sm border-2 border-brand-blue-DEFAULT rounded-lg p-2 shadow-lg">
                  <BlockMath math={element.latex} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }
)

WhiteboardCanvas.displayName = 'WhiteboardCanvas'

