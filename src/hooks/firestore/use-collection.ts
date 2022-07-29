import { collection, CollectionReference, DocumentData, DocumentReference } from 'firebase/firestore'

import { useFirestore } from './use-firestore'

export function useCollection<T = DocumentData>(
  colRef: CollectionReference,
  path: string,
  ...paths: string[]
): CollectionReference<T>
export function useCollection<T = DocumentData>(
  docRef: DocumentReference,
  path: string,
  ...paths: string[]
): CollectionReference<T>
export function useCollection<T = DocumentData>(path: string, ...paths: string[]): CollectionReference<T>
export function useCollection<T = DocumentData>(
  pathOrRef: CollectionReference | DocumentReference | string,
  path: string,
  ...paths: string[]
): CollectionReference<T> {
  const db = useFirestore()

  if (pathOrRef instanceof DocumentReference) {
    return collection(pathOrRef, path, ...paths) as CollectionReference<T>
  }

  if (pathOrRef instanceof CollectionReference) {
    return collection(pathOrRef, path, ...paths) as CollectionReference<T>
  }

  if (path) {
    return collection(db, pathOrRef, path, ...paths) as CollectionReference<T>
  }

  return collection(db, pathOrRef, ...paths) as CollectionReference<T>
}
