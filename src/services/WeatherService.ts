import { apiUrl } from '@/constants'
import type { Weather } from '@/models'

const BASE_URL = apiUrl

export class WeatherService {
  static getDestinationWeather = async (destinationId: string) => {
    try {
      const weatherResponse = await fetch(
        `${BASE_URL}/weather/${destinationId}`,
      )
      const weather = await weatherResponse.json()
      return weather as Weather
    } catch (e) {
      console.error(e)
    }
  }
}
