<script setup lang="ts">
import { CardComponent, TripPlanComponent } from '@/components'
import { useTripStore } from '@/stores'
import dayjs from 'dayjs'

const trip = useTripStore()
</script>
<template>
  <div class="plan-view">
    <header class="header">
      <h1>{{ trip.name }}</h1>
      <h5>
        {{ dayjs(trip.startDate).utc().format('DD MMM') }} -
        {{ dayjs(trip.endDate).utc().format('DD MMM') }}
      </h5>
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
