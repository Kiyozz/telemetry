import is from '@sindresorhus/is'

import { PutApp } from '@/dto'
import { validation, prisma, createApi, createNotFound } from '@/helpers/server'

const api = createApi()

api.put(validation(PutApp), async (req, res) => {
  const dto = req.body as PutApp
  const key = req.query.key as string
  const app = await prisma.app.update({ where: { key }, data: { name: dto.name } })

  if (is.null_(app)) {
    createNotFound(res, `${key} not found`)
    return
  }

  res.status(200).send({ data: app })
})

export default api
