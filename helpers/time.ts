export default function time(label: string) {
  console.time(label)

  return () => console.timeEnd(label)
}
