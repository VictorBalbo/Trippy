import type { Place } from './Place'

export interface Housing extends Place {
  checkin?: string
  checkout?: string
  website?: string
  notes?: string
  price?: number
}
