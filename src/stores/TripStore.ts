import type { Activity, Housing, Trip } from '@/models'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { mockTripData } from '@/constants'

export const useTripStore = defineStore('trip', () => {
  const trip = ref<Trip>()
  /// TODO: Get this from an API
  const store = undefined
  trip.value = JSON.parse(store ?? mockTripData)

  const activities = computed(() =>
    trip.value?.Destinations?.filter(d => d.activities?.length).reduce<
      Activity[]
    >((acc, d) => acc.concat(d.activities ?? []), []),
  )
  const housing = computed(() =>
    trip.value?.Destinations?.filter(d => d.housing).reduce<Housing[]>(
      (acc, d) => [...acc, d.housing!],
      [],
    ),
  )

  return {
    name: trip.value?.Name,
    destinations: trip.value?.Destinations,
    activities,
    housing,
    transportations: trip.value?.Transportations,
  }
})
