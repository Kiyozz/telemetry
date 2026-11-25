import { randomUUID } from 'node:crypto'

import { fail, isAdmin, ok, readJson, validationError } from '@/lib/api'
import { prisma } from '@/lib/db'
import { appBody } from '@/lib/schemas'

export async function GET() {
  const apps = await prisma.app.findMany({ orderBy: { updatedAt: 'desc' } })

  return ok(apps, { maxAge: 60 })
}

export async function POST(request: Request) {
  if (!isAdmin(request)) {
    return fail(401, 'Unauthorized')
  }

  const parsed = appBody.safeParse(await readJson(request))

  if (!parsed.success) {
    return validationError(parsed.error)
  }

  const app = await prisma.app.create({ data: { name: parsed.data.name, key: randomUUID() } })

  return ok(app, { status: 201 })
}
