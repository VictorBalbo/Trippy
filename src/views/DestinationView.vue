<script setup lang="ts">
import dayjs from 'dayjs'
import { ref, watchEffect } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import type {
  Activity,
  Destination,
  Housing,
  Place,
  Transportation,
} from '@/models'
import { useMapStore, useTripStore } from '@/stores'
import { CardComponent } from '@/components'
import { ArrowRight } from '@/components/icons'
import { MapsService } from '@/services'
import { getCurrencySymbol, sanitizeUrl } from '@/utils/utils'

const tripStore = useTripStore()
const { destinations, transportations } = storeToRefs(tripStore)
const mapStore = useMapStore()
const { mapCenter } = storeToRefs(mapStore)

const route = useRoute()

const destinationId = route.params.id
const destination = ref<Destination>()
const housing = ref<Housing>()
const activities = ref<Activity[]>()
const arrival = ref<Transportation>()
const departure = ref<Transportation>()

watchEffect(() => {
  destination.value = destinations.value.find(d => d.id === destinationId)
  if (!destination.value) {
    return
  }
  housing.value = destination.value?.housing
  activities.value = destination.value?.activities
  arrival.value = transportations.value.find(
    t =>
      destination.value?.placeId === t.destinationId &&
      dayjs(destination.value?.startDate)
        .utc()
        .isSame(dayjs(t.endDate).utc(), 'day'),
  )
  departure.value = transportations.value.find(
    t =>
      destination.value?.placeId === t.originId &&
      dayjs(destination.value?.endDate)
        .utc()
        .isSame(dayjs(t.startDate).utc(), 'day'),
  )
  let places: Place[] = [destination.value.place]
  if (activities.value?.length) {
    places = [...places, ...activities.value.map(a => a.place)]
  }
  if (housing.value) {
    places = [...places, housing.value.place]
  }
  if (arrival.value) {
    console.log(arrival.value)
    places = [...places, arrival.value.destinationTerminal]
  }
  if (departure.value) {
    console.log(departure.value)
    places = [...places, departure.value.originTerminal]
  }
  mapCenter.value = places
})
</script>

