import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { collection, getDocs } from 'firebase/firestore'

import { Event } from '@models/event'

import { useFirestore } from './firestore/use-firestore'

export function useEventsQueryOptions(appId?: string, options?: UseQueryOptions<Event[]>) {
  const db = useFirestore()

  return {
    queryKey: ['events', appId],
    queryFn: async () => {
      if (!appId) {
        return []
      }

      const dbRef = collection(db, 'apps', appId, 'events')
      const eventsSnapshot = await getDocs(dbRef)

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
