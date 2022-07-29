import admin from 'firebase-admin'
import functions, { logger } from 'firebase-functions'

admin.initializeApp()

async function triggerAppEventUpdateTime(appId: string) {
  const appDoc = await admin.firestore().collection('apps').doc(appId)
  const appSnap = await appDoc.get()

  if (!appSnap.exists) {
    return
  }

  await appDoc.update({
    updateTime: admin.firestore.FieldValue.serverTimestamp(),
  })
}

export const OnCreateAppEvent = functions
  .region('europe-west1')
  .firestore.document('apps/{appId}/events/{eventId}')
  .onCreate(async (snap, context) => {
    // update the updateTime app from appId
    logger.log('onCreateAppEvent', { params: context.params })
    const appId = context.params.appId

    await triggerAppEventUpdateTime(appId)
  })

export const OnUpdateAppEvent = functions
  .region('europe-west1')
  .firestore.document('apps/{appId}/events/{eventId}')
  .onUpdate(async (snap, context) => {
    // update the updateTime app from appId
    logger.log('OnUpdateAppEvent', { params: context.params })
    const appId = context.params.appId

    await triggerAppEventUpdateTime(appId)
  })

export const OnDeleteAppEvent = functions
  .region('europe-west1')
  .firestore.document('apps/{appId}/events/{eventId}')
  .onDelete(async (snap, context) => {
    // update the updateTime app from appId
    logger.log('OnDeleteAppEvent', { params: context.params })
    const appId = context.params.appId

    await triggerAppEventUpdateTime(appId)
  })
