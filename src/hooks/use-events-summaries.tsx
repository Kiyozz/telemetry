import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { getDocs } from 'firebase/firestore'

import { collection } from '@/helpers'
import { Summary } from '@/models/summary'

export function useEventsSummariesQueryOptions<
  T extends boolean,
  R extends Omit<Summary, 'properties'> = T extends true ? Summary : Omit<Summary, 'properties'>,
>(appId: string | undefined, useProperties: T = true as T, options?: UseQueryOptions<R[]>) {
  return {
    queryKey: ['apps', appId, 'events', { useProperties }],
    queryFn: async () => {
      if (!appId) {
        return []
      }

      const dbRef = collection('apps', appId, 'events')
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

        acc[key].count++

        return acc
      }, {} as Record<string, R>)

      return Object.values(summary).sort((a, b) => {
        if (a.count < b.count) {
          return 1
        }

        if (a.count > b.count) {
          return -1
        }

        return 0
      })
    },
    enabled: Boolean(appId),
    ...options,
  }
}

export function useEventsSummaries<
  T extends boolean,
  R extends Omit<Summary, 'properties'> = T extends true ? Summary : Omit<Summary, 'properties'>,
>(appId: string | undefined, useProperties: T = true as T, options?: UseQueryOptions<R[]>) {
  return useQuery(useEventsSummariesQueryOptions(appId, useProperties, options))
}
