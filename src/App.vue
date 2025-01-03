<script setup lang="ts">
import { RouterView } from 'vue-router'
import { MapComponent } from '@/components'
import { apiUrl } from '@/constants'
import type { Trip } from './models'
import { useTripStore } from './stores'

const tripStore = useTripStore()

const loadTrip = async () => {
  const tripResponse = await fetch(
    `${apiUrl}/trip/f19c2817-bbc6-ef11-88cf-002248defd2d`,
  )
  const trip = (await tripResponse.json()) as Trip
  tripStore.setTrip(trip)
}
loadTrip()
</script>

<template>
  <div class="app">
    <main class="main">
      <RouterView />
    </main>
    <aside class="aside">
      <MapComponent class="map-component" />
    </aside>
  </div>
</template>

<style scoped>
.app {
  display: flex;
  flex-direction: row;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
.main {
  width: 100%;
  max-width: 45rem;
}
.aside {
  height: 100%;
  position: relative;
  flex-grow: 1;
}
</style>
