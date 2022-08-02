import { UseQueryOptions } from '@tanstack/react-query'
import ky from 'ky'

import { Summary } from '@/models'

interface UseAppSummaryReturns {
  summary: Summary[]
  summaryWithoutProperties: Omit<Summary, 'properties'>[]
}

export function useAppSummaryQueryOptions(appId: string | undefined, options?: UseQueryOptions<UseAppSummaryReturns>) {
  return {
    queryKey: ['apps', appId, 'summary'],
    queryFn: async () => {
      if (!appId) {
        return []
      }

      const {
        data: { summary, summaryWithoutProperties },
      } = await ky
        .get(`/api/v1/apps/${appId}/summary`)
        .json<{ data: { summary: Summary[]; summaryWithoutProperties: Omit<Summary, 'properties'>[] } }>()

      return {
        summary,
        summaryWithoutProperties,
      }
    },
    enabled: Boolean(appId),
    ...options,
  } as UseQueryOptions<UseAppSummaryReturns>
}
