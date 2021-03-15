import { GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'

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
      <div className="p-4 text-center text-3xl">
        {apps.map(app => (
          <div key={app.key}>
            <Link href={`/apps/${app.key}`}>
              <a className="text-blue-500 hover:underline">App {app.name}</a>
            </Link>
          </div>
        ))}
      </div>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    fallback: 'blocking',
    paths: [],
  }
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const apps = await prisma.app.findMany({ select: { name: true, key: true } })

  return {
    props: {
      apps,
    },
    revalidate: true,
  }
}
