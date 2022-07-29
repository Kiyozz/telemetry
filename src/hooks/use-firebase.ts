import { getApp } from '@helpers/firebase/app'

export function useFirebase() {
  return getApp()
}
