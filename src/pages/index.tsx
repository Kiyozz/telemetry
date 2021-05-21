import is from '@sindresorhus/is'
import { GetStaticPaths, InferGetStaticPropsType } from 'next'
import Head from 'next/head'
import Link from 'next/link'

import AppBar from '../components/app-bar'
import prisma from '../helpers/database'
import time from '../helpers/time'

export default function Home({ apps }: InferGetStaticPropsType<typeof getStaticProps>) {
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

export const getStaticProps = async () => {
  console.log('--------')

  const timerGetApps = time('apps/findMany')
  const apps = await prisma.app.findMany({ select: { name: true, key: true } })

  timerGetApps()

  return {
    props: {
      apps,
    },
    revalidate: 3600,
  }
}
