import is from '@sindresorhus/is'

import { PutApp } from '../../../../dto/apps/dto'
import createApi, { createNotFound } from '../../../../helpers/api'
import cache, { CacheKey } from '../../../../helpers/cache'
import prisma from '../../../../helpers/database'
import { validation } from '../../../../helpers/middleware'

const api = createApi()

api.put(validation(PutApp), async (req, res) => {
  const dto = req.body as PutApp
  const key = req.query.key as string
  const app = await prisma.app.update({ where: { key }, data: { name: dto.name } })

  if (is.null_(app)) {
    createNotFound(res, `${key} not found`)
    return
  }

  cache.del(CacheKey.Apps)
  cache.del(`${CacheKey.AppOne}-${app.key}`)

  res.status(200).json({ data: app })
})

export default api
