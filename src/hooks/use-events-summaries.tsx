import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { collection, getDocs } from 'firebase/firestore'

import { Summary } from '@models/summary'

import { useFirestore } from './firestore/use-firestore'

export function useEventsSummariesQueryOptions<
  T extends boolean,
  R = T extends true ? Summary : Omit<Summary, 'properties'>,
>(appId: string | undefined, useProperties: T = true as T, options?: UseQueryOptions<R[]>) {
  const db = useFirestore()

  return {
    queryKey: ['events', appId, useProperties],
    queryFn: async () => {
      if (!appId) {
        return []
      }

      const dbRef = collection(db, 'apps', appId, 'events')
      const eventsSnapshot = await getDocs(dbRef)

      const summary = eventsSnapshot.docs.reduce((acc, evt) => {
        const data = evt.data()
        const key = `${data.type}${useProperties ? JSON.stringify(data.properties ?? {}) : ''}`

        if (!acc[key]) {
          if (useProperties) {
            acc[key] = {
              id: evt.id,
              type: data.type as string,
              properties: data.properties ?? {},
              count: 0,
            } as unknown as R
          } else {
            acc[key] = {
              id: evt.id,
              type: data.type as string,
              count: 0,
            } as unknown as R
          }
        }

        ;(acc[key] as unknown as { count: number }).count++

        return acc
      }, {} as Record<string, R>)

      return Object.values(summary)
    },
    enabled: Boolean(appId),
    ...options,
  }
}

export function useEventsSummaries<T extends boolean, R = T extends true ? Summary : Omit<Summary, 'properties'>>(
  appId: string | undefined,
  useProperties: T = true as T,
  options?: UseQueryOptions<R[]>,
) {
  return useQuery(useEventsSummariesQueryOptions(appId, useProperties, options))
}
