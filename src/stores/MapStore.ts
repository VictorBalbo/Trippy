import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { DistanceBetweenPlaces, Place } from '@/models'

export const useMapStore = defineStore('map', () => {
  const mapCenter = ref<Place[]>([])
  const markerFocus = ref<Place>()
  const distances = ref<DistanceBetweenPlaces[]>([])

  return { distances, mapCenter, markerFocus }
})
