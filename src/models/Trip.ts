import type { Destination, Transportation } from '.'

export interface Trip {
  name: string
  start: string
  end: string
  destinations: Destination[]
  transportations: Transportation[]
}
