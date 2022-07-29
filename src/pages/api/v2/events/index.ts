import { collection, getDoc, doc, addDoc, Timestamp } from 'firebase/firestore'

import { PostEventV2 } from '@/dto'
import { firestore } from '@/helpers'
import { createApi, createNotFound, validation } from '@/helpers/server'
import { contentType } from '@/helpers/server/middleware/content-type'

const api = createApi()

api.post(contentType('application/json'), validation(PostEventV2), async (req, res) => {
  const dto = req.body as PostEventV2
  const appsDbRef = collection(firestore, 'apps')
  const appDoc = await getDoc(doc(appsDbRef, dto.appId))

  if (!appDoc.exists()) {
    createNotFound(res, `app with id ${dto.appId} not found`)
    return
  }

  const eventsDbRef = collection(appDoc.ref, 'events')

  const now = Timestamp.now()

  const event = await addDoc(eventsDbRef, {
    type: dto.type,
    properties: dto.properties,
    createTime: now,
  })

  res.status(201).send({ data: event })
})

export default api
