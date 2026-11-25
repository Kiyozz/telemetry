import { Tooltip, TooltipContent, TooltipTrigger } from '@ui-sdk/react/tooltip'
import { clsx } from 'clsx'

import { delta, formatNumber } from '@/lib/format'
import type { Kpi } from '@/lib/queries'

interface KpiTileProps {
  label: string
  kpi: Kpi
  /** For exceptions, going up is bad news. */
  upIsGood?: boolean
  hint?: string
}

export function KpiTile({ label, kpi, upIsGood = true, hint }: KpiTileProps) {
  const change = delta(kpi.current, kpi.previous)
  const good = change && change.direction !== 'flat' && (change.direction === 'up') === upIsGood

  return (
    <div className="rounded-xl border border-hairline bg-surface p-4">
      <div className="flex items-center gap-1.5 text-sm text-ink-muted">
        {label}
        {hint && (
          <Tooltip>
            <TooltipTrigger
              aria-label={`About ${label}`}
              className="grid size-4! min-h-0! place-items-center rounded-full! border border-hairline p-0! text-[10px] leading-none"
            >
              <span aria-hidden>?</span>
            </TooltipTrigger>
            <TooltipContent>{hint}</TooltipContent>
          </Tooltip>
        )}
      </div>
      <p className="mt-1 text-3xl font-semibold tracking-tight">{formatNumber(kpi.current)}</p>
      <p className="mt-1 h-5 text-sm">
        {change ? (
          <span className={clsx(change.direction === 'flat' ? 'text-ink-muted' : good ? 'text-good' : 'text-critical')}>
            <span aria-hidden>{change.direction === 'up' ? '▲' : change.direction === 'down' ? '▼' : '■'}</span>{' '}
            {change.label} <span className="text-ink-muted">vs previous period</span>
          </span>
        ) : (
          kpi.previous !== null && <span className="text-ink-muted">No data in the previous period</span>
        )}
      </p>
    </div>
  )
}
