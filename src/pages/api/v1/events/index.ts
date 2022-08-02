import is from '@sindresorhus/is'

import { PostEventV1 } from '@/dto'
import { validation, prisma, createNotFound, createApi } from '@/helpers/server'

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

  await prisma.app.update({
    where: { id: app.id },
    data: { updatedAt: new Date() },
  })

  res.status(201).json({ data: event })
})

export default api
