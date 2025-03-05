import type { Place } from './Place'

export interface Housing {
  id: string
  placeId: string
  place: Place
  name: string
  checkin?: Date
  checkout?: Date
  website?: string
  notes?: string
  price?: number
}
