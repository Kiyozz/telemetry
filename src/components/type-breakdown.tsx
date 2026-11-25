import { ShareBars } from '@/components/share-bars'
import type { PropertyBreakdown } from '@/lib/queries'

export function TypeBreakdown({ breakdown }: { breakdown: PropertyBreakdown[] }) {
  if (breakdown.length === 0) {
    return <p className="text-sm text-ink-muted">This event has no properties.</p>
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {breakdown.map(entry => (
        <div key={entry.property}>
          <h3 className="mb-2 flex items-baseline justify-between text-sm font-medium">
            <code className="rounded bg-surface-muted px-1.5 py-0.5">{entry.property}</code>
            <span className="text-xs font-normal text-ink-muted">
              {entry.distinct > entry.values.length
                ? `top ${entry.values.length} of ${entry.distinct} values`
                : `${entry.distinct} values`}
            </span>
          </h3>
          <ShareBars shares={entry.values} />
        </div>
      ))}
    </div>
  )
}
