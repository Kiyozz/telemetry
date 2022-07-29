import { connectFirestoreEmulator, getFirestore as getFirebaseFirestore } from 'firebase/firestore'

import { app } from '@/helpers/firebase/app'

let firestore: ReturnType<typeof getFirebaseFirestore>

type GlobalWithFirestore = {
  firestore: typeof firestore
}

if (process.env.NODE_ENV === 'production') {
  firestore = getFirebaseFirestore(app)
} else {
  if (!(global as unknown as GlobalWithFirestore).firestore) {
    ;(global as unknown as GlobalWithFirestore).firestore = getFirebaseFirestore(app)

    connectFirestoreEmulator(
      (global as unknown as GlobalWithFirestore).firestore,
      process.env.NEXT_PUBLIC_FIRESTORE_HOST ?? '',
      Number(process.env.NEXT_PUBLIC_FIRESTORE_PORT ?? 0),
    )
  }

  firestore = (global as unknown as GlobalWithFirestore).firestore
}

export function getFirestore() {
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

export { firestore }
