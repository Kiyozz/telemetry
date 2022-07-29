import { Timestamp } from 'firebase/firestore'

export interface Event {
  id: string
  type: string
  properties: Record<string, unknown>
  createTime: Timestamp
}
