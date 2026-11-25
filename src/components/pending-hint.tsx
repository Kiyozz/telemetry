'use client'

import { useLinkStatus } from 'next/link'

/**
 * Put inside a <Link>: while its navigation is pending the link shows a spinner and the
 * page-wide [data-pending] feedback from globals.css kicks in.
 */
export function PendingHint({ className }: { className?: string }) {
  const { pending } = useLinkStatus()

  return (
    <span
      aria-hidden
      data-pending={pending || undefined}
      className={`inline-block size-3 shrink-0 rounded-full border-2 border-current border-r-transparent text-accent opacity-0 transition-opacity data-pending:animate-spin data-pending:opacity-100 ${className ?? ''}`}
    />
  )
}
