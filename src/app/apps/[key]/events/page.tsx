import { Accordion, AccordionHeader, AccordionItem, AccordionPanel, AccordionTrigger } from '@ui-sdk/react/accordion'
import { Button } from '@ui-sdk/react/button'
import { Field, FieldLabel } from '@ui-sdk/react/field'
import { Input } from '@ui-sdk/react/input'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import { Skeleton } from '@/components/card'
import { EventsPagination } from '@/components/events-pagination'
import { formatDateTime, formatNumber, formatRelative } from '@/lib/format'
import { EVENTS_PAGE_SIZE, getApp, getEvents, type EventItem } from '@/lib/queries'
import { eventsQuery } from '@/lib/schemas'

export async function generateMetadata({ params }: PageProps<'/apps/[key]/events'>): Promise<Metadata> {
  const app = await getApp((await params).key)

  return { title: app ? `${app.name} events` : 'Unknown app' }
}

export default function EventsPage({ params, searchParams }: PageProps<'/apps/[key]/events'>) {
  return (
    <Suspense fallback={<Skeleton className="h-96" />}>
      <EventsExplorer params={params} searchParams={searchParams} />
    </Suspense>
  )
}

async function EventsExplorer({ params, searchParams }: PageProps<'/apps/[key]/events'>) {
  const [{ key }, rawQuery] = await Promise.all([params, searchParams])
  const parsed = eventsQuery.safeParse(rawQuery)
  const { page, type } = parsed.success ? parsed.data : { page: 1, type: undefined }
  const app = await getApp(key)

  if (!app) {
    notFound()
  }

  const { data: events, total } = await getEvents(app.id, { page, type })

  return (
    <>
      <Link href={`/apps/${app.key}`} className="text-sm text-ink-muted hover:text-ink">
        ← {app.name}
      </Link>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">Events</h1>
      <p className="mt-1 text-sm text-ink-muted">
        {formatNumber(total)} events{type ? ` matching “${type}”` : ''}, newest first
      </p>

      <search className="mt-4 block max-w-md">
        <form action={`/apps/${app.key}/events`} className="flex items-end gap-2">
          <Field name="type" className="flex-1">
            <FieldLabel>Event type</FieldLabel>
            <Input defaultValue={type} placeholder="e.g. Exception" />
          </Field>
          <Button type="submit" data-variant="solid">
            Filter
          </Button>
        </form>
      </search>

      {events.length === 0 ? (
        <p className="mt-6 text-ink-muted">No events{type ? ` matching “${type}”` : ''}.</p>
      ) : (
        <Accordion multiple className="mt-6 max-w-none! overflow-hidden rounded-xl border border-hairline bg-surface">
          {events.map(event => (
            <EventRow key={event.id} event={event} />
          ))}
        </Accordion>
      )}

      {total > EVENTS_PAGE_SIZE && (
        <div className="mt-4 flex justify-center">
          <EventsPagination page={page} total={total} pageSize={EVENTS_PAGE_SIZE} type={type} />
        </div>
      )}
    </>
  )
}

function EventRow({ event }: { event: EventItem }) {
  const preview = Object.entries(event.properties)
    .filter(([name]) => name !== 'stack')
    .map(([name, value]) => `${name}=${typeof value === 'string' ? value : JSON.stringify(value)}`)
    .join('  ')

  return (
    <AccordionItem value={String(event.id)} className="border-b border-hairline last:border-b-0">
      <AccordionHeader>
        <AccordionTrigger className="h-auto! w-full gap-3 px-4 py-3 text-left hover:bg-surface-muted">
          <span className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-medium">{event.type}</span>
            <time dateTime={event.createdAt} className="text-sm text-ink-muted">
              {formatRelative(event.createdAt)}
            </time>
            {preview && <span className="min-w-0 flex-1 truncate font-mono text-xs text-ink-muted">{preview}</span>}
          </span>
        </AccordionTrigger>
      </AccordionHeader>
      <AccordionPanel>
        <div className="bg-surface-muted px-4 py-3 text-xs">
          <p className="mb-2 text-ink-muted">{formatDateTime(event.createdAt)}</p>
          <pre className="overflow-x-auto leading-relaxed">
            {Object.keys(event.properties).length > 0 ? JSON.stringify(event.properties, null, 2) : 'No properties'}
          </pre>
        </div>
      </AccordionPanel>
    </AccordionItem>
  )
}
