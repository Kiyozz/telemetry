import { connectFirestoreEmulator, getFirestore as getFirebaseFirestore } from 'firebase/firestore'

import { getApp } from '@helpers/firebase/app'

let firestore: ReturnType<typeof getFirebaseFirestore>

export function getFirestore() {
  const app = getApp()

  if (!firestore) {
    firestore = getFirebaseFirestore(app)

    connectFirestoreEmulator(
      firestore,
      process.env.NEXT_PUBLIC_FIRESTORE_HOST ?? '',
      Number(process.env.NEXT_PUBLIC_FIRESTORE_PORT ?? 0),
    )
  }

  return firestore
}
