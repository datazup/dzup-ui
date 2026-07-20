/**
 * Page-level accessibility suite (TASK-FREE-10).
 *
 * The per-block axe suite (`blocks/a11y.spec.ts`) covers the 87 catalog blocks;
 * until now the 12 PAGES had no a11y test at all. This suite mounts the real
 * App (router, nav, footer, announcer), navigates to every chromed route, and
 * asserts:
 *
 *   • exactly one <h1> per route, and no skipped heading levels — the three
 *     routes that used to start at <h2> (/templates, /templates/:slug,
 *     /compare) regress loudly now;
 *   • exactly one <main> landmark per route (TASK-FREE2-04) — see the landmark
 *     describe below for why this suite was green while /ai shipped two;
 *   • zero serious/critical axe violations (WCAG 2.0/2.1 A+AA structural
 *     rules — like the block suite, jsdom has no layout so color-contrast
 *     comes back *incomplete*, not *fail*, and is NOT claimed here);
 *   • the SPA focus-move: after client-side navigation, focus sits on the new
 *     page's <h1> (or <main>), and the aria-live route announcer carries the
 *     new page title;
 *   • the skip link's target is focusable on the FIRST painted route
 *     (TASK-FREE3-07) — it used to become focusable only once the router's
 *     afterEach had fired, i.e. never on arrival.
 *
 * The two chromeless preview routes (/blocks/preview/:id,
 * /templates/:slug/preview) are exempt from the heading assertions BY DECISION:
 * they are iframe/new-tab embed surfaces whose entire content is the embedded
 * block/template, so the embedded content owns the heading structure — a
 * template that is itself a full page brings its own <h1>.
 */

import type { Result } from 'axe-core'
import { render } from '@testing-library/vue'
import { flushPromises } from '@vue/test-utils'
import { beforeAll, describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import App from './App.vue'
import { BLOCKS } from './blocks/registry.ts'
import router from './router.ts'
import { TEMPLATES } from './templates/registry.ts'

// Same jsdom polyfills the block suite needs (matchMedia for the theme toggle
// and reduced-motion checks, IntersectionObserver for lazy-mount/scroll-reveal).
beforeAll(() => {
  if (typeof window.matchMedia !== 'function') {
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia
  }
  if (typeof globalThis.IntersectionObserver === 'undefined') {
    globalThis.IntersectionObserver = class {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
      takeRecords(): [] {
        return []
      }
    } as unknown as typeof globalThis.IntersectionObserver
  }
})

const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] as const
const BLOCKING_IMPACTS = new Set(['critical', 'serious'])

function reportViolation(violation: Result): string {
  const targets = violation.nodes
    .map(node => (Array.isArray(node.target) ? node.target.join(' ') : String(node.target)))
    .join(', ')
  return `[${violation.impact}] ${violation.id} — ${violation.help}\n      nodes: ${targets}\n      ${violation.helpUrl}`
}

/** Every chromed route, one representative per dynamic pattern. */
const CHROMED_ROUTES: Array<{ path: string, label: string }> = [
  { path: '/', label: 'home' },
  { path: '/pro', label: 'pro' },
  { path: '/blocks', label: 'blocks index' },
  { path: `/blocks/${BLOCKS[0]!.id}`, label: 'block detail' },
  { path: '/animations', label: 'animations' },
  { path: '/themes', label: 'themes' },
  { path: '/templates', label: 'templates index' },
  { path: `/templates/${TEMPLATES[0]!.slug}`, label: 'template detail' },
  { path: '/ai', label: 'ai ide' },
  { path: '/compare', label: 'compare' },
  { path: '/changelog', label: 'changelog' },
  { path: '/definitely-not-a-page', label: 'not found (404)' },
]

/** Mount the real app (fresh per test — the render is auto-cleaned) at `path`. */
async function mountAt(path: string): Promise<void> {
  render(App, { global: { plugins: [router] } })
  await router.isReady()
  await router.push(path)
  await flushPromises()
  await flushPromises()
}

/** Heading levels in DOM order, for the skip check. */
function headingLevels(root: ParentNode): number[] {
  return [...root.querySelectorAll('h1, h2, h3, h4, h5, h6')].map(el =>
    Number(el.tagName.slice(1)),
  )
}

