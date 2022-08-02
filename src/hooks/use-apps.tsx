import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import ky from 'ky'

import { App } from '@/models/app'

export function useApps(options?: Partial<UseQueryOptions<App[]>>) {
  return useQuery({
    queryKey: ['apps'],
    queryFn: async () => {
      const { data: apps } = await ky.get('/api/v1/apps').json<{ data: App[] }>()

      return apps
    },
    ...options,
  })
}
