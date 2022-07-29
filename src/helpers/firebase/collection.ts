import { collection as fbCollection, CollectionReference, DocumentData, DocumentReference } from 'firebase/firestore'

import { firestore } from '@/helpers'

export function collection<T = DocumentData>(
  colRef: CollectionReference,
  path: string,
  ...paths: string[]
): CollectionReference<T>
export function collection<T = DocumentData>(
  docRef: DocumentReference,
  path: string,
  ...paths: string[]
): CollectionReference<T>
export function collection<T = DocumentData>(path: string, ...paths: string[]): CollectionReference<T>
export function collection<T = DocumentData>(
  pathOrRef: CollectionReference | DocumentReference | string,
  path: string,
  ...paths: string[]
): CollectionReference<T> {
  if (pathOrRef instanceof DocumentReference) {
    return fbCollection(pathOrRef, path, ...paths) as CollectionReference<T>
  }

  if (pathOrRef instanceof CollectionReference) {
    return fbCollection(pathOrRef, path, ...paths) as CollectionReference<T>
  }

  if (path) {
    return fbCollection(firestore, pathOrRef, path, ...paths) as CollectionReference<T>
  }

  return fbCollection(firestore, pathOrRef, ...paths) as CollectionReference<T>
}
