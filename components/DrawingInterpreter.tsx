'use client'

import { useEffect, useRef } from 'react'
import { DrawingCommand } from '@/app/types/drawing'

interface DrawingInterpreterProps {
  commands: DrawingCommand[]
  canvasRef: React.RefObject<HTMLCanvasElement>
  clearCanvas?: boolean
}

export function DrawingInterpreter({ commands, canvasRef, clearCanvas }: DrawingInterpreterProps) {
  const commandsExecutedRef = useRef(false)

  useEffect(() => {
    console.log('🖼️ DrawingInterpreter useEffect triggered:', {
      hasCanvas: !!canvasRef.current,
      commandCount: commands.length,
      alreadyExecuted: commandsExecutedRef.current,
      clearCanvas
    })
    
    if (!canvasRef.current) {
      console.error('❌ Canvas ref is null')
      return
    }
    
    if (commands.length === 0) {
      console.log('⚠️ No commands to execute')
      return
    }
    
    if (commandsExecutedRef.current) {
      console.log('⚠️ Commands already executed, skipping')
      return
    }

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      console.error('❌ Could not get canvas context')
      return
    }

    console.log('📐 Canvas dimensions:', {
      width: canvas.width,
      height: canvas.height
    })

    // DON'T clear canvas - we want to draw ON TOP of the existing coordinate plane/grid
    // The coordinate plane is already drawn by WhiteboardCanvas
    // We just add our shapes on top
    if (clearCanvas) {
      console.log('🧹 Clearing only user drawings (keeping coordinate plane)')
      // Don't use clearRect - it would remove the coordinate axes too
      // Just draw our new shapes on top
    }

    // Execute each drawing command
    console.log(`🎨 Executing ${commands.length} drawing commands...`)
    commands.forEach((command, index) => {
      console.log(`  Command ${index + 1}/${commands.length}:`, command.type, command)
      try {
        executeCommand(ctx, canvas, command)
        console.log(`  ✅ Command ${index + 1} executed successfully`)
      } catch (error) {
        console.error(`  ❌ Error executing command ${index + 1}:`, error)
      }
    })

    // Mark as executed
    commandsExecutedRef.current = true
    console.log('✅ All drawing commands executed and persisted to canvas')
  }, [commands, canvasRef, clearCanvas])

  // Reset execution flag when commands change
  useEffect(() => {
    console.log('🔄 Commands changed, resetting execution flag')
    commandsExecutedRef.current = false
  }, [commands])

  return null // This is a logic-only component
}

/**
 * Convert percentage-based coordinates to canvas pixels
 */
function toPixels(percent: number, dimension: number): number {
  return (percent / 100) * dimension
}

/**
 * Execute a single drawing command
 */