describe.sequential('landing pages — accessibility', () => {
  describe.each(CHROMED_ROUTES)('route "$label" ($path)', ({ path }) => {
    it('has one h1, no skipped heading levels, and no serious/critical axe violations', async () => {
      await mountAt(path)

      const main = document.getElementById('main')
      expect(main, `route ${path} did not render a <main id="main">`).toBeTruthy()

      const h1s = main!.querySelectorAll('h1')
      expect(h1s.length, `route ${path} must have exactly one <h1>`).toBe(1)

      // A heading may go at most ONE level deeper than the previous heading;
      // popping back up any number of levels is fine.
      const levels = headingLevels(main!)
      let previous = 0
      for (const level of levels) {
        expect(
          level <= previous + 1,
          `route ${path} skips a heading level (h${previous} → h${level}). Order: ${levels.join(' → ')}`,
        ).toBe(true)
        previous = level
      }

      // `iframes: false` — the template detail page embeds its live preview in
      // an <iframe> (a separate document axe cannot inject into under jsdom);
      // the preview content is the template itself, audited via its own route.
      const results = await axe(document.body, {
        runOnly: { type: 'tag', values: [...AXE_TAGS] },
        iframes: false,
      })
      const blocking = (results.violations ?? []).filter(
        violation => violation.impact != null && BLOCKING_IMPACTS.has(violation.impact),
      )
      expect(
        blocking,
        `route ${path} has ${blocking.length} blocking a11y violation(s):\n    ${blocking.map(reportViolation).join('\n    ')}`,
      ).toEqual([])
    })
  })

  /**
   * One <main> per page (TASK-FREE2-04).
   *
   * `App.vue` wraps every routed view in the single `<main id="main">` that the
   * skip link targets, so a page component's root must not be a landmark of its
   * own. `/ai` shipped `<main class="ai">` as its root: two main landmarks, one
   * inside the other — invalid HTML, and an ambiguous page map for anyone
   * navigating by landmark, including a skip link that now has two plausible
   * destinations.
   *
   * It shipped *past this very suite*, which mounts /ai and runs axe on it. axe
   * has the rule — `landmark-no-duplicate-main` — but grades it **moderate**, and
   * the audit above only fails on serious/critical. Widening that filter would
   * re-arm a long backlog of unrelated moderate findings, so the invariant gets
   * its own assertion at full strength instead. Structure is checked structurally.
   *
   * Asserted against the whole document, not `#main`: the second landmark can
   * appear anywhere, and nesting is exactly the case a scoped query would miss.
   */
  describe('landmark structure', () => {
    it.each(CHROMED_ROUTES)('route "$label" ($path) renders exactly one <main>', async ({ path }) => {
      await mountAt(path)

      const mains = [...document.querySelectorAll('main')]
      expect(
        mains.length,
        `route ${path} rendered ${mains.length} <main> landmarks (want 1): `
        + `${mains.map(el => `<main${el.id ? ` id="${el.id}"` : ''}${el.className ? ` class="${el.className}"` : ''}>`).join(', ')}`
        + '\n      A page root must be a div/section — App.vue already provides the page <main>.',
      ).toBe(1)

      // The one that exists is the skip link's target, not some other element
      // that merely happens to be the only main left.
      expect(mains[0]!.id, `route ${path}: the page <main> is not the skip-link target`).toBe('main')
    })
  })

  /**
   * The skip link's target must be focusable on the FIRST painted route
   * (TASK-FREE3-07).
   *
   * `tabindex="-1"` used to arrive only from the router's `afterEach` guard, which
   * by definition has not run before the first navigation — so on arrival, the one
   * moment the skip link exists to serve, `<main id="main">` could not take focus
   * and moving focus to it was left to browser discretion. It is now in the
   * template, asserted here before any `router.push`.
   *
   * WHAT THIS DOES NOT CLAIM: jsdom does not implement fragment navigation, so
   * clicking the anchor cannot move focus here no matter how the app is written —
   * a test that "clicked" it would be testing its own simulation. This asserts the
   * app-side precondition the browser behaviour depends on (target exists, is
   * reachable from the link's href, and accepts focus). Real activation in a real
   * browser is TASK-FREE3-06's e2e flow.
   */
  describe('skip link', () => {
    it('has a focusable target on a fresh mount, before any navigation', async () => {
      render(App, { global: { plugins: [router] } })
      await router.isReady()
      await flushPromises()

      const link = document.querySelector<HTMLAnchorElement>('a.skip-link')
      expect(link, 'the skip link is not rendered').toBeTruthy()

      // Resolve the target the way a browser does — from the link's own href —
      // so the two cannot drift apart silently.
      const targetId = link!.getAttribute('href')!.replace(/^#/, '')
      const target = document.getElementById(targetId)
      expect(target, `the skip link points at #${targetId}, which does not exist`).toBeTruthy()

      expect(
        target!.getAttribute('tabindex'),
        `#${targetId} must carry tabindex="-1" in the template — without it, focus movement `
        + 'on fragment activation is browser-dependent, and the router guard that used to '
        + 'supply it has not run on the first painted route',
      ).toBe('-1')

      target!.focus()
      expect(document.activeElement, `focusing #${targetId} did not move activeElement`).toBe(target)
    })
  })

  it('moves focus to the new page heading on client-side navigation', async () => {
    await mountAt('/')
    await router.push('/compare')
    await flushPromises()
    await flushPromises()

    const active = document.activeElement as HTMLElement | null
    expect(active, 'nothing received focus after navigation').toBeTruthy()
    expect(
      active!.tagName === 'H1' || active!.id === 'main',
      `focus landed on <${active!.tagName.toLowerCase()}> instead of the page h1/main`,
    ).toBe(true)
  })

  it('announces the new page title via the aria-live route announcer', async () => {
    await mountAt('/')
    await router.push('/templates')
    await flushPromises()
    await flushPromises()

    const region = document.querySelector('[aria-live="polite"][role="status"]')
    expect(region?.textContent).toBe(document.title)
    expect(document.title).toContain('Templates')
  })
})
