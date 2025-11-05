// Drawing command types for AI-generated visuals

export type DrawingCommand = 
  | CircleCommand
  | LineCommand
  | ArrowCommand
  | TextCommand
  | PointCommand
  | RectangleCommand
  | TriangleCommand
  | AngleCommand
  | ParabolaCommand
  | AxisCommand
  | GridCommand

export interface CircleCommand {
  type: 'circle'
  x: number // center x (0-100, percentage of canvas width)
  y: number // center y (0-100, percentage of canvas height)
  radius: number // radius (0-100, percentage of canvas width)
  color: string // fill color
  strokeColor?: string // stroke color (default #000000)
  fill?: boolean
  fillOpacity?: number
  label?: string
  strokeWidth?: number
}

export interface LineCommand {
  type: 'line'
  x1: number
  y1: number
  x2: number
  y2: number
  strokeColor?: string // stroke color (default #000000)
  strokeWidth?: number
  dashed?: boolean
  label?: string
}

export interface ArrowCommand {
  type: 'arrow'
  x1: number
  y1: number
  x2: number
  y2: number
  strokeColor?: string // stroke color (default #000000)
  strokeWidth?: number
  label?: string
}

export interface TextCommand {
  type: 'text'
  x: number
  y: number
  text: string
  color: string
  fontSize?: number
  align?: 'left' | 'center' | 'right'
}

export interface PointCommand {
  type: 'point'
  x: number
  y: number
  color: string // fill color
  strokeColor?: string // stroke color (default #000000)
  radius?: number
  label?: string
}

export interface RectangleCommand {
  type: 'rectangle'
  x: number
  y: number
  width: number
  height: number
  color: string // fill color
  strokeColor?: string // stroke color (default #000000)
  fill?: boolean
  fillOpacity?: number
  label?: string
  strokeWidth?: number
  isSquare?: boolean // if true, force width=height in pixels (use width for both)
}

export interface TriangleCommand {
  type: 'triangle'
  x1: number // first vertex x (percentage)
  y1: number // first vertex y (percentage)
  x2: number // second vertex x (percentage)
  y2: number // second vertex y (percentage)
  x3: number // third vertex x (percentage)
  y3: number // third vertex y (percentage)
  color?: string // fill color
  strokeColor?: string // stroke color (default #000000)
  fill?: boolean
  fillOpacity?: number
  label?: string
  strokeWidth?: number
}

export interface AngleCommand {
  type: 'angle'
  x: number // vertex x (percentage)
  y: number // vertex y (percentage)
  x1: number // first ray endpoint x (percentage)
  y1: number // first ray endpoint y (percentage)
  x2: number // second ray endpoint x (percentage)
  y2: number // second ray endpoint y (percentage)
  radius?: number // arc radius (percentage of canvas width)
  color?: string // arc color
  strokeColor?: string // stroke color (default #000000)
  strokeWidth?: number
  showArc?: boolean // show the arc between rays (default true)
  label?: string // angle measure label (e.g., "45°", "90°")
}

export interface ParabolaCommand {
  type: 'parabola'
  a: number // coefficient a in y = ax² + bx + c
  b: number // coefficient b
  c: number // coefficient c
  strokeColor?: string // stroke color (default #000000)
  strokeWidth?: number
  xMin: number // minimum x value to draw
  xMax: number // maximum x value to draw
  label?: string
}

export interface AxisCommand {
  type: 'axis'
  showX?: boolean
  showY?: boolean
  strokeColor?: string // stroke color (default #000000)
  strokeWidth?: number
  showLabels?: boolean
  xMin?: number
  xMax?: number
  yMin?: number
  yMax?: number
}

export interface GridCommand {
  type: 'grid'
  strokeColor?: string // stroke color (default #E5E7EB for light gray)
  strokeWidth?: number
  spacing?: number
}

export interface DrawingResponse {
  message: string
  commands?: DrawingCommand[]
  clearCanvas?: boolean
  sessionId?: string
  isCorrect?: boolean
  isPartiallyCorrect?: boolean
}

