import is from '@sindresorhus/is'
import dayjs from 'dayjs'
import { GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'

import prisma from '../../helpers/database'

type Stats = Record<string, number>

interface Props {
  app: {
    events: {
      id: number
      type: string
      properties: Record<string, unknown>
      createdAt: string
    }[]
    name: string
  }
  stats: Stats
}

function sortStats(stats: Stats): [string, number][] {
  const obj = Object.entries(stats)

  obj.sort(([, aP], [, bP]) => {
    if (aP < bP) {
      return 1
    }

    if (bP < aP) {
      return -1
    }

    return 0
  })

  return obj
}

export default function TelemetryView({ app, stats }: Props) {
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
                    </tr>
                  </thead>
                  <tbody className="text-center bg-gray-300">
                    {sortStats(stats).map(([k, p]) => (
                      <tr key={k} className="border-t">
                        <td className="p-2">{k}</td>
                        <td>{p}</td>
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
                        <tr key={event.id} className="border-t">
                          <td className="p-1 sm:p-2">{event.type}</td>
                          <td className="p-1 sm:p-2">{event.createdAt}</td>
                          <td className="p-1 sm:p-2">
                            {is.emptyObject(event.properties)
                              ? 'No properties'
                              : JSON.stringify(event.properties, null, 2)}
                          </td>
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
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps<Props, { key: string }> = async context => {
  const { key } = context.params

  const app = await prisma.app.findUnique({
    where: { key },
    select: {
      events: true,
      name: true,
    },
  })

  if (is.null_(app)) {
    return {
      notFound: true,
    }
  }

  const stats = app.events.reduce((acc, item) => {
    if (is.undefined(acc[item.type])) {
      acc[item.type] = 1
    } else {
      acc[item.type] += 1
    }

    return acc
  }, {} as Stats)

  return {
    props: {
      app: {
        ...app,
        events: app.events.map(e => ({
          ...e,
          properties: JSON.parse(e.properties as string),
          createdAt: dayjs(e.createdAt).format('DD/MM/YYYY\nHH:mm'),
        })),
      },
      stats,
    },
    revalidate: 60,
  }
}
