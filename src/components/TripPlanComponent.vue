<script setup lang="ts">
import dayjs from 'dayjs'
import Draggable from 'vuedraggable'
import { InputNumber } from '.'
import { useTripStore } from '@/stores'
import type { Destination } from '@/models'
import { BadgeComponent } from '@/components'
import { BedIcon, HikingIcon, MoonIcon } from '@/components/icons'
import { storeToRefs } from 'pinia'

const tripStore = useTripStore()
const { destinations } = storeToRefs(tripStore)

const updateNights = (destination: Destination, nights: number) => {
  let change = 0
  let isNewEndDateInValid = false
  destinations.value = tripStore.destinations
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
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
  <section class="plan-list">
    <section class="plan-header">
      <article class="item destination"></article>
      <article class="item nights"><MoonIcon class="icon" />Nights</article>
      <article class="item activities">
        <HikingIcon class="icon" />Activities
      </article>
      <article class="item housing"><BedIcon class="icon" />Housing</article>
    </section>
    <Draggable
      v-model="destinations"
      item-key="id"
      handle=".badge"
      tag="article"
      :animation="200"
      :component-data="{
        tag: 'TransitionGroup',
        name: 'flip-list',
      }"
      @change="onDestinationReorder"
    >
      <template
        #item="{ element, index }: { element: Destination; index: number }"
      >
        <section class="plan-body">
          <article class="item badge">
            <BadgeComponent :value="index + 1" />
          </article>
          <article class="item destination">
            <h2 class="elipsis">{{ element.place.name }}</h2>
            <p>
              {{ dayjs(element.startDate).utc().format('ddd DD/MM') }} -
              {{ dayjs(element.endDate).utc().format('ddd DD/MM') }}
            </p>
          </article>
          <article class="item nights">
            <InputNumber
              title="Nights"
              :value="dayjs(element.endDate).diff(element.startDate, 'days')"
              @update:model-value="(e: number) => updateNights(element, e)"
              :min="0"
            />
          </article>
          <article class="item activities">
            <p class="elipsis">{{ element.activities?.length ?? 0 }}</p>
          </article>
          <article class="item housing">
            <span class="elipsis">
              {{ element.housing?.name ?? element?.housing?.place.name ?? '-' }}
            </span>
            <p v-if="element.housing" class="booked">Booked</p>
          </article>
        </section>
      </template>
    </Draggable>
  </section>
</template>

<style scoped>
.plan-list {
  width: 100%;
}
.plan-header {
  display: flex;
  flex-direction: row;
  .item {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 3rem;
  }
  .icon {
    width: 1rem;
    height: 1rem;
    margin-right: 0.25rem;
  }
}
.plan-body {
  display: flex;
  flex-direction: row;
  height: 100%;
  padding: var(--small-spacing) 0;
  border-top: 1px solid var(--color-border);
  .item {
    height: 4rem;
    padding: var(--small-spacing);
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    border-radius: var(--small-spacing);
    transition: var(--default-transition);
  }
  .destination {
    text-align: start;
    &:hover {
      background-color: var(--color-background-blue);
    }
  }
  .nights {
    padding: 0;
  }
  .activities {
    &:hover {
      background-color: var(--color-background-red);
    }
  }
  .housing {
    .booked {
      color: var(--color-text-green);
    }
    &:hover {
      background-color: var(--color-background-green);
    }
  }
}
/* Badge + Destination + Nights + Activities + Housing = 41rem */
.badge {
  padding: 0 !important;
  width: 1.5rem;
  margin-right: var(--small-spacing);
  cursor: grab;
}
.destination {
  min-width: 11.5rem;
  width: 100%;
}
.nights {
  min-width: 7.5rem;
}
.activities {
  min-width: 7rem;
  @media (max-width: 510px) {
    display: none !important;
  }
}
.housing {
  min-width: 13rem;
  @media (max-width: 700px) {
    display: none !important;
  }
}
.elipsis {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>
