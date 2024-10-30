<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { useTripStore } from '@/stores'
import type { Place, MapPlace } from '@/models'
import { MapsService } from '@/services'

const props = defineProps<{
  placeId: string
}>()
const emit = defineEmits(['close', 'locationLoaded'])
const tripStore = useTripStore()

const place = ref<MapPlace>()
const tripActivity = computed(() =>
  tripStore.activities?.find(a => a.placeId === props.placeId),
)

const centralizeMap = (location: Place) => emit('locationLoaded', location)
const closeWindow = () => emit('close')

watchEffect(async () => {
  place.value = undefined
  place.value = await MapsService.getDetaisForPlaceId(props.placeId)
  if (place.value && place.value.coordinates) {
    centralizeMap(place.value)
  }
})
</script>
<template>
  <section class="info-window-container">
    HIIIIIIIIIIII
    {{ place?.name }}
  </section>
</template>

<style scoped>
.info-window-container {
  width: 25rem;
  height: 100%;
  position: absolute;
  bottom: 0;
  padding: var(--large-spacing);
  @media (max-width: 480px) {
    width: 100%;
    padding: 0;
  }
}
</style>
