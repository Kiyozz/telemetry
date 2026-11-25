import { Accordion, AccordionHeader, AccordionItem, AccordionPanel, AccordionTrigger } from '@ui-sdk/react/accordion'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import { Skeleton } from '@/components/card'
import { PendingHint } from '@/components/pending-hint'
import { RangeControl } from '@/components/range-control'
import { Sparkline } from '@/components/sparkline'
import { formatDateTime, formatNumber, formatRelative } from '@/lib/format'
import { getApp, getExceptions, type ExceptionGroup } from '@/lib/queries'
import { parseRange, ranges } from '@/lib/range'

export async function generateMetadata({ params }: PageProps<'/apps/[key]/exceptions'>): Promise<Metadata> {
  const app = await getApp((await params).key)

  return { title: app ? `${app.name} exceptions` : 'Unknown app' }
}

export default function ExceptionsPage({ params, searchParams }: PageProps<'/apps/[key]/exceptions'>) {
  return (
    <Suspense fallback={<Skeleton className="h-96" />}>
      <Exceptions params={params} searchParams={searchParams} />
    </Suspense>
  )
}

async function Exceptions({ params, searchParams }: PageProps<'/apps/[key]/exceptions'>) {
  const [{ key }, query] = await Promise.all([params, searchParams])
  const range = parseRange(query.range)
  const app = await getApp(key)

  if (!app) {
    notFound()
  }

  const report = await getExceptions(app.id, range)
  const period = range === 'all' ? 'since the first event' : `over the last ${ranges[range].label}`

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link
            href={{ pathname: `/apps/${app.key}`, query: { range } }}
            className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink"
          >
            ← {app.name} <PendingHint />
          </Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Exceptions</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {formatNumber(report.total)} exceptions {period}, {formatNumber(report.distinct)} distinct messages
            {report.distinct > report.groups.length && ` (the ${report.groups.length} most frequent are shown)`}
          </p>
        </div>
        <RangeControl current={range} />
      </div>

      {report.groups.length === 0 ? (
        <p className="mt-6 text-ink-muted">No exception {period}.</p>
      ) : (
        <Accordion multiple className="mt-6 max-w-none! overflow-hidden rounded-xl border border-hairline bg-surface">
          {report.groups.map(group => (
            <ExceptionRow
              key={group.error}
              group={group}
              total={report.total}
              bucket={report.bucket}
              buckets={report.buckets}
            />
          ))}
        </Accordion>
      )}
    </>
  )
}

interface ExceptionRowProps {
  group: ExceptionGroup
  total: number
  bucket: 'day' | 'week'
  buckets: string[]
}

function ExceptionRow({ group, total, bucket, buckets }: ExceptionRowProps) {
  const share = total > 0 ? Math.round((group.count / total) * 100) : 0
  const first = buckets[0]

  return (
    <AccordionItem value={group.error} className="border-b border-hairline last:border-b-0">
      <AccordionHeader>
        <AccordionTrigger className="h-auto! w-full gap-4 px-4 py-3 text-left hover:bg-surface-muted">
          <span className="grid min-w-0 flex-1 gap-x-4 gap-y-1 sm:grid-cols-[minmax(0,1fr)_8rem_7rem]">
            <span className="min-w-0">
              <span className="line-clamp-2 font-mono text-sm break-words">{group.error}</span>
              <span className="mt-0.5 block text-xs text-ink-muted">
                Last seen {formatRelative(group.lastSeen)} · first seen {formatRelative(group.firstSeen)}
              </span>
            </span>
            <span className="hidden self-center sm:block">
              <Sparkline
                values={group.trend}
                label={`Occurrences per ${bucket}${first ? ` since ${formatDateTime(first)}` : ''}`}
                className="h-8"
              />
            </span>
            <span className="self-center text-sm tabular-nums sm:text-right">
              <span className="font-medium">{formatNumber(group.count)}</span>{' '}
              <span className="text-ink-muted">· {share}%</span>
            </span>
          </span>
        </AccordionTrigger>
      </AccordionHeader>
      <AccordionPanel>
        <div className="space-y-3 bg-surface-muted px-4 py-3 text-xs">
          <dl className="flex flex-wrap gap-x-6 gap-y-1">
            <div>
              <dt className="inline text-ink-muted">First seen </dt>
              <dd className="inline">{formatDateTime(group.firstSeen)}</dd>
            </div>
            <div>
              <dt className="inline text-ink-muted">Last seen </dt>
              <dd className="inline">{formatDateTime(group.lastSeen)}</dd>
            </div>
            <div>
              <dt className="inline text-ink-muted">Occurrences </dt>
              <dd className="inline tabular-nums">{formatNumber(group.count)}</dd>
            </div>
          </dl>
          <div>
            <p className="mb-1 text-ink-muted">Latest stack trace</p>
            <pre className="overflow-x-auto rounded-lg border border-hairline bg-surface p-3 leading-relaxed">
              {group.stack ?? 'No stack trace'}
            </pre>
          </div>
        </div>
      </AccordionPanel>
    </AccordionItem>
  )
}
