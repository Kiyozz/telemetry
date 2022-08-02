import cx from 'classnames'

interface DataTableProps {
  className?: string
  headers: string[]
  lines?: { key: string; values: { key: string; value: string | number }[] }[]
  compact?: boolean
}

export default function DataTable({ className, headers, lines = [], compact = false }: DataTableProps) {
  return (
    <div className={cx('data-table-wrap', className)}>
      <table className={cx('data-table', compact && 'compact')}>
        <thead>
          <tr>
            {headers.map(header => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {lines.map(line => (
            <tr key={line.key}>
              {line.values.map((l, i) => (
                <td key={l.key} data-title={headers[i]}>
                  {l.value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
