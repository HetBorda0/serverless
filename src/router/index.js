import { createRouter, createWebHistory } from 'vue-router'
import OTPCombined from '../views/OTPCombined.vue'

const routes = [
  {
    path: '/',
    name: 'OTPCombined',
    component: OTPCombined
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router 