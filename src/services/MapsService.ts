import { apiUrl } from '@/constants'
import type { Coordinates, Place } from '@/models'
import { v4 as uuid } from 'uuid'

const BASE_URL = apiUrl
const token = (self.crypto.randomUUID && self.crypto?.randomUUID()) ?? uuid()

export class MapsService {
  static getDetaisForPlaceName = async (input: string) => {
    try {
      const response = await fetch(`${BASE_URL}/places/${input}`)
      const data = (await response.json()) as Place[]
      return data
    } catch (e) {
      console.error(e)
    }
  }

  static getDetaisForPlaceId = async (id: string) => {
    try {
      const response = await fetch(`${BASE_URL}/place/${id}`)
      const data = await response.json()
      return data as Place
    } catch (e) {
      console.error(e)
    }
  }

  static getAutocompletePlaceName = async (
    input: string,
    coordinates: Coordinates,
    radius: number,
  ) => {
    try {
      const response = await fetch(
        `${BASE_URL}/places/autocomplete/${input}?lat=${coordinates.lat}&lng=${coordinates.lng}&radius=${radius}&token=${token}`,
      )
      const data = (await response.json()) as Place[]
      return data
    } catch (e) {
      console.error(e)
    }
  }

  static getPhotoForPlace = (keys: string[]) => {
    if (keys.length)
      return `https://itin-dev.sfo2.cdn.digitaloceanspaces.com/freeImageSmall/${keys[0]}`
  }
  static getMediumPhotoForPlace = (keys: string[]) => {
    if (keys.length)
      return `https://itin-dev.sfo2.cdn.digitaloceanspaces.com/freeImageMedium/${keys[0]} 1200w`
  }
}
