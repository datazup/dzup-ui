import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('./pages/HomePage.vue'),
    },
    {
      path: '/buttons',
      name: 'buttons',
      component: () => import('./pages/ButtonsPage.vue'),
    },
    {
      path: '/inputs',
      name: 'inputs',
      component: () => import('./pages/InputsPage.vue'),
    },
    {
      path: '/feedback',
      name: 'feedback',
      component: () => import('./pages/FeedbackPage.vue'),
    },
    {
      path: '/overlays',
      name: 'overlays',
      component: () => import('./pages/OverlaysPage.vue'),
    },
    {
      path: '/cards',
      name: 'cards',
      component: () => import('./pages/CardsPage.vue'),
    },
    {
      path: '/data',
      name: 'data',
      component: () => import('./pages/DataPage.vue'),
    },
    {
      path: '/forms',
      name: 'forms',
      component: () => import('./pages/FormsPage.vue'),
    },
    {
      path: '/layout',
      name: 'layout',
      component: () => import('./pages/LayoutPage.vue'),
    },
    {
      path: '/navigation',
      name: 'navigation',
      component: () => import('./pages/NavigationPage.vue'),
    },
    {
      path: '/media',
      name: 'media',
      component: () => import('./pages/MediaPage.vue'),
    },
    {
      path: '/typography',
      name: 'typography',
      component: () => import('./pages/TypographyPage.vue'),
    },
  ],
})

export default router
