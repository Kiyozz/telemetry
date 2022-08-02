import is from '@sindresorhus/is'
import { plainToInstance } from 'class-transformer'

import { GetSummary } from '@/dto'
import { prisma, createApi, createNotFound, createOk, validateOrBadRequest } from '@/helpers/server'
import { Summary } from '@/models'

const api = createApi()

api.get(async (req, res) => {
  const dto = plainToInstance(GetSummary, req.query)

  if (!(await validateOrBadRequest(res, dto))) {
    return
  }

  const app = await prisma.app.findUnique({ where: { key: dto.key }, select: { id: true } })

  if (is.null_(app)) {
    createNotFound(res, `${dto.key} not found`)
    return
  }

  const summaryWithoutProperties = await prisma.$queryRaw<
    Omit<Summary, 'properties'>[]
  >`SELECT e.type, COUNT(e.type) as count
FROM events e
WHERE e.app_id = ${app.id}
GROUP BY e.type
ORDER BY count DESC, e.type`

  const summary = await prisma.$queryRaw<Summary[]>`SELECT e.type, COUNT(e.type) as count, e.properties
FROM events e
WHERE e.app_id = ${app.id}
GROUP BY e.type, e.properties
ORDER BY count DESC, e.type`

  createOk(res, {
    summary: summary.map((s, i) => ({
      ...s,
      id: i,
      count: Number(s.count),
    })),
    summaryWithoutProperties: summaryWithoutProperties.map((s, i) => ({
      ...s,
      id: i,
      count: Number(s.count),
    })),
  })
})

export default api
