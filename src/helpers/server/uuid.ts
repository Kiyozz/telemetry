import { v4 } from 'uuid'

export function createUuid(): string {
  return v4()
}
