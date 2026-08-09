/**
 * Router head-management specs (TASK-FREE-16).
 *
 * `router.ts`'s `applyHead` is the most intricate logic in the landing app —
 * ~150 lines that set AND reset ten head tags, resolve share images to absolute
 * URLs, and swap a JSON-LD block per route. It shipped untested, which is why
 * every SEO defect TASK-FREE-08 found lived here.
 *
 * **Why this is a separate file from `router.spec.ts`.** `DEFAULT_HEAD` is a
 * module-level snapshot: `router.ts` reads `document.title` and the `<meta>` tags
 * ONCE, at import time, and treats them as the values to restore on any route
 * declaring no `meta.head`. Under jsdom the document starts empty, so a plain
 * top-level `import router from './router.ts'` would snapshot ten empty strings
 * and every "restores the default" assertion would pass against `''` — proving
 * nothing. So the head is seeded with index.html-shaped tags FIRST, and the
 * router is imported dynamically afterwards. Vitest gives each spec file its own
 * module registry, so this import is independent of `router.spec.ts`'s.
 *
 * Assertions read the real `document.head`, never a mock.
 */

import type { Router } from 'vue-router'
import { beforeAll, describe, expect, it } from 'vitest'
import { PRO_FACTS } from './data.ts'
import { TEMPLATE_OG_SLUGS } from './generated/ogImages.ts'
import { TEMPLATES } from './templates/registry.ts'

// Stand-ins for the values index.html ships in the real document.
const DEFAULT_TITLE = 'dzup-ui — accessible Vue 3 components'
const DEFAULT_DESC = 'The default description, as authored in index.html.'
const DEFAULT_OG_IMAGE = 'https://dzup-ui.com/og/default.png'
const DEFAULT_CANONICAL = 'https://dzup-ui.com/'

let router: Router

/** Two templates that DO have a committed share card, so `image` is exercised. */
const withOg = TEMPLATES.filter(t => TEMPLATE_OG_SLUGS.has(t.slug))

function content(selector: string): string | null {
  return document.head.querySelector(selector)?.getAttribute('content') ?? null
}

function jsonLdNodes(): Element[] {
  return [...document.head.querySelectorAll('script[data-dz-jsonld]')]
}

beforeAll(async () => {
  document.head.innerHTML = `
    <title>${DEFAULT_TITLE}</title>
    <meta name="description" content="${DEFAULT_DESC}">
    <meta property="og:image" content="${DEFAULT_OG_IMAGE}">
    <meta property="og:title" content="${DEFAULT_TITLE}">
    <meta property="og:description" content="${DEFAULT_DESC}">
    <meta property="og:url" content="${DEFAULT_CANONICAL}">
    <meta name="twitter:title" content="${DEFAULT_TITLE}">
    <meta name="twitter:description" content="${DEFAULT_DESC}">
    <link rel="canonical" href="${DEFAULT_CANONICAL}">
  `
  // Only now, with the head populated, may router.ts snapshot DEFAULT_HEAD.
  router = (await import('./router.ts')).default
  await router.push('/')
  await router.isReady()
})

describe('the seeded default head', () => {
  it('is what DEFAULT_HEAD captured — otherwise every restore test is vacuous', () => {
    expect(document.title).toBe(DEFAULT_TITLE)
    expect(content('meta[name="description"]')).toBe(DEFAULT_DESC)
  })

  it('exercises at least one template that has a real share card', () => {
    expect(withOg.length).toBeGreaterThan(1)
  })
})

