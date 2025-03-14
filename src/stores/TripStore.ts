import type {
  Activity,
  Destination,
  Housing,
  Place,
  Transportation,
} from '@/models'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { distanceBetweenPoints } from '@/models/Coordinates'
import { TripService } from '@/services'
import { debounce } from '@/utils'

const destinationCategory = 'locality'

export const useTripStore = defineStore('trip', () => {
  const id = ref<string>('')
  const name = ref<string>('')
  const startDate = ref<Date>(new Date())
  const endDate = ref<Date>(new Date())
  const destinations = ref<Destination[]>([])
  const transportations = ref<Transportation[]>([])

  const activities = computed(() =>
    destinations.value
      .filter(d => d.activities?.length)
      .reduce<Activity[]>((acc, d) => acc.concat(d.activities ?? []), []),
  )
  const housing = computed(() =>
    destinations.value
      .filter(d => d.housing)
      .reduce<Housing[]>((acc, d) => [...acc, d.housing!], []),
  )

  const cost = computed(
    () =>
      activities.value?.reduce((acc, d) => acc + (d.price?.value ?? 0), 0) +
      housing.value?.reduce((acc, d) => acc + (d.price.value ?? 0), 0),
  )

  const addPlaceToTrip = async (place: Place) => {
    if (place.categories?.includes(destinationCategory)) {
      addDestinationToTrip(place)
    } else {
      addActivityToTrip(place)
    }
    saveTrip()
  }

  const removePlaceFromTrip = async (place: Place) => {
    if (place.categories?.includes(destinationCategory)) {
      removeDestinationFromTrip(place)
    } else {
      removeActivityFromTrip(place)
    }
    saveTrip()
  }

  // Private
  const addDestinationToTrip = (place: Place) => {
    const lastDestination = destinations.value.reduce((latest, d) =>
      d.startDate > latest.startDate ? d : latest,
    )
    const newDestination: Destination = {
      id: crypto.randomUUID(),
      place: place,
      placeId: place.id,
      startDate: lastDestination.endDate,
      endDate: lastDestination.endDate,
    }
    destinations.value.push(newDestination)
  }
  const removeDestinationFromTrip = (place: Place) => {
    destinations.value = destinations.value.filter(d => d.place.id !== place.id)
    saveTrip()
  }

  const addActivityToTrip = (place: Place) => {
    const newActivity: Activity = {
      id: crypto.randomUUID(),
      place: place,
      placeId: place.id,
      price: { value: undefined, currency: undefined },
    }

    const destination = findClosedDestination(newActivity.place)
    destination?.activities?.push(newActivity)
  }
  const removeActivityFromTrip = (place: Place) => {
    destinations.value = destinations.value.map(d => {
      d.activities = d.activities?.filter(a => a.place.id !== place.id)
      return d
    })
    saveTrip()
  }

  const findClosedDestination = (place: Place) => {
    let closestDestination: Destination | undefined
    let closestDestinationDistance: number = Number.MAX_VALUE
    destinations.value.forEach(d => {
      const distance = distanceBetweenPoints(
        d.place.coordinates,
        place.coordinates,
      )
      if (!closestDestination || distance < closestDestinationDistance) {
        closestDestination = d
        closestDestinationDistance = distance
      }
    })
    return closestDestination!
  }

  const saveTrip = async () => {
    await TripService.setTripDetails({
      id: id.value,
      name: name.value,
      startDate: startDate.value,
      endDate: endDate.value,
      destinations: destinations.value,
      transportations: transportations.value,
    })
  }
  const loadTrip = async () => {
    const trip = await TripService.getTripDetails(
      '63c54b55-d3fa-4224-9c22-408b41f8ace9',
    )
    if (trip) {
      id.value = trip.id
      name.value = trip.name
      destinations.value = trip.destinations ?? []
      transportations.value = trip.transportations
      startDate.value = trip.startDate
      endDate.value = trip.endDate
    }
  }
  loadTrip()

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
    addPlaceToTrip,
    removePlaceFromTrip,
    saveTrip: debounce(saveTrip),
  }
})
