import { PostApp } from '@/dto'
import { createUuid, prisma, createApi, validation } from '@/helpers/server'

const api = createApi()

api.post(validation(PostApp), async (req, res) => {
  const dto = req.body as PostApp
  const app = await prisma.app.create({ data: { name: dto.name, key: createUuid() } })

  res.status(201).json({ data: app })
})

export default api
