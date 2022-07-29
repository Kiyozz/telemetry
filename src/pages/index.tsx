import is from '@sindresorhus/is'
import Head from 'next/head'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

import { App } from '@models/app'

import AppBar from '../components/app-bar'
import { useApps } from '../hooks/use-apps'

export default function Home() {
  const {
    data: apps,
    isLoading,
    isSuccess,
  } = useApps({
    onSuccess: () => {
      toast.success('Apps loaded', { id: 'apps' })
    },
    onError: err => {
      console.error('get apps error', err)
      toast.error('Apps failed to load', { id: 'apps' })
    },
  })

  return (
    <>
      <Head>
        <title>Telemetry - all apps</title>
      </Head>
      <AppBar />
      {isLoading && 'Loading...'}
      {isSuccess && (
        <div className="p-4 grid grid-flow-col gap-4 bg-background mt-16">
          {!is.emptyArray(apps) ? (
            apps.map((app: App) => (
              <div key={app.id}>
                <Link href={`/apps/${app.id}`}>
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
      )}
    </>
  )
}
