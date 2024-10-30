export interface Transportation {
  origin: string
  destination: string
  type: TransportTypes
  startDate?: string
  endDate?: string
  price?: number
}
export enum TransportTypes {
  Bus = 'Bus',
  Car = 'Car',
  Plane = 'Plane',
  Ship = 'Ship',
  Train = 'Train',
}
