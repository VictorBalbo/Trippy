<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { useTripStore } from '@/stores'
import type { Place, MapPlace } from '@/models'
import { MapsService } from '@/services'
import ScrollPanel from 'primevue/scrollpanel'
import {
  Accordion,
  AccordionPanel,
  AccordionHeader,
  AccordionContent,
  ButtonComponent,
  CardComponent,
  ProgressSpinner,
} from '@/components'
import { AddIcon, GlobeIcon, StarIcon, TrashIcon } from '@/components/icons'

const props = defineProps<{ placeId: string }>()
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

const sanitizeUrl = (url: string) => new URL(url).hostname.replace('www.', '')
</script>
<template>
  <section class="info-window-container">
    <CardComponent class="info-window">
      <article class="close-button" @click="() => closeWindow()">
        <AddIcon class="close-icon" />
      </article>
      <section v-if="!place" class="info-window-loading">
        <ProgressSpinner />
      </section>
      <ScrollPanel v-else class="info-window-content-scroll">
        <section class="info-window-content">
          <img
            class="photo"
            :src="MapsService.getPhotoForPlace(place.images)"
            :alt="place.name"
          />
          <header class="header">
            <h2>{{ place.name }}</h2>
            <article>
              <h5 v-if="place.categories?.length">
                {{ place.categories[0] }}
              </h5>
            </article>
            <article v-if="place.rating" class="rating">
              <StarIcon class="icon" />
              <h3>{{ place.rating }} / 5</h3>
            </article>
            <article class="actions">
              <ButtonComponent
                v-if="!tripActivity"
                size="small"
                class="add-button"
                @click="() => tripStore.addActivityToTrip(place as Place)"
              >
                <AddIcon class="icon-button" /> Add to trip
              </ButtonComponent>
              <ButtonComponent
                v-else
                severity="danger"
                size="small"
                class="remove-button"
                @click="() => tripStore.removeActivityFromTrip(place as Place)"
              >
                <TrashIcon class="icon-button" /> Remove
              </ButtonComponent>
              <ButtonComponent
                as="a"
                :href="place.website"
                target="_blank"
                rel="noreferrer noopener"
                severity="secondary"
                size="small"
                class="link-button"
              >
                <GlobeIcon class="icon-button" /> Go to Website
              </ButtonComponent>
            </article>
          </header>
          <main class="body">
            <CardComponent class="card-info">
              <h3>Description</h3>
              <p>{{ place.description }}</p>
            </CardComponent>
            <CardComponent class="card-info">
              <h3>Address</h3>
              <a :href="place.mapsUrl" target="_blank" rel="noopener">{{
                place.address
              }}</a>
            </CardComponent>
            <CardComponent v-if="place.phoneNumber" class="card-info">
              <h3>Phone</h3>
              <a :href="`tel:${place.phoneNumber}`">{{ place.phoneNumber }}</a>
            </CardComponent>
            <CardComponent v-if="place.website" class="card-info website-card">
              <h3>Website</h3>
              <a :href="place.website" target="_blank" rel="noopener">{{
                sanitizeUrl(place.website)
              }}</a>
            </CardComponent>
            <CardComponent v-if="place.openingHours" class="card-info">
              <Accordion>
                <AccordionPanel value="1">
                  <AccordionHeader>
                    <section class="accordion-header">
                      <h3>Opening Hours</h3>
                      <h5 class="accordion-header-text">
                        {{
                          place.openingHours.weekday_text.find(o =>
                            o.startsWith(
                              new Date().toLocaleDateString('en-US', {
                                weekday: 'long',
                              }),
                            ),
                          )
                        }}
                      </h5>
                    </section>
                  </AccordionHeader>
                  <AccordionContent>
                    <p
                      v-for="(hours, index) in place.openingHours.weekday_text"
                      :key="index"
                      class="opening-hours"
                    >
                      {{ hours }}
                    </p>
                  </AccordionContent>
                </AccordionPanel>
              </Accordion>
            </CardComponent>
          </main>
        </section>
      </ScrollPanel>
    </CardComponent>
  </section>
</template>

<style scoped lang="css">
.info-window-container {
  width: 25rem;
  height: 100%;
  position: absolute;
  bottom: 0;
  padding: var(--large-spacing);
}
.info-window {
  width: 100%;
  height: 100%;
  position: relative;
  background-color: var(--color-background);
  overflow: auto;
}
.close-button {
  position: absolute;
  top: var(--large-spacing);
  right: var(--large-spacing);
  z-index: 2;
  background-color: var(--color-background);
  border: 1px solid;
  width: 40px;
  height: 40px;
  rotate: 45deg;
  border-radius: 2rem;
  padding: var(--small-spacing);
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  opacity: 0.5;
  transition: var(--default-transition);
  &:hover {
    opacity: 1;
  }
}

.info-window-loading {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.info-window-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.info-window-content-scroll {
  height: 100%;
}

.icon {
  transition: var(--default-transition);
  width: 1rem;
  margin-right: var(--small-spacing);
}
.icon-button {
  width: 1rem;
}

.photo {
  width: 100%;
  height: 15rem;
  object-fit: cover;
}

.header {
  display: flex;
  flex-direction: column;
  padding: var(--small-spacing) var(--large-spacing);
  background-color: var(--color-background-soft);

  .rating {
    margin-bottom: var(--small-spacing);
    display: flex;
    flex-direction: row;
    color: var(--color-yellow);
  }

  .actions {
    display: flex;
    flex-direction: row;
    justify-content: space-between;

    .add-button,
    .remove-button,
    .link-button {
      width: 48.5%;
    }
    .link-button {
      color: var(--color-text);
    }
  }
}

.body {
  padding: var(--large-spacing);

  .card-info {
    padding: var(--large-spacing);
    margin-bottom: var(--large-spacing);
  }
  .website-card {
    word-break: break-all;
  }
  .accordion-header-text {
    transition: var(--default-transition);
  }
  .p-accordionpanel-active .accordion-header-text {
    opacity: 0;
  }
}
</style>