<template>
  <header>
    <img
      :src="MapsService.getPhotoForPlace(destination?.place?.images ?? [])"
      :srcset="
        MapsService.getMediumPhotoForPlace(destination?.place?.images ?? [])
      "
      class="cover-image"
    />
    <section class="destination-header">
      <article>
        {{ dayjs(destination?.endDate).diff(destination?.startDate, 'days') }}
        {{
          dayjs(destination?.endDate).diff(destination?.startDate, 'days') > 1
            ? 'nights'
            : 'night'
        }}
      </article>
      <h1>
        {{ destination?.place.name }}
      </h1>
      <article>
        {{ dayjs(destination?.startDate).utc().format('DD MMM') }} -
        {{ dayjs(destination?.endDate).utc().format('DD MMM') }}
      </article>
    </section>
  </header>
  <CardComponent v-if="destination?.housing" class="card housing">
    <section class="info">
      <h4>Sleep in {{ destination.place.name }}</h4>
      <p>{{ destination.housing.name }}</p>
      <p class="dates">
        {{ dayjs(destination.housing.checkin).utc().format('ddd DD/MM HH:mm') }}
        <ArrowRight class="icon" />
        {{
          dayjs(destination.housing.checkout).utc().format('ddd DD/MM HH:mm')
        }}
      </p>
      <p v-if="destination.housing.price.value">
        <small>
          {{ getCurrencySymbol(destination.housing.price.currency ?? '') }}
          {{ destination.housing.price.value.toFixed(2) }}
        </small>
      </p>
      <small class="bottom">
        <a :href="destination.housing.place.mapsUrl">
          {{ destination.housing.place.vicinity }}
        </a>
      </small>
      <small v-if="destination.housing.website">
        <a :href="destination.housing.website" target="_blank" rel="noopener">
          {{ sanitizeUrl(destination.housing.website) }}
        </a>
      </small>
    </section>
    <img
      v-if="destination.housing.image"
      :src="destination.housing.image"
      class="housing-cover"
    />
  </CardComponent>

  <CardComponent v-if="arrival || departure" class="card transport">
    <section v-if="arrival" class="arrival">
      <h4>Arrival</h4>
      <small>{{ arrival.type }}</small>
      <p>{{ arrival.company }} {{ arrival.number }}</p>
      <p>
        {{ dayjs(arrival.endDate).utc().format('ddd, DD/MM - HH:mm') }}
      </p>
      <small>
        <a :href="arrival.destinationTerminal.mapsUrl">
          {{ arrival.destinationTerminal.name }}
        </a>
      </small>
    </section>
    <section v-if="departure" class="departure">
      <h4>Departure</h4>
      <small>{{ departure.type }}</small>
      <p>
        {{ departure.company }}
        {{ departure.number }}
      </p>
      <p>
        {{ dayjs(departure.startDate).utc().format('ddd, DD/MM - HH:mm') }}
      </p>
      <small>
        <a :href="departure.destinationTerminal.mapsUrl">
          {{ departure.destinationTerminal.name }}
        </a>
      </small>
    </section>
  </CardComponent>

  <CardComponent
    v-for="activity in destination?.activities"
    :key="activity.id"
    class="card activity"
  >
    <section class="info">
      <h4>
        {{ activity.place.name }}
      </h4>
      <small severity="danger"> {{ activity.place.categories?.[0] }}</small>
      <p v-if="activity.dateTime">
        {{ dayjs(activity.dateTime).utc().format('ddd DD/MM - HH:mm') }}
      </p>
      <p v-if="activity.price?.value">
        {{ getCurrencySymbol(activity.price.currency ?? '') }}
        {{ activity.price.value.toFixed(2) }}
      </p>
      <small v-if="activity.website ?? activity.place.website" class="bottom">
        <a :href="activity.website ?? activity.place.website">
          {{ sanitizeUrl(activity.website ?? activity.place.website!) }}
        </a>
      </small>
    </section>
    <img
      v-if="activity?.place?.images?.length"
      :src="MapsService.getPhotoForPlace(activity.place.images)"
      class="activity-cover"
    />
  </CardComponent>
</template>

<style scoped>
.cover-image {
  width: 100%;
  height: 20rem;
  object-fit: cover;

  --mask: linear-gradient(
    to left,
    rgba(0, 0, 0, 1) 50%,
    rgba(0, 0, 0, 0.3) 100%
  );

  -webkit-mask-image: var(--mask);
  mask-image: var(--mask);
}
.destination-header {
  height: 20rem;
  position: absolute;
  top: 0;

  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-left: var(--large-spacing);
}

.card {
  margin: var(--large-spacing);
}
.icon {
  width: 1rem;
  color: var(--color-text);
  margin: 0 var(--large-spacing);
}

.housing {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  .info {
    padding: var(--large-spacing);
    display: flex;
    flex-direction: column;
    .dates {
      display: flex;
      align-items: center;
    }
  }
  .housing-cover {
    width: 250px;
    height: 215px;
    object-fit: cover;
    --mask: linear-gradient(
      to left,
      rgba(0, 0, 0, 1) 95%,
      rgba(0, 0, 0, 0) 100%
    );

    -webkit-mask-image: var(--mask);
    mask-image: var(--mask);
  }
}

.transport {
  padding: var(--large-spacing);
  display: flex;
  flex-direction: row;
  .arrival {
    width: 50%;
    margin-right: var(--large-spacing);
  }
  .departure {
    width: 50%;
  }
}

.activity {
  height: 10rem;
  display: flex;
  justify-content: space-between;
  .info {
    display: flex;
    flex-direction: column;
    padding: var(--large-spacing);
  }
  .activity-cover {
    width: 250px;
    object-fit: cover;
    --mask: linear-gradient(
      to left,
      rgba(0, 0, 0, 1) 95%,
      rgba(0, 0, 0, 0) 100%
    );

    -webkit-mask-image: var(--mask);
    mask-image: var(--mask);
  }
}
.bottom {
  margin-top: auto;
}
</style>
