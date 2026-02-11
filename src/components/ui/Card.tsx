import type { ReactNode } from 'react'

interface CardProps {
  className?: string
  children: ReactNode
}

function Card({ className = '', children }: CardProps) {
  return <article className={`card ${className}`.trim()}>{children}</article>
}

export default Card
