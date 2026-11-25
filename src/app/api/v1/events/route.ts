import { anonymize } from '@/lib/anonymize'
import { fail, readJson, validationError } from '@/lib/api'
import { prisma } from '@/lib/db'
import { eventBody } from '@/lib/schemas'

export async function POST(request: Request) {
  const parsed = eventBody.safeParse(await readJson(request))

  if (!parsed.success) {
    return validationError(parsed.error)
  }

  const { appKey, type, properties } = parsed.data
  const app = await prisma.app.findUnique({ where: { key: appKey }, select: { id: true } })

  if (!app) {
    return fail(404, 'appKey not found')
  }

  const [event] = await prisma.$transaction([
    prisma.event.create({
      data: { appId: app.id, type, properties: anonymize(properties) as object },
      select: { id: true, type: true, properties: true, appId: true, createdAt: true },
    }),
    prisma.app.update({ where: { id: app.id }, data: { updatedAt: new Date() }, select: { id: true } }),
  ])

  return Response.json({ data: event }, { status: 201 })
}
