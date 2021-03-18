import Link from 'next/link'
import { PropsWithChildren } from 'react'

interface AppBarProps {
  title?: string
}

export default function AppBar({ title, children }: PropsWithChildren<AppBarProps>) {
  return (
    <div className="w-full flex fixed top-0 z-10 left-0 h-16 bg-background flex items-center px-4">
      <Link href="/">
        <a className="text-lg text-headline font-medium hover:underline">Home</a>
      </Link>
      <h1 className="text-headline text-center font-bold ml-auto">{title ?? 'Telemetry'}</h1>
      <div className="ml-auto">{children}</div>
    </div>
  )
}
