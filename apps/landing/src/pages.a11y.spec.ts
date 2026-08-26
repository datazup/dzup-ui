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
 *   • zero violations of the explicitly gated moderate-impact rules — the
 *     landmark family and document-wide heading order (TASK-FREE3-11). See
 *     `lib/axeGates.ts` for why widening the impact filter would NOT have
 *     caught the duplicate `<main>`, and for the dated moderate backlog;
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

import { fireEvent, render } from '@testing-library/vue'
import { flushPromises } from '@vue/test-utils'
import { beforeAll, describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import App from './App.vue'
import { BLOCKS } from './blocks/registry.ts'
import { AXE_WCAG_TAGS, blockingViolations, PAGE_GATED_RULES, reportViolation } from './lib/axeGates.ts'
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
    /**
     * This stub must FIRE, not just exist (TASK-FREE3-04).
     *
     * A no-op `observe()` used to satisfy the type while never invoking the
     * callback. That was harmless only while every page rendered eagerly. Now
     * that below-the-fold sections mount through `useLazyMount` — the home page's
     * nine sections, and every BlockPreview — a silent observer means
     * `shouldRender` never flips, those subtrees never mount, and axe audits a
     * page containing nothing but placeholders. The suite would stay green while
     * covering an empty document, which is worse than no suite at all.
     *
     * Reporting an immediate intersection is also the honest emulation: jsdom has
     * no layout, so "is it near the viewport" has exactly one defensible answer
     * for content the page intends to show.
     */
    globalThis.IntersectionObserver = class {
      constructor(private readonly callback: IntersectionObserverCallback) {}
      observe(target: Element): void {
        this.callback(
          [{ isIntersecting: true, target } as IntersectionObserverEntry],
          this as unknown as IntersectionObserver,
        )
      }

      unobserve(): void {}
      disconnect(): void {}
      takeRecords(): [] {
        return []
      }
    } as unknown as typeof globalThis.IntersectionObserver
  }
})

/**
 * Every chromed route, one representative per dynamic pattern.
 *
 * `mustRender` is an anti-vacuous guard for lazily-mounted SUB-content — the
 * failure mode the size floor below cannot see, because the page around it still
 * renders plenty of chrome. It is not hypothetical: while measuring
 * TASK-FREE3-11, `/blocks/:id` was observed both with and without its live
 * preview mounted depending on how many routes ran before it, and the
 * `landmark-unique` violation that preview causes appeared and vanished with it.
 * An audit that silently stops covering the preview must fail, not pass.
 */
