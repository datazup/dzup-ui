import { createRouter, createWebHistory } from 'vue-router'
import type { RouteLocationNormalized } from 'vue-router'
import HomePage from './pages/HomePage.vue'
import ProPage from './pages/ProPage.vue'
import BlocksIndexPage from './pages/BlocksIndexPage.vue'
import AnimationsPage from './pages/AnimationsPage.vue'
import { getTemplate } from './templates/registry.ts'

/**
 * Per-route document head. A route opts in via `meta.head`; routes without it
 * fall back to the static values authored in index.html (captured once below),
 * so navigating away from a page that set a title restores the home values.
 *
 * Done without a head library on purpose — the app has no head dependency and
 * docs/landing.md §8 calls for SEO meta without adding one. The title/description
 * also mirror into the Open Graph + Twitter tags so per-route share cards stay in
 * lockstep with the visible tab title.
 */
interface RouteHead {
  title: string
  description: string
}

declare module 'vue-router' {
  interface RouteMeta {
    head?: RouteHead
  }
}

/**
 * Guard for the template detail/preview routes: an unknown `slug` (one not in
 * the registry) redirects to the gallery rather than rendering a dead page
 * (docs/templates.md §3). The registry is empty during the foundation phase, so
 * every slug currently resolves here until the catalogue rows land.
 */
function resolveTemplateSlug(to: RouteLocationNormalized) {
  const slug = to.params.slug
  if (typeof slug === 'string' && getTemplate(slug)) return true
  return { path: '/templates' }
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomePage },
    // Phase 1: renders a "coming soon" / waitlist state. Phase 2 flips the
    // CTAs that point here to the published pro Storybook + pricing page.
    { path: '/pro', name: 'pro', component: ProPage },
    // Blocks — the first shipped Ecosystem offering (docs/blocks.md §3.1). The
    // index page is a placeholder until the catalog lands (Task A3). Carries its
    // own SEO head (title + description) — /blocks is a primary marketing surface
    // (docs/landing.md §8), so it must not inherit the generic home title.
    {
      path: '/blocks',
      name: 'blocks',
      component: BlocksIndexPage,
      meta: {
        head: {
          title: 'Blocks — pre-composed Vue 3 UI sections | dzup-ui',
          description:
            'Copy-paste UI blocks for Vue 3 — heroes, pricing tables, navbars, stat rows and auth forms built from @dzup-ui/core components and design tokens. Themed, accessible, light & dark out of the box.',
        },
      },
    },
    // Animations — the live motion gallery (docs/animations.md §4). Placeholder
    // page until the gallery shell + catalog land (Task 2).
    { path: '/animations', name: 'animations', component: AnimationsPage },
    // Templates — the free, full-page starters gallery (docs/templates.md §3).
    // Lazy-loaded like /pro; detail/preview resolve their slug against the
    // registry and redirect unknown slugs back to the gallery.
    { path: '/templates', name: 'templates', component: () => import('./pages/TemplatesPage.vue') },
    {
      path: '/templates/:slug',
      name: 'template-detail',
      component: () => import('./pages/TemplateDetailPage.vue'),
      props: true,
      beforeEnter: resolveTemplateSlug,
    },
    {
      path: '/templates/:slug/preview',
      name: 'template-preview',
      component: () => import('./pages/TemplatePreviewPage.vue'),
      props: true,
      beforeEnter: resolveTemplateSlug,
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  },
})

/** Read a `<meta>`'s content by selector, or '' when the tag is absent. */
function readContent(selector: string): string {
  return document.head.querySelector(selector)?.getAttribute('content') ?? ''
}

/** Full head snapshot, so the default state restores byte-for-byte on return. */
interface HeadSnapshot extends RouteHead {
  ogTitle: string
  ogDescription: string
  twitterTitle: string
  twitterDescription: string
}

// Captured once at load — these are the index.html values, i.e. the home page's
// head — and used as the fallback whenever a route declares no `meta.head`.
const DEFAULT_HEAD: HeadSnapshot = {
  title: document.title,
  description: readContent('meta[name="description"]'),
  ogTitle: readContent('meta[property="og:title"]'),
  ogDescription: readContent('meta[property="og:description"]'),
  twitterTitle: readContent('meta[name="twitter:title"]'),
  twitterDescription: readContent('meta[name="twitter:description"]'),
}

/** Set a `<meta>`'s content, creating the tag if it does not yet exist. */
function setMeta(selector: string, attr: 'name' | 'property', key: string, content: string): void {
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function applyHead(head?: RouteHead): void {
  const snapshot: HeadSnapshot = head
    ? {
        title: head.title,
        description: head.description,
        ogTitle: head.title,
        ogDescription: head.description,
        twitterTitle: head.title,
        twitterDescription: head.description,
      }
    : DEFAULT_HEAD
  document.title = snapshot.title
  setMeta('meta[name="description"]', 'name', 'description', snapshot.description)
  setMeta('meta[property="og:title"]', 'property', 'og:title', snapshot.ogTitle)
  setMeta('meta[property="og:description"]', 'property', 'og:description', snapshot.ogDescription)
  setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', snapshot.twitterTitle)
  setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', snapshot.twitterDescription)
}

// Set after navigation so the head reflects the route the user landed on; routes
// with no `meta.head` restore the home/default values.
router.afterEach((to) => applyHead(to.meta.head))

export default router
