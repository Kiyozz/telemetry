import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { Reducer, useEffect, useReducer } from 'react'
import { toast } from 'react-hot-toast'

import { Event } from '@/models/event'

type Action<T extends Pick<Event, 'type'>> =
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

function filterSearch<T extends Pick<Event, 'type'>>(array: T[], query: string): T[] {
  return array.filter(({ type }) => type.toLowerCase().includes(query.toLowerCase()))
}

function reducer<T extends Pick<Event, 'type'>>(state: T[], action: Action<T>) {
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

type UseListOptions<T extends Pick<Event, 'type'>> = {
  onReset: () => void
  query: UseQueryOptions<T[]>
} & ToastOptions

export function useList<T extends Pick<Event, 'type'>>({
  onReset,
  useToast = false,
  successMessage,
  errorMessage,
  query: options,
}: UseListOptions<T>) {
  const [list, dispatch] = useReducer<Reducer<T[], Action<T>>>(reducer, [])

  const {
    data: queryData,
    isSuccess,
    isLoading,
    isLoadingError,
  } = useQuery<T[]>({
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
      dispatch({ type: 'set', payload: queryData })
      onReset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, queryData])

  return {
    handleSubmit: (query: string) => {
      if (isSuccess) {
        dispatch({ type: 'filter', payload: { query, from: queryData } })
      }
    },
    list,
    data: queryData,
    isSuccess,
    isLoading,
    isLoadingError,
  }
}
