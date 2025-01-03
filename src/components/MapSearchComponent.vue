<script setup lang="ts">
import { ref } from 'vue'
import type { Place } from '@/models'
import { AutoComplete } from '@/components'
import { MapsService } from '@/services'
import type { GoogleMap } from 'vue3-google-map'
import { distanceBetweenPoints } from '@/models/Coordinates'

const { map } = defineProps<{
  map: typeof GoogleMap
}>()
const emit = defineEmits(['placeSelected'])

const autocomplete = ref<string | Place>()
const suggestion = ref<Place[]>()
const isLoadingSuggestions = ref(false)
const searchLocation = async () => {
  try {
    isLoadingSuggestions.value = true
    if (!autocomplete.value) {
      return
    }

    const search =
      typeof autocomplete.value === 'string'
        ? autocomplete.value
        : autocomplete.value.name
    const center = map.getCenter()
    const centerCoordinates = { lat: center.lat(), lng: center.lng() }

    const northEast = map.getBounds().getNorthEast()
    const northEastCoordinates = { lat: northEast.lat(), lng: northEast.lng() }

    const radius = distanceBetweenPoints(
      centerCoordinates,
      northEastCoordinates,
    )
    const locations = await MapsService.getAutocompletePlaceName(
      search,
      centerCoordinates,
      radius,
    )
    suggestion.value = locations
  } finally {
    isLoadingSuggestions.value = false
  }
}
</script>

<template>
  <article class="auto-complete-container">
    <AutoComplete
      v-model="autocomplete"
      :suggestions="suggestion"
      option-label="name"
      :loading="isLoadingSuggestions"
      placeholder="Search for a place"
      class="auto-complete"
      dropdown
      @complete="searchLocation"
      @option-select="e => emit('placeSelected', e.value.id)"
    />
  </article>
</template>
