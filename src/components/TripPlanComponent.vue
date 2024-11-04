<script setup lang="ts">
import { useTripStore } from '@/stores'
import dayjs from 'dayjs'
import { InputNumber } from '.'
import type { Destination } from '@/models'

const tripStore = useTripStore()
const updateNights = (destination: Destination, nights: number) => {
  let change = 0
  let isNewEndDateInValid = false
  tripStore.destinations = tripStore.destinations?.map(d => {
    if (d.key === destination.key) {
      const previousNights = dayjs(destination.endDate).diff(
        destination.startDate,
        'days',
      )
      change = nights - previousNights
      isNewEndDateInValid = dayjs(d.endDate)
        .add(change, 'd')
        .isBefore(dayjs(d.startDate), 'd')
      if (!isNewEndDateInValid) {
        d.endDate = dayjs(d.endDate).add(change, 'd').toString()
      }
    } else {
      if (!isNewEndDateInValid) {
        d.startDate = dayjs(d.startDate).add(change, 'd').toString()
        d.endDate = dayjs(d.endDate).add(change, 'd').toString()
      }
    }
    return d
  })
}
</script>

<template>
  <table class="plan-table">
    <thead>
      <tr>
        <th class="destination"><MarkerIcon class="icon" /></th>
        <th class="nights"><MoonIcon class="icon" /> Nights</th>
        <th class="activities"><TicketIcon class="icon" /> Activities</th>
        <th class="housing"><BedIcon class="icon" /> Housing</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="destination in tripStore.destinations" :key="destination.name">
        <td class="item destination">
          <h2 class="elipsis">{{ destination.name }}</h2>
          <p>
            {{ dayjs(destination.startDate).format('ddd DD/MM') }} -
            {{ dayjs(destination.endDate).format('ddd DD/MM') }}
          </p>
        </td>
        <td class="item nights">
          <InputNumber
            title="Nights"
            :value="
              dayjs(destination.endDate).diff(destination.startDate, 'days')
            "
            @update:model-value="(e: number) => updateNights(destination, e)"
            :min="0"
          />
        </td>
        <td class="item activities">
          <p class="elipsis">{{ destination.activities?.length ?? 0 }}</p>
        </td>
        <td class="item housing elipsis">
          <p class="elipsis">{{ destination?.housing?.name ?? '-' }}</p>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
.plan-table {
  width: 100%;
}
.item {
  text-align: center;
  height: 100%;
}
.destination {
  text-align: start;
}
.nights {
  width: 7.5rem;
}
</style>
