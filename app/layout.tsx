import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MathSageAI - AI Math Tutor',
  description: 'An intelligent math tutoring application that guides students through math problems using the Socratic method.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

