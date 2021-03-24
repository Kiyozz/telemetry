import is from '@sindresorhus/is'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import AppBar from '../../components/app-bar'
import DataTable from '../../components/data-table'
import cache from '../../helpers/cache'
import prisma from '../../helpers/database'
import formatDate from '../../helpers/formatDate'
import time from '../../helpers/time'
import { useLayoutEffect } from '../../hooks/use-layout-effect'

interface Summary {
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
  summary: Summary[]
  summaryWithoutProperties: Omit<Summary, 'properties'>[]
  updatedAt: string
}

function filterSearch<T extends Pick<Summary, 'type'>>(array: T[], query: string): T[] {
  return array.filter(({ type }) => type.toLowerCase().includes(query.toLowerCase()))
}

export default function TelemetryView({
  app,
  summary: initialSummary,
  summaryWithoutProperties: initialSummaryWithoutProperties,
  updatedAt,
}: Props) {
  const [isDetailsActive, setDetailsActive] = useState(true)
  const [isSummaryActive, setSummaryActive] = useState(true)
  const [isSummaryPropertiesActive, setSummaryPropertiesActive] = useState(true)
  const { register, handleSubmit, getValues } = useForm({ defaultValues: { type: '' } })
  const { register: detailsRegister, handleSubmit: handleDetailsSubmit } = useForm({ defaultValues: { type: '' } })
  const [summary, setSummary] = useState(initialSummary)
  const [summaryWithoutProperties, setSummaryWithoutProperties] = useState(initialSummaryWithoutProperties)
  const [events, setEvents] = useState(app.events)

  useLayoutEffect(() => {
    if (isSummaryActive) {
      setSummary(() => initialSummary)
    }
  }, [isSummaryActive, initialSummary])

  useLayoutEffect(() => {
    if (isDetailsActive) {
      setEvents(app.events)
    }
  }, [isDetailsActive, app.events])

  const onClickSummaryToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur()

    setSummaryActive(a => !a)
  }

  const onClickDetailsToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur()

    setDetailsActive(a => !a)
  }

  const onClickSummaryPropertiesActive = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur()

    const query = getValues('type')

    setSummaryPropertiesActive(a => !a)
    setSummary(filterSearch(initialSummary, query))
    setSummaryWithoutProperties(filterSearch(initialSummaryWithoutProperties, query))
  }

  const onSubmitSummary = handleSubmit(data => {
    if (isSummaryPropertiesActive) {
      setSummary(filterSearch(initialSummary, data.type))
    } else {
      setSummaryWithoutProperties(filterSearch(initialSummaryWithoutProperties, data.type))
    }
  })

  const onSubmitDetails = handleDetailsSubmit(data => {
    setEvents(app.events.filter(({ type }) => type.toLowerCase().includes(data.type.toLowerCase())))
  })

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

            {initialSummary.length > 0 && (
              <>
                <form className="inline-form" onSubmit={onSubmitSummary}>
                  <input name="type" defaultValue="" ref={register} />

                  <button>Submit</button>
                </form>
                <div className="mt-2">
                  <button
                    onClick={onClickSummaryPropertiesActive}
                    className={
                      isSummaryPropertiesActive
                        ? 'bg-primary-400'
                        : 'bg-background hover:bg-background-lighter focus:bg-background-lighter'
                    }
                  >
                    Properties
                  </button>
                </div>
              </>
            )}

            {isSummaryPropertiesActive && !is.emptyArray(summary) ? (
              <DataTable
                className="mt-4"
                headers={['Type', 'Count', 'Properties']}
                lines={summary.map(({ type, count, properties }) => [type, count, properties])}
              />
            ) : !isSummaryPropertiesActive && !is.emptyArray(summaryWithoutProperties) ? (
              <DataTable
                className="mt-4"
                headers={['Type', 'Count']}
                lines={summaryWithoutProperties.map(({ type, count }) => [type, count])}
              />
            ) : (
              <p className="text-paragraph">No events yet</p>
            )}
          </div>
        )}

        {isDetailsActive && (
          <div className="mt-4 flex flex-col">
            <h2>Details</h2>

            {app.events.length > 0 && (
              <form className="inline-form" onSubmit={onSubmitDetails}>
                <input name="type" defaultValue="" ref={detailsRegister} />

                <button>Submit</button>
              </form>
            )}

            {!is.emptyArray(events) ? (
              <DataTable
                className="mt-4"
                headers={['Type', 'Time', 'Count', 'Properties']}
                lines={events.map(({ type, count, event_created_at, properties }) => [
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
  const lastEvent = await prisma.event.findFirst({
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

  const lastCreatedAt = lastEvent?.createdAt ?? null
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

  let summary = await prisma.$queryRaw<
    Summary[]
  >`SELECT e.type, COUNT(e.type) as count, e.properties FROM events e WHERE e."appId" = ${app.id} GROUP BY e.type, e.properties ORDER BY count DESC, e.type`
  const summaryWithoutProperties = await prisma.$queryRaw<
    Omit<Summary, 'properties'>[]
  >`SELECT e.type, COUNT(e.type) as count FROM events e WHERE e."appId" = ${app.id} GROUP BY e.type ORDER BY count DESC, e.type`

  summary = summary.map(stat => {
    const props = JSON.parse(stat.properties)

    return { ...stat, properties: is.emptyObject(props) ? 'No properties' : JSON.stringify(props, null, 2) }
  }) as Summary[]

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

  cache.setAppViaKey(
    key,
    JSON.stringify({ app: finalApp, summary, summaryWithoutProperties, updatedAt: lastUpdatedAt } as Props),
  )

  timerOther()
  timer()

  return {
    props: {
      app: {
        name: app.name,
        events,
      },
      summary,
      summaryWithoutProperties,
      updatedAt: lastUpdatedAt,
    },
  }
}
