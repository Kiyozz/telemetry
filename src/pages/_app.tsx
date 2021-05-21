import '../styles/tailwind.css'
import '../styles/globals.css'
import '../styles/utilities.css'
import { AppProps } from 'next/app'
import { Router } from 'next/router'
import { useEffect, useState } from 'react'

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
    <>
      {isLoading && (
        <div className="fixed text-2xl bottom-0 flex justify-center items-center left-1/2 transform -translate-x-1/2 h-16 p-4 text-text">
          Loading
        </div>
      )}
      <Component {...pageProps} />
    </>
  )
}

export default MyApp
