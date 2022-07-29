import { collection, getDoc, doc, addDoc, Timestamp, writeBatch } from 'firebase/firestore'

import { PostEventV2 } from '@dto/events/dto'
import createApi, { createNotFound } from '@helpers/api'
import { getFirestore } from '@helpers/firebase/firestore'
import validation from '@helpers/middleware/validation'

const api = createApi()
const db = getFirestore()

api.post(validation(PostEventV2), async (req, res) => {
  const dto = req.body as PostEventV2
  const appsDbRef = collection(db, 'apps')
  const appDoc = await getDoc(doc(appsDbRef, dto.appId))

  if (!appDoc.exists()) {
    createNotFound(res, `app with id ${dto.appId} not found`)
    return
  }

  const eventsDbRef = collection(appDoc.ref, 'events')

  const eventDoc = doc(eventsDbRef)

  const event = await addDoc(eventsDbRef, {
    type: dto.type,
    properties: dto.properties,
    createTime: Timestamp.now(),
  })

  const batch = writeBatch(db)
  const now = Timestamp.now()

  batch.set(eventDoc, {
    type: dto.type,
    properties: dto.properties,
    createTime: now,
  })

  batch.update(appDoc.ref, {
    updateTime: now,
  })

  await batch.commit()

  res.status(201).send({ data: event })
})

export default api
