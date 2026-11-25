import type { Metadata, Viewport } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'

import './globals.css'

export const metadata: Metadata = {
  title: { default: 'PCA Telemetry', template: '%s · PCA Telemetry' },
  description: 'Anonymous usage statistics of Papyrus Compiler App.',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f6f6f8' },
    { media: '(prefers-color-scheme: dark)', color: '#0b0b0d' },
  ],
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh">
        <header className="sticky top-0 z-20 border-b border-hairline bg-page/80 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
            <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
              <span aria-hidden className="grid size-7 place-items-center rounded-md bg-accent text-sm text-white">
                P
              </span>
              PCA Telemetry
            </Link>
          </div>
          <div
            aria-hidden
            className="pending-bar pointer-events-none absolute inset-x-0 -bottom-px h-0.5 overflow-hidden opacity-0 transition-opacity after:block after:h-full after:w-2/5 after:rounded-full after:bg-accent"
          />
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        <footer className="mx-auto max-w-6xl px-4 pb-10 text-sm text-ink-muted">
          All data is anonymous: no IP address, user name, file path or identifier is stored or shown.
        </footer>
      </body>
    </html>
  )
}
