import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { AppProps } from 'next/app'
import { Router } from 'next/router'
import { useEffect, useState } from 'react'
import { toast, Toaster } from 'react-hot-toast'
import '../styles/globals.css'

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

  useEffect(() => {
    let time: NodeJS.Timeout

    if (isLoading) {
      time = setTimeout(() => {
        toast.loading('Loading...', {
          id: 'route_loading',
        })
      }, 200)
    }

    return () => {
      toast.dismiss('route_loading')
      clearTimeout(time)
    }
  }, [isLoading])

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster toastOptions={{ style: { minWidth: '200px' } }} />
      <Component {...pageProps} />
    </QueryClientProvider>
  )
}

export default MyApp
