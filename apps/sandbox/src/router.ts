import { createRouter, createWebHistory } from 'vue-router'
import { routerRoutes } from './routes.ts'

const router = createRouter({
  history: createWebHistory(),
  routes: routerRoutes,
})

export default router
