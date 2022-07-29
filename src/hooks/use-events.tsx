import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { getDocs, orderBy, query } from 'firebase/firestore'

import { collection } from '@/helpers'
import { Event } from '@/models/event'

export function useEventsQueryOptions(appId?: string, options?: UseQueryOptions<Event[]>) {
  return {
    queryKey: ['apps', appId, 'events'],
    queryFn: async () => {
      if (!appId) {
        return []
      }

      const dbRef = collection('apps', appId, 'events')
      const eventsSnapshot = await getDocs(query(dbRef, orderBy('createTime', 'desc')))

      return eventsSnapshot.docs.map(doc => {
        return {
          id: doc.id,
          ...doc.data(),
        } as Event
      })
    },
    enabled: Boolean(appId),
    ...options,
  }
}

export function useEvents(appId?: string, options?: UseQueryOptions<Event[]>) {
  return useQuery(useEventsQueryOptions(appId, options))
}
