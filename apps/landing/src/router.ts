import type { RouteLocationNormalized } from 'vue-router'
import { nextTick } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { getBlock } from './blocks/registry.ts'
import { SITE_ORIGIN } from './config.ts'
import { BLOCK_OG_IDS, TEMPLATE_OG_SLUGS } from './generated/ogImages.ts'
import { startViewTransition, supportsViewTransitions } from './motion/useViewTransition.ts'
// `/` is the only eagerly-imported route: it is the first paint for most visitors,
// so code-splitting it would just add a round trip before the LCP element. Every
// other route is `() => import()` — see the note on /pro, /blocks and /animations
// below (TASK-FREE-13).
import HomePage from './pages/HomePage.vue'
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
  /**
   * Optional JSON-LD structured data (schema.org) for the route, serialised into a
   * single `<script type="application/ld+json">`. The detail pages emit a
   * BreadcrumbList (Home › gallery › item) so search + AI answer engines understand
   * the trail; the site-wide SoftwareApplication entity lives statically in
   * index.html. Omitted ⇒ any JSON-LD a previous route set is cleared, so a detail
   * page's breadcrumb never bleeds onto the next route (mirrors image/robots reset).
   */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[]
}

/**
 * Build a schema.org BreadcrumbList for a detail page. Item URLs are absolute
 * (`SITE_ORIGIN`-prefixed) as the vocabulary expects, and match each hop's
 * canonical so the trail agrees with the indexed URLs.
 */
function breadcrumbList(trail: Array<{ name: string, path: string }>): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': trail.map((hop, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': hop.name,
      'item': `${SITE_ORIGIN}${hop.path}`,
    })),
  }
}

/** A route's head is either a fixed object or resolved from the matched route. */
type RouteHeadInput = RouteHead | ((route: RouteLocationNormalized) => RouteHead | undefined)

declare module 'vue-router' {
  interface RouteMeta {
    head?: RouteHeadInput
  }
}

/**
 * Route an unknown catalog slug to the 404 page WITHOUT changing the address
 * bar: the not-found route re-matches the same path via its `pathMatch`
 * catch-all param, so the visitor (and any error reporting) still sees the URL
 * that failed. The 404 page reads the path to say specifically that the
 * block/template does not exist — a removed item and a mistyped URL both get
 * an explanation instead of the old silent redirect to the gallery
 * (TASK-FREE-09).
 */
function toNotFound(to: RouteLocationNormalized) {
  return {
    name: 'not-found' as const,
    params: { pathMatch: to.path.slice(1).split('/') },
    query: to.query,
    hash: to.hash,
  }
}

/**
 * Guard for the template detail/preview routes: an unknown `slug` (one not in
 *  the registry) lands on the 404 page (docs/templates.md §3).
 */
function resolveTemplateSlug(to: RouteLocationNormalized) {
  const slug = to.params.slug
  if (typeof slug === 'string' && getTemplate(slug))
    return true
  return toNotFound(to)
}

/**
 * Guard for the block detail/preview routes: an unknown `id` (one not in the
 *  registry) lands on the 404 page (docs/blocks.md §3.5). The preview page
 *  repeats this check defensively for any other entry path.
 */
