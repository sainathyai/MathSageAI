declare module 'react-katex' {
  import { ComponentType } from 'react'

  export interface MathProps {
    children?: string
    math?: string
    errorColor?: string
    renderError?: (error: Error | TypeError) => JSX.Element
  }

  export const InlineMath: ComponentType<MathProps>
  export const BlockMath: ComponentType<MathProps>
}

