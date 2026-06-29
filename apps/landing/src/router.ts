import { nextTick } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteLocationNormalized } from 'vue-router'
import { startViewTransition, supportsViewTransitions } from './motion/useViewTransition.ts'
import HomePage from './pages/HomePage.vue'
import ProPage from './pages/ProPage.vue'
import BlocksIndexPage from './pages/BlocksIndexPage.vue'
import AnimationsPage from './pages/AnimationsPage.vue'
import { getTemplate } from './templates/registry.ts'
import { getBlock } from './blocks/registry.ts'

/**
 * Per-route document head. A route opts in via `meta.head`; routes without it
 * fall back to the static values authored in index.html (captured once below),
 * so navigating away from a page that set a title restores the home values.
 *
 * Done without a head library on purpose — the app has no head dependency and
 * docs/landing.md §8 calls for SEO meta without adding one. The title/description
 * also mirror into the Open Graph + Twitter tags so per-route share cards stay in
 * lockstep with the visible tab title.
 *
 * A route may declare `meta.head` as a static object (e.g. /blocks) OR as a
 * resolver `(route) => RouteHead` when the head depends on a param — the template
 * detail page resolves its slug against the registry so each /templates/:slug
 * gets its own title, description and (when generated) og:image share card.
 */
interface RouteHead {
  title: string
  description: string
  /**
   * Optional share-card image (og:image / twitter:image). May be root-relative
   * ('/og/foo.webp') — it is resolved to an absolute URL before being written,
   * since crawlers require an absolute og:image. Omitted ⇒ no image tag is set
   * (and any image left by a previous route is cleared).
   */
  image?: string
  /**
   * Optional `<meta name="robots">` content. Set to `'noindex'` on bare/duplicate
   * surfaces (e.g. the chrome-free /blocks/preview/:id render) so crawlers skip
   * them. Omitted ⇒ the tag is cleared, restoring the default indexable state.
   */
  robots?: string
  /**
   * Optional canonical URL for the route (the `<link rel="canonical">` href, also
   * mirrored into `og:url`). May be root-relative ('/blocks/hero-split') — it is
   * resolved to an absolute URL before being written, since crawlers require an
   * absolute canonical. A deep-linkable per-block page (/blocks/:id) declares its
   * own URL here so it — not the in-page anchor on /blocks — is the indexable
   * source for that block (docs/blocks.md §3.5, Task I4). Omitted ⇒ the canonical
   * restores to index.html's default (the home URL), matching how the share image
   * and robots tags reset on routes that declare none.
   */
  canonical?: string
}

/** A route's head is either a fixed object or resolved from the matched route. */
type RouteHeadInput = RouteHead | ((route: RouteLocationNormalized) => RouteHead | undefined)

