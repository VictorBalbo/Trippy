<script setup lang="ts">
import { ref, watch, useTemplateRef } from 'vue'
import { GoogleMap, AdvancedMarker, MarkerCluster } from 'vue3-google-map'
import { storeToRefs } from 'pinia'
import { googleKey, googleMapId } from '@/constants'
import { useTripStore } from '@/stores'
import type { Place } from '@/models'
import { MapInfoWindow, MapSearchComponent } from '@/components'
import { BedIcon } from '@/components/icons'

const tripStore = useTripStore()
const { activities, housing } = storeToRefs(tripStore)

const mapCenter = ref<Place>()
const currentPlace = ref<string>()

const mapRef = useTemplateRef<typeof GoogleMap>('mapRef')
const bedIconRef = useTemplateRef('bedIconRef')

const openCustomInfoWindow = async (placeId?: string) => {
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
const mapUnwatch = watch(
  () => mapRef.value?.ready,
  ready => {
    if (!ready) {
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
    activities.value?.forEach(a => bounds.extend(a.coordinates))
    housing.value?.forEach(a => bounds.extend(a.coordinates))
    mapRef.value?.api.event.addListenerOnce(
      mapRef.value?.map,
      'bounds_changed',
      () =>
        mapRef.value?.map.setZoom(Math.min(mapRef.value?.map.getZoom(), 14)),
    )
    mapRef.value?.map.fitBounds(bounds)

    mapUnwatch()
  },
)
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
      <MarkerCluster>
        <AdvancedMarker
          v-for="marker in activities"
          :key="marker.name"
          :animation="2"
          :options="{
            position: marker.coordinates,
            title: marker.name,
          }"
          :pin-options="{
            scale: marker.placeId === currentPlace ? 1.25 : 1,
          }"
          @click="() => openCustomInfoWindow(marker.placeId)"
        />
        <AdvancedMarker
          v-for="(marker, index) in housing"
          :key="marker.name"
          :animation="2"
          :options="{
            position: marker.coordinates,
            title: marker.name,
          }"
          :pin-options="{
            scale: marker.placeId === currentPlace ? 1.25 : 1,
            glyph: bedIconRef?.[index]?.$el,
          }"
        >
          <BedIcon
            ref="bedIconRef"
            :style="{
              width: '14px',
            }"
          />
        </AdvancedMarker>
        <AdvancedMarker
          v-if="mapCenter && !activities?.find(a => a.placeId === currentPlace)"
          :options="{
            position: mapCenter?.coordinates,
            title: mapCenter?.name,
          }"
          :animation="2"
          :pin-options="{
            borderColor: '#658c96',
            background: '#3e5871',
            glyphColor: '#1a252f',
            scale: 1.25,
          }"
        />
      </MarkerCluster>
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
