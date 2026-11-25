import { readProperties } from '@/lib/anonymize'
import { fail, ok } from '@/lib/api'
import { prisma } from '@/lib/db'

export async function GET(_request: Request, { params }: RouteContext<'/api/v1/apps/[key]/summary'>) {
  const { key } = await params
  const app = await prisma.app.findUnique({ where: { key }, select: { id: true } })

  if (!app) {
    return fail(404, `${key} not found`)
  }

  const [byType, byProperties] = await Promise.all([
    prisma.$queryRaw<{ type: string; count: bigint }[]>`
      SELECT e.type, COUNT(*) AS count
      FROM events e
      WHERE e.app_id = ${app.id}
      GROUP BY e.type
      ORDER BY count DESC, e.type`,
    prisma.$queryRaw<{ type: string; count: bigint; properties: unknown }[]>`
      SELECT e.type, COUNT(*) AS count, e.properties
      FROM events e
      WHERE e.app_id = ${app.id}
      GROUP BY e.type, e.properties
      ORDER BY count DESC, e.type`,
  ])

  return ok(
    {
      summary: byProperties.map((row, id) => ({
        id,
        type: row.type,
        count: Number(row.count),
        properties: JSON.stringify(readProperties(row.properties)),
      })),
      summaryWithoutProperties: byType.map((row, id) => ({ id, type: row.type, count: Number(row.count) })),
    },
    { maxAge: 300 },
  )
}
