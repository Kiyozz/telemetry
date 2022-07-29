import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { doc, getDoc } from 'firebase/firestore'

import { collection } from '@/helpers/firebase/collection'
import { App } from '@/models/app'

export function useAppQueryOptions<T>(
  appId: string | undefined,
  options?: Partial<UseQueryOptions<App & T>>,
): UseQueryOptions<App & T> {
  const dbRef = collection('apps')

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

export function useApp<T>(appId?: string, options?: Partial<UseQueryOptions<App & T>>) {
  return useQuery(useAppQueryOptions<T>(appId, options))
}
