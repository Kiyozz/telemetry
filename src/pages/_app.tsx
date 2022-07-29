import '../styles/tailwind.css'
import '../styles/globals.css'
import '../styles/utilities.css'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { AppProps } from 'next/app'
import { Router } from 'next/router'
import { useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchIntervalInBackground: false,
      staleTime: 90_000,
    },
  },
})

function MyApp({ Component, pageProps }: AppProps) {
  const [isLoading, setLoading] = useState(false)

  useEffect(() => {
    const start = () => {
      setLoading(true)
    }

    const end = () => {
      setLoading(false)
    }

    Router.events.on('routeChangeStart', start)
    Router.events.on('routeChangeComplete', end)
    Router.events.on('routeChangeError', end)

    return () => {
      Router.events.off('routeChangeStart', start)
      Router.events.off('routeChangeComplete', end)
      Router.events.off('routeChangeError', end)
    }
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      {isLoading && (
        <div className="fixed text-2xl bottom-0 flex justify-center items-center left-1/2 transform -translate-x-1/2 h-16 p-4 text-text">
          Loading
        </div>
      )}
      <Toaster />
      <Component {...pageProps} />
    </QueryClientProvider>
  )
}

export default MyApp
