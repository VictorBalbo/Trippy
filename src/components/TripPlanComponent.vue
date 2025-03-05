<script setup lang="ts">
import dayjs from 'dayjs'
import Draggable from 'vuedraggable'
import { InputNumber } from '.'
import { useTripStore } from '@/stores'
import type { Destination } from '@/models'
import { BedIcon, HikingIcon, MoonIcon } from '@/components/icons'
import { storeToRefs } from 'pinia'

const tripStore = useTripStore()
const { destinations } = storeToRefs(tripStore)

const updateNights = (destination: Destination, nights: number) => {
  let change = 0
  let isNewEndDateInValid = false
  destinations.value = tripStore.destinations
    .sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    )
    .map(d => {
      if (d.id === destination.id) {
        const previousNights = dayjs(destination.endDate).diff(
          destination.startDate,
          'days',
        )
        change = nights - previousNights
        isNewEndDateInValid = dayjs(d.endDate)
          .add(change, 'd')
          .isBefore(dayjs(d.startDate), 'd')
        if (!isNewEndDateInValid) {
          d.endDate = dayjs(d.endDate).add(change, 'd').toDate()
        }
      } else {
        if (!isNewEndDateInValid) {
          d.startDate = dayjs(d.startDate).add(change, 'd').toDate()
          d.endDate = dayjs(d.endDate).add(change, 'd').toDate()
        }
      }
      return d
    })
  tripStore.saveTrip()
}

const onDestinationReorder = () => {
  for (let i = 1; i < destinations.value.length; i++) {
    const nights = dayjs(destinations.value[i].endDate).diff(
      destinations.value[i].startDate,
      'days',
    )
    destinations.value[i].startDate = destinations.value[i - 1].endDate
    destinations.value[i].endDate = dayjs(destinations.value[i].startDate)
      .add(nights, 'd')
      .toDate()
  }
  tripStore.saveTrip()
}
</script>

<template>
  <table class="plan-table">
    <thead>
      <tr>
        <th class="destination"></th>
        <th class="nights">
          <article class="header"><MoonIcon class="icon" />Nights</article>
        </th>
        <th class="activities">
          <article class="header">
            <HikingIcon class="icon" />Activities
          </article>
        </th>
        <th class="housing">
          <article class="header"><BedIcon class="icon" />Housing</article>
        </th>
      </tr>
    </thead>
    <Draggable
      v-model="destinations"
      item-key="id"
      handle=".destination"
      tag="tbody"
      :animation="200"
      :component-data="{
        tag: 'TransitionGroup',
        name: 'flip-list',
      }"
      @change="onDestinationReorder"
    >
      <template #item="{ element }">
        <tr>
          <td class="item destination">
            <h2 class="elipsis">{{ element.place.name }}</h2>
            <p>
              {{ dayjs(element.startDate).utc().format('ddd DD/MM') }} -
              {{ dayjs(element.endDate).utc().format('ddd DD/MM') }}
            </p>
          </td>
          <td class="item nights">
            <InputNumber
              title="Nights"
              :value="dayjs(element.endDate).diff(element.startDate, 'days')"
              @update:model-value="(e: number) => updateNights(element, e)"
              :min="0"
            />
          </td>
          <td class="item activities">
            <p class="elipsis">{{ element.activities?.length ?? 0 }}</p>
          </td>
          <td class="item housing elipsis">
            <p class="elipsis">
              {{
                element?.housing?.name ?? element?.housing?.place.name ?? '-'
              }}
            </p>
          </td>
        </tr>
      </template>
    </Draggable>
  </table>
</template>

<style scoped>
.plan-table {
  width: 100%;
}
.icon {
  width: 1rem;
  height: 1rem;
  fill: white;
}
.header {
  display: flex;
  justify-content: center;
  align-items: center;
  .icon {
    margin-right: 0.25rem;
  }
}
.item {
  text-align: center;
  height: 100%;
}
.destination {
  text-align: start;
  min-width: 11.75rem;
}
.nights {
  min-width: 7.5rem;
  width: 7.5rem;
}
.activities {
  width: 7.5rem;
  @media (max-width: 500px) {
    display: none;
  }
}
.housing {
  @media (max-width: 700px) {
    display: none;
  }
  width: 14rem;
}
</style>
