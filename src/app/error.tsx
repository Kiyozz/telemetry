'use client'

import { Button } from '@ui-sdk/react/button'

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="py-16 text-center">
      <h1 className="text-2xl font-semibold">The statistics could not be loaded</h1>
      <p className="mt-2 text-ink-muted">The database is probably unreachable. Try again in a moment.</p>
      {error.digest && <p className="mt-1 font-mono text-xs text-ink-muted">Error {error.digest}</p>}
      <Button className="mt-6" data-variant="solid" onClick={() => reset()}>
        Try again
      </Button>
    </div>
  )
}
