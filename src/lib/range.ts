export const ranges = {
  '7d': { label: '7 days', days: 7 },
  '30d': { label: '30 days', days: 30 },
  '90d': { label: '90 days', days: 90 },
  '1y': { label: '1 year', days: 365 },
  all: { label: 'All time', days: null },
} as const

export type RangeKey = keyof typeof ranges

export const defaultRange: RangeKey = '30d'

export function parseRange(value: unknown): RangeKey {
  return typeof value === 'string' && value in ranges ? (value as RangeKey) : defaultRange
}

/** Day buckets up to 90 days, week buckets beyond. */
export function bucketOf(range: RangeKey): 'day' | 'week' {
  const { days } = ranges[range]
  return days !== null && days <= 90 ? 'day' : 'week'
}
