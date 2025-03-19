<script setup lang="ts">
import { decode } from '@googlemaps/polyline-codec'
import type { Activity, Coordinates, DistanceBetweenPlaces } from '@/models'
import {
  getCurrencySymbol,
  getDisplayDistance,
  getDisplayDuration,
  getMapsDirectionLink,
  isSameDay,
  sanitizeUrl,
  utcDate,
} from '@/utils'
import { ref, watch } from 'vue'
import CardComponent from './CardComponent.vue'
import { MapsService } from '@/services'
import { useMapStore } from '@/stores'
import { DividerComponent } from '.'
import { WalkingIcon } from './icons'

const { activities, startDate, endDate } = defineProps<{
  activities: Activity[]
  startDate: Date
  endDate: Date
}>()
const activitiesByDate = ref<Record<string, Activity[]>>({})
const distanceByDate = ref<Record<string, number>>({})
const distancesBetweenPlaces = ref<Record<string, DistanceBetweenPlaces>>({})
const mapStore = useMapStore()

const getDistanceBetween = (activity1?: Activity, activity2?: Activity) =>
  distancesBetweenPlaces.value[`${activity1?.place.id}:${activity2?.place.id}`]
const setDistanceBetween = (distance: DistanceBetweenPlaces) => {
  distancesBetweenPlaces.value[
    `${distance.fromPlaceId}:${distance.toPlaceId}`
  ] = distance
}

watch(
  [() => startDate, () => endDate, () => activities],
  async () => {
    const daysDiff = utcDate(endDate).diff(utcDate(startDate), 'day')
    const walkingDistances: DistanceBetweenPlaces[] = []

    const noDateActivities = activities.filter(a => !a.dateTime)
    if (noDateActivities.length) {
      activitiesByDate.value['No Date'] = noDateActivities
    }
    for (let i = 0; i <= daysDiff; i++) {
      const day = utcDate(startDate).add(i, 'day')
      const dayStr = day.format('ddd, DD/MM')
      const dayActivities = activities
        .filter(a => isSameDay(a.dateTime, day.toDate()))
        .sort(
          (a, b) => (a.dateTime?.getTime() ?? 0) - (b.dateTime?.getTime() ?? 0),
        )
      distanceByDate.value[dayStr] = 0
      activitiesByDate.value[dayStr] = dayActivities

      for (let i = 1; i < dayActivities.length; i++) {
        const previousActivity = dayActivities[i - 1]
        const currentActivity = dayActivities[i]
        const distance = getDistanceBetween(previousActivity, currentActivity)
        if (distance) {
          walkingDistances.push(distance)
          distanceByDate.value[dayStr] += distance.walking.distance
        }
        if (!getDistanceBetween(previousActivity, currentActivity)) {
          const distance = await MapsService.getDistaceBetweenPlaces(
            previousActivity.place.id,
            currentActivity.place.id,
          )
          if (distance) {
            distance.walking.decodedPolyline = decode(
              distance.walking.polyline,
            ).map(c => {
              const coordinates: Coordinates = {
                lat: c[0],
                lng: c[1],
              }
              return coordinates
            })
            setDistanceBetween(distance)
            walkingDistances.push(distance)
            distanceByDate.value[dayStr] += distance.walking.distance
          }
        }
      }
    }
    mapStore.distances = walkingDistances
  },
  { immediate: true, deep: true },
)
</script>
<template>
  <section v-for="(activities, day) in activitiesByDate" :key="day" class="day">
    <DividerComponent class="divider" />
    <h3>{{ day }}</h3>
    <small v-if="distanceByDate[day]" class="day-distance"
      >Total walking distance:
      {{ getDisplayDistance(distanceByDate[day]) }}</small
    >
    <TransitionGroup name="list">
      <section
        v-for="(activity, index) in activities"
        :key="activity.id"
        @pointerenter="mapStore.markerFocus = activity.place"
        @pointerleave="mapStore.markerFocus = undefined"
        @click="mapStore.selectedPlaceId = activity.place.id"
      >
        <CardComponent class="activity">
          <article class="info">
            <h4>
              {{ activity.place.name }}
            </h4>
            <small severity="danger">
              {{ activity.place.categories?.[0] }}</small
            >
            <p v-if="activity.dateTime">
              {{ utcDate(activity.dateTime).format('ddd DD/MM - HH:mm') }}
            </p>
            <p v-if="activity.price?.value != undefined">
              {{ getCurrencySymbol(activity.price.currency ?? '') }}
              {{ activity.price.value.toFixed(2) }}
            </p>
            <small
              v-if="activity.website ?? activity.place.website"
              class="bottom"
            >
              <a :href="activity.website ?? activity.place.website">
                {{ sanitizeUrl(activity.website ?? activity.place.website!) }}
              </a>
            </small>
          </article>
          <img
            v-if="activity?.place?.images?.length"
            :src="MapsService.getPhotoForPlace(activity.place.images)"
            class="activity-cover"
          />
        </CardComponent>
        <a
          v-if="
            getDistanceBetween(activities?.[index], activities?.[index + 1])
          "
          :href="
            getMapsDirectionLink(
              activities?.[index]?.place,
              activities?.[index + 1]?.place,
              'walking',
            )
          "
          class="direction-link"
        >
          <WalkingIcon class="icon" />
          {{
            getDisplayDistance(
              getDistanceBetween(activities?.[index], activities?.[index + 1])
                .walking.distance,
            )
          }}
          ·
          {{
            getDisplayDuration(
              getDistanceBetween(activities?.[index], activities?.[index + 1])
                .walking.duration,
            )
          }}
        </a>
      </section>
    </TransitionGroup>
  </section>
</template>

<style scoped>
.day {
  margin: var(--large-spacing);
}
.divider {
  margin: var(--large-spacing) 0;
}
.day-distance {
  margin-bottom: var(--small-spacing);
  display: block;
}
.icon {
  height: 1rem;
}
.activity {
  height: 10rem;
  display: flex;
  justify-content: space-between;
  margin: var(--small-spacing) 0;
  cursor: pointer;
  .info {
    display: flex;
    flex-direction: column;
    padding: var(--large-spacing);
    min-width: 20rem;
  }
  .activity-cover {
    width: 250px;
    min-width: 3rem;
    aspect-ratio: 2;
    object-fit: cover;
    --mask: linear-gradient(
      to left,
      rgba(0, 0, 0, 1) 95%,
      rgba(0, 0, 0, 0) 100%
    );

    -webkit-mask-image: var(--mask);
    mask-image: var(--mask);
  }

  .bottom {
    margin-top: auto;
  }
}
.direction-link {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;

  .icon {
    margin-right: var(--small-spacing);
  }
}

.list-move, /* apply transition to moving elements */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
.list-leave-active {
  position: absolute;
}
</style>
