<script setup lang="ts">
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import type {
  Activity,
  Destination,
  DistanceBetweenPlaces,
  Housing,
  Place,
  Transportation,
} from '@/models'
import { useMapStore, useTripStore } from '@/stores'
import { CardComponent, Timeline } from '@/components'
import { ArrowRight } from '@/components/icons'
import { MapsService } from '@/services'
import {
  getCurrencySymbol,
  getDisplayDuration,
  getMapsDirectionLink,
  isSameDay,
  sanitizeUrl,
  utcDate,
} from '@/utils'

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
const arrivalDistanceToHome = ref<DistanceBetweenPlaces>()
const departure = ref<Transportation>()
const departureTimeFromHome = ref<DistanceBetweenPlaces>()

watch(
  [destinations, transportations],
  async () => {
    destination.value = destinations.value.find(d => d.id === destinationId)
    if (!destination.value) {
      return
    }
    housing.value = destination.value.housing
    activities.value = destination.value.activities

    arrival.value = transportations.value.find(
      t =>
        destination.value?.placeId === t.destinationId &&
        isSameDay(destination.value.startDate, t.endDate),
    )
    if (arrival.value && housing.value) {
      arrivalDistanceToHome.value = await MapsService.getDistaceBetweenPlaces(
        arrival.value.destinationTerminalId,
        housing.value.place.id,
      )
    }

    departure.value = transportations.value.find(
      t =>
        destination.value?.placeId === t.originId &&
        isSameDay(destination.value.endDate, t.startDate),
    )
    if (departure.value && housing.value) {
      departureTimeFromHome.value = await MapsService.getDistaceBetweenPlaces(
        housing.value.place.id,
        departure.value.originTerminalId,
      )
    }

    if (!mapCenter.value || !mapCenter.value.length) {
      let places: Place[] = [destination.value.place]
      if (activities.value?.length) {
        places = [...places, ...activities.value.map(a => a.place)]
      }
      if (housing.value) {
        places = [...places, housing.value.place]
      }
      if (arrival.value) {
        places = [...places, arrival.value.destinationTerminal]
      }
      if (departure.value) {
        places = [...places, departure.value.originTerminal]
      }
      mapCenter.value = places
    }
  },
  { immediate: true },
)
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
      <article v-if="destination?.startDate && destination?.endDate">
        {{
          utcDate(destination?.endDate).diff(
            utcDate(destination?.startDate),
            'days',
          )
        }}
        {{
          utcDate(destination?.endDate).diff(
            utcDate(destination?.startDate),
            'days',
          ) > 1
            ? 'nights'
            : 'night'
        }}
      </article>
      <h1>
        {{ destination?.place.name }}
      </h1>
      <article v-if="destination?.startDate && destination?.endDate">
        {{ utcDate(destination?.startDate).format('DD MMM') }} -
        {{ utcDate(destination?.endDate).format('DD MMM') }}
      </article>
    </section>
  </header>
  <CardComponent v-if="destination?.housing" class="card housing">
    <section class="info">
      <h4>Sleep in {{ destination.place.name }}</h4>
      <p>{{ destination.housing.name }}</p>
      <p v-if="housing?.checkin && housing?.checkout" class="dates">
        {{ utcDate(housing.checkin).format('ddd DD/MM HH:mm') }}
        <ArrowRight class="icon" />
        {{ utcDate(housing.checkout).format('ddd DD/MM HH:mm') }}
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
      <p v-if="arrival.endDate">
        {{ utcDate(arrival.endDate).format('ddd, DD/MM - HH:mm') }}
      </p>
      <p v-if="arrivalDistanceToHome">
        Time to Home:
        <a
          :href="
            getMapsDirectionLink(arrival.destinationTerminal, housing!.place)
          "
        >
          {{ getDisplayDuration(arrivalDistanceToHome.transit.duration) }}
        </a>
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
      <p v-if="departure.startDate">
        {{ utcDate(departure.startDate).format('ddd, DD/MM - HH:mm') }}
      </p>
      <p v-if="departureTimeFromHome">
        Time from Home:
        <a
          :href="getMapsDirectionLink(housing!.place, departure.originTerminal)"
        >
          {{ getDisplayDuration(departureTimeFromHome.transit.duration) }}
        </a>
      </p>
      <small>
        <a :href="departure.destinationTerminal.mapsUrl">
          {{ departure.destinationTerminal.name }}
        </a>
      </small>
    </section>
  </CardComponent>
  <Timeline
    v-if="destination?.startDate && destination?.endDate"
    :startDate="destination?.startDate"
    :endDate="destination?.endDate"
    :activities="activities!"
  />
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

.connector {
  margin-left: var(--small-spacing);
  padding-left: var(--small-spacing);
  border-left: 2px red solid;
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
