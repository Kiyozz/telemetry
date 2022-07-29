import is from '@sindresorhus/is'

import { PostEventV1 } from '@dto/events/dto'
import createApi, { createNotFound } from '@helpers/api'
import prisma from '@helpers/database'
import validation from '@helpers/middleware/validation'

const api = createApi()

api.post(validation(PostEventV1), async (req, res) => {
  const dto = req.body as PostEventV1
  const app = await prisma.app.findUnique({ where: { key: dto.appKey }, select: { id: true } })

  if (is.null_(app)) {
    createNotFound(res, 'appKey not found')
    return
  }

  const event = await prisma.event.create({
    data: { appId: app.id, type: dto.type, properties: dto.propertiesString },
  })

  res.status(201).json({ data: event })
})

export default api
