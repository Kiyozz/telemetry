import { UseInfiniteQueryOptions, useQuery, UseQueryOptions } from '@tanstack/react-query'
import ky from 'ky'

import { AppEvent } from '@/models'

export function useEventsQueryOptions(appKey?: string, options?: UseQueryOptions<AppEvent[]>) {
  return {
    queryKey: ['apps', appKey, 'events', { page: 2 }],
    queryFn: async () => {
      if (!appKey) {
        return []
      }

      const { data: events } = await ky.get(`/api/v1/apps/${appKey}/events?page=2`).json<{ data: AppEvent[] }>()

      return events
    },
    enabled: Boolean(appKey),
    ...options,
  }
}

export function useInfiniteEventsQueryOptions(
  appKey?: string,
  options?: UseInfiniteQueryOptions<{ nextPage: number; data: AppEvent[] }>,
) {
  return {
    queryKey: ['apps', appKey, 'events'],
    queryFn: async ({ pageParam = 1 }) => {
      if (!appKey) {
        return []
      }

      const { data } = await ky
        .get(`/api/v1/apps/${appKey}/events?page=${pageParam}`)
        .json<{ data: { nextPage: number; data: AppEvent[] } }>()

      return {
        nextPage: data.nextPage,
        data: data.data,
      }
    },
    enabled: Boolean(appKey),
    getNextPageParam: lastPage => lastPage.nextPage,
    ...options,
  } as UseInfiniteQueryOptions<{ nextPage: number; data: AppEvent[] }>
}

export function useEvents(appKey?: string, options?: UseQueryOptions<AppEvent[]>) {
  return useQuery(useEventsQueryOptions(appKey, options))
}
