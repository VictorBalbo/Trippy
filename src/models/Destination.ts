import type { Activity, Coordinates, Housing } from '.'

export interface Destination {
  id: string
  name: string
  coordinates: Coordinates
  housing?: Housing
  activities?: Activity[]
  startDate?: Date
  endDate?: Date
}
