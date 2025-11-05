'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { ToolType, CanvasMode } from './WhiteboardContainer'
import { LucideIcon, ChevronDown, ChevronUp, Grid, Axis3D } from 'lucide-react'

interface Tool {
  id: ToolType
  icon: LucideIcon
  label: string
  color: string
}

interface Color {
  name: string
  value: string
  class: string
}

interface WhiteboardToolbarProps {
  tools: Tool[]
  colors: Color[]
  selectedTool: ToolType
  selectedColor: string
  strokeWidth: number
  showGrid: boolean
  canvasMode: CanvasMode
  onToolSelect: (tool: ToolType) => void
  onColorSelect: (color: string) => void
  onStrokeWidthChange: (width: number) => void
  onToggleGrid: () => void
  onCanvasModeChange: (mode: CanvasMode) => void
  onShowFormulaInput: () => void
  onShowSymbolsPalette: () => void
  onClear: () => void
  onExport: () => void
  onUndo: () => void
  onRedo: () => void
}

export function WhiteboardToolbar({
  tools,
  colors,
  selectedTool,
  selectedColor,
  strokeWidth,
  showGrid,
  canvasMode,
  onToolSelect,
  onColorSelect,
  onStrokeWidthChange,
  onToggleGrid,
  onCanvasModeChange,
  onShowFormulaInput,
  onShowSymbolsPalette,
  onClear,
  onExport,
  onUndo,
  onRedo,
}: WhiteboardToolbarProps) {
  const [colorsOpen, setColorsOpen] = useState(false)
  const colorDropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorDropdownRef.current && !colorDropdownRef.current.contains(event.target as Node)) {
        setColorsOpen(false)
      }
    }

    if (colorsOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [colorsOpen])

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Tools */}
      <div className="flex items-center gap-1 rounded-lg bg-slate-100/80 p-1">
        {tools.map((tool) => {
          const Icon = tool.icon
          const isSelected = selectedTool === tool.id
          return (
            <Button
              key={tool.id}
              variant="ghost"
              size="sm"
              onClick={() => onToolSelect(tool.id)}
              className={cn(
                'h-8 w-8 p-0',
                isSelected
                  ? 'bg-gradient-brand text-white hover:opacity-90'
                  : 'text-slate-600 hover:bg-slate-200'
              )}
              title={tool.label}
            >
              <Icon className="h-4 w-4" />
            </Button>
          )
        })}
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Color Palette - Single Tile with Dropdown */}
      <div className="relative flex items-center gap-1" ref={colorDropdownRef}>
        {/* Selected Color Tile */}
        <button
          onClick={() => setColorsOpen(!colorsOpen)}
          className={cn(
            'h-9 w-9 rounded-lg border-2 transition-all flex items-center justify-center shadow-sm',
            colorsOpen
              ? 'border-brand-blue-DEFAULT ring-2 ring-brand-blue-light ring-offset-1'
              : 'border-slate-300 hover:border-slate-400 hover:shadow-md'
          )}
          style={{ backgroundColor: selectedColor }}
          title={`Selected: ${colors.find(c => c.value === selectedColor)?.name || 'Color'}`}
        >
          {colorsOpen && (
            <ChevronUp className="h-4 w-4 text-white drop-shadow-lg" />
          )}
        </button>

        {/* Dropdown Grid of All Colors - 3 columns, 4 rows (12 colors total) */}
        {colorsOpen && (
          <div className="absolute top-full left-0 mt-2 p-3 bg-white rounded-xl border-2 border-slate-200 shadow-xl z-50">
            <div className="grid grid-cols-3 gap-2.5">
              {colors.map((color) => {
                const isSelected = selectedColor === color.value
                return (
                  <button
                    key={color.value}
                    onClick={() => {
                      onColorSelect(color.value)
                      setColorsOpen(false)
                    }}
                    className={cn(
                      'h-8 w-8 rounded-lg border-2 transition-all shadow-sm hover:shadow-md hover:scale-110 flex-shrink-0',
                      isSelected
                        ? 'border-brand-blue-DEFAULT ring-2 ring-brand-blue-light ring-offset-1 scale-110 shadow-md'
                        : 'border-slate-200 hover:border-slate-400'
                    )}
                    title={color.name}
                    style={{ backgroundColor: color.value }}
                  />
                )
              })}
            </div>
          </div>
        )}
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Stroke Width */}
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-slate-600">Width:</label>
        <input
          type="range"
          min="1"
          max="10"
          value={strokeWidth}
          onChange={(e) => onStrokeWidthChange(Number(e.target.value))}
          className="w-20 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-blue-DEFAULT"
        />
        <span className="text-xs text-slate-500 w-6">{strokeWidth}</span>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Math Tools */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onShowFormulaInput}
          className="h-8 w-8 p-0 text-slate-600 hover:bg-brand-blue-light/10 hover:text-brand-blue-DEFAULT"
          title="Math Formula Input"
        >
          <span className="text-lg font-mono italic font-semibold">f(x)</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onShowSymbolsPalette}
          className="h-8 w-8 p-0 text-slate-600 hover:bg-brand-teal-light/10 hover:text-brand-teal-DEFAULT"
          title="Math Symbols"
        >
          <span className="text-lg font-mono">Σ</span>
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Canvas Mode */}
      <div className="flex items-center gap-1 rounded-lg bg-slate-100/80 p-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (canvasMode === 'grid') {
              // Toggle grid visibility when grid mode is already selected
              onToggleGrid()
            } else {
              // Switch to grid mode and show grid
              onCanvasModeChange('grid')
              if (!showGrid) {
                onToggleGrid()
              }
            }
          }}
          className={cn(
            'h-7 px-2 text-xs',
            canvasMode === 'grid' && showGrid
              ? 'bg-gradient-brand text-white hover:opacity-90'
              : 'text-slate-600 hover:bg-slate-200'
          )}
          title={canvasMode === 'grid' && showGrid ? 'Hide Grid' : 'Show Grid'}
        >
          <Grid className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onCanvasModeChange('coordinate')}
          className={cn(
            'h-7 px-2 text-xs',
            canvasMode === 'coordinate'
              ? 'bg-gradient-brand text-white hover:opacity-90'
              : 'text-slate-600 hover:bg-slate-200'
          )}
          title="Coordinate Plane"
        >
          <Axis3D className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onCanvasModeChange('numberline')}
          className={cn(
            'h-7 px-2 text-xs',
            canvasMode === 'numberline'
              ? 'bg-gradient-brand text-white hover:opacity-90'
              : 'text-slate-600 hover:bg-slate-200'
          )}
          title="Number Line"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onUndo}
          className="h-8 w-8 p-0 text-slate-600 hover:bg-slate-200"
          title="Undo"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRedo}
          className="h-8 w-8 p-0 text-slate-600 hover:bg-slate-200"
          title="Redo"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
          </svg>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="h-8 px-3 text-slate-600 hover:bg-red-50 hover:text-red-600"
          title="Clear Canvas"
        >
          <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span className="text-xs">Clear</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onExport}
          className="h-8 px-3 bg-gradient-brand text-white hover:opacity-90"
          title="Export Image"
        >
          <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span className="text-xs">Export</span>
        </Button>
      </div>
    </div>
  )
}
