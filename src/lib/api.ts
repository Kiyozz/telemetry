import type { z } from 'zod'

export function ok<T>(data: T, { status = 200, maxAge = 0 }: { status?: number; maxAge?: number } = {}) {
  const headers = new Headers()

  if (maxAge > 0) {
    headers.set('Cache-Control', `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 5}`)
  }

  return Response.json({ data }, { status, headers })
}

export function fail(status: number, error: unknown) {
  return Response.json({ error }, { status })
}

export function validationError(error: z.ZodError) {
  return fail(
    400,
    error.issues.map(issue => ({ [issue.path.join('.') || 'body']: issue.message })),
  )
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json()
  } catch {
    return undefined
  }
}

/** Creating and renaming apps is open unless TELEMETRY_ADMIN_TOKEN is set. */
export function isAdmin(request: Request): boolean {
  const token = process.env.TELEMETRY_ADMIN_TOKEN

  if (!token) {
    return true
  }

  return request.headers.get('authorization') === `Bearer ${token}`
}
