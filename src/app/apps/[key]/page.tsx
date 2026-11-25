import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from '@ui-sdk/react/collapsible'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import { Card, Skeleton } from '@/components/card'
import { KpiTile } from '@/components/kpi-tile'
import { RangeControl } from '@/components/range-control'
import { ShareBars } from '@/components/share-bars'
import { Legend, TimeSeriesChart, type Series } from '@/components/time-series-chart'
import { PendingHint } from '@/components/pending-hint'
import { ScrollIntoView } from '@/components/scroll-into-view'
import { TypeBreakdown } from '@/components/type-breakdown'
import { formatLongDay, formatNumber, formatRelative } from '@/lib/format'
import { EVENT_TYPES, getApp, getDashboard, getTypeBreakdown, type Dashboard } from '@/lib/queries'
import { parseRange, ranges } from '@/lib/range'

export async function generateMetadata({ params }: PageProps<'/apps/[key]'>): Promise<Metadata> {
  const app = await getApp((await params).key)

  return { title: app?.name ?? 'Unknown app' }
}

const eventsSeries: Series[] = [{ key: 'events', label: 'Events', color: 'var(--series-1)' }]
const launchesSeries: Series[] = [
  { key: 'launches', label: 'Launches', color: 'var(--series-1)' },
  { key: 'installs', label: 'First launches', color: 'var(--series-2)' },
]

export default function AppPage({ params, searchParams }: PageProps<'/apps/[key]'>) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <AppDashboard params={params} searchParams={searchParams} />
    </Suspense>
  )
}

async function AppDashboard({ params, searchParams }: PageProps<'/apps/[key]'>) {
  const [{ key }, query] = await Promise.all([params, searchParams])
  const range = parseRange(query.range)
  const selectedType = typeof query.type === 'string' ? query.type : undefined
  const app = await getApp(key)

  if (!app) {
    notFound()
  }

  const basePath = `/apps/${app.key}` as const
  const [dashboard, breakdown] = await Promise.all([
    getDashboard(app.id, range),
    selectedType ? getTypeBreakdown(app.id, selectedType, range) : null,
  ])
  const { kpis } = dashboard
  const period = range === 'all' ? 'since the first event' : `over the last ${ranges[range].label}`

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/" className="text-sm text-ink-muted hover:text-ink">
            ← Applications
          </Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{app.name}</h1>
          <p className="mt-1 text-sm text-ink-muted">Last event {formatRelative(app.updatedAt)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <RangeControl current={range} />
          <Link
            href={`${basePath}/exceptions?range=${range}`}
            className="inline-flex items-center gap-2 rounded-lg border border-hairline bg-surface px-3 py-2 text-sm transition-colors hover:border-accent"
          >
            Exceptions → <PendingHint />
          </Link>
          <Link
            href={`${basePath}/events`}
            className="inline-flex items-center gap-2 rounded-lg border border-hairline bg-surface px-3 py-2 text-sm transition-colors hover:border-accent"
          >
            Browse events → <PendingHint />
          </Link>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiTile label="Events" kpi={kpis.events} />
        <KpiTile label="Launches" kpi={kpis.launches} hint="App.Loaded events" />
        <KpiTile label="First launches" kpi={kpis.installs} hint="App.FirstLoaded events: new installs" />
        <KpiTile
          label="Exceptions"
          kpi={kpis.exceptions}
          upIsGood={false}
          href={{ pathname: `${basePath}/exceptions`, query: { range } }}
        />
      </div>

      <Card
        className="mt-4"
        title="Events"
        description={`${formatNumber(kpis.events.current)} events ${period}, per ${dashboard.bucket}`}
      >
        <TimeSeriesChart data={dashboard.series} series={eventsSeries} bucket={dashboard.bucket} />
        <SeriesTable dashboard={dashboard} />
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <Card
          className="lg:col-span-3"
          title="Launches"
          description="App starts, and first starts after an install"
          action={<Legend series={launchesSeries} />}
        >
          <TimeSeriesChart data={dashboard.series} series={launchesSeries} bucket={dashboard.bucket} />
        </Card>
        <Card className="lg:col-span-2" title="Versions" description="Share of launches per PCA version">
          <ShareBars shares={dashboard.versions} />
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <Card
          className="lg:col-span-3"
          title="Event types"
          description={`${kpis.types} types ${period}. Select one to see its properties.`}
        >
          <ShareBars
            shares={dashboard.types}
            selected={selectedType}
            hrefOf={share => ({
              pathname: basePath,
              query: { range, ...(share.label === selectedType ? {} : { type: share.label }) },
              hash: share.label === selectedType ? undefined : 'properties',
            })}
          />
        </Card>
        <Card className="lg:col-span-2" title="Games" description="Game selected in the settings">
          <ShareBars shares={dashboard.games} />
        </Card>
      </div>

      {selectedType && breakdown && (
        <div id="properties" className="scroll-mt-20">
          <ScrollIntoView key={selectedType} />
          <Card
            className="mt-4"
            title={
              <>
                Properties of <code className="rounded bg-surface-muted px-1.5 py-0.5">{selectedType}</code>
              </>
            }
            description={`Most frequent values ${period}`}
            action={
              <Link
                href={{ pathname: basePath, query: { range } }}
                scroll={false}
                className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink"
              >
                Close <PendingHint />
              </Link>
            }
          >
            <TypeBreakdown breakdown={breakdown} />
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {selectedType === EVENT_TYPES.exception && (
                <Link
                  href={`${basePath}/exceptions?range=${range}`}
                  className="inline-flex items-center gap-2 text-accent hover:underline"
                >
                  Browse exceptions by message → <PendingHint />
                </Link>
              )}
              <Link
                href={{ pathname: `${basePath}/events`, query: { type: selectedType } }}
                className="inline-flex items-center gap-2 text-accent hover:underline"
              >
                See these events → <PendingHint />
              </Link>
            </div>
          </Card>
        </div>
      )}
    </>
  )
}

