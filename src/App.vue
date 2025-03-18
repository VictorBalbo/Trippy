<script setup lang="ts">
import { RouterView } from 'vue-router'
import { MapComponent, ScrollPanel } from '@/components'
import SplitterComponent from './components/SplitterComponent.vue'
</script>

<template>
  <SplitterComponent layout="vertical">
    <template #top>
      <MapComponent class="map-component" />
    </template>

    <template #bottom>
      <ScrollPanel class="scroll-panel">
        <RouterView />
      </ScrollPanel>
    </template>
  </SplitterComponent>
</template>

<style scoped>
.scroll-panel {
  height: 100%;
  --p-scrollpanel-bar-background: var(--color-border);
  --p-scrollpanel-bar-size: var(--small-spacing);
}
</style>
