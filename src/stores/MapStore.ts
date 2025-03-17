import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { DistanceBetweenPlaces, Place } from '@/models'

export const useMapStore = defineStore('map', () => {
  const mapCenter = ref<Place[]>([])
  const markerFocus = ref<Place>()
  const selectedPlaceId = ref<string>()
  const distances = ref<DistanceBetweenPlaces[]>([])

  return { distances, selectedPlaceId, mapCenter, markerFocus }
})
