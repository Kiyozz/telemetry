import dayjs from 'dayjs'

export default function formatDate(
  date: Date | string,
  { eol = false, space = false }: { eol?: boolean; space?: boolean },
): string {
  return dayjs(date).format(`DD/MM/YYYY${eol ? '\n' : ''}${space ? ' ' : ''}HH:mm`)
}
