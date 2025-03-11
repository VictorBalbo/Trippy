<script setup lang="ts">
import { ref, watch, useTemplateRef } from 'vue'
import { GoogleMap, Polyline } from 'vue3-google-map'
import { storeToRefs } from 'pinia'
import { googleKey, googleMapId } from '@/constants'
import { useTripStore } from '@/stores'
import type { Place } from '@/models'
import {
  MapInfoWindow,
  MapMarkerComponent,
  MapSearchComponent,
} from '@/components'

const {
  showCities: showDestinations = true,
  showActivities = true,
  showTransportations = true,
  showHousing = true,
} = defineProps<{
  showCities?: boolean
  showActivities?: boolean
  showTransportations?: boolean
  showHousing?: boolean
}>()

const tripStore = useTripStore()
const { id, activities, destinations, housing, transportations } =
  storeToRefs(tripStore)

const mapCenter = ref<Place>()
const currentPlace = ref<string>()

const mapRef = useTemplateRef<typeof GoogleMap>('mapRef')

const openCustomInfoWindow = async (placeId?: string) => {
  console.log('Open', placeId)
  if (currentPlace.value !== placeId) {
    mapCenter.value = undefined
    currentPlace.value = placeId
  }
}
const closeCustomInfoWindow = async () => {
  mapCenter.value = undefined
  currentPlace.value = undefined
}
const centralizeOnLocation = async (location: Place) => {
  mapCenter.value = location
  const minZoom = 12
  if (mapRef.value?.map.zoom && mapRef.value?.map.zoom < minZoom) {
    mapRef.value.map.zoom = 13
  }
  mapRef.value?.map.panTo(location.coordinates)
}
const mapUnwatch = watch([() => mapRef.value?.ready, () => id.value], ready => {
  if (!ready || !id.value) {
    return
  }

  mapRef.value?.map.addListener('click', (e: any) => {
    if (e.placeId) {
      openCustomInfoWindow(e.placeId)
      e.stop()
    }
  })

  // Set map boundries to fit all markers
  const latLngBounds = mapRef.value?.api.LatLngBounds
  const bounds = new latLngBounds()

  if (destinations.value && destinations.value.length > 1) {
    destinations.value.forEach(d => bounds.extend(d.place.coordinates))
  } else {
    activities.value?.forEach(a => bounds.extend(a.place.coordinates))
    housing.value?.forEach(a => bounds.extend(a.place.coordinates))
  }

  mapRef.value?.map.fitBounds(bounds)

  mapUnwatch()
})
</script>
<template>
  <div class="map-container">
    <GoogleMap
      ref="mapRef"
      class="map"
      :apiKey="googleKey"
      :mapId="googleMapId"
      gesture-handling="greedy"
      :zoom-control="false"
      :map-type-control="false"
      :fullscreen-control="false"
      :scale-control="false"
    >
      <!-- Destinations -->
      <article v-if="showDestinations">
        <MapMarkerComponent
          v-for="(destination, index) in destinations"
          :key="destination.id"
          :place="destination.place"
          :z-index="2"
          :label="`${index + 1}`"
          marker-type="Destination"
          @click="() => openCustomInfoWindow(destination.place.id)"
        />
      </article>

      <!-- Activities -->
      <article v-if="showActivities">
        <MapMarkerComponent
          v-for="marker in activities"
          :key="marker.place.name"
          :place="marker.place"
          :z-index="0"
          @click="() => openCustomInfoWindow(marker.place.id)"
        />
      </article>

      <!-- Housing -->
      <article v-if="showHousing">
        <MapMarkerComponent
          v-for="marker in housing"
          :key="marker.place.name"
          :place="marker.place"
          :z-index="1"
          marker-type="Bed"
        />
      </article>

      <!-- New Activity -->
      <MapMarkerComponent
        v-if="
          mapCenter &&
          !activities?.find(a => a.place.id === currentPlace) &&
          !transportations?.find(
            t =>
              t.destinationTerminal.id === currentPlace ||
              t.originTerminal.id === currentPlace,
          )
        "
        :place="mapCenter"
        :z-index="0"
        marker-type="New"
      />

      <!-- Transportations -->
      <section v-if="showTransportations">
        <article
          v-for="transport in transportations"
          :key="transport.originTerminal.id + transport.destinationTerminal.id"
        >
          <Polyline
            :options="{
              path: transport.path,
              geodesic: true,
            }"
          />
          <MapMarkerComponent
            :place="transport.originTerminal"
            :marker-type="transport.type"
            :z-index="0"
            @click="id => openCustomInfoWindow(id)"
          />
          <MapMarkerComponent
            :place="transport.destinationTerminal"
            :marker-type="transport.type"
            :z-index="0"
            @click="id => openCustomInfoWindow(id)"
          />
        </article>
      </section>
    </GoogleMap>

    <MapSearchComponent
      :map="mapRef?.map"
      @place-selected="(placeId: string) => openCustomInfoWindow(placeId)"
      class="auto-complete-container"
    />

    <Transition>
      <MapInfoWindow
        v-if="currentPlace"
        :placeId="currentPlace"
        @close="closeCustomInfoWindow"
        @location-loaded="centralizeOnLocation"
      />
    </Transition>
  </div>
</template>

<style scope>
.map-container {
  width: 100%;
  height: 100%;
  position: relative;
}
.map {
  width: 100%;
  height: 100%;
}

.auto-complete-container {
  width: 100%;
  position: absolute;
  top: 0;
  padding: var(--large-spacing);
  display: flex;
  justify-content: center;
  .auto-complete {
    width: 25rem;
    max-width: 100%;
  }
}

.v-enter-active,
.v-leave-active {
  transition: all var(--default-transition) ease;
}

.v-enter-from,
.v-leave-to {
  transform: translateX(calc(-1 * var(--large-spacing)));
  opacity: 0;
}
</style>
