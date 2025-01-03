import type {
  Activity,
  Destination,
  Housing,
  Place,
  Transportation,
  Trip,
} from '@/models'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { distanceBetweenPoints } from '@/models/Coordinates'

export const useTripStore = defineStore('trip', () => {
  const id = ref<string>()
  const name = ref<string>()
  const startDate = ref<Date>()
  const endDate = ref<Date>()
  const destinations = ref<Destination[]>()
  const transportations = ref<Transportation[]>()

  const activities = computed(() =>
    destinations.value
      ?.filter(d => d.activities?.length)
      .reduce<Activity[]>((acc, d) => acc.concat(d.activities ?? []), []),
  )
  const housing = computed(() =>
    destinations.value
      ?.filter(d => d.housing)
      .reduce<Housing[]>((acc, d) => [...acc, d.housing!], []),
  )

  const cost = computed(
    () =>
      (activities.value?.reduce((acc, d) => acc + (d.price ?? 0), 0) ?? 0) +
      (housing.value?.reduce((acc, d) => acc + (d.price ?? 0), 0) ?? 0),
  )

  const addActivityToTrip = (place: Place, destinationId?: string) => {
    const newActivity: Activity = {
      id: crypto.randomUUID(),
      place: place,
    }
    let destination: Destination | undefined
    if (destinationId) {
      destination = destinations.value?.find(d => d.id === destinationId)
    } else {
      destination = findClosedDestination(newActivity.place)
    }
    destination?.activities?.push(newActivity)
    localStorage.setItem(
      'tripStore',
      JSON.stringify({
        name: name.value,
        startDate: startDate.value,
        endDate: endDate.value,
        destinations: destinations.value,
        transportations: transportations.value,
      }),
    )
  }

  const removeActivityFromTrip = (place: Place) => {
    destinations.value = destinations.value?.map(d => {
      d.activities = d.activities?.filter(a => a.place.id !== place.id)
      return d
    })
    localStorage.setItem(
      'tripStore',
      JSON.stringify({
        name: name.value,
        startDate: startDate.value,
        endDate: endDate.value,
        destinations: destinations.value,
        transportations: transportations.value,
      }),
    )
  }

  const findClosedDestination = (place: Place) => {
    let closestDestination: Destination | undefined
    let closestDestinationDistance: number = Number.MAX_VALUE
    destinations.value?.forEach(d => {
      const distance = distanceBetweenPoints(d.coordinates, place.coordinates)
      if (!closestDestination || distance < closestDestinationDistance) {
        closestDestination = d
        closestDestinationDistance = distance
      }
    })
    return closestDestination!
  }

  const setTrip = (trip: Trip) => {
    id.value = trip.id
    name.value = trip.name
    destinations.value = trip.destinations
    transportations.value = trip.transportations
    startDate.value = trip.startDate
    endDate.value = trip.endDate
  }

  return {
    id,
    name,
    destinations,
    transportations,
    startDate,
    endDate,
    activities,
    housing,
    cost,
    addActivityToTrip,
    removeActivityFromTrip,
    setTrip,
  }
})
