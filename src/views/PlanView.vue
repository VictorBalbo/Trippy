<script setup lang="ts">
import dayjs from 'dayjs'
import { watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useMapStore, useTripStore } from '@/stores'
import { CardComponent, TripPlanComponent } from '@/components'

const tripStore = useTripStore()
const { name, startDate, endDate, destinations, activities, housing } =
  storeToRefs(tripStore)
const mapStore = useMapStore()
const { mapCenter } = storeToRefs(mapStore)

watch(name, () => {
  console.log('destinations')
  if (destinations.value && destinations.value.length > 1) {
    mapCenter.value = destinations.value.map(d => d.place)
  } else {
    mapCenter.value = activities.value
      .map(a => a.place)
      .concat(housing.value.map(a => a.place))
  }
})
</script>
<template>
  <div class="plan-view">
    <header class="header">
      <h2>{{ name }}</h2>
      <small>
        {{ dayjs(startDate).utc().format('DD MMM') }} -
        {{ dayjs(endDate).utc().format('DD MMM') }}
      </small>
    </header>
    <main>
      <CardComponent class="card-info">
        <TripPlanComponent />
      </CardComponent>
    </main>
  </div>
</template>
<style scoped>
.plan-view {
  margin: var(--large-spacing);
}
.header {
  margin-bottom: var(--large-spacing);
}
.card-info {
  padding: var(--large-spacing);
}
.divider {
  margin: var(--small-spacing) 0;
}
</style>
