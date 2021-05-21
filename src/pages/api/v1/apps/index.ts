import { PostApp } from '../../../../dto/apps/dto'
import createApi from '../../../../helpers/api'
import prisma from '../../../../helpers/database'
import validation from '../../../../helpers/middleware/validation'
import createUuid from '../../../../helpers/uuid'

const api = createApi()

api.post(validation(PostApp), async (req, res) => {
  const dto = req.body as PostApp
  const app = await prisma.app.create({ data: { name: dto.name, key: createUuid() } })

  res.status(201).json({ data: app })
})

export default api