function SeriesTable({ dashboard }: { dashboard: Dashboard }) {
  return (
    <Collapsible className="mt-3 text-sm">
      <CollapsibleTrigger className="text-ink-muted hover:text-ink">Show as table</CollapsibleTrigger>
      <CollapsiblePanel className="mt-2 max-h-72 overflow-auto rounded-lg border border-hairline">
        <table className="w-full text-left tabular-nums">
          <thead className="sticky top-0 bg-surface-muted text-ink-muted">
            <tr>
              <th className="px-3 py-2 font-medium">{dashboard.bucket === 'week' ? 'Week of' : 'Day'}</th>
              <th className="px-3 py-2 text-right font-medium">Events</th>
              <th className="px-3 py-2 text-right font-medium">Launches</th>
              <th className="px-3 py-2 text-right font-medium">First launches</th>
              <th className="px-3 py-2 text-right font-medium">Exceptions</th>
            </tr>
          </thead>
          <tbody>
            {dashboard.series.toReversed().map(point => (
              <tr key={point.date} className="border-t border-hairline">
                <td className="px-3 py-1.5">{formatLongDay(point.date)}</td>
                <td className="px-3 py-1.5 text-right">{formatNumber(point.events)}</td>
                <td className="px-3 py-1.5 text-right">{formatNumber(point.launches)}</td>
                <td className="px-3 py-1.5 text-right">{formatNumber(point.installs)}</td>
                <td className="px-3 py-1.5 text-right">{formatNumber(point.exceptions)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CollapsiblePanel>
    </Collapsible>
  )
}

function DashboardSkeleton() {
  return (
    <>
      <Skeleton className="h-16 w-64" />
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map(i => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <Skeleton className="mt-4 h-80" />
    </>
  )
}