declare module 'vue-router' {
  interface RouteMeta {
    head?: RouteHeadInput
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

/**
 * Guard for the standalone block-preview route: an unknown `id` (one not in the
 * registry) redirects to the gallery rather than rendering a dead/blank preview
 * (docs/blocks.md §3.5). The page repeats this check defensively for any other
 * entry path (e.g. a hand-typed iframe src).
 */
function resolveBlockId(to: RouteLocationNormalized) {
  const id = to.params.id
  if (typeof id === 'string' && getBlock(id)) return true
  return { path: '/blocks' }
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
          // Self-canonical so the gallery owns its URL (not the home default), and
          // each per-block page owns `/blocks/<id>` — the two never claim each other.
          canonical: '/blocks',
        },
      },
    },
    // Standalone, chrome-free render of a single block (docs/blocks.md §3.5) —
    // the "Open in new tab" target, the iframe src for full-section isolation
    // (Tasks F1–F3) and the OG render source (Task I4). Param-driven via
    // ?theme/?dir/?w; unknown ids redirect to the gallery. Marked noindex — it is
    // a bare duplicate of the indexable per-block page (Task I4).
    {
      path: '/blocks/preview/:id',
      name: 'block-preview',
      component: () => import('./pages/BlockPreviewPage.vue'),
      props: true,
      beforeEnter: resolveBlockId,
      meta: {
        head: (to) => {
          const id = to.params.id
          const block = typeof id === 'string' ? getBlock(id) : undefined
          if (!block) return undefined
          return {
            title: `${block.title} — block preview | dzup-ui`,
            description: block.description,
            robots: 'noindex',
          }
        },
      },
    },
    // Per-block SEO page (docs/blocks.md §3.5, §1.2 #7, Task I4) — the indexable,
    // shareable route for a SINGLE block: it renders the block's live preview +
    // dependency manifest + a short "what it is / when to use it" intro inside the
    // full site chrome, and carries its own title/description/OG share card +
    // self-referential canonical. The /blocks index stays the PRIMARY browse
    // surface (the in-page `#<id>` anchors keep working); this route is the
    // canonical destination crawlers index for the block. Unknown ids redirect to
    // the gallery via the shared guard. Registered after /blocks/preview/:id so the
    // more specific 3-segment preview route always wins for that path.
    {
      path: '/blocks/:id',
      name: 'block-detail',
      component: () => import('./pages/BlockDetailPage.vue'),
      props: true,
      beforeEnter: resolveBlockId,
      meta: {
        head: (to) => {
          const id = to.params.id
          const block = typeof id === 'string' ? getBlock(id) : undefined
          if (!block) return undefined
          return {
            title: `${block.title} — dzup-ui Blocks`,
            description: block.description,
            // The OG share card is generated per block from the chrome-free
            // /blocks/preview/:id render (scripts/shoot-og.mts → public/og/<id>.png).
            image: `/og/${block.id}.png`,
            // Self-referential canonical so this page — not the /blocks#<id> anchor
            // — is the indexed source for the block (avoids duplicate content).
            canonical: `/blocks/${block.id}`,
          }
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
      // Per-template share head (docs/templates.md §1) — title + blurb + OG/Twitter
      // tags, resolved from the slug. The guard above guarantees a hit; the
      // undefined branch only keeps the resolver total for type-safety.
      meta: {
        head: (to) => {
          const slug = to.params.slug
          const template = typeof slug === 'string' ? getTemplate(slug) : undefined
          if (!template) return undefined
          return {
            title: `${template.name} — dzup-ui Templates`,
            description: template.blurb,
            image: template.thumbnail,
          }
        },
      },
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

/**
 * OS-level reduced-motion check for the native route transition (effect 30).
 *
 * Reads the system setting directly rather than the `useReducedMotion`
 * composable: a router guard runs outside any component's inject scope, and the
 * page-level "Reduce motion" toggle governs only the in-gallery RouteTransition
 * demo — real navigation honours the OS setting alone. SSR-safe.
 */
function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/**
 * Native route transition (docs/animations.md §3.1, §4 — effect 30). When the
 * View Transitions API is available and motion is allowed, drive the route swap
 * through `document.startViewTransition` so the browser cross-fades/slides the
 * `root` snapshot (see the `::view-transition-*` keyframes in App.vue). The guard
 * resolves the navigation INSIDE the transition's update callback so the new page
 * is painted before the "after" snapshot is captured, then awaits `nextTick()`.
 *
 * Skipped for the first paint (`!from.name`), in-page hash nav (same path),
 * unsupported browsers and reduced motion — all of which fall through to the
 * existing `<Transition name="route">` fallback in App.vue with no visual break.
 */
router.beforeResolve((to, from) => {
  if (!from.name || to.path === from.path) return
  if (!supportsViewTransitions() || prefersReducedMotion()) return
  return new Promise<void>((proceed) => {
    void startViewTransition(async () => {
      // Let the navigation finalise (route ref updates → Vue re-renders), then
      // wait for the DOM patch so the View Transition captures the new page.
      proceed()
      await nextTick()
    })
  })
})

/** Read a `<meta>`'s content by selector, or '' when the tag is absent. */
function readContent(selector: string): string {
  return document.head.querySelector(selector)?.getAttribute('content') ?? ''
}

/** Read a `<link>`'s href by selector, or '' when the tag is absent. */
function readHref(selector: string): string {
  return document.head.querySelector(selector)?.getAttribute('href') ?? ''
}

/** Full head snapshot, so the default state restores byte-for-byte on return. */
interface HeadSnapshot {
  title: string
  description: string
  image: string
  robots: string
  canonical: string
  ogTitle: string
  ogDescription: string
  ogUrl: string
  twitterTitle: string
  twitterDescription: string
}

// Captured once at load — these are the index.html values, i.e. the home page's
// head — and used as the fallback whenever a route declares no `meta.head`.
const DEFAULT_HEAD: HeadSnapshot = {
  title: document.title,
  description: readContent('meta[name="description"]'),
  image: readContent('meta[property="og:image"]'),
  robots: readContent('meta[name="robots"]'),
  canonical: readHref('link[rel="canonical"]'),
  ogTitle: readContent('meta[property="og:title"]'),
  ogDescription: readContent('meta[property="og:description"]'),
  ogUrl: readContent('meta[property="og:url"]'),
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

/** Remove a `<meta>` if present — used to clear a stale share image on routes
 *  that declare none (so a template's og:image never bleeds onto the home page). */
function removeMeta(selector: string): void {
  document.head.querySelector(selector)?.remove()
}

/** Set a `<link rel="…">`'s href, creating the tag if it does not yet exist. */
function setLink(rel: string, href: string): void {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

/**
 * Resolve a possibly root-relative share image to an absolute URL — crawlers
 * require an absolute og:image. Already-absolute URLs pass through unchanged.
 */
function absoluteImage(src: string): string {
  if (!src) return ''
  try {
    return new URL(src, window.location.origin).href
  } catch {
    return src
  }
}

function applyHead(head?: RouteHead): void {
  const canonical = head?.canonical ? absoluteImage(head.canonical) : DEFAULT_HEAD.canonical
  const snapshot: HeadSnapshot = head
    ? {
        title: head.title,
        description: head.description,
        image: head.image ? absoluteImage(head.image) : DEFAULT_HEAD.image,
        robots: head.robots ?? DEFAULT_HEAD.robots,
        canonical,
        ogTitle: head.title,
        ogDescription: head.description,
        // og:url tracks the canonical so the share card and the indexed URL agree.
        ogUrl: canonical || DEFAULT_HEAD.ogUrl,
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
  // Canonical + og:url: a per-block page points both at its own URL so it (not the
  // /blocks#<id> anchor) is the indexed source; other routes restore the default
  // (home) canonical so a stale per-block URL never bleeds onto another page.
  if (snapshot.canonical) setLink('canonical', snapshot.canonical)
  if (snapshot.ogUrl) setMeta('meta[property="og:url"]', 'property', 'og:url', snapshot.ogUrl)
  // Share image: write it when present, otherwise clear any tag a prior route set.
  if (snapshot.image) {
    setMeta('meta[property="og:image"]', 'property', 'og:image', snapshot.image)
    setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', snapshot.image)
  } else {
    removeMeta('meta[property="og:image"]')
    removeMeta('meta[name="twitter:image"]')
  }
  // Robots: write it when a route opts in (e.g. noindex on the bare preview),
  // otherwise clear any tag a prior route set so other routes stay indexable.
  if (snapshot.robots) {
    setMeta('meta[name="robots"]', 'name', 'robots', snapshot.robots)
  } else {
    removeMeta('meta[name="robots"]')
  }
}

// Set after navigation so the head reflects the route the user landed on; routes
// with no `meta.head` restore the home/default values. A function `meta.head`
// is resolved against the route (the template detail page keys off its slug).
router.afterEach((to) => {
  const head = typeof to.meta.head === 'function' ? to.meta.head(to) : to.meta.head
  applyHead(head)
})

export default router
