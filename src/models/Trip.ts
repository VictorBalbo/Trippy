import type { Destination, Transportation } from '.'

export interface Trip {
  name: string
  startDate: string
  endDate: string
  destinations: Destination[]
  transportations: Transportation[]
}
