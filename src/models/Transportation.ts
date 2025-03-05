import type { Coordinates } from './Coordinates'
import type { Place } from './Place'

export interface Transportation {
  id: string
  originId: string
  origin: Place
  destinationId: string
  destination: Place
  path: Coordinates[]
  type: TransportTypes
  startDate?: Date
  endDate?: Date
  price?: number
  company?: string
  number?: string
  reservation?: string
  seat?: string
}
export enum TransportTypes {
  Bus = 'Bus',
  Car = 'Car',
  Plane = 'Plane',
  Ship = 'Ship',
  Train = 'Train',
}
