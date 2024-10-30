import type { Activity, Coordinates, Housing } from '.'

export interface Destination {
  key: string
  name: string
  coordinates: Coordinates
  housing?: Housing
  activities?: Activity[]
  startDate?: string
  endDate?: string
}
