import { getFirestore } from '@helpers/firebase/firestore'

export function useFirestore() {
  return getFirestore()
}
