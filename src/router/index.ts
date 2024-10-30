import { createRouter, createWebHistory } from 'vue-router'
import PlanView from '@/views/PlanView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: { name: 'Plan' } },
    {
      path: '/plan',
      name: 'Plan',
      component: PlanView
    },
  ]
})

export default router
