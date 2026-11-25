import { cacheLife, cacheTag } from 'next/cache'

import { Prisma } from '@/generated/prisma/client'
import { anonymize, readProperties } from '@/lib/anonymize'
import { prisma } from '@/lib/db'
import { bucketOf, ranges, type RangeKey } from '@/lib/range'

/** Old events keep their properties as a JSON string inside the jsonb column. */
const { empty, raw, sql } = Prisma

const props = raw(
  `(CASE WHEN jsonb_typeof(e.properties) = 'string' THEN (e.properties #>> '{}')::jsonb ELSE e.properties END)`,
)

export const EVENT_TYPES = {
  launch: 'App.Loaded',
  install: 'App.FirstLoaded',
  exception: 'Exception',
  game: 'Settings.Game',
} as const

export const EVENTS_PAGE_SIZE = 150

export interface AppListItem {
  key: string
  name: string
  updatedAt: string
  total: number
  last30: number
  lastEventAt: string | null
  daily: number[]
}

export async function getApps(): Promise<AppListItem[]> {
  'use cache'
  cacheLife('minutes')
  cacheTag('apps')

  const apps = await prisma.$queryRaw<
    {
      id: number
      key: string
      name: string
      updated_at: Date
      total: bigint
      last30: bigint
      last_event_at: Date | null
    }[]
  >`
    SELECT a.id, a.key, a.name, a.updated_at,
      COUNT(e.id) AS total,
      COUNT(e.id) FILTER (WHERE e.created_at >= now() - interval '30 days') AS last30,
      MAX(e.created_at) AS last_event_at
    FROM apps a
    LEFT JOIN events e ON e.app_id = a.id
    GROUP BY a.id
    ORDER BY a.updated_at DESC`

  const daily = await prisma.$queryRaw<{ app_id: number; day: Date; count: bigint }[]>`
    SELECT d.app_id, d.day, COUNT(e.id) AS count
    FROM (
      SELECT a.id AS app_id, day
      FROM apps a
      CROSS JOIN generate_series(date_trunc('day', now() - interval '29 days'), date_trunc('day', now()), interval '1 day') AS day
    ) d
    LEFT JOIN events e ON e.app_id = d.app_id AND date_trunc('day', e.created_at) = d.day
      AND e.created_at >= now() - interval '30 days'
    GROUP BY d.app_id, d.day
    ORDER BY d.day`

  return apps.map(app => ({
    key: app.key,
    name: app.name,
    updatedAt: app.updated_at.toISOString(),
    total: Number(app.total),
    last30: Number(app.last30),
    lastEventAt: app.last_event_at?.toISOString() ?? null,
    daily: daily.filter(d => d.app_id === app.id).map(d => Number(d.count)),
  }))
}

export async function getApp(key: string) {
  'use cache'
  cacheLife('minutes')
  cacheTag(`app:${key}`)

  const app = await prisma.app.findUnique({
    where: { key },
    select: { id: true, key: true, name: true, updatedAt: true },
  })

  return app ? { ...app, updatedAt: app.updatedAt.toISOString() } : null
}

export interface Kpi {
  current: number
  previous: number | null
}

export interface SeriesPoint {
  date: string
  events: number
  launches: number
  installs: number
  exceptions: number
}

export interface Share {
  label: string
  count: number
}

export interface Dashboard {
  bucket: 'day' | 'week'
  kpis: { events: Kpi; launches: Kpi; installs: Kpi; exceptions: Kpi; types: number }
  series: SeriesPoint[]
  types: Share[]
  versions: Share[]
  games: Share[]
}

/** Keeps the `limit - 1` biggest shares and folds the rest into "Other". */
function fold(rows: { label: string | null; count: bigint }[], limit: number): Share[] {
  const shares = rows.map(row => ({ label: row.label ?? 'Unknown', count: Number(row.count) }))

  if (shares.length <= limit) {
    return shares
  }

  const kept = shares.slice(0, limit - 1)
  const other = shares.slice(limit - 1).reduce((sum, share) => sum + share.count, 0)

  return [...kept, { label: 'Other', count: other }]
}

