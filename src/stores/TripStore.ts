import type { Activity, Destination, Housing, Place, Trip } from '@/models'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { mockTripData } from '@/constants'
import { distanceBetweenPoints } from '@/models/Coordinates'

export const useTripStore = defineStore('trip', () => {
  /// TODO: Get this from an API
  const trip = ref<Trip>(
    JSON.parse(localStorage.getItem('tripStore') ?? mockTripData),
  )

  const activities = computed(() =>
    trip.value.destinations
      ?.filter(d => d.activities?.length)
      .reduce<Activity[]>((acc, d) => acc.concat(d.activities ?? []), []),
  )
  const housing = computed(() =>
    trip.value.destinations
      ?.filter(d => d.housing)
      .reduce<Housing[]>((acc, d) => [...acc, d.housing!], []),
  )

  const addActivityToTrip = (activity: Activity, destinationKey?: string) => {
    let destination: Destination | undefined
    if (destinationKey) {
      destination = trip.value?.destinations.find(d => d.key === destinationKey)
    } else {
      destination = findClosedDestination(activity)
    }
    destination?.activities?.push(activity)
    localStorage.setItem(
      'tripStore',
      JSON.stringify({
        name: trip.value?.name,
        start: trip.value?.start,
        end: trip.value?.end,
        destinations: trip.value?.destinations,
        transportations: trip.value?.transportations,
      }),
    )
  }
  const removeActivityFromTrip = (activity: Activity) => {
    trip.value.destinations = trip.value.destinations?.map(d => {
      d.activities = d.activities?.filter(a => a.placeId !== activity.placeId)
      return d
    })
    localStorage.setItem(
      'tripStore',
      JSON.stringify({
        name: trip.value?.name,
        start: trip.value?.start,
        end: trip.value?.end,
        destinations: trip.value?.destinations,
        transportations: trip.value?.transportations,
      }),
    )
  }

  const findClosedDestination = (place: Place) => {
    let closestDestination: Destination | undefined
    let closestDestinationDistance: number = Number.MAX_VALUE
    trip.value?.destinations?.forEach(d => {
      const distance = distanceBetweenPoints(d.coordinates, place.coordinates)
      if (!closestDestination || distance < closestDestinationDistance) {
        closestDestination = d
        closestDestinationDistance = distance
      }
    })
    return closestDestination!
  }

  return {
    name: trip.value?.name,
    destinations: trip.value?.destinations,
    activities,
    housing,
    transportations: trip.value?.transportations,
    addActivityToTrip,
    removeActivityFromTrip,
  }
})
