import { PropsWithChildren } from 'react'

interface LineProps {
  className?: string
}

export default function Line({ className, children }: PropsWithChildren<LineProps>) {
  return <li className={`py-2 px-3 rounded bg-primary-300 mb-1 ${className ?? ''}`.trim()}>{children}</li>
}
