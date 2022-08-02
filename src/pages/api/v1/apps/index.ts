import { PostApp } from '@/dto'
import { createUuid, prisma, createApi, validation, createOk } from '@/helpers/server'

const api = createApi()

api.post(validation(PostApp), async (req, res) => {
  const dto = req.body as PostApp
  const app = await prisma.app.create({ data: { name: dto.name, key: createUuid() } })

  createOk(res, app, 201)
})

api.get(async (req, res) => {
  const apps = await prisma.app.findMany({ orderBy: { updatedAt: 'desc' } })

  createOk(res, apps)
})

export default api
