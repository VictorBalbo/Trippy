import { createRouter, createWebHistory } from 'vue-router'
import PlanView from '@/views/PlanView.vue'
import DestinationView from '@/views/DestinationView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: { name: 'Plan' } },
    {
      path: '/plan',
      name: 'Plan',
      component: PlanView,
    },
    {
      path: '/destination/:id',
      name: 'Destination',
      component: DestinationView,
    },
  ],
})

export default router
