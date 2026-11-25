import { clsx } from 'clsx'
import type { ReactNode } from 'react'

interface CardProps {
  title?: ReactNode
  description?: ReactNode
  action?: ReactNode
  className?: string
  children: ReactNode
}

export function Card({ title, description, action, className, children }: CardProps) {
  return (
    <section className={clsx('rounded-xl border border-hairline bg-surface p-5', className)}>
      {(title || action) && (
        <header className="mb-4 flex items-start justify-between gap-4">
          <div>
            {title && <h2 className="font-semibold">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-ink-muted">{description}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx('animate-pulse rounded-xl bg-surface-muted', className)} />
}
