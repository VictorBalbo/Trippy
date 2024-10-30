import type { Coordinates } from '.'

export interface Place {
  placeId: string
  name: string
  address: string
  coordinates: Coordinates
}
