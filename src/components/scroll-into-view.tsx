'use client'

import { useEffect, useRef } from 'react'

/** Scrolls its parent into view when it mounts: give it a `key` to scroll again. */
export function ScrollIntoView() {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ref.current?.parentElement?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' })
  }, [])

  return <span ref={ref} hidden />
}
