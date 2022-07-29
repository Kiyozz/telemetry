import cx from 'classnames'

interface DataTableProps {
  className?: string
  headers: string[]
  lines?: (string | number)[][]
  compact?: boolean
}

export default function DataTable({ className, headers, lines = [], compact = false }: DataTableProps) {
  return (
    <div className={cx('data-table-wrap', className)}>
      <table className={cx('data-table', compact && 'compact')}>
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={index}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {lines.map((line, index) => (
            <tr key={index}>
              {line.map((l, i) => (
                <td key={i} data-title={headers[i]}>
                  {l}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