export async function getDashboard(appId: number, range: RangeKey): Promise<Dashboard> {
  'use cache'
  cacheLife('minutes')
  cacheTag(`app-id:${appId}`)

  const { days } = ranges[range]
  const bucket = bucketOf(range)
  const unit = raw(`'${bucket}'`)
  const since = days === null ? empty : sql`AND e.created_at >= now() - make_interval(days => ${days})`

  const kpisQuery =
    days === null
      ? prisma.$queryRaw<Record<string, bigint>[]>`
        SELECT
          COUNT(*) AS events,
          COUNT(*) FILTER (WHERE e.type = ${EVENT_TYPES.launch}) AS launches,
          COUNT(*) FILTER (WHERE e.type = ${EVENT_TYPES.install}) AS installs,
          COUNT(*) FILTER (WHERE e.type = ${EVENT_TYPES.exception}) AS exceptions,
          COUNT(DISTINCT e.type) AS types
        FROM events e
        WHERE e.app_id = ${appId}`
      : prisma.$queryRaw<Record<string, bigint>[]>`
        WITH w AS (
          SELECT e.type, e.created_at >= now() - make_interval(days => ${days}) AS cur
          FROM events e
          WHERE e.app_id = ${appId} AND e.created_at >= now() - make_interval(days => ${days * 2})
        )
        SELECT
          COUNT(*) FILTER (WHERE cur) AS events,
          COUNT(*) FILTER (WHERE NOT cur) AS events_prev,
          COUNT(*) FILTER (WHERE cur AND type = ${EVENT_TYPES.launch}) AS launches,
          COUNT(*) FILTER (WHERE NOT cur AND type = ${EVENT_TYPES.launch}) AS launches_prev,
          COUNT(*) FILTER (WHERE cur AND type = ${EVENT_TYPES.install}) AS installs,
          COUNT(*) FILTER (WHERE NOT cur AND type = ${EVENT_TYPES.install}) AS installs_prev,
          COUNT(*) FILTER (WHERE cur AND type = ${EVENT_TYPES.exception}) AS exceptions,
          COUNT(*) FILTER (WHERE NOT cur AND type = ${EVENT_TYPES.exception}) AS exceptions_prev,
          COUNT(DISTINCT type) FILTER (WHERE cur) AS types
        FROM w`

  const start =
    days === null
      ? sql`(SELECT date_trunc(${unit}, MIN(e.created_at)) FROM events e WHERE e.app_id = ${appId})`
      : sql`date_trunc(${unit}, now() - make_interval(days => ${days - 1}))`

  const seriesQuery = prisma.$queryRaw<
    { bucket: Date; events: bigint; launches: bigint; installs: bigint; exceptions: bigint }[]
  >`
    WITH counts AS (
      SELECT date_trunc(${unit}, e.created_at) AS bucket,
        COUNT(*) AS events,
        COUNT(*) FILTER (WHERE e.type = ${EVENT_TYPES.launch}) AS launches,
        COUNT(*) FILTER (WHERE e.type = ${EVENT_TYPES.install}) AS installs,
        COUNT(*) FILTER (WHERE e.type = ${EVENT_TYPES.exception}) AS exceptions
      FROM events e
      WHERE e.app_id = ${appId} ${since}
      GROUP BY 1
    )
    SELECT s.bucket,
      COALESCE(c.events, 0) AS events,
      COALESCE(c.launches, 0) AS launches,
      COALESCE(c.installs, 0) AS installs,
      COALESCE(c.exceptions, 0) AS exceptions
    FROM generate_series(${start}, date_trunc(${unit}, now()), ('1 ' || ${bucket})::interval) AS s(bucket)
    LEFT JOIN counts c ON c.bucket = s.bucket
    ORDER BY s.bucket`

  const typesQuery = prisma.$queryRaw<{ label: string; count: bigint }[]>`
    SELECT e.type AS label, COUNT(*) AS count
    FROM events e
    WHERE e.app_id = ${appId} ${since}
    GROUP BY e.type
    ORDER BY count DESC, e.type`

  const versionsQuery = prisma.$queryRaw<{ label: string | null; count: bigint }[]>`
    SELECT ${props} ->> 'version' AS label, COUNT(*) AS count
    FROM events e
    WHERE e.app_id = ${appId} AND e.type IN (${EVENT_TYPES.launch}, ${EVENT_TYPES.install}) ${since}
    GROUP BY 1
    ORDER BY count DESC, 1 DESC`

  const gamesQuery = prisma.$queryRaw<{ label: string | null; count: bigint }[]>`
    SELECT ${props} ->> 'game' AS label, COUNT(*) AS count
    FROM events e
    WHERE e.app_id = ${appId} AND e.type = ${EVENT_TYPES.game} ${since}
    GROUP BY 1
    ORDER BY count DESC, 1`

  const [[kpis = {}], series, types, versions, games] = await Promise.all([
    kpisQuery,
    seriesQuery,
    typesQuery,
    versionsQuery,
    gamesQuery,
  ])

  const kpi = (name: string): Kpi => ({
    current: Number(kpis[name] ?? 0),
    previous: days === null ? null : Number(kpis[`${name}_prev`] ?? 0),
  })

  return {
    bucket,
    kpis: {
      events: kpi('events'),
      launches: kpi('launches'),
      installs: kpi('installs'),
      exceptions: kpi('exceptions'),
      types: Number(kpis.types ?? 0),
    },
    series: series.map(point => ({
      date: point.bucket.toISOString(),
      events: Number(point.events),
      launches: Number(point.launches),
      installs: Number(point.installs),
      exceptions: Number(point.exceptions),
    })),
    types: types.map(row => ({ label: row.label, count: Number(row.count) })),
    versions: anonymize(fold(versions, 8)),
    games: anonymize(fold(games, 6)),
  }
}

