import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

import '@/assets/main.css'

dayjs.extend(utc)

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      cssLayer: true,
    },
  },
})

app.mount('#app')
