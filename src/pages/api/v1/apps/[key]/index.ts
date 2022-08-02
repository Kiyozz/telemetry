import is from '@sindresorhus/is'

import { PutApp } from '@/dto'
import { validation, prisma, createApi, createNotFound, createBadRequest, createOk } from '@/helpers/server'

const api = createApi()

api.put(validation(PutApp), async (req, res) => {
  const dto = req.body as PutApp
  const key = req.query.key as string | undefined

  if (is.undefined(key)) {
    createBadRequest(res, 'Missing key')
    return
  }

  const app = await prisma.app.update({ where: { key }, data: { name: dto.name } })

  if (is.null_(app)) {
    createNotFound(res, `${key} not found`)
    return
  }

  createOk(res, app)
})

api.get(async (req, res) => {
  const key = req.query.key as string | undefined

  if (is.undefined(key)) {
    createBadRequest(res, 'Missing key')
    return
  }

  const app = await prisma.app.findUnique({ where: { key } })

  if (is.null_(app)) {
    createNotFound(res, `${key} not found`)
    return
  }

  createOk(res, app)
})

export default api