function executeCommand(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  command: DrawingCommand
) {
  const { width, height } = canvas

  switch (command.type) {
    case 'circle': {
      const x = toPixels(command.x, width)
      const y = toPixels(command.y, height)
      const radius = toPixels(command.radius, width)

      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)

      // Fill if requested
      if (command.fill) {
        ctx.fillStyle = command.color
        ctx.globalAlpha = command.fillOpacity || 0.4
        ctx.fill()
        ctx.globalAlpha = 1
      }

      // Stroke (always use black or specified strokeColor)
      ctx.strokeStyle = command.strokeColor || '#000000'
      ctx.lineWidth = command.strokeWidth || 3
      ctx.stroke()

      // Label if provided
      if (command.label) {
        ctx.fillStyle = '#000000'
        ctx.font = 'bold 14px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(command.label, x, y + radius + 20)
      }
      break
    }

    case 'line': {
      const x1 = toPixels(command.x1, width)
      const y1 = toPixels(command.y1, height)
      const x2 = toPixels(command.x2, width)
      const y2 = toPixels(command.y2, height)

      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.strokeStyle = command.strokeColor || '#000000'
      ctx.lineWidth = command.strokeWidth || 3

      if (command.dashed) {
        ctx.setLineDash([5, 5])
      }

      ctx.stroke()
      ctx.setLineDash([])

      // Label if provided
      if (command.label) {
        const midX = (x1 + x2) / 2
        const midY = (y1 + y2) / 2
        ctx.fillStyle = '#000000'
        ctx.font = 'bold 12px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(command.label, midX, midY - 5)
      }
      break
    }

    case 'arrow': {
      const x1 = toPixels(command.x1, width)
      const y1 = toPixels(command.y1, height)
      const x2 = toPixels(command.x2, width)
      const y2 = toPixels(command.y2, height)

      // Draw line
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.strokeStyle = command.strokeColor || '#000000'
      ctx.lineWidth = command.strokeWidth || 3
      ctx.stroke()

      // Draw arrowhead
      const angle = Math.atan2(y2 - y1, x2 - x1)
      const headLength = 12
      ctx.beginPath()
      ctx.moveTo(x2, y2)
      ctx.lineTo(
        x2 - headLength * Math.cos(angle - Math.PI / 6),
        y2 - headLength * Math.sin(angle - Math.PI / 6)
      )
      ctx.moveTo(x2, y2)
      ctx.lineTo(
        x2 - headLength * Math.cos(angle + Math.PI / 6),
        y2 - headLength * Math.sin(angle + Math.PI / 6)
      )
      ctx.stroke()

      // Label if provided
      if (command.label) {
        const midX = (x1 + x2) / 2
        const midY = (y1 + y2) / 2
        ctx.fillStyle = '#000000'
        ctx.font = 'bold 12px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(command.label, midX, midY - 5)
      }
      break
    }

    case 'text': {
      const x = toPixels(command.x, width)
      const y = toPixels(command.y, height)

      ctx.fillStyle = command.color
      ctx.font = `${command.fontSize || 14}px sans-serif`
      ctx.textAlign = command.align || 'left'
      ctx.fillText(command.text, x, y)
      break
    }

    case 'point': {
      const x = toPixels(command.x, width)
      const y = toPixels(command.y, height)
      const radius = command.radius || 5

      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fillStyle = command.color
      ctx.fill()
      
      // Stroke (black border)
      ctx.strokeStyle = command.strokeColor || '#000000'
      ctx.lineWidth = 2
      ctx.stroke()

      // Label if provided
      if (command.label) {
        ctx.fillStyle = '#000000'
        ctx.font = 'bold 12px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(command.label, x, y - 10)
      }
      break
    }

    case 'rectangle': {
      const x = toPixels(command.x, width)
      const y = toPixels(command.y, height)
      let rectWidth = toPixels(command.width, width)
      let rectHeight = toPixels(command.height, height)

      // If it's a square, use the same pixel dimension for both width and height
      if (command.isSquare) {
        // Use the width dimension for both to create a perfect square
        rectHeight = rectWidth
        console.log('🟦 Drawing square with equal dimensions:', rectWidth)
      }

      // Fill if requested
      if (command.fill) {
        ctx.fillStyle = command.color
        ctx.globalAlpha = command.fillOpacity || 0.4
        ctx.fillRect(x, y, rectWidth, rectHeight)
        ctx.globalAlpha = 1
      }

      // Stroke (always use black or specified strokeColor)
      ctx.strokeStyle = command.strokeColor || '#000000'
      ctx.lineWidth = command.strokeWidth || 3
      ctx.strokeRect(x, y, rectWidth, rectHeight)

      // Label if provided
      if (command.label) {
        ctx.fillStyle = '#000000'
        ctx.font = 'bold 14px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(command.label, x + rectWidth / 2, y + rectHeight + 20)
      }
      break
    }

    case 'triangle': {
      const x1 = toPixels(command.x1, width)
      const y1 = toPixels(command.y1, height)
      const x2 = toPixels(command.x2, width)
      const y2 = toPixels(command.y2, height)
      const x3 = toPixels(command.x3, width)
      const y3 = toPixels(command.y3, height)

      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.lineTo(x3, y3)
      ctx.closePath()

      // Fill if requested
      if (command.fill) {
        ctx.fillStyle = command.color || '#3B82F6'
        ctx.globalAlpha = command.fillOpacity || 0.4
        ctx.fill()
        ctx.globalAlpha = 1
      }

      // Stroke (black border)
      ctx.strokeStyle = command.strokeColor || '#000000'
      ctx.lineWidth = command.strokeWidth || 3
      ctx.stroke()

      // Label if provided (place at centroid)
      if (command.label) {
        const centroidX = (x1 + x2 + x3) / 3
        const centroidY = (y1 + y2 + y3) / 3
        ctx.fillStyle = '#000000'
        ctx.font = 'bold 14px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(command.label, centroidX, centroidY + 20)
      }
      break
    }

    case 'angle': {
      const vx = toPixels(command.x, width)
      const vy = toPixels(command.y, height)
      const x1 = toPixels(command.x1, width)
      const y1 = toPixels(command.y1, height)
      const x2 = toPixels(command.x2, width)
      const y2 = toPixels(command.y2, height)
      const arcRadius = command.radius ? toPixels(command.radius, width) : 30

      // Draw the two rays
      ctx.strokeStyle = command.strokeColor || '#000000'
      ctx.lineWidth = command.strokeWidth || 2

      // First ray
      ctx.beginPath()
      ctx.moveTo(vx, vy)
      ctx.lineTo(x1, y1)
      ctx.stroke()

      // Second ray
      ctx.beginPath()
      ctx.moveTo(vx, vy)
      ctx.lineTo(x2, y2)
      ctx.stroke()

      // Draw arc if requested (default true)
      if (command.showArc !== false) {
        // Calculate angles for the arc
        const angle1 = Math.atan2(y1 - vy, x1 - vx)
        const angle2 = Math.atan2(y2 - vy, x2 - vx)

        ctx.beginPath()
        ctx.arc(vx, vy, arcRadius, angle1, angle2)
        ctx.strokeStyle = command.color || command.strokeColor || '#3B82F6'
        ctx.stroke()
      }

      // Label if provided
      if (command.label) {
        const angle1 = Math.atan2(y1 - vy, x1 - vx)
        const angle2 = Math.atan2(y2 - vy, x2 - vx)
        const midAngle = (angle1 + angle2) / 2
        const labelX = vx + Math.cos(midAngle) * (arcRadius + 15)
        const labelY = vy + Math.sin(midAngle) * (arcRadius + 15)
        
        ctx.fillStyle = '#000000'
        ctx.font = 'bold 12px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(command.label, labelX, labelY)
      }
      break
    }

    case 'parabola': {
      const { a, b, c } = command
      
      // Calculate wider range based on canvas size to show more of the curve
      const GRID_SIZE = 20 // pixels per unit (matches WhiteboardCanvas.tsx)
      const centerX = width / 2
      const centerY = height / 2
      
      // Calculate how many units we can fit on screen
      const maxUnitsX = Math.floor(width / (2 * GRID_SIZE)) // Half on each side
      const maxUnitsY = Math.floor(height / (2 * GRID_SIZE)) // Half on each side
      
      // Use wider range - expand AI-provided range if it's too narrow
      // Default to canvas width if not specified, otherwise expand by 50% on each side
      let effectiveXMin = command.xMin ?? -maxUnitsX
      let effectiveXMax = command.xMax ?? maxUnitsX
      
      // If range is provided but too narrow, expand it
      const rangeWidth = effectiveXMax - effectiveXMin
      if (rangeWidth < maxUnitsX * 0.5) {
        // Expand range to be at least 50% of canvas width
        const expansion = (maxUnitsX * 0.5 - rangeWidth) / 2
        effectiveXMin = effectiveXMin - expansion
        effectiveXMax = effectiveXMax + expansion
        console.log(`📏 Expanding parabola range from ${command.xMin ?? -10} to ${command.xMax ?? 10} to ${effectiveXMin} to ${effectiveXMax}`)
      }
      
      console.log('🎨 Drawing parabola:', { a, b, c, xMin: effectiveXMin, xMax: effectiveXMax, color: command.strokeColor })
      
      // Convert math coords to canvas coords using the same scaling as coordinate plane
      const toCanvasX = (mathX: number) => centerX + mathX * GRID_SIZE
      const toCanvasY = (mathY: number) => centerY - mathY * GRID_SIZE // Y inverted (canvas Y increases downward)

      ctx.beginPath()
      let first = true
      let pointsDrawn = 0
      
      // Draw from xMin to xMax in math coordinates
      // Use small step size for smooth curve
      const step = (effectiveXMax - effectiveXMin) / 800 // More points = smoother curve
      
      for (let x = effectiveXMin; x <= effectiveXMax; x += step) {
        const y = a * x * x + b * x + c
        const px = toCanvasX(x)
        const py = toCanvasY(y)
        
        // Only draw if point is within canvas bounds
        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          if (first) {
            ctx.moveTo(px, py)
            first = false
          } else {
            ctx.lineTo(px, py)
          }
          pointsDrawn++
        }
      }

      // Use teal as default color to match theme
      ctx.strokeStyle = command.strokeColor || '#40E0D0'
      ctx.lineWidth = command.strokeWidth || 4
      ctx.stroke()
      
      console.log(`✅ Parabola drawn with ${pointsDrawn} points`)
      console.log(`📍 Parabola at x=2: y=${a*4 + b*2 + c} (should be 0)`)
      console.log(`📍 Parabola at x=3: y=${a*9 + b*3 + c} (should be 0)`)

      // Label
      if (command.label) {
        ctx.fillStyle = '#000000'
        ctx.font = 'bold 14px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(command.label, width / 2, 20)
      }
      
      // Draw root points for debugging (smaller dots)
      if (a === 1 && b === -5 && c === 6) {
        // Mark roots at x=2 and x=3
        const root2X = toCanvasX(2)
        const root2Y = toCanvasY(0)
        const root3X = toCanvasX(3)
        const root3Y = toCanvasY(0)
        
        ctx.fillStyle = '#FF0000'
        ctx.beginPath()
        ctx.arc(root2X, root2Y, 2.5, 0, 2 * Math.PI) // Smaller radius: 2.5 instead of 5
        ctx.fill()
        ctx.beginPath()
        ctx.arc(root3X, root3Y, 2.5, 0, 2 * Math.PI) // Smaller radius: 2.5 instead of 5
        ctx.fill()
        console.log(`🔴 Marked roots at canvas (${root2X}, ${root2Y}) and (${root3X}, ${root3Y})`)
      }
      
      break
    }

    case 'axis': {
      const strokeColor = command.strokeColor || '#000000'
      const strokeWidth = command.strokeWidth || 2

      ctx.strokeStyle = strokeColor
      ctx.lineWidth = strokeWidth

      // Draw X axis
      if (command.showX !== false) {
        ctx.beginPath()
        ctx.moveTo(0, height / 2)
        ctx.lineTo(width, height / 2)
        ctx.stroke()

        // Arrow
        ctx.beginPath()
        ctx.moveTo(width - 10, height / 2 - 5)
        ctx.lineTo(width, height / 2)
        ctx.lineTo(width - 10, height / 2 + 5)
        ctx.stroke()

        if (command.showLabels) {
          ctx.fillStyle = '#000000'
          ctx.font = 'bold 14px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText('x', width - 20, height / 2 + 20)
        }
      }

      // Draw Y axis
      if (command.showY !== false) {
        ctx.beginPath()
        ctx.moveTo(width / 2, 0)
        ctx.lineTo(width / 2, height)
        ctx.stroke()

        // Arrow
        ctx.beginPath()
        ctx.moveTo(width / 2 - 5, 10)
        ctx.lineTo(width / 2, 0)
        ctx.lineTo(width / 2 + 5, 10)
        ctx.stroke()

        if (command.showLabels) {
          ctx.fillStyle = '#000000'
          ctx.font = 'bold 14px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText('y', width / 2 + 20, 20)
        }
      }
      break
    }

    case 'grid': {
      const strokeColor = command.strokeColor || '#E5E7EB'
      const strokeWidth = command.strokeWidth || 0.5
      const spacing = command.spacing || 20

      ctx.strokeStyle = strokeColor
      ctx.lineWidth = strokeWidth

      // Vertical lines
      for (let x = 0; x < width; x += spacing) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }

      // Horizontal lines
      for (let y = 0; y < height; y += spacing) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }
      break
    }
  }
}

