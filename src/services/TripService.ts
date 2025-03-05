import { apiUrl } from '@/constants'
import type { Trip } from '@/models'

const BASE_URL = apiUrl

export class TripService {
  static getTripDetails = async (tripId: string) => {
    try {
      const tripResponse = await fetch(`${BASE_URL}/trip/${tripId}`)
      const trip = await tripResponse.json()
      return trip as Trip
    } catch (e) {
      console.error(e)
    }
  }

  static setTripDetails = async (trip: Trip) => {
    try {
      const tripResponse = await fetch(`${BASE_URL}/trip`, {
        method: 'POST',
        body: JSON.stringify(trip),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!tripResponse.ok) {
        console.error('Failed to save', tripResponse.statusText)
      }
    } catch (e) {
      console.error(e)
    }
  }
}
