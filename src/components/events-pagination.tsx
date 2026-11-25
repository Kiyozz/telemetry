'use client'

import {
  Pagination,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationList,
  PaginationNext,
  PaginationPrevious,
} from '@ui-sdk/react/pagination'
import type { Route } from 'next'
import Link, { useLinkStatus } from 'next/link'
import type { ComponentProps } from 'react'

function RouterLink({ href, children, ...props }: ComponentProps<'a'>) {
  return href ? (
    <Link {...props} href={href as Route}>
      {children}
      <Pending />
    </Link>
  ) : (
    <a {...props}>{children}</a>
  )
}

/** Hidden marker: drives the page-wide [data-pending] feedback without moving the pagination. */
function Pending() {
  const { pending } = useLinkStatus()

  return pending ? <span hidden data-pending /> : null
}

interface EventsPaginationProps {
  page: number
  total: number
  pageSize: number
  type?: string
}

export function EventsPagination({ page, total, pageSize, type }: EventsPaginationProps) {
  const getHref = (target: number) => {
    const params = new URLSearchParams()

    if (type) {
      params.set('type', type)
    }

    params.set('page', String(target))

    return `?${params}`
  }

  return (
    <Pagination aria-label="Pagination" page={page} total={total} pageSize={pageSize} getHref={getHref}>
      <PaginationList>
        {({ items }) => (
          <>
            <PaginationItem>
              <PaginationPrevious render={RouterLink}>Newer</PaginationPrevious>
            </PaginationItem>
            {items.map(item => (
              <PaginationItem key={item}>
                {typeof item === 'number' ? <PaginationLink page={item} render={RouterLink} /> : <PaginationEllipsis />}
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext render={RouterLink}>Older</PaginationNext>
            </PaginationItem>
          </>
        )}
      </PaginationList>
    </Pagination>
  )
}
