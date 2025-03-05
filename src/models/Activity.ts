import type { Place } from '.'

export interface Activity {
  id: string
  placeId: string
  place: Place
  dateTime?: Date
  website?: string
  notes?: string
  price?: number
}
