import is from '@sindresorhus/is'

import { PostEvent } from '../../../../dto/events/dto'
import createApi from '../../../../helpers/api'
import prisma from '../../../../helpers/database'
import { validation } from '../../../../helpers/middleware'

const api = createApi()

api.post(validation(PostEvent), async (req, res) => {
  const dto = req.body as PostEvent
  const app = await prisma.app.findUnique({ where: { key: dto.appKey }, select: { id: true } })

  if (is.null_(app)) {
    res.status(404).json({ error: 'appKey not found' })
    return
  }

  const event = await prisma.event.create({
    data: { appId: app.id, type: dto.type, properties: dto.propertiesString },
  })

  res.status(201).json({ data: event })
})

export default api
