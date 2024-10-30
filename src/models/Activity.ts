import type { Place } from '.'

export interface Activity extends Place {
  dateTime?: Date
  website?: string
  notes?: string
  price?: number
}