function resolveBlockId(to: RouteLocationNormalized) {
  const id = to.params.id
  if (typeof id === 'string' && getBlock(id))
    return true
  return toNotFound(to)
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomePage },
    // Phase 1: renders a "coming soon" / waitlist state. Phase 2 flips the
    // CTAs that point here to the published pro Storybook + pricing page.
    // Carries its own head — a primary marketing surface must not inherit the
    // home title, and without a self-canonical it would tell crawlers it IS
    // the home page (the index.html default canonical).
    {
      path: '/pro',
      name: 'pro',
      component: () => import('./pages/ProPage.vue'),
      meta: {
        head: {
          title: 'dzup-ui Pro — enterprise Vue 3 components | dzup-ui',
          description:
            'The commercial tier of dzup-ui: enterprise-grade Vue 3 components built on the same token system and accessibility bar as the free core. Join the waitlist to hear when it ships.',
          canonical: '/pro',
        },
      },
    },
    // Blocks — the first shipped Ecosystem offering (docs/blocks.md §3.1). The
    // index renders the full catalogue, sourced from blocks/registry.ts. Carries
    // its own SEO head (title + description) — /blocks is a primary marketing
    // surface (docs/landing.md §8), so it must not inherit the generic home title.
    {
      path: '/blocks',
      name: 'blocks',
      // Lazy: 653 lines that pull in LazyBlockPreview, BlockCard,
      // BlockCommandPalette, BlockSearchBar, BlockCategoryNav and BlockAiCallout.
      // None of it is on the critical path for a visitor landing on `/`.
      component: () => import('./pages/BlocksIndexPage.vue'),
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
    // ?theme/?dir/?w; unknown ids land on the 404 via the shared guard. Marked
    // noindex — it is a bare duplicate of the indexable per-block page (Task I4).
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
          if (!block)
            return undefined
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
    // canonical destination crawlers index for the block. Unknown ids land on the
    // 404 via the shared guard. Registered after /blocks/preview/:id so the
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
          if (!block)
            return undefined
          return {
            title: `${block.title} — dzup-ui Blocks`,
            description: block.description,
            // Per-block OG card, advertised ONLY when the file exists (yarn og is
            // an optional, heavy Playwright step — build-og-images.ts inventories
            // its committed output). Absent ⇒ the site-wide default card applies.
            image: BLOCK_OG_IDS.has(block.id) ? `/og/${block.id}.png` : undefined,
            // Self-referential canonical so this page — not the /blocks#<id> anchor
            // — is the indexed source for the block (avoids duplicate content).
            canonical: `/blocks/${block.id}`,
            // Breadcrumb trail (Home › Blocks › this block) for rich results.
            jsonLd: breadcrumbList([
              { name: 'Home', path: '/' },
              { name: 'Blocks', path: '/blocks' },
              { name: block.title, path: `/blocks/${block.id}` },
            ]),
          }
        },
      },
    },
    // Animations — the live motion gallery (docs/animations.md §4). Carries its
    // own head + self-canonical like the other primary marketing surfaces.
    {
      path: '/animations',
      name: 'animations',
      // Lazy: 671 lines importing the whole 60-effect CATALOG.
      component: () => import('./pages/AnimationsPage.vue'),
      meta: {
        head: {
          title: 'Animations — the dzup-ui motion gallery | dzup-ui',
          description:
            'A live gallery of copy-paste Vue 3 motion effects built on the dzup-ui motion tokens — entrances, scroll-driven reveals, hover states, transitions and more, every one honouring prefers-reduced-motion.',
          canonical: '/animations',
        },
      },
    },
    // Themes — the visual token editor (the "Themes" Ecosystem offering). Lazy
    // like /pro & /templates. Carries its own SEO head — it's a primary
    // marketing surface and must not inherit the generic home title. The optional
    // `?theme=` query encodes a shared design; the page reads it on mount.
    {
      path: '/themes',
      name: 'themes',
      component: () => import('./pages/ThemesPage.vue'),
      meta: {
        head: {
          title: 'Theme Designer — visual OKLCH token editor | dzup-ui',
          description:
            'Design a complete dzup-ui theme in the browser: tune the OKLCH token palette, preview real components in light and dark, check WCAG contrast live, then export the --dz-* CSS variables or share a link.',
          canonical: '/themes',
        },
      },
    },
    // Templates — the free, full-page starters gallery (docs/templates.md §3).
    // Lazy-loaded like /pro; carries its own head + self-canonical.
    {
      path: '/templates',
      name: 'templates',
      component: () => import('./pages/TemplatesPage.vue'),
      meta: {
        head: {
          title: 'Templates — free full-page Vue 3 starters | dzup-ui',
          description:
            'Free full-page and full-app starter templates composed entirely from @dzup-ui/core components — dashboards, auth flows, marketing pages, editorial layouts and more, themed, accessible and responsive out of the box.',
          canonical: '/templates',
        },
      },
    },
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
          if (!template)
            return undefined
          return {
            title: `${template.name} — dzup-ui Templates`,
            description: template.blurb,
            // Share cards must be PNG/JPEG — X and LinkedIn do not reliably render
            // WebP og:images. build-og-images.ts derives a 1200×630 PNG from each
            // committed WebP thumbnail; the WebP stays the on-page rendering.
            image: TEMPLATE_OG_SLUGS.has(template.slug)
              ? `/og-templates/${template.slug}.png`
              : undefined,
            // Self-canonical so this page — not the /templates gallery card — is the
            // indexed source for the template (parity with /blocks/:id).
            canonical: `/templates/${template.slug}`,
            // Breadcrumb trail (Home › Templates › this template) for rich results.
            jsonLd: breadcrumbList([
              { name: 'Home', path: '/' },
              { name: 'Templates', path: '/templates' },
              { name: template.name, path: `/templates/${template.slug}` },
            ]),
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
      // Chrome-free duplicate of the canonical /templates/:slug page — noindex,
      // matching /blocks/preview/:id, so 44 preview URLs stop inheriting the
      // home page's head (and its canonical) and never enter the index.
      meta: {
        head: (to) => {
          const slug = to.params.slug
          const template = typeof slug === 'string' ? getTemplate(slug) : undefined
          if (!template)
            return undefined
          return {
            title: `${template.name} — template preview | dzup-ui`,
            description: template.blurb,
            robots: 'noindex',
          }
        },
      },
    },
    // AI IDE — "Use dzup-ui with your AI IDE" (Task G5). Copy-paste MCP config +
    // docs for the free @dzup-ui/mcp server. Lazy like the other secondary pages;
    // carries its own SEO head (a primary distribution surface).
    {
      path: '/ai',
      name: 'ai',
      component: () => import('./pages/AiIdePage.vue'),
      meta: {
        head: {
          title: 'Use dzup-ui with your AI IDE — MCP server | dzup-ui',
          description:
            'Connect the free @dzup-ui/mcp server to Cursor, Claude Code, Windsurf or VS Code and your assistant can browse every dzup-ui component, block, template and design token — and fetch the real source + install command on request.',
          canonical: '/ai',
        },
      },
    },
    // Compare — an honest, sourced feature matrix vs. peer Vue 3 libraries
    // (docs/landing.md — helps evaluators decide). Lazy like the other secondary
    // pages; carries its own SEO head — a primary evaluation surface that must not
    // inherit the generic home title.
    {
      path: '/compare',
      name: 'compare',
      component: () => import('./pages/ComparePage.vue'),
      meta: {
        head: {
          title: 'dzup-ui vs. PrimeVue, Nuxt UI, Vuetify & Element Plus | dzup-ui',
          description:
            'An honest, sourced feature matrix comparing dzup-ui with other popular Vue 3 component libraries — component count, TypeScript, accessibility, design tokens, styling and license. Neutral facts, cited and dated.',
          canonical: '/compare',
        },
      },
    },
    // Changelog — the on-site release feed (FREE2-10). Build-derived from
    // CHANGELOG.md via the shared release parser; replaces the old off-site
    // GitHub deep-link as the highest-intent retention surface. Carries its own
    // SEO head + self-canonical like the other primary marketing pages.
    {
      path: '/changelog',
      name: 'changelog',
      component: () => import('./pages/ChangelogPage.vue'),
      meta: {
        head: {
          title: 'Changelog — what\'s new in dzup-ui | dzup-ui',
          description:
            'Every shipped change to dzup-ui — new components, refinements and fixes, newest first. Generated from the repository changelog and available as an Atom feed.',
          canonical: '/changelog',
        },
      },
    },
    // The real 404 (TASK-FREE-09) — replaces the old silent `redirect: '/'`,
    // which explained nothing and told crawlers every dead URL was the home
    // page. Renders an explanation + search + navigation; noindex so error
    // pages never enter the index. (The HTTP status stays 200 until a host
    // with SPA-404 support is configured — no deploy exists yet; see
    // docs/free-apps-audit.md TASK-FREE-09 note.)
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('./pages/NotFoundPage.vue'),
      meta: {
        head: to => ({
          title: 'Page not found | dzup-ui',
          description: `No page exists at ${to.path} on dzup-ui.com.`,
          robots: 'noindex',
        }),
      },
    },
  ],
  scrollBehavior(to) {
    if (to.hash)
      return { el: to.hash, behavior: 'smooth' }
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
    typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
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
  if (!from.name || to.path === from.path)
    return
  if (!supportsViewTransitions() || prefersReducedMotion())
    return
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

/**
 * Remove a `<meta>` if present — used to clear a stale share image on routes
 *  that declare none (so a template's og:image never bleeds onto the home page).
 */
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
 * Write (or replace) the route-managed JSON-LD `<script>` — the BreadcrumbList on
 * a detail page. A single tag marked `data-dz-jsonld` is reused so navigation
 * never accumulates stale structured data, and the distinct marker keeps it clear
 * of the static SoftwareApplication script authored in index.html.
 */
function setJsonLd(data: Record<string, unknown> | Record<string, unknown>[]): void {
  let el = document.head.querySelector<HTMLScriptElement>('script[data-dz-jsonld]')
  if (!el) {
    el = document.createElement('script')
    el.type = 'application/ld+json'
    el.setAttribute('data-dz-jsonld', '')
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(data)
}

/**
 * Remove the route-managed JSON-LD script — used on routes that declare none, so
 *  a detail page's breadcrumb never lingers on the next route.
 */
function removeJsonLd(): void {
  document.head.querySelector('script[data-dz-jsonld]')?.remove()
}

/**
 * Resolve a possibly root-relative share image to an absolute URL — crawlers
 * require an absolute og:image. Already-absolute URLs pass through unchanged.
 */
function absoluteImage(src: string): string {
  if (!src)
    return ''
  try {
    return new URL(src, window.location.origin).href
  }
  catch {
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
  if (snapshot.canonical)
    setLink('canonical', snapshot.canonical)
  if (snapshot.ogUrl)
    setMeta('meta[property="og:url"]', 'property', 'og:url', snapshot.ogUrl)
  // Share image: write it when present, otherwise clear any tag a prior route set.
  if (snapshot.image) {
    setMeta('meta[property="og:image"]', 'property', 'og:image', snapshot.image)
    setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', snapshot.image)
  }
  else {
    removeMeta('meta[property="og:image"]')
    removeMeta('meta[name="twitter:image"]')
  }
  // Robots: write it when a route opts in (e.g. noindex on the bare preview),
  // otherwise clear any tag a prior route set so other routes stay indexable.
  if (snapshot.robots) {
    setMeta('meta[name="robots"]', 'name', 'robots', snapshot.robots)
  }
  else {
    removeMeta('meta[name="robots"]')
  }
  // JSON-LD: write the route's structured data (BreadcrumbList on detail pages),
  // otherwise clear any a prior route set so it never bleeds onto the next route.
  // Read from `head` directly (not the snapshot) since it's route-specific and,
  // like robots/image, resets to none when a route declares no head.
  if (head?.jsonLd) {
    setJsonLd(head.jsonLd)
  }
  else {
    removeJsonLd()
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
