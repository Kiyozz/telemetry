import { clsx } from 'clsx'
import Link from 'next/link'
import type { ComponentProps } from 'react'

import { formatNumber } from '@/lib/format'
import type { Share } from '@/lib/queries'

interface ShareBarsProps {
  shares: Share[]
  empty?: string
  hrefOf?: (share: Share) => ComponentProps<typeof Link>['href'] | null
  selected?: string
  max?: number
}

/** Horizontal bars, direct-labelled, rendered on the server. */
export function ShareBars({ shares, empty = 'No data for this period.', hrefOf, selected, max }: ShareBarsProps) {
  if (shares.length === 0) {
    return <p className="text-sm text-ink-muted">{empty}</p>
  }

  const visible = max ? shares.slice(0, max) : shares
  const total = shares.reduce((sum, share) => sum + share.count, 0)
  const top = Math.max(...visible.map(share => share.count))

  return (
    <ol className="space-y-1">
      {visible.map(share => {
        const href = hrefOf?.(share)
        const percent = total > 0 ? Math.round((share.count / total) * 100) : 0
        const content = (
          <>
            <span className="relative z-10 flex items-baseline justify-between gap-3 text-sm">
              <span className="truncate">{share.label}</span>
              <span className="shrink-0 tabular-nums text-ink-muted">
                {formatNumber(share.count)} <span className="inline-block w-9 text-right">{percent}%</span>
              </span>
            </span>
            <span className="mt-1 block h-1.5 rounded-full bg-surface-muted">
              <span
                className="block h-full rounded-full bg-series-1"
                style={{ width: `${Math.max(1, (share.count / top) * 100)}%` }}
              />
            </span>
          </>
        )

        return (
          <li key={share.label}>
            {href ? (
              <Link
                href={href}
                scroll={false}
                aria-current={selected === share.label ? 'true' : undefined}
                className={clsx(
                  '-mx-2 block rounded-md px-2 py-1.5 transition-colors hover:bg-surface-muted',
                  selected === share.label && 'bg-accent-soft',
                )}
              >
                {content}
              </Link>
            ) : (
              <div className="py-1.5">{content}</div>
            )}
          </li>
        )
      })}
    </ol>
  )
}
