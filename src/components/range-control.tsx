'use client'

import { Field, FieldLabel } from '@ui-sdk/react/field'
import { SegmentedControl, SegmentedControlIndicator, SegmentedControlItem } from '@ui-sdk/react/segmented-control'
import type { Route } from 'next'
import { usePathname, useRouter } from 'next/navigation'
import { useOptimistic, useTransition } from 'react'

import { ranges, type RangeKey } from '@/lib/range'

export function RangeControl({ current }: { current: RangeKey }) {
  const router = useRouter()
  const pathname = usePathname()
  const [pending, startTransition] = useTransition()
  const [value, setValue] = useOptimistic(current)

  return (
    <Field className="flex-row! items-center gap-2" data-pending={pending || undefined}>
      <FieldLabel className="sr-only">Period</FieldLabel>
      <SegmentedControl
        value={value}
        onValueChange={next => {
          if (!next) {
            return
          }

          startTransition(() => {
            setValue(next as RangeKey)
            router.push(`${pathname}?range=${next}` as Route, { scroll: false })
          })
        }}
      >
        <SegmentedControlIndicator />
        {(Object.keys(ranges) as RangeKey[]).map(key => (
          <SegmentedControlItem key={key} value={key}>
            {ranges[key].label}
          </SegmentedControlItem>
        ))}
      </SegmentedControl>
    </Field>
  )
}
