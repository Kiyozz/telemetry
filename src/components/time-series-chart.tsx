'use client'

import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { TooltipContentProps } from 'recharts'
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'

import { formatCompact, formatDay, formatLongDay, formatNumber } from '@/lib/format'
import type { SeriesPoint } from '@/lib/queries'

export interface Series {
  key: keyof Omit<SeriesPoint, 'date'>
  label: string
  color: string
}

interface TimeSeriesChartProps {
  data: SeriesPoint[]
  series: Series[]
  bucket: 'day' | 'week'
}

function ChartTooltip({
  active,
  payload,
  label,
  series,
  bucket,
}: Partial<TooltipContentProps<ValueType, NameType>> & { series: Series[]; bucket: 'day' | 'week' }) {
  if (!active || !payload?.length) {
    return null
  }

  const point = payload[0]?.payload as SeriesPoint

  return (
    <div className="rounded-lg border border-hairline bg-surface px-3 py-2 text-sm shadow-lg">
      <p className="mb-1 text-ink-muted">
        {bucket === 'week' ? 'Week of ' : ''}
        {formatLongDay(label as string)}
      </p>
      {series.map(s => (
        <p key={s.key} className="flex items-center gap-2">
          <span aria-hidden className="h-0.5 w-3 rounded-full" style={{ backgroundColor: s.color }} />
          <strong className="tabular-nums">{formatNumber(point[s.key])}</strong>
          <span className="text-ink-muted">{s.label}</span>
        </p>
      ))}
    </div>
  )
}

export function TimeSeriesChart({ data, series, bucket }: TimeSeriesChartProps) {
  const axis = {
    stroke: 'var(--axis)',
    tick: { fill: 'var(--ink-muted)', fontSize: 12 },
    tickLine: false,
  }
  const common = {
    data,
    margin: { top: 8, right: 8, bottom: 0, left: 0 },
    accessibilityLayer: true,
  }
  const children = (
    <>
      <CartesianGrid stroke="var(--grid)" vertical={false} />
      <XAxis dataKey="date" {...axis} tickFormatter={formatDay} minTickGap={32} />
      <YAxis {...axis} axisLine={false} width={44} tickFormatter={formatCompact} allowDecimals={false} />
      <Tooltip
        cursor={{ stroke: 'var(--axis)', strokeWidth: 1 }}
        content={<ChartTooltip series={series} bucket={bucket} />}
      />
    </>
  )

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        {series.length === 1 && series[0] ? (
          <AreaChart {...common}>
            {children}
            <defs>
              <linearGradient id={`fill-${series[0].key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={series[0].color} stopOpacity={0.25} />
                <stop offset="100%" stopColor={series[0].color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey={series[0].key}
              name={series[0].label}
              stroke={series[0].color}
              strokeWidth={2}
              fill={`url(#fill-${series[0].key})`}
              activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--surface)' }}
              isAnimationActive={false}
            />
          </AreaChart>
        ) : (
          <LineChart {...common}>
            {children}
            {series.map(s => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={s.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--surface)' }}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}

export function Legend({ series }: { series: Series[] }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-muted">
      {series.map(s => (
        <li key={s.key} className="flex items-center gap-2">
          <span aria-hidden className="h-0.5 w-4 rounded-full" style={{ backgroundColor: s.color }} />
          {s.label}
        </li>
      ))}
    </ul>
  )
}