describe('applyHead — writing a route head', () => {
  it('writes title, description and the og/twitter mirrors from the route', async () => {
    await router.push('/pro')
    expect(document.title).toContain('dzup-ui Pro')
    const description = content('meta[name="description"]')
    expect(description).toContain(`${PRO_FACTS.published} published`)
    expect(description).toContain(`${PRO_FACTS.families} families`)

    // og:* and twitter:* mirror the same title/description — a share card that
    // disagrees with the page is the defect this guards.
    expect(content('meta[property="og:title"]')).toBe(document.title)
    expect(content('meta[property="og:description"]')).toBe(description)
    expect(content('meta[name="twitter:title"]')).toBe(document.title)
    expect(content('meta[name="twitter:description"]')).toBe(description)
  })

  it('resolves a root-relative canonical to an absolute URL', async () => {
    await router.push('/pro')
    const href = document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')
    // Crawlers need an absolute canonical; the route declares only '/pro'.
    expect(href).toMatch(/^https?:\/\//)
    expect(href).toMatch(/\/pro$/)
  })

  it('points og:url at the canonical, so the share card and indexed URL agree', async () => {
    await router.push('/pro')
    expect(content('meta[property="og:url"]'))
      .toBe(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href'))
  })
})

describe('applyHead — restoring the default head', () => {
  it('restores the index.html title and description on a route declaring no head', async () => {
    await router.push('/pro')
    expect(document.title).not.toBe(DEFAULT_TITLE)

    // `/` declares no meta.head — it must fall back to the captured snapshot.
    await router.push('/')
    expect(document.title).toBe(DEFAULT_TITLE)
    expect(content('meta[name="description"]')).toBe(DEFAULT_DESC)
    expect(content('meta[property="og:title"]')).toBe(DEFAULT_TITLE)
    expect(content('meta[name="twitter:description"]')).toBe(DEFAULT_DESC)
  })

  it('never lets one route’s share image bleed onto the next', async () => {
    const template = withOg[0]!
    await router.push(`/templates/${template.slug}`)
    expect(content('meta[property="og:image"]')).toContain(`/og-templates/${template.slug}.png`)

    // /pro declares no image, so the default share card must come back — the
    // template's card must not linger.
    await router.push('/pro')
    expect(content('meta[property="og:image"]')).toBe(DEFAULT_OG_IMAGE)
  })
})

describe('absoluteImage', () => {
  it('turns a root-relative share image into an absolute URL', async () => {
    const template = withOg[0]!
    await router.push(`/templates/${template.slug}`)
    const image = content('meta[property="og:image"]')
    // The route declares `/og-templates/<slug>.png`; a relative og:image is
    // ignored by every crawler.
    expect(image).toMatch(/^https?:\/\//)
    expect(image).toBe(`${window.location.origin}/og-templates/${template.slug}.png`)
    expect(content('meta[name="twitter:image"]')).toBe(image)
  })
})

describe('json-ld breadcrumbs', () => {
  it('writes exactly one breadcrumb block on a detail route', async () => {
    const template = withOg[0]!
    await router.push(`/templates/${template.slug}`)
    const nodes = jsonLdNodes()
    expect(nodes).toHaveLength(1)
    const data = JSON.parse(nodes[0]!.textContent ?? '{}')
    expect(data['@type']).toBe('BreadcrumbList')
    expect(JSON.stringify(data)).toContain(template.name)
  })

  it('replaces rather than accumulates across repeat navigation', async () => {
    const [a, b] = [withOg[0]!, withOg[1]!]
    await router.push(`/templates/${a.slug}`)
    await router.push(`/templates/${b.slug}`)
    await router.push(`/templates/${a.slug}`)

    // Three detail navigations, still one tag — stale structured data never piles up.
    const nodes = jsonLdNodes()
    expect(nodes).toHaveLength(1)
    expect(nodes[0]!.textContent).toContain(a.name)
    expect(nodes[0]!.textContent).not.toContain(b.name)
  })

  it('clears the breadcrumb on a route that declares none', async () => {
    await router.push(`/templates/${withOg[0]!.slug}`)
    expect(jsonLdNodes()).toHaveLength(1)

    await router.push('/pro')
    expect(jsonLdNodes()).toHaveLength(0)
  })

  it('leaves the static index.html JSON-LD alone', async () => {
    // The route-managed block is marked `data-dz-jsonld` precisely so it cannot
    // clobber the SoftwareApplication script authored in index.html.
    const staticLd = document.createElement('script')
    staticLd.type = 'application/ld+json'
    staticLd.textContent = '{"@type":"SoftwareApplication"}'
    document.head.appendChild(staticLd)

    await router.push(`/templates/${withOg[0]!.slug}`)
    await router.push('/pro')

    expect(document.head.contains(staticLd)).toBe(true)
    staticLd.remove()
  })
})

describe('robots', () => {
  it('marks a bare preview route noindex, and clears it again afterwards', async () => {
    await router.push(`/templates/${withOg[0]!.slug}/preview`)
    expect(content('meta[name="robots"]')).toBe('noindex')

    // /pro is indexable and declares no robots — the tag must be removed, not
    // left behind to deindex a marketing page.
    await router.push('/pro')
    expect(document.head.querySelector('meta[name="robots"]')).toBeNull()
  })
})

describe('scrollBehavior', () => {
  const scrollBehavior = () => router.options.scrollBehavior!

  it('scrolls to the element for a hash navigation', () => {
    const result = scrollBehavior()(
      { hash: '#features' } as never,
      { hash: '' } as never,
      null,
    )
    expect(result).toEqual({ el: '#features', behavior: 'smooth' })
  })

  it('scrolls to the top for a plain navigation', () => {
    const result = scrollBehavior()(
      { hash: '' } as never,
      { hash: '' } as never,
      null,
    )
    expect(result).toEqual({ top: 0 })
  })
})
