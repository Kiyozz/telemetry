import Link from 'next/link'
import { useRouter } from 'next/router'
import type { PropsWithChildren, ReactNode } from 'react'

interface AppBarProps {
  title?: ReactNode
}

export default function AppBar({ title, children }: PropsWithChildren<AppBarProps>) {
  const router = useRouter()

  const isHomeDisabled = router.pathname === '/'

  return (
    <div className="w-full flex fixed top-0 z-10 left-0 h-16 bg-background flex items-center px-4">
      <Link href="/">
        <a className="text-lg font-medium hover:underline absolute left-4 text-primary-400" hidden={isHomeDisabled}>
          Home
        </a>
      </Link>
      <h1 className="text-headline text-center font-bold mx-auto">{title ?? 'Telemetry'}</h1>
      <div className="absolute right-4">{children}</div>
    </div>
  )
}
