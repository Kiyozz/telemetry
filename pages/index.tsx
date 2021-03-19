import is from '@sindresorhus/is'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'

import AppBar from '../components/app-bar'
import cache from '../helpers/cache'
import prisma from '../helpers/database'
import time from '../helpers/time'

interface Props {
  apps: { name: string; key: string }[]
}

export default function Home({ apps }: Props) {
  return (
    <>
      <Head>
        <title>Telemetry - all apps</title>
      </Head>
      <AppBar />
      <div className="p-4 grid grid-flow-col gap-4 bg-background mt-16">
        {!is.emptyArray(apps) ? (
          apps.map(app => (
            <div key={app.key}>
              <Link href={`/apps/${app.key}`}>
                <a className="bg-primary-400 hover:bg-primary-500 text-lg transition-colors rounded py-2 px-3 flex justify-center items-center">
                  {app.name}
                </a>
              </Link>
            </div>
          ))
        ) : (
          <p className="text-paragraph">No apps yet</p>
        )}
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  console.log('--------')

  const timer = time('apps')
  const timerCache = time('apps/cache')
  const cached = await cache.getApps<string>()

  timerCache()

  if (is.string(cached)) {
    timer()
    console.log('apps/cached')

    return {
      props: JSON.parse(cached) as Props,
    }
  }

  const timerGetApps = time('apps/findMany')
  const apps = await prisma.app.findMany({ select: { name: true, key: true } })

  timerGetApps()
  cache.setApps(JSON.stringify({ apps }))
  timer()

  return {
    props: {
      apps,
    },
  }
}
