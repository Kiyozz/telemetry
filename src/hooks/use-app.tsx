import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import ky from 'ky'

import { App } from '@/models'

export function useAppQueryOptions<T>(
  appKey: string | undefined,
  options?: Partial<UseQueryOptions<App & T>>,
): UseQueryOptions<App & T> {
  return {
    queryKey: ['apps', appKey],
    queryFn: async () => {
      if (!appKey) {
        throw new TypeError('no appId')
      }

      const { data: app } = await ky.get(`/api/v1/apps/${appKey}`).json<{ data: App & T }>()

      return app
    },
    enabled: Boolean(appKey),
    ...options,
  }
}

export function useApp<T>(appId?: string, options?: Partial<UseQueryOptions<App & T>>) {
  return useQuery(useAppQueryOptions<T>(appId, options))
}
