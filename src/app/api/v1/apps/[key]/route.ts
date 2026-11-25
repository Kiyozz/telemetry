import { fail, isAdmin, ok, readJson, validationError } from '@/lib/api'
import { prisma } from '@/lib/db'
import { appBody } from '@/lib/schemas'

export async function GET(_request: Request, { params }: RouteContext<'/api/v1/apps/[key]'>) {
  const { key } = await params
  const app = await prisma.app.findUnique({ where: { key } })

  if (!app) {
    return fail(404, `${key} not found`)
  }

  return ok(app, { maxAge: 60 })
}

export async function PUT(request: Request, { params }: RouteContext<'/api/v1/apps/[key]'>) {
  if (!isAdmin(request)) {
    return fail(401, 'Unauthorized')
  }

  const { key } = await params
  const parsed = appBody.safeParse(await readJson(request))

  if (!parsed.success) {
    return validationError(parsed.error)
  }

  const { count } = await prisma.app.updateMany({ where: { key }, data: { name: parsed.data.name } })

  if (count === 0) {
    return fail(404, `${key} not found`)
  }

  return ok(await prisma.app.findUnique({ where: { key } }))
}
