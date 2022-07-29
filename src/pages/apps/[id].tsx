import is from '@sindresorhus/is'
import { useQueries } from '@tanstack/react-query'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState } from 'react'
import type React from 'react'
import { useForm } from 'react-hook-form'

import formatDate from '@helpers/formatDate'

import AppBar from '../../components/app-bar'
import Button from '../../components/button'
import DataTable from '../../components/data-table'
import Input from '../../components/input'
import { useAppQueryOptions } from '../../hooks/use-app'
import { useEventsQueryOptions } from '../../hooks/use-events'
import { useEventsSummariesQueryOptions } from '../../hooks/use-events-summaries'
import { useList } from '../../hooks/use-list'

export default function AppPage() {
  const router = useRouter()
  const appId = router.query.id as string | undefined
  const [isEventsListActive, setEventsListActive] = useState(false)
  const [isSummaryActive, setSummaryActive] = useState(true)
  const [isSummaryPropertiesActive, setSummaryPropertiesActive] = useState(true)
  const { register, handleSubmit, reset: resetSummaryForm } = useForm({ defaultValues: { type: '' } })
  const {
    register: detailsRegister,
    handleSubmit: handleDetailsSubmit,
    reset: resetDetailsForm,
  } = useForm({ defaultValues: { type: '' } })
  const [{ data: app, isLoading: isLoadingApp, isSuccess: isSuccessApp }] = useQueries({
    queries: [useAppQueryOptions(appId), useEventsSummariesQueryOptions(appId, false)],
  })
  const updatedAt = app?.updateTime
  const {
    handleSubmit: handleSubmitEventsList,
    list: events,
    data: initialEvents,
    isSuccess: isSuccessEventsList,
  } = useList({
    onReset: () => {
      resetDetailsForm()
    },
    useToast: true,
    toastId: 'events-list',
    successMessage: 'Events list loaded',
    errorMessage: 'Cannot load events list',
    query: useEventsQueryOptions(appId, { enabled: isEventsListActive }),
  })
  const {
    handleSubmit: handleSubmitSummariesList,
    list: eventsSummaries,
    data: initialEventsSummaries,
    isSuccess: isSuccessEventsSummariesList,
  } = useList({
    onReset: () => {
      resetSummaryForm()
    },
    useToast: true,
    toastId: 'summaries-list',
    successMessage: 'Summary loaded',
    errorMessage: 'Cannot load summary',
    query: useEventsSummariesQueryOptions(appId, true),
  })
  const {
    handleSubmit: handleSubmitSummariesWithoutPropertiesList,
    list: eventsSummariesWithoutProperties,
    data: initialEventsSummariesWithoutProperties,
    isSuccess: isSuccessEventsSummariesWithoutPropertiesList,
  } = useList({
    onReset: () => {
      resetSummaryForm()
    },
    query: useEventsSummariesQueryOptions(appId, false),
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
    handleSubmitSummariesList(data.type)
    handleSubmitSummariesWithoutPropertiesList(data.type)
  })

  const onSubmitEventsList = handleDetailsSubmit(data => {
    handleSubmitEventsList(data.type)
  })
  const appName = isLoadingApp ? 'Loading...' : app?.name ?? 'Error'
  const title = `Telemetry - ${appName}`

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
          {!is.undefined(updatedAt) ? formatDate(new Date(updatedAt.toMillis()), { space: true }) : 'Unknown'}
        </div>
      </AppBar>

      {(isSuccessApp || isSuccessEventsSummariesList || isSuccessEventsSummariesWithoutPropertiesList) && (
        <div className="px-4 pb-4 mt-16">
          <div className="flex toolbar">
            <Button onClick={onClickSummaryToggle} active={isSummaryActive}>
              Summary
            </Button>
            <Button onClick={onClickDetailsToggle} active={isEventsListActive}>
              Details
            </Button>
          </div>

          {isSummaryActive && (
            <div className="mt-4">
              <h2>Summary</h2>

              {(isSuccessEventsSummariesList || isSuccessEventsSummariesWithoutPropertiesList) && (
                <>
                  <form className="inline-form" onSubmit={onSubmitSummary}>
                    <Input defaultValue="" {...register('type')} />

                    <Button active>Submit</Button>
                  </form>

                  {isSuccessEventsSummariesWithoutPropertiesList &&
                    is.nonEmptyArray(initialEventsSummariesWithoutProperties) && (
                      <div className="mt-2">
                        <Button
                          type="submit"
                          onClick={onClickSummaryPropertiesActive}
                          active={isSummaryPropertiesActive}
                        >
                          Properties
                        </Button>
                      </div>
                    )}
                </>
              )}

              {isSummaryPropertiesActive && isSuccessEventsSummariesList && is.nonEmptyArray(initialEventsSummaries) ? (
                <DataTable
                  compact
                  className="mt-4"
                  headers={['Type', 'Count', 'Properties']}
                  lines={eventsSummaries.map(({ type, count, properties }) => [
                    type,
                    count,
                    JSON.stringify(properties, undefined, 2),
                  ])}
                />
              ) : !isSummaryPropertiesActive &&
                isSuccessEventsSummariesWithoutPropertiesList &&
                is.nonEmptyArray(eventsSummariesWithoutProperties) ? (
                <DataTable
                  className="mt-4"
                  headers={['Type', 'Count']}
                  lines={eventsSummariesWithoutProperties.map(({ type, count }) => [type, count])}
                />
              ) : (
                <p className="text-paragraph">No events yet</p>
              )}
            </div>
          )}

          {isEventsListActive && isSuccessEventsList && (
            <div className="mt-4 flex flex-col">
              <h2>Events</h2>

              {is.nonEmptyArray(initialEvents) && (
                <form className="inline-form" onSubmit={onSubmitEventsList}>
                  <Input defaultValue="" {...detailsRegister('type')} />

                  <Button type="submit" active>
                    Submit
                  </Button>
                </form>
              )}

              {is.nonEmptyArray(events) ? (
                <DataTable
                  className="mt-4"
                  headers={['Id', 'Type', 'Time', 'Properties']}
                  lines={events.map(({ type, id, properties, createTime }) => [
                    id,
                    type,
                    formatDate(new Date(createTime.toMillis()), { space: true }),
                    JSON.stringify(properties, undefined, 2),
                  ])}
                  compact
                />
              ) : (
                <p className="text-paragraph">No events yet</p>
              )}
            </div>
          )}

          {!isSummaryActive && !isEventsListActive && <p className="text-lg mt-4">Nothing to display.</p>}
        </div>
      )}
    </>
  )
}
