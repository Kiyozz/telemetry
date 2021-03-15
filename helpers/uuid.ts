import { v4 } from 'uuid'

export default function createUuid(): string {
  return v4()
}
