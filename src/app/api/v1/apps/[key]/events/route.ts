import type { NextRequest } from 'next/server'

import { fail, ok, validationError } from '@/lib/api'
import { prisma } from '@/lib/db'
import { getEvents } from '@/lib/queries'
import { eventsQuery } from '@/lib/schemas'

export async function GET(request: NextRequest, { params }: RouteContext<'/api/v1/apps/[key]/events'>) {
  const { key } = await params
  const parsed = eventsQuery.safeParse(Object.fromEntries(request.nextUrl.searchParams))

  if (!parsed.success) {
    return validationError(parsed.error)
  }

  const app = await prisma.app.findUnique({ where: { key }, select: { id: true } })

  if (!app) {
    return fail(404, `${key} not found`)
  }

  return ok(await getEvents(app.id, parsed.data), { maxAge: 30 })
}