const CHROMED_ROUTES: Array<{ path: string, label: string, mustRender?: string }> = [
  { path: '/', label: 'home' },
  { path: '/classic', label: 'home classic (pre-v2, TASK-LV2-01)' },
  { path: '/pro', label: 'pro' },
  { path: '/blocks', label: 'blocks index' },
  { path: `/blocks/${BLOCKS[0]!.id}`, label: 'block detail', mustRender: '.block-preview' },
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

/**
 * Anti-vacuous floor: the smallest real route (`/404`) renders 189 characters
 * across 20 elements; the next smallest (`/`) renders 539 across 105. A route
 * whose subtree failed to mount yields near-zero, so this catches it with ~35%
 * headroom on the tightest case. Measured 2026-07-21.
 *
 * Every axe assertion in this file is only as good as the DOM it scanned — a
 * rule "passing" over an empty page is the exact failure the block suite already
 * learned to kill, and the gated moderate rules inherit the same guard.
 */
const MIN_MAIN_TEXT = 120
const MIN_MAIN_ELEMENTS = 12

describe.sequential('landing pages — accessibility', () => {
  describe.each(CHROMED_ROUTES)('route "$label" ($path)', ({ path, mustRender }) => {
    it('has one h1, no skipped heading levels, and no blocking axe violations', async () => {
      await mountAt(path)

      const main = document.getElementById('main')
      expect(main, `route ${path} did not render a <main id="main">`).toBeTruthy()

      const text = (main!.textContent ?? '').replace(/\s+/g, ' ').trim()
      expect(
        text.length,
        `route ${path} rendered only ${text.length} characters into <main> — the audit below `
        + 'would be scanning an essentially empty page and would pass vacuously',
      ).toBeGreaterThanOrEqual(MIN_MAIN_TEXT)
      expect(
        main!.querySelectorAll('*').length,
        `route ${path} rendered too few elements into <main> to audit meaningfully`,
      ).toBeGreaterThanOrEqual(MIN_MAIN_ELEMENTS)

      if (mustRender != null) {
        expect(
          document.querySelector(mustRender),
          `route ${path} did not mount "${mustRender}" — its lazily-loaded content is missing, `
          + 'so any clean axe result below is about the placeholder, not the page',
        ).toBeTruthy()
      }

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
        runOnly: { type: 'tag', values: [...AXE_WCAG_TAGS] },
        iframes: false,
      })

      // Second pass, selected by rule id. The gated moderate rules are all tagged
      // `best-practice` with no WCAG tag, so the tag pass above never runs them —
      // see lib/axeGates.ts. Their findings fail whatever impact axe assigns.
      const gated = await axe(document.body, {
        runOnly: { type: 'rule', values: [...PAGE_GATED_RULES] },
        iframes: false,
      })

      const blocking = blockingViolations(
        results.violations ?? [],
        gated.violations ?? [],
        PAGE_GATED_RULES,
      )
      expect(
        blocking,
        `route ${path} has ${blocking.length} blocking a11y violation(s):\n    ${blocking.map(reportViolation).join('\n    ')}`,
      ).toEqual([])
    },
    // Four minutes, against a 60s file default, and only for these route audits.
    //
    // `/blocks` is the outlier that sets the number: it mounts all 87 block
    // previews and then runs TWO full axe passes over the result. That measures
    // ~17s bare and ~23s under `--coverage` in isolation — but `yarn test:coverage`
    // runs it alongside 400 other files, and under that contention the same test
    // crossed 60s and failed the coverage job while passing every other way.
    //
    // A timeout that only trips when the machine is busy is a flake, not a gate:
    // it reports "accessibility broken" for a scheduling artifact. Raised here
    // rather than in vitest.config.ts so the rest of the suite keeps the tight
    // default, where a 60s test really does mean something hung.
    240_000)
  })

  it('keeps block details preview-first without repeating summary or setup content', async () => {
    const target = BLOCKS[0]!
    await mountAt(`/blocks/${target.id}`)

    const main = document.getElementById('main')!
    const preview = main.querySelector<HTMLElement>('.block-preview')
    const details = main.querySelector<HTMLElement>('.bd-details-section')

    expect(preview, 'block detail did not render its live preview').toBeTruthy()
    expect(details, 'block detail did not render its supporting information').toBeTruthy()
    expect(
      preview!.compareDocumentPosition(details!) & Node.DOCUMENT_POSITION_FOLLOWING,
      'supporting information must follow the live preview in DOM order',
    ).toBeTruthy()

    expect(preview!.querySelector('h1')?.textContent).toContain(target.title)
    expect(preview!.querySelector('.bp-desc')?.textContent).toContain(target.description)
    expect(details!.textContent).not.toContain(target.description)

    // Components remain in the preview header; install/import commands live in
    // the one supporting manifest rather than repeating inside the Code tab.
    expect(main.querySelectorAll('.bp-chips')).toHaveLength(1)
    expect(main.querySelectorAll('.bm-chips')).toHaveLength(0)
    expect(main.querySelectorAll('.block-manifest')).toHaveLength(1)
  })

  it('collapses secondary preview settings by default on narrow screens', async () => {
    const originalMatchMedia = window.matchMedia
    window.matchMedia = ((query: string) => ({
      matches: query === '(max-width: 560px)',
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    })) as typeof window.matchMedia

    try {
      await mountAt(`/blocks/${BLOCKS[0]!.id}`)

      const toggle = document.querySelector<HTMLButtonElement>('.bp-controls-toggle')
      expect(toggle, 'mobile preview settings toggle did not render').toBeTruthy()
      expect(toggle!.getAttribute('aria-expanded')).toBe('false')

      const controlsId = toggle!.getAttribute('aria-controls')!
      const controls = document.getElementById(controlsId)
      expect(controls?.dataset.state).toBe('closed')
      expect(controls?.getAttribute('aria-hidden')).toBe('true')

      await fireEvent.click(toggle!)
      await flushPromises()

      expect(toggle!.getAttribute('aria-expanded')).toBe('true')
      expect(controls?.dataset.state).toBe('open')
      expect(controls?.hasAttribute('aria-hidden')).toBe(false)
    }
    finally {
      window.matchMedia = originalMatchMedia
    }
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
   * It shipped *past this very suite*, which mounts /ai and runs axe on it.
   *
   * The original diagnosis here was that axe has the rule
   * (`landmark-no-duplicate-main`) but grades it **moderate**, while the audit
   * only fails on serious/critical. That was half right, and the missing half
   * mattered: the rule is tagged `cat.semantics, best-practice` and carries no
   * WCAG tag, so the audit's `runOnly` tag filter excluded it from the run
   * altogether. It never executed — its impact grade was never even consulted,
   * and flipping the impact filter would have changed nothing.
   *
   * As of TASK-FREE3-11 the axe path DOES gate it, via a second rule-id-selected
   * pass (see lib/axeGates.ts). This bespoke assertion stays anyway — double
   * coverage, on purpose. It is cheap, it names the failure in one line instead
   * of an axe node dump, and it does not depend on the allowlist staying correct.
   * It also still covers `landmark-one-main`, which is anchored to `<html>` and
   * therefore unreachable from this suite's `document.body` context at any impact.
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
