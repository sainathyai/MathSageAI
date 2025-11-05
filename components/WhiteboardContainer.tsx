'use client'

import { useState, useRef, useEffect } from 'react'
import { WhiteboardCanvas } from './WhiteboardCanvas'
import { WhiteboardToolbar } from './WhiteboardToolbar'
import { MathFormulaInput } from './MathFormulaInput'
import { MathSymbolsPalette } from './MathSymbolsPalette'
import { DrawingInterpreter } from './DrawingInterpreter'
import { DrawingCommand } from '@/app/types/drawing'
import { Card } from '@/components/ui/card'
import { Pen, Eraser, Square, Circle, Type, Minus, RotateCcw, RotateCw, Trash2, Download, Grid, Paintbrush } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { renderMathContent } from '@/app/utils/mathRenderer'

export type ToolType = 'pen' | 'brush' | 'eraser' | 'rectangle' | 'circle' | 'line' | 'text'
export type CanvasMode = 'grid' | 'coordinate' | 'numberline'

interface WhiteboardContainerProps {
  sessionId?: string
  mathElements?: Array<{ id: string; latex: string; x: number; y: number }>
  drawingCommands?: DrawingCommand[]
  clearCanvas?: boolean
  onStateChange?: (state: any) => void
}

export function WhiteboardContainer({ sessionId, mathElements: externalMathElements = [], drawingCommands = [], clearCanvas = false, onStateChange }: WhiteboardContainerProps) {
  // Debug logging for props
  useEffect(() => {
    console.log('📦 WhiteboardContainer received props:', {
      commandCount: drawingCommands?.length || 0,
      clearCanvas,
      hasCommands: !!drawingCommands && drawingCommands.length > 0
    })
  }, [drawingCommands, clearCanvas])
  const [selectedTool, setSelectedTool] = useState<ToolType>('pen')
  const [color, setColor] = useState('#40E0D0') // brand-teal-DEFAULT (teal)
  const [strokeWidth, setStrokeWidth] = useState(3)
  const [showGrid, setShowGrid] = useState(true) // Default to showing grid when in grid mode
  const [canvasMode, setCanvasMode] = useState<CanvasMode>('grid')
  const [showFormulaInput, setShowFormulaInput] = useState(false)
  const [showSymbolsPalette, setShowSymbolsPalette] = useState(false)
  const [internalMathElements, setInternalMathElements] = useState<Array<{ id: string; latex: string; x: number; y: number }>>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Merge external math elements (from chat) with internal ones (from formula input)
  const mathElements = [...externalMathElements, ...internalMathElements]
  const { toast } = useToast()
  const { isAuthenticated } = useAuth()

  // Tool options matching design system
  const tools = [
    { id: 'pen' as ToolType, icon: Pen, label: 'Pen', color: 'text-brand-blue-DEFAULT' },
    { id: 'brush' as ToolType, icon: Paintbrush, label: 'Brush', color: 'text-brand-green-DEFAULT' },
    { id: 'eraser' as ToolType, icon: Eraser, label: 'Eraser', color: 'text-slate-500' },
    { id: 'rectangle' as ToolType, icon: Square, label: 'Rectangle', color: 'text-brand-green-DEFAULT' },
    { id: 'circle' as ToolType, icon: Circle, label: 'Circle', color: 'text-brand-teal-DEFAULT' },
    { id: 'line' as ToolType, icon: Minus, label: 'Line', color: 'text-brand-purple-DEFAULT' },
    { id: 'text' as ToolType, icon: Type, label: 'Text', color: 'text-slate-600' },
  ]

  const colors = [
    // Primary colors
    { name: 'Blue', value: '#4A90E2', class: 'bg-brand-blue-DEFAULT' },
    { name: 'Green', value: '#7FFF00', class: 'bg-brand-green-DEFAULT' },
    { name: 'Teal', value: '#40E0D0', class: 'bg-brand-teal-DEFAULT' },
    { name: 'Purple', value: '#9370DB', class: 'bg-brand-purple-DEFAULT' },
    // Extended colors
    { name: 'Dark Blue', value: '#2C5F8D', class: 'bg-brand-blue-dark' },
    { name: 'Black', value: '#1F2937', class: 'bg-slate-800' },
    { name: 'Red', value: '#EF4444', class: 'bg-red-500' },
    { name: 'Orange', value: '#F97316', class: 'bg-orange-500' },
    { name: 'Yellow', value: '#EAB308', class: 'bg-yellow-500' },
    { name: 'Pink', value: '#EC4899', class: 'bg-pink-500' },
    { name: 'Indigo', value: '#6366F1', class: 'bg-indigo-500' },
    { name: 'Gray', value: '#6B7280', class: 'bg-gray-500' },
  ]

  const handleToolSelect = (tool: ToolType) => {
    setSelectedTool(tool)
  }

  const handleColorSelect = (colorValue: string) => {
    setColor(colorValue)
  }

  const handleClear = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        toast({
          title: 'Canvas cleared',
          description: 'All drawings have been removed',
        })
      }
    }
  }

  const handleExport = () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `whiteboard-${Date.now()}.png`
      link.href = dataUrl
      link.click()
      toast({
        title: 'Image exported',
        description: 'Your whiteboard has been saved as an image',
      })
    }
  }

  const handleFormulaInsert = (latex: string) => {
    // Add math element to canvas
    const newElement = {
      id: `math-${Date.now()}`,
      latex,
      x: canvasRef.current ? canvasRef.current.width / 2 : 400,
      y: canvasRef.current ? canvasRef.current.height / 2 : 300,
    }
    setInternalMathElements([...internalMathElements, newElement])
    setShowFormulaInput(false)
    toast({
      title: 'Formula added',
      description: 'Math formula has been added to the whiteboard',
    })
  }

  const handleSymbolInsert = (symbol: string) => {
    // For now, just insert into formula input if open
    if (showFormulaInput) {
      // This would be handled by formula input component
      handleFormulaInsert(symbol)
    } else {
      // Insert directly as a simple formula
      handleFormulaInsert(symbol)
    }
  }

  const handleUndo = () => {
    // TODO: Implement undo functionality
    toast({
      title: 'Undo',
      description: 'Undo functionality coming soon',
    })
  }

  const handleRedo = () => {
    // TODO: Implement redo functionality
    toast({
      title: 'Redo',
      description: 'Redo functionality coming soon',
    })
  }

  return (
    <div className="flex flex-col w-full h-full bg-gradient-chat relative">
      {/* Toolbar - fixed at top */}
      <div className="sticky top-0 z-20 bg-gradient-to-b from-white to-slate-50/90 backdrop-blur-sm border-b border-slate-200/50 shadow-sm">
        <div className="container max-w-7xl mx-auto px-4 py-3">
          <WhiteboardToolbar
            tools={tools}
            colors={colors}
            selectedTool={selectedTool}
            selectedColor={color}
            strokeWidth={strokeWidth}
            showGrid={showGrid}
            canvasMode={canvasMode}
            onToolSelect={handleToolSelect}
            onColorSelect={handleColorSelect}
            onStrokeWidthChange={setStrokeWidth}
            onToggleGrid={() => {
              if (canvasMode === 'grid') {
                setShowGrid(!showGrid)
              }
            }}
            onCanvasModeChange={(mode) => {
              setCanvasMode(mode)
              // Auto-show grid when switching to grid mode
              if (mode === 'grid' && !showGrid) {
                setShowGrid(true)
              }
              // Auto-hide grid when switching to other modes
              if (mode !== 'grid' && showGrid) {
                setShowGrid(false)
              }
            }}
            onShowFormulaInput={() => setShowFormulaInput(!showFormulaInput)}
            onShowSymbolsPalette={() => setShowSymbolsPalette(!showSymbolsPalette)}
            onClear={handleClear}
            onExport={handleExport}
            onUndo={handleUndo}
            onRedo={handleRedo}
          />
        </div>
      </div>

      {/* Math Formula Input Panel */}
      {showFormulaInput && (
        <MathFormulaInput
          onInsert={handleFormulaInsert}
          onClose={() => setShowFormulaInput(false)}
        />
      )}

      {/* Math Symbols Palette */}
      {showSymbolsPalette && (
        <MathSymbolsPalette
          onInsert={handleSymbolInsert}
          onClose={() => setShowSymbolsPalette(false)}
        />
      )}

      {/* Canvas Area - takes remaining space */}
      <div className="flex-1 overflow-hidden relative" style={{ position: 'relative' }}>
        <WhiteboardCanvas
          ref={canvasRef}
          tool={selectedTool}
          color={color}
          strokeWidth={strokeWidth}
          showGrid={showGrid}
          canvasMode={canvasMode}
          mathElements={mathElements}
          sessionId={sessionId}
          onStateChange={onStateChange}
        />
        
        {/* Drawing Interpreter for AI-generated visuals - always rendered */}
        <DrawingInterpreter
          commands={drawingCommands}
          canvasRef={canvasRef}
          clearCanvas={clearCanvas}
        />
        
        {/* Debug: Show drawing commands count */}
        {drawingCommands && drawingCommands.length > 0 && (
          <div className="absolute top-4 left-4 z-50 bg-yellow-100 px-3 py-2 rounded text-xs">
            🎨 {drawingCommands.length} drawing command(s) active
          </div>
        )}
      </div>

      {/* Info Card - bottom right */}
      <div className="absolute bottom-4 right-4 z-10">
        <Card className="px-3 py-2 bg-white/90 backdrop-blur-sm border border-slate-200/50 shadow-md">
          <p className="text-xs text-slate-600">
            <span className="font-medium">Tip:</span> Draw equations, diagrams, or work through problems step by step
          </p>
        </Card>
      </div>
    </div>
  )
}

