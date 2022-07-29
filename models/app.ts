import { Timestamp } from 'firebase/firestore'

export interface App {
  id: string
  name: string
  updateTime: Timestamp
}
