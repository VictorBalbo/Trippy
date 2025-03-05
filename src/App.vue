<script setup lang="ts">
import { RouterView } from 'vue-router'
import { MapComponent } from '@/components'
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
