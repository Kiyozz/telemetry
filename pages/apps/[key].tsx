import is from '@sindresorhus/is'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import { useState } from 'react'

import AppBar from '../../components/app-bar'
import DataTable from '../../components/data-table'
import cache from '../../helpers/cache'
import prisma from '../../helpers/database'
import formatDate from '../../helpers/formatDate'
import time from '../../helpers/time'

interface Stat {
  type: string
  count: number
  properties: string
}

interface Event {
  type: string
  properties: string
  event_created_at: string
  count: number
}

interface Props {
  app: {
    name: string
    events: Event[]
  }
  stats: Stat[]
  updatedAt: string
}

export default function TelemetryView({ app, stats, updatedAt }: Props) {
  const [isDetailsActive, setDetailsActive] = useState(true)
  const [isSummaryActive, setSummaryActive] = useState(true)

  const onClickSummaryToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur()

    setSummaryActive(a => !a)
  }

  const onClickDetailsToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur()

    setDetailsActive(a => !a)
  }

  return (
    <>
      <Head>
        <title>Telemetry {app.name}</title>
      </Head>
      <AppBar
        title={
          <>
            <span className="hidden sm:inline">Application </span>
            {app.name}
          </>
        }
      >
        <div className="text-xs sm:text-lg">
          <span className="hidden sm:inline">Updated at </span>
          {updatedAt}
        </div>
      </AppBar>
      <div className="px-4 pb-4 mt-16">
        <div className="flex toolbar">
          <button
            onClick={onClickSummaryToggle}
            className={
              isSummaryActive
                ? 'bg-primary-400'
                : 'bg-background hover:bg-background-lighter focus:bg-background-lighter'
            }
          >
            Summary
          </button>
          <button
            onClick={onClickDetailsToggle}
            className={
              isDetailsActive
                ? 'bg-primary-400'
                : 'bg-background hover:bg-background-lighter focus:bg-background-lighter'
            }
          >
            Details
          </button>
        </div>

        {isSummaryActive && (
          <div className="mt-4">
            <h2>Summary</h2>

            {!is.emptyArray(stats) ? (
              <DataTable
                className="mt-4"
                headers={['Type', 'Count', 'Properties']}
                lines={stats.map(({ type, count, properties }) => [type, count, properties])}
              />
            ) : (
              <p className="text-paragraph">No events yet</p>
            )}
          </div>
        )}

        {isDetailsActive && (
          <div className="mt-4 flex flex-col">
            <h2>Details</h2>

            {!is.emptyArray(app.events) ? (
              <DataTable
                className="mt-4"
                headers={['Type', 'Time', 'Count', 'Properties']}
                lines={app.events.map(({ type, count, event_created_at, properties }) => [
                  type,
                  event_created_at,
                  count,
                  properties,
                ])}
                compact
              />
            ) : (
              <p className="text-paragraph">No events yet</p>
            )}
          </div>
        )}

        {!isSummaryActive && !isDetailsActive && <p className="text-lg mt-4">Nothing to display.</p>}
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<Props, { key: string }> = async context => {
  console.log('--------')
  const timer = time('apps/[key]')
  const { key } = context.params
  const timerCache = time('apps/[key]/cache')
  const cached = await cache.getAppViaKey<string>(key)

  timerCache()

  if (is.string(cached)) {
    timer()
    console.log('apps/[key]/cached')

    return {
      props: JSON.parse(cached) as Props,
    }
  }

  const timerGetApp = time('apps/[key]/app')
  const app = await prisma.app.findUnique({
    where: {
      key,
    },
    select: {
      id: true,
      name: true,
    },
  })

  timerGetApp()

  if (is.null_(app)) {
    timer()

    return {
      notFound: true,
    }
  }

  const timerCreatedAt = time('apps/[key]/created-at')
  const { createdAt: lastCreatedAt } = await prisma.event.findFirst({
    select: {
      createdAt: true,
    },
    where: {
      appId: app.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 1,
  })
  const lastUpdatedAt = formatDate(lastCreatedAt, { space: true })

  timerCreatedAt()

  const timerEvents = time('apps/[key]/events')

  const result = await prisma.$queryRaw<Event[]>(`SELECT
       e.type,
       e.properties,
       date_trunc('minute', e.created_at) event_created_at,
       COUNT(*) count
FROM
     events e
WHERE e."appId" = '${app.id}'
GROUP BY
         e.type,
         e.properties,
         event_created_at
ORDER BY
    event_created_at DESC,
    count DESC`)

  timerEvents()

  const timerStats = time('apps/[key]/stats')

  let stats = await prisma.$queryRaw<
    Stat[]
  >`SELECT e.type, COUNT(e.type) as count, e.properties FROM events e WHERE e."appId" = ${app.id} GROUP BY e.type, e.properties ORDER BY count DESC, e.type`

  stats = stats.map(stat => {
    const props = JSON.parse(stat.properties)

    return { ...stat, properties: is.emptyObject(props) ? 'No properties' : JSON.stringify(props, null, 2) }
  }) as Stat[]

  timerStats()

  const timerOther = time('apps/[key]/other')

  const events = result.map(
    (e): Event => {
      const properties = JSON.parse(e.properties as string)

      return {
        ...e,
        properties: is.emptyObject(properties) ? 'No properties' : JSON.stringify(properties, null, 2),
        event_created_at: formatDate(e.event_created_at, { eol: true }),
      }
    },
  )
  const finalApp = {
    name: app.name,
    events,
  }

  cache.setAppViaKey(key, JSON.stringify({ app: finalApp, stats, updatedAt: lastUpdatedAt }))

  timerOther()
  timer()

  return {
    props: {
      app: {
        name: app.name,
        events,
      },
      stats,
      updatedAt: lastUpdatedAt,
    },
  }
}
