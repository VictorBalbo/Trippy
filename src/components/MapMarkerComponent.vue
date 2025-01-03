<script setup lang="ts">
import { AdvancedMarker } from 'vue3-google-map'
import { BedIcon, PlaneIcon, TrainIcon } from '@/components/icons'
import type { Place } from '@/models'
import { ref, useTemplateRef } from 'vue'

const { place, markerType } = defineProps<{
  place: Place
  markerType?: string
}>()
const emit = defineEmits(['click'])

const bedIcon = useTemplateRef('BedIconRef')
const planeIcon = useTemplateRef('PlaneIconRef')
const trainIcon = useTemplateRef('TrainIconRef')

const background = ref<string>()
const borderColor = ref<string>()
const glyphColor = ref<string>()

const getIconForTransportation = () => {
  switch (markerType) {
    case 'Bed':
      return bedIcon
    case 'Plane':
      return planeIcon
    case 'Train':
      return trainIcon
    default:
      return
  }
}
const getColorFromVariables = (color: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(color)
const getMarkerColor = () => {
  switch (markerType) {
    case 'Bed':
      background.value = getColorFromVariables('--color-blue')
      borderColor.value = getColorFromVariables('--color-dark-blue')
      glyphColor.value = getColorFromVariables('--color-light-gray')
      break
    case 'Plane':
    case 'Train':
      background.value = getColorFromVariables('--color-green')
      borderColor.value = getColorFromVariables('--color-dark-green')
      glyphColor.value = getColorFromVariables('--color-light-gray')
      break
    case 'New':
      background.value = '#658c96'
      borderColor.value = '#3e5871'
      glyphColor.value = '#1a252f'
      break
    default:
      break
  }
}
getMarkerColor()
</script>

<template>
  <AdvancedMarker
    :animation="2"
    :options="{
      position: place.coordinates,
      title: place.name,
    }"
    :pinOptions="{
      // scale: place.id === currentPlace ? 1.25 : 1,
      glyphColor: glyphColor,
      glyph: getIconForTransportation()?.value?.$el,
      background: background,
      borderColor: borderColor,
    }"
    @click="() => emit('click', place.id)"
  />
  <BedIcon
    v-if="markerType === 'Bed'"
    ref="BedIconRef"
    :style="{
      width: '14px',
    }"
  />
  <PlaneIcon
    v-else-if="markerType === 'Plane'"
    ref="PlaneIconRef"
    :style="{
      width: '14px',
    }"
  />
  <TrainIcon
    v-else-if="markerType === 'Train'"
    ref="TrainIconRef"
    :style="{
      width: '14px',
    }"
  />
</template>
