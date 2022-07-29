import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { doc, getDoc } from 'firebase/firestore'

import { App } from '@models/app'

import { useCollection } from './firestore/use-collection'

export function useAppQueryOptions<T>(
  appId: string | undefined,
  options?: Partial<UseQueryOptions<App & T>>,
): UseQueryOptions<App & T> {
  const dbRef = useCollection('apps')

  return {
    queryKey: ['apps', appId],
    queryFn: async () => {
      if (!appId) {
        throw new TypeError('no appId')
      }

      const appSnapshot = await getDoc(doc(dbRef, appId))

      if (!appSnapshot.exists()) {
        throw new TypeError('app does not exist')
      }

      return {
        id: appSnapshot.id,
        ...appSnapshot.data(),
      } as App & T
    },
    enabled: Boolean(appId),
    ...options,
  }
}

export function useApp<T>(appId: string | undefined, options?: Partial<UseQueryOptions<App & T>>) {
  return useQuery(useAppQueryOptions<T>(appId, options))
}
