import is from '@sindresorhus/is'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState } from 'react'
import type React from 'react'
import { useForm } from 'react-hook-form'

import { AppBar, Button, DataTable, Input } from '@/components'
import { formatDate, formatJson } from '@/helpers'
import {
  useApp,
  useAppSummaryQueryOptions,
  useInfiniteEventsQueryOptions,
  useInfiniteList,
  useObjectList,
} from '@/hooks'

export default function AppPage() {
  const router = useRouter()
  const appKey = router.query.key as string | undefined
  const [isEventsListActive, setEventsListActive] = useState(false)
  const [isAppSummaryActive, setSummaryActive] = useState(true)
  const [isSummaryPropertiesActive, setSummaryPropertiesActive] = useState(true)
  const { register, handleSubmit, reset: resetSummaryForm } = useForm({ defaultValues: { type: '' } })
  const {
    register: detailsRegister,
    handleSubmit: handleDetailsSubmit,
    reset: resetDetailsForm,
    getValues: getDetailsValues,
  } = useForm({ defaultValues: { type: '' } })
  const { data: app, isLoading: isLoadingApp, isSuccess: isSuccessApp } = useApp(appKey)
  const updatedAt = app?.updatedAt
  const {
    handleSubmit: handleSubmitEventsList,
    list: events,
    data: initialEvents,
    isSuccess: isSuccessEventsList,
    hasNextPage: hasNextPageEventsList,
    fetchNextPage: fetchNextEvents,
    isFetchingNextPage: isFetchingNextEvents,
    isFetching: isFetchingEventsList,
  } = useInfiniteList({
    onReset: () => {
      resetDetailsForm()
    },
    useToast: true,
    toastId: 'events-list',
    successMessage: 'Events list loaded',
    errorMessage: 'Cannot load events list',
    query: useInfiniteEventsQueryOptions(appKey, { enabled: isEventsListActive }),
  })
  const {
    handleSubmit: handleSubmitAppSummary,
    list: appSummary,
    data: initialAppSummary,
    isSuccess: isSuccessAppSummary,
    isLoading: isLoadingAppSummary,
  } = useObjectList({
    onReset: () => {
      resetSummaryForm()
    },
    useToast: true,
    toastId: 'summaries-list',
    successMessage: 'Summary loaded',
    errorMessage: 'Cannot load summary',
    query: useAppSummaryQueryOptions(appKey),
  })

  const onClickSummaryToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur()

    setSummaryActive(a => !a)
  }

  const onClickDetailsToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur()

    setEventsListActive(a => !a)
  }

  const onClickSummaryPropertiesActive = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur()

    setSummaryPropertiesActive(a => !a)
  }

  const onSubmitSummary = handleSubmit(data => {
    handleSubmitAppSummary(data.type)
  })

  const onSubmitEventsList = handleDetailsSubmit(data => {
    handleSubmitEventsList(data.type)
  })
  const appName = isLoadingApp ? 'Loading...' : app?.name ?? 'Error'
  const title = `Telemetry - app ${appName}`

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <AppBar
        title={
          isLoadingApp ? (
            'Loading...'
          ) : (
            <>
              <span className="hidden sm:inline">Application </span>
              {appName}
            </>
          )
        }
      >
        <div className="text-xs sm:text-lg">
          <span className="hidden sm:inline">Updated at </span>
          {isLoadingApp ? (
            <span>loading...</span>
          ) : !is.undefined(updatedAt) ? (
            <span>{formatDate(updatedAt, { space: true })}</span>
          ) : (
            <span>unknown</span>
          )}
        </div>
      </AppBar>

      {(isSuccessApp || isSuccessAppSummary) && (
        <div className="px-4 pb-4 mt-20">
          <div className="flex">
            <Button
              className="rounded-br-none rounded-tr-none border border-primary-400 border-r-0"
              onClick={onClickSummaryToggle}
              active={isAppSummaryActive}
            >
              Summary
            </Button>
            <Button
              className="rounded-bl-none rounded-tl-none border border-primary-400"
              onClick={onClickDetailsToggle}
              active={isEventsListActive}
            >
              Details
            </Button>
          </div>

          {isAppSummaryActive && (
            <div className="mt-4">
              <h2>Summary</h2>

              {isSuccessAppSummary && !is.undefined(initialAppSummary) && (
                <>
                  {is.nonEmptyArray(initialAppSummary.summary) && (
                    <form className="flex" onSubmit={onSubmitSummary}>
                      <Input className="rounded-tr-none rounded-br-none" defaultValue="" {...register('type')} />

                      <Button active className="rounded-bl-none rounded-tl-none">
                        Submit
                      </Button>
                    </form>
                  )}

                  {is.nonEmptyArray(initialAppSummary.summaryWithoutProperties) && (
                    <div className="mt-2">
                      <Button type="submit" onClick={onClickSummaryPropertiesActive} active={isSummaryPropertiesActive}>
                        Properties
                      </Button>
                    </div>
                  )}
                </>
              )}

              {isLoadingAppSummary && <div>Loading...</div>}

              {isSuccessApp &&
                !is.undefined(initialAppSummary) &&
                !is.undefined(appSummary) &&
                (isSummaryPropertiesActive && is.nonEmptyArray(initialAppSummary.summary) ? (
                  <DataTable
                    className="mt-4"
                    headers={['Type', 'Count', 'Properties']}
                    lines={appSummary.summary.map(({ id, type, count, properties }) => ({
                      key: id,
                      values: [
                        { key: `${id}-type`, value: type },
                        { key: `${id}-count`, value: count },
                        { key: `${id}-properties`, value: formatJson(properties) },
                      ],
                    }))}
                  />
                ) : !isSummaryPropertiesActive && is.nonEmptyArray(initialAppSummary.summaryWithoutProperties) ? (
                  <DataTable
                    className="mt-4"
                    headers={['Type', 'Count']}
                    lines={appSummary.summaryWithoutProperties.map(({ id, type, count }) => ({
                      key: id,
                      values: [
                        { key: `${id}-type`, value: type },
                        { key: `${id}-count`, value: count },
                      ],
                    }))}
                  />
                ) : (
                  <p className="text-paragraph">No events yet</p>
                ))}
            </div>
          )}

          {isEventsListActive && (
            <div className="mt-4 flex flex-col">
              <h2>Events</h2>

              {isSuccessEventsList && (
                <>
                  {!is.undefined(initialEvents) && is.nonEmptyArray(initialEvents.pages) && (
                    <form onSubmit={onSubmitEventsList} className="flex">
                      <Input className="rounded-tr-none rounded-br-none" defaultValue="" {...detailsRegister('type')} />

                      <Button type="submit" active className="rounded-bl-none rounded-tl-none">
                        Submit
                      </Button>
                    </form>
                  )}

                  {is.nonEmptyArray(events) ? (
                    <DataTable
                      className="mt-4"
                      headers={['Id', 'Type', 'Time', 'Properties']}
                      lines={events.map(({ type, id, properties, createdAt }) => ({
                        key: id,
                        values: [
                          { key: `${id}-id`, value: id },
                          { key: `${id}-type`, value: type },
                          { key: `${id}-time`, value: formatDate(createdAt, { space: true }) },
                          { key: `${id}-properties`, value: formatJson(properties) },
                        ],
                      }))}
                      compact
                    />
                  ) : (
                    <p className="text-paragraph">No events yet</p>
                  )}
                  {hasNextPageEventsList && is.emptyString(getDetailsValues('type')) && (
                    <Button
                      onClick={() => fetchNextEvents()}
                      className="self-center mt-4"
                      disabled={isFetchingNextEvents}
                    >
                      Load more
                    </Button>
                  )}
                </>
              )}

              {isFetchingEventsList && <div className="self-center text-xl">Loading...</div>}
            </div>
          )}

          {!isAppSummaryActive && !isEventsListActive && <p className="text-lg mt-4">Nothing to display.</p>}
        </div>
      )}
    </>
  )
}
