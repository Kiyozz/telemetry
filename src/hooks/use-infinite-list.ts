import { useInfiniteQuery, UseInfiniteQueryOptions } from '@tanstack/react-query'
import { Reducer, useEffect, useReducer } from 'react'
import { toast } from 'react-hot-toast'

import { AppEvent } from '@/models'

type Action<T extends Pick<AppEvent, 'type'>> =
  | {
      type: 'filter'
      payload: {
        query: string
        from: T[]
      }
    }
  | {
      type: 'set'
      payload: T[]
    }

function filterSearch<T extends Pick<AppEvent, 'type'>>(array: T[], query: string): T[] {
  return array.filter(({ type }) => type.toLowerCase().includes(query.toLowerCase()))
}

function reducer<T extends Pick<AppEvent, 'type'>>(state: T[], action: Action<T>) {
  switch (action.type) {
    case 'filter':
      return filterSearch(action.payload.from, action.payload.query)
    case 'set':
      return action.payload
    default:
      return state
  }
}

type ToastOptions = {
  useToast?: boolean
  successMessage?: string
  errorMessage?: string
  toastId?: string
}

type UseListOptions<T extends Pick<AppEvent, 'type'>> = {
  onReset: () => void
  query: UseInfiniteQueryOptions<{ nextPage: number; data: T[] }>
} & ToastOptions

export function useInfiniteList<T extends Pick<AppEvent, 'type'>>({
  onReset,
  useToast = false,
  successMessage,
  errorMessage,
  query: options,
}: UseListOptions<T>) {
  const [list, dispatch] = useReducer<Reducer<T[], Action<T>>>(reducer, [])

  const {
    data: queryData,
    isFetchingNextPage,
    hasNextPage,
    isSuccess,
    isLoading,
    isLoadingError,
    fetchNextPage,
    isFetching,
  } = useInfiniteQuery<{ nextPage: number; data: T[] }>({
    ...options,
    onSuccess: data => {
      if (useToast && successMessage) {
        toast.success(successMessage)
      }

      options.onSuccess?.(data)
    },
    onError: err => {
      if (useToast && errorMessage) {
        toast.error(errorMessage)
      }

      console.error(err)

      options.onError?.(err)
    },
  })

  useEffect(() => {
    if (isSuccess && queryData) {
      dispatch({ type: 'set', payload: queryData.pages.map(p => p.data).flat() })
      onReset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, queryData])

  return {
    handleSubmit: (query: string) => {
      if (isSuccess && queryData) {
        dispatch({ type: 'filter', payload: { query, from: queryData.pages.map(p => p.data).flat() } })
      }
    },
    list,
    data: queryData,
    isSuccess,
    isLoading,
    isLoadingError,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  }
}
