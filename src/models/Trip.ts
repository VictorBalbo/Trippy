import type { Destination } from '.'

export interface Trip {
  Name: string
  Start: string
  End: string
  Destinations: Destination[]
  Transportations: Transportation[]
}
