import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { getDocs } from 'firebase/firestore'

import { App } from '@models/app'

import { useCollection } from './firestore/use-collection'

export function useApps(options?: Partial<UseQueryOptions<App[]>>) {
  const appDbRef = useCollection('apps')

  return useQuery({
    queryKey: ['apps'],
    queryFn: async () => {
      const appsSnapshot = await getDocs(appDbRef)

      return appsSnapshot.docs.map(d => {
        return {
          id: d.id,
          ...d.data(),
        }
      }) as App[]

      /*return fetch(`/api/v2/apps/GetApps`)
        .then(async res => {
          if (!res.ok) {
            throw new Error(await res.text())
          }

          return (await res.json()) as { apps: App[] }
        })
        .then(({ apps }) => apps)*/
    },
    ...options,
  })
}
