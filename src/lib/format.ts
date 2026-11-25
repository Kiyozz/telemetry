const numberFormat = new Intl.NumberFormat('en-US')
const compactFormat = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })
const percentFormat = new Intl.NumberFormat('en-US', {
  style: 'percent',
  maximumFractionDigits: 0,
  signDisplay: 'exceptZero',
})
const dateTimeFormat = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' })
const dayFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })
const longDayFormat = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})
const relativeFormat = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

export function formatNumber(value: number): string {
  return numberFormat.format(value)
}

export function formatCompact(value: number): string {
  return value < 10_000 ? numberFormat.format(value) : compactFormat.format(value)
}

export function formatDateTime(value: string | Date): string {
  return `${dateTimeFormat.format(new Date(value))} UTC`
}

export function formatDay(value: string | Date): string {
  return dayFormat.format(new Date(value))
}

export function formatLongDay(value: string | Date): string {
  return longDayFormat.format(new Date(value))
}

const units: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 24 * 3600],
  ['month', 30 * 24 * 3600],
  ['week', 7 * 24 * 3600],
  ['day', 24 * 3600],
  ['hour', 3600],
  ['minute', 60],
]

export function formatRelative(value: string | Date, now = Date.now()): string {
  const seconds = (new Date(value).getTime() - now) / 1000

  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) {
      return relativeFormat.format(Math.round(seconds / size), unit)
    }
  }

  return 'just now'
}

/** Change from the previous period, or null when there is nothing to compare with. */
export function delta(
  current: number,
  previous: number | null,
): { label: string; direction: 'up' | 'down' | 'flat' } | null {
  if (previous === null || previous === 0) {
    return null
  }

  const ratio = (current - previous) / previous

  return {
    label: percentFormat.format(ratio),
    direction: Math.abs(ratio) < 0.005 ? 'flat' : ratio > 0 ? 'up' : 'down',
  }
}
