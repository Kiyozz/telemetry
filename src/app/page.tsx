import Link from 'next/link'
import { connection } from 'next/server'
import { Suspense } from 'react'

import { Skeleton } from '@/components/card'
import { Sparkline } from '@/components/sparkline'
import { formatCompact, formatRelative } from '@/lib/format'
import { getApps } from '@/lib/queries'

export default function HomePage() {
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Applications</h1>
      <p className="mt-1 text-ink-muted">Anonymous usage statistics, refreshed every few minutes.</p>
      <Suspense
        fallback={
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-44" />
            <Skeleton className="h-44" />
          </div>
        }
      >
        <AppList />
      </Suspense>
    </>
  )
}

async function AppList() {
  await connection()
  const apps = await getApps()

  if (apps.length === 0) {
    return <p className="mt-6 text-ink-muted">No apps yet.</p>
  }

  return (
    <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {apps.map(app => (
        <li key={app.key}>
          <Link
            href={`/apps/${app.key}`}
            className="group block rounded-xl border border-hairline bg-surface p-5 transition-colors hover:border-accent"
          >
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="truncate font-semibold group-hover:text-accent">{app.name}</h2>
              <span className="shrink-0 text-xs text-ink-muted">
                {app.lastEventAt ? formatRelative(app.lastEventAt) : 'no events'}
              </span>
            </div>
            <dl className="mt-3 flex gap-6">
              <div>
                <dt className="text-xs text-ink-muted">Last 30 days</dt>
                <dd className="text-xl font-semibold">{formatCompact(app.last30)}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-muted">All time</dt>
                <dd className="text-xl font-semibold">{formatCompact(app.total)}</dd>
              </div>
            </dl>
            <div className="mt-3">
              <Sparkline values={app.daily} label={`Events per day over the last 30 days for ${app.name}`} />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}
