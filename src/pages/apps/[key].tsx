import is from '@sindresorhus/is'
import { GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import AppBar from '../../components/app-bar'
import DataTable from '../../components/data-table'
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
  app:
    | {
        name: string
        events: Event[] | null
      }
    | undefined
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
  const router = useRouter()
  const [isDetailsActive, setDetailsActive] = useState(!is.null_(app?.events ?? null))
  const [isSummaryActive, setSummaryActive] = useState(true)
  const [isSummaryPropertiesActive, setSummaryPropertiesActive] = useState(true)
  const { register, handleSubmit, getValues } = useForm({ defaultValues: { type: '' } })
  const { register: detailsRegister, handleSubmit: handleDetailsSubmit } = useForm({ defaultValues: { type: '' } })
  const [summary, setSummary] = useState(initialSummary)
  const [summaryWithoutProperties, setSummaryWithoutProperties] = useState(initialSummaryWithoutProperties)
  const [events, setEvents] = useState<Event[] | undefined>(app?.events ?? undefined)

  useLayoutEffect(() => {
    if (isSummaryActive) {
      setSummary(() => initialSummary)
    }
  }, [isSummaryActive, initialSummary])

  useLayoutEffect(() => {
    if (isDetailsActive) {
      setEvents(app?.events ?? undefined)
    }
  }, [isDetailsActive, app])

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
    setEvents(app?.events?.filter(({ type }) => type.toLowerCase().includes(data.type.toLowerCase())))
  })

  if (router.isFallback) return <div>Loading...</div>

  const title = `Telemetry - ${app?.name ?? 'Unknown'}`

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <AppBar
        title={
          <>
            <span className="hidden sm:inline">Application </span>
            {app?.name ?? 'Name not defined'}
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
          {!is.null_(events) && (
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
          )}
        </div>

        {isSummaryActive && (
          <div className="mt-4">
            <h2>Summary</h2>

            {initialSummary.length > 0 && (
              <>
                <form className="inline-form" onSubmit={onSubmitSummary}>
                  <input defaultValue="" {...register('type')} />

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

        {isDetailsActive && !is.null_(events) && (
          <div className="mt-4 flex flex-col">
            <h2>Details</h2>

            {(app?.events?.length ?? 0) > 0 && (
              <form className="inline-form" onSubmit={onSubmitDetails}>
                <input defaultValue="" {...detailsRegister('type')} />

                <button>Submit</button>
              </form>
            )}

            {!is.emptyArray(events) ? (
              <DataTable
                className="mt-4"
                headers={['Type', 'Time', 'Count', 'Properties']}
                lines={events?.map(({ type, count, event_created_at, properties }) => [
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

export const getStaticPaths: GetStaticPaths = async () => {
  const apps = await prisma.app.findMany({ select: { key: true } })

  return {
    paths: apps.map(app => ({
      params: { key: app.key },
    })),
    fallback: true,
  }
}

export const getStaticProps: GetStaticProps<Props> = async context => {
  console.log('--------')
  const timer = time('apps/[key]')
  const key = context.params?.key as string

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

  const timerStats = time('apps/[key]/stats')

  let summary = await prisma.$queryRaw<Summary[]>`SELECT e.type, COUNT(e.type) as count, e.properties
FROM events e
WHERE e."appId" = ${app.id}
GROUP BY e.type, e.properties
ORDER BY count DESC, e.type`

  let summaryWithoutProperties = await prisma.$queryRaw<
    Omit<Summary, 'properties'>[]
  >`SELECT e.type, COUNT(e.type) as count
FROM events e
WHERE e."appId" = ${app.id}
GROUP BY e.type
ORDER BY count DESC, e.type`

  summary = summary.map<Summary>(stat => {
    const props = JSON.parse(stat.properties)

    return {
      ...stat,
      count: Number(stat.count),
      properties: is.emptyObject(props) ? 'No properties' : JSON.stringify(props, null, 2),
    }
  })

  summaryWithoutProperties = summaryWithoutProperties.map((stat: Omit<Summary, 'properties'>) => {
    return { ...stat, count: Number(stat.count) }
  })

  timerStats()

  let events: Event[] | null = null

  if (process.env.NEXT_APP_DETAILS_EVENTS === '1') {
    const timerEvents = time('apps/[key]/events')
    const result = await prisma.$queryRaw<Event[]>`SELECT
  e.type,
  e.properties,
  date_trunc('minute', e.created_at) event_created_at,
  COUNT(*) count
FROM
  events e
WHERE
  e."appId" = ${app.id}
GROUP BY
  e.created_at,
  e.type,
  e.properties,
  event_created_at
ORDER BY
  e.created_at DESC,
  count DESC`

    timerEvents()

    events = result.map((e): Event => {
      const properties = JSON.parse(e.properties as string)

      return {
        ...e,
        count: Number(e.count),
        properties: is.emptyObject(properties) ? 'No properties' : JSON.stringify(properties, null, 2),
        event_created_at: formatDate(e.event_created_at, { eol: true }),
      }
    })
  } else {
    console.log('--- details feature is disabled ---')
  }

  timer()
  console.log('--------')

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
    revalidate: 7200,
  }
}
