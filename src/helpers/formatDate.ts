import dayjs from 'dayjs'

export default function formatDate(
  date: Date | string | null,
  { eol = false, space = false }: { eol?: boolean; space?: boolean },
): string {
  if (date === null) {
    return 'unknown'
  }

  return dayjs(date).format(`DD/MM/YYYY${eol ? '\n' : ''}${space ? ' ' : ''}HH:mm`)
}
