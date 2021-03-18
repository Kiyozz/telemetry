import is from '@sindresorhus/is'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'

import AppBar from '../components/app-bar'
import cache, { CacheKey } from '../helpers/cache'
import prisma from '../helpers/database'

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
  console.log((Date.now() / 1000).toFixed(3))
  const cached = await cache.get(CacheKey.Apps)

  if (is.string(cached)) {
    console.log('-', (Date.now() / 1000).toFixed(3))
    return {
      props: JSON.parse(cached) as Props,
    }
  }

  const apps = await prisma.app.findMany({ select: { name: true, key: true } })

  cache.set(CacheKey.Apps, JSON.stringify({ apps }), { ttl: 3600 })
  console.log((Date.now() / 1000).toFixed(3))

  return {
    props: {
      apps,
    },
  }
}
