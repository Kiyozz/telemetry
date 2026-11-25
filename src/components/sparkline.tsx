interface SparklineProps {
  values: number[]
  label: string
  className?: string
}

/** Rendered on the server: no JavaScript is shipped for it. */
export function Sparkline({ values, label, className = 'h-12' }: SparklineProps) {
  const width = 240
  const height = 48
  const max = Math.max(1, ...values)
  const step = values.length > 1 ? width / (values.length - 1) : width
  const points = values.map((value, index) => [index * step, height - 2 - (value / max) * (height - 6)] as const)
  const line = points.map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const area = `${line} L${width},${height} L0,${height} Z`

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={`w-full ${className}`}
      role="img"
      aria-label={label}
    >
      <path d={area} fill="var(--series-1)" opacity={0.12} />
      <path
        d={line}
        fill="none"
        stroke="var(--series-1)"
        strokeWidth={2}
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
      />
    </svg>
  )
}
