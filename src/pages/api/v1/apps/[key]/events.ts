import is from '@sindresorhus/is'
import { plainToInstance } from 'class-transformer'

import { GetEvents } from '@/dto'
import { prisma, createApi, createNotFound, createOk, validateOrBadRequest } from '@/helpers/server'

const api = createApi()

api.get(async (req, res) => {
  const dto = plainToInstance(GetEvents, req.query)

  if (!(await validateOrBadRequest(res, dto))) {
    return
  }

  const app = await prisma.app.findUnique({ where: { key: dto.key }, select: { id: true } })

  if (is.null_(app)) {
    createNotFound(res, `${dto.key} not found`)
    return
  }

  const events = await prisma.event.findMany({
    where: { appId: app.id },
    orderBy: { createdAt: 'desc' },
    skip: (dto.page - 1) * 150,
    take: 150,
  })

  const nextPage = events.length === 150 ? dto.page + 1 : undefined

  createOk(res, { nextPage, data: events })
})

export default api
