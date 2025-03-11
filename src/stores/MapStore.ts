import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Place } from '@/models'

export const useMapStore = defineStore('map', () => {
  const mapCenter = ref<Place[]>([])

  return { mapCenter }
})
