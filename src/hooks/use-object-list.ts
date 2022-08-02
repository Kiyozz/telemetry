import is from '@sindresorhus/is'
import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { Reducer, useEffect, useReducer } from 'react'
import { toast } from 'react-hot-toast'

import { AppEvent } from '@/models'

type Action<T extends ListObject<object>> =
  | {
      type: 'filter'
      payload: {
        query: string
        from: T
      }
    }
  | {
      type: 'set'
      payload: T
    }

function filterSearch<T extends ListObject>(obj: T, query: string): T {
  return Object.keys(obj).reduce((acc, key: keyof T) => {
    if (obj[key].type.toLowerCase().includes(query.toLowerCase())) {
      acc[key] = obj[key]
    }

    return acc
  }, {} as T)
}

function reducer<T extends ListObject>(state: T, action: Action<T>) {
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

type ObjectType = Pick<AppEvent, 'type'>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ListObject<T = any> = Record<keyof T, ObjectType>
type UseQueryData<T> = T extends UseQueryOptions<infer U> ? U : never

type UseObjectListOptions<Q extends UseQueryOptions, D extends UseQueryData<Q>, T extends ListObject<D>> = {
  onReset: () => void
  query: UseQueryOptions<T>
} & ToastOptions

export function useObjectList<Q extends UseQueryOptions, D extends UseQueryData<Q>, T extends ListObject<D>>({
  onReset,
  useToast = false,
  successMessage,
  errorMessage,
  query: options,
}: UseObjectListOptions<Q, D, T>) {
  const [list, dispatch] = useReducer<Reducer<T, Action<T>>>(reducer, {} as T)

  const {
    data: queryData,
    isSuccess,
    isLoading,
    isLoadingError,
  } = useQuery<T>({
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
    list: is.emptyObject(list) ? undefined : list,
    data: queryData,
    isSuccess,
    isLoading,
    isLoadingError,
  }
}
