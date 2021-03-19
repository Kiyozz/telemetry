import is from '@sindresorhus/is'
import dayjs from 'dayjs'
import { GetServerSideProps } from 'next'
import Head from 'next/head'

import AppBar from '../../components/app-bar'
import DataTable from '../../components/data-table'
import cache, { CacheKey } from '../../helpers/cache'
import prisma from '../../helpers/database'

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
}

export default function TelemetryView({ app, stats }: Props) {
  return (
    <>
      <Head>
        <title>Telemetry {app.name}</title>
      </Head>
      <AppBar title={`Application ${app.name}`} />
      <div className="px-4 mt-16">
        <div>
          <h2>Number of events</h2>

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
        <div className="mt-4">
          <div className="flex flex-col">
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
        </div>
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<Props, { key: string }> = async context => {
  const { key } = context.params

  const cached = await cache.get<string>(`${CacheKey.AppOne}-${key}`)

  if (is.string(cached)) {
    return {
      props: JSON.parse(cached) as Props,
    }
  }

  const app = await prisma.app.findUnique({
    where: {
      key,
    },
    select: {
      id: true,
      name: true,
    },
  })

  if (is.null_(app)) {
    return {
      notFound: true,
    }
  }

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

  let stats = await prisma.$queryRaw<
    Stat[]
  >`SELECT e.type, COUNT(e.type) as count, e.properties FROM events e WHERE e."appId" = ${app.id} GROUP BY e.type, e.properties ORDER BY count DESC, e.type`

  stats = stats.map(stat => {
    const props = JSON.parse(stat.properties)

    return { ...stat, properties: is.emptyObject(props) ? 'No properties' : JSON.stringify(props, null, 2) }
  }) as Stat[]

  const events = result.map(
    (e): Event => {
      const properties = JSON.parse(e.properties as string)

      return {
        ...e,
        properties: is.emptyObject(properties) ? 'No properties' : JSON.stringify(properties, null, 2),
        event_created_at: dayjs(e.event_created_at).format('DD/MM/YYYY\nHH:mm'),
      }
    },
  )

  const finalApp = {
    name: app.name,
    events,
  }

  cache.set(`${CacheKey.AppOne}-${key}`, JSON.stringify({ app: finalApp, stats }), { ttl: 0 })

  return {
    props: {
      app: {
        name: app.name,
        events,
      },
      stats,
    },
  }
}
