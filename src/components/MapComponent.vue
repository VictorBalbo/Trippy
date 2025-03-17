<script setup lang="ts">
import { ref, watch, useTemplateRef } from 'vue'
import { GoogleMap, Polyline } from 'vue3-google-map'
import { storeToRefs } from 'pinia'
import { googleKey, googleMapId } from '@/constants'
import { useMapStore, useTripStore } from '@/stores'
import type { Place } from '@/models'
import {
  MapInfoWindow,
  MapMarkerComponent,
  MapSearchComponent,
} from '@/components'

const {
  showDestinations = true,
  showActivities = true,
  showTransportations = true,
  showHousing = true,
} = defineProps<{
  showDestinations?: boolean
  showActivities?: boolean
  showTransportations?: boolean
  showHousing?: boolean
}>()

const tripStore = useTripStore()
const { activities, destinations, housing, transportations } =
  storeToRefs(tripStore)
const mapStore = useMapStore()
const { distances, selectedPlaceId, mapCenter } = storeToRefs(mapStore)

const newActivity = ref<Place>()

const mapRef = useTemplateRef<typeof GoogleMap>('mapRef')

const openCustomInfoWindow = async (placeId?: string) => {
  console.log('Open', placeId)
  if (selectedPlaceId.value !== placeId) {
    newActivity.value = undefined
    selectedPlaceId.value = placeId
  }
}
const closeCustomInfoWindow = async () => {
  newActivity.value = undefined
  selectedPlaceId.value = undefined
}
const centralizeOnLocation = async (location: Place) => {
  newActivity.value = location
  mapCenter.value = [location]
}
const mapUnwatch = watch(
  () => mapRef.value?.ready,
  () => {
    if (!mapRef.value?.ready) {
      return
    }

    mapRef.value?.map.addListener('click', (e: any) => {
      if (e.placeId) {
        openCustomInfoWindow(e.placeId)
        e.stop()
      }
    })
    mapUnwatch()
  },
)
watch(mapCenter, () => {
  // Set map boundries to fit all markers
  const latLngBounds = mapRef.value?.api.LatLngBounds
  const bounds = new latLngBounds()

  if (mapCenter.value.length > 1) {
    mapCenter.value.forEach(d => bounds.extend(d.coordinates))
    mapRef.value?.map.fitBounds(bounds, 50)
  } else if (mapCenter.value.length === 1) {
    const minZoom = 12
    if (mapRef.value?.map.zoom && mapRef.value?.map.zoom <= minZoom) {
      mapRef.value.map.zoom = minZoom
    }
    mapRef.value?.map.panTo(mapCenter.value[0].coordinates)
  }
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
      :zoom="3"
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
          newActivity &&
          !activities?.find(a => a.place.id === selectedPlaceId) &&
          !transportations?.find(
            t =>
              t.destinationTerminal.id === selectedPlaceId ||
              t.originTerminal.id === selectedPlaceId,
          )
        "
        :place="newActivity"
        :z-index="0"
        marker-type="New"
      />

      <!-- Transportations -->
      <section v-if="showTransportations">
        <article
          v-for="transport in transportations"
          :key="transport.originTerminalId + transport.destinationTerminalId"
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
      <!-- Distances -->
      <Polyline
        v-for="(distance, index) in distances"
        :key="index"
        :options="{
          path: distance.walking.decodedPolyline,
          geodesic: true,
        }"
      />
    </GoogleMap>

    <MapSearchComponent
      :map="mapRef?.map"
      @place-selected="(placeId: string) => openCustomInfoWindow(placeId)"
      class="auto-complete-container"
    />

    <Transition>
      <MapInfoWindow
        v-if="selectedPlaceId"
        :placeId="selectedPlaceId"
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