export interface PropertyBreakdown {
  property: string
  distinct: number
  values: Share[]
}

/** Stack traces are unique per crash: grouping them tells nothing. */
const UNGROUPED_PROPERTIES = ['stack']

export async function getTypeBreakdown(appId: number, type: string, range: RangeKey): Promise<PropertyBreakdown[]> {
  'use cache'
  cacheLife('minutes')
  cacheTag(`app-id:${appId}`)

  const { days } = ranges[range]
  const since = days === null ? empty : sql`AND e.created_at >= now() - make_interval(days => ${days})`

  const rows = await prisma.$queryRaw<{ property: string; value: string; count: bigint; distinct_values: bigint }[]>`
    WITH normalized AS (
      SELECT ${props} AS properties
      FROM events e
      WHERE e.app_id = ${appId} AND e.type = ${type} ${since}
    ),
    kv AS (
      SELECT p.key AS property, p.value AS value
      FROM normalized n,
        jsonb_each_text(CASE WHEN jsonb_typeof(n.properties) = 'object' THEN n.properties ELSE '{}'::jsonb END) AS p
    ),
    grouped AS (
      SELECT property, value, COUNT(*) AS count
      FROM kv
      WHERE property <> ALL (${UNGROUPED_PROPERTIES})
      GROUP BY property, value
    ),
    ranked AS (
      SELECT *, ROW_NUMBER() OVER (PARTITION BY property ORDER BY count DESC, value) AS rank,
        COUNT(*) OVER (PARTITION BY property) AS distinct_values
      FROM grouped
    )
    SELECT property, value, count, distinct_values FROM ranked WHERE rank <= 10 ORDER BY property, rank`

  const breakdown = new Map<string, PropertyBreakdown>()

  for (const row of rows) {
    const entry = breakdown.get(row.property) ?? {
      property: row.property,
      distinct: Number(row.distinct_values),
      values: [],
    }
    entry.values.push({ label: row.value, count: Number(row.count) })
    breakdown.set(row.property, entry)
  }

  return anonymize([...breakdown.values()])
}

export interface EventItem {
  id: number
  type: string
  createdAt: string
  properties: Record<string, unknown>
}

export async function getEvents(
  appId: number,
  { page = 1, type }: { page?: number; type?: string },
): Promise<{ nextPage: number | undefined; total: number; data: EventItem[] }> {
  const where = { appId, ...(type ? { type: { contains: type, mode: 'insensitive' as const } } : {}) }
  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * EVENTS_PAGE_SIZE,
      take: EVENTS_PAGE_SIZE,
      select: { id: true, type: true, createdAt: true, properties: true },
    }),
    prisma.event.count({ where }),
  ])

  return {
    nextPage: page * EVENTS_PAGE_SIZE < total ? page + 1 : undefined,
    total,
    data: events.map(event => ({
      id: event.id,
      type: event.type,
      createdAt: event.createdAt.toISOString(),
      properties: readProperties(event.properties),
    })),
  }
}
