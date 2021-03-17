import is from '@sindresorhus/is'
import dayjs from 'dayjs'
import { GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'

import prisma from '../../helpers/database'

interface Stat {
  type: string
  count: number
  properties: string
}

interface Props {
  app: {
    events: {
      id: number
      type: string
      properties: string
      createdAt: string
    }[]
    name: string
  }
  stats: Stat[]
}

export default function TelemetryView({ app, stats }: Props) {
  const router = useRouter()

  if (router.isFallback) {
    return (
      <div className="fixed top-0 left-0 w-full h-full bg-white flex justify-center items-center text-2xl md:text-5xl">
        Loading...
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Telemetry {app.name}</title>
      </Head>
      <div className="p-4">
        <div className="flex flex-col sm:flex-row text-center sm:text-left">
          <Link href="/">
            <a className="mb-4 sm:mb-0 text-blue-500 hover:underline text-3xl">Home</a>
          </Link>
          <h1 className="font-bold text-2xl sm:text-5xl text-center mx-auto">Application {app.name}</h1>
        </div>
        <div className="grid grid-cols- sm:grid-cols-2 mt-8">
          <div className="overflow-auto">
            <h2 className="text-xl font-medium sm:font-bold">Number of events</h2>
            {!is.emptyObject(stats) ? (
              <div className="mt-4 w-full overflow-auto">
                <table>
                  <thead className="bg-blue-400">
                    <tr>
                      <th className="p-2">Name</th>
                      <th className="p-2">Count</th>
                      <th className="p-2">Properties</th>
                    </tr>
                  </thead>
                  <tbody className="text-center bg-gray-300">
                    {stats.map(({ type, count, properties }) => (
                      <tr key={type + properties} className="border-t">
                        <td className="p-1 sm:p-2 text-sm">{type}</td>
                        <td className="p-1 sm:p-2 text-xs">{count}</td>
                        <td className="p-1 sm:p-2 text-xs tracking-tighter font-light">{properties}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <>No events yet</>
            )}
          </div>
          <div className="sm:ml-4 mt-4 sm:mt-0 overflow-auto">
            <div className="flex flex-col">
              <h2 className="font-medium sm:font-bold text-xl">Details</h2>

              {app.events.length > 0 ? (
                <div className="w-full overflow-auto">
                  <table className="mt-4 overflow-auto">
                    <thead className="bg-blue-400">
                      <tr className="text-center">
                        <th className="p-1 sm:p-2">Type</th>
                        <th className="p-1 sm:p-2">Time</th>
                        <th className="p-1 sm:p-2">Properties</th>
                      </tr>
                    </thead>
                    <tbody className="text-center bg-gray-300">
                      {app.events.map(event => (
                        <tr key={event.id} className="border-t text-xs">
                          <td className="p-1 sm:p-2">{event.type}</td>
                          <td className="p-1 sm:p-2">{event.createdAt}</td>
                          <td className="p-1 sm:p-2 font-light tracking-tighter">{event.properties}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <>No events yet</>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export const getStaticPaths: GetStaticPaths<{ key: string }> = async () => {
  const apps = await prisma.app.findMany({ select: { key: true } })

  return {
    paths: apps.map(app => ({
      params: { key: `${app.key}` },
    })),
    fallback: true,
  }
}

export const getStaticProps: GetStaticProps<Props, { key: string }> = async context => {
  const { key } = context.params

  const app = await prisma.app.findUnique({
    where: { key },
    select: {
      events: {
        select: {
          createdAt: true,
          type: true,
          properties: true,
          id: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
      name: true,
      id: true,
    },
  })

  if (is.null_(app)) {
    return {
      notFound: true,
    }
  }

  let stats = await prisma.$queryRaw<
    Stat[]
  >`SELECT e.type, COUNT(e.type) as count, e.properties FROM events e WHERE e."appId" = ${app.id} GROUP BY e.type, e.properties ORDER BY count DESC, e.type`

  stats = stats.map(stat => {
    const props = JSON.parse(stat.properties)

    return { ...stat, properties: is.emptyObject(props) ? 'No properties' : JSON.stringify(props, null, 2) }
  }) as Stat[]

  return {
    props: {
      app: {
        ...app,
        events: app.events.map(e => {
          const properties = JSON.parse(e.properties as string)

          return {
            ...e,
            properties: is.emptyObject(properties) ? 'No properties' : JSON.stringify(properties, null, 2),
            createdAt: dayjs(e.createdAt).format('DD/MM/YYYY\nHH:mm'),
          }
        }),
      },
      stats,
    },
    revalidate: 60,
  }
}
