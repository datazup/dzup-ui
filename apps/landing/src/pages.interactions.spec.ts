/**
 * Per-route interaction smoke test (TASK-FREE3-12).
 *
 * `pages.a11y.spec.ts` mounts the real app at every chromed route and audits the
 * DOM it finds; it never touches a control. So the pages' own logic — the blocks
 * index's filter/sort/view-mode handlers, the template detail tabs, the theme
 * designer's controls, the block preview toolbar — went almost entirely
 * unexecuted: measured before this suite, `BlocksIndexPage.vue` ran 4 of its 16
 * functions and `components/blocks/BlockPreview.vue` 4 of 28, both while the
 * a11y suite was green.
 *
 * This suite navigates to each route and clicks one representative of every
 * DISTINCT control on the page, asserting after each click that it did not
 * throw, that Vue's `errorHandler` caught nothing, and that `<main>` still
 * renders content. It does not assert what a control does — that belongs in the
 * page's own spec (`ThemesPage.copy.spec.ts`, `TopNav.spec.ts`, …). This is the
 * floor: every handler runs, and no handler can blank or break its own page.
 *
 * ## Why "one representative of every distinct control"
 *
 * `/blocks` renders ~90 cards whose buttons are all the same component bound to
 * the same handler; clicking all of them costs 90× the time to cover the same
 * function once. Controls are therefore deduplicated by role + class signature,
 * which is the closest DOM-visible proxy for "same component, same handler".
 * The cap below is asserted to be sufficient, so it can never silently truncate
 * a page's controls as pages grow.
 *
 * ## Shape and traps
 *
 *   • **Anchors are excluded** — jsdom has no navigation, and every in-app link
 *     is a `<RouterLink>` whose destination is already a route asserted here.
 *   • **Sequential, with a fresh mount per route** (`describe.sequential` +
 *     Testing Library's auto-cleanup), matching the a11y suite: these tests
 *     share one router and one theme singleton.
 *   • **`document.body` is never wiped** — Teleported dialogs (the ⌘K palette,
 *     block preview sheets) unmount through it.
 *   • **The sweep is scoped to `<main>`**, so the shared chrome (nav, footer)
 *     is exercised by its own specs and one page cannot leave the nav in a state
 *     the next test inherits.
 */

import { render } from '@testing-library/vue'
import { flushPromises } from '@vue/test-utils'
import { beforeAll, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import App from './App.vue'
import { BLOCKS } from './blocks/registry.ts'
import router from './router.ts'
import { TEMPLATES } from './templates/registry.ts'

/**
 * The same polyfills `pages.a11y.spec.ts` installs — including an
 * IntersectionObserver that actually FIRES, without which every `useLazyMount`
 * subtree (the home page's nine sections, every BlockPreview) stays a
 * placeholder and this sweep would find nothing to click.
 */
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

/** Controls a visitor can click with no navigation side effect. */
const CLICKABLE = [
  'button:not([disabled]):not([aria-disabled="true"])',
  '[role="tab"]:not([aria-disabled="true"])',
  '[role="switch"]:not([aria-disabled="true"])',
  '[role="checkbox"]:not([aria-disabled="true"])',
  '[role="radio"]:not([aria-disabled="true"])',
  '[role="menuitem"]',
  '[role="menuitemcheckbox"]',
  '[role="menuitemradio"]',
  '[role="option"]',
  'summary',
].join(',')

/** Per-route budget on DISTINCT controls — bounded, and asserted sufficient. */
const MAX_CLICKS = 60

/** Every chromed route, one representative per dynamic pattern (as the a11y suite). */
const ROUTES: Array<{ path: string, label: string }> = [
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

function describeError(error: unknown): string {
  if (error instanceof Error)
    return error.message
  try {
    return typeof error === 'object' && error !== null ? JSON.stringify(error) : String(error)
  }
  catch {
    return String(error)
  }
}

/**
 * "Same component, same handler" proxy: role + the class list. Deliberately NOT
 * the accessible name — 90 block cards have 90 different names and one handler.
 */
function signature(el: Element): string {
  return `${el.getAttribute('role') ?? el.tagName.toLowerCase()}|${el.className}`
}

function describeControl(el: Element): string {
  const name = el.getAttribute('aria-label') ?? el.textContent?.trim().slice(0, 40) ?? ''
  const role = el.getAttribute('role') ?? el.tagName.toLowerCase()
  return name ? `${role} "${name}"` : `<${role}>`
}

/** Mount the real app (auto-cleaned per test) at `path`. */
async function mountAt(path: string): Promise<unknown[]> {
  const errors: unknown[] = []
  render(App, {
    global: { plugins: [router], config: { errorHandler: (error: unknown) => errors.push(error) } },
  })
  await router.isReady()
  await router.push(path)
  await flushPromises()
  await flushPromises()
  return errors
}

/** Distinct controls clicked per route, for the aggregate floor asserted last. */
const swept = new Map<string, number>()

describe.sequential('landing pages — interaction smoke', () => {
  it.each(ROUTES)('route "$label" ($path) survives clicking every control', async ({ path }) => {
    const errors = await mountAt(path)

    const main = document.getElementById('main')
    expect(main, `route ${path} did not render a <main id="main">`).toBeTruthy()
    // Anti-vacuous guard: a route that failed to mount its content has nothing
    // to click and would "survive" the sweep trivially.
    expect(
      (main!.textContent ?? '').trim().length,
      `route ${path} rendered an essentially empty <main> — nothing to exercise`,
    ).toBeGreaterThan(120)

    const seen = new Set<string>()
    const clicked: string[] = []
    for (let guard = 0; guard < MAX_CLICKS; guard += 1) {
      // Re-query every iteration: a click that re-renders the page detaches the
      // nodes an up-front query captured, and clicking a detached node is a
      // no-op that looks like a pass.
      const next = [...(document.getElementById('main')?.querySelectorAll(CLICKABLE) ?? [])]
        .find(el => el.isConnected && !seen.has(signature(el)))
      if (!next)
        break

      seen.add(signature(next))
      const label = describeControl(next)
      try {
        ;(next as HTMLElement).click()
        await nextTick()
      }
      catch (thrown) {
        throw new Error(`[interactions] route ${path} threw on ${label}: ${describeError(thrown)}`)
      }
      clicked.push(label)

      expect(
        errors.map(describeError),
        `[interactions] route ${path} raised an error on ${label}`,
      ).toEqual([])
      expect(
        (document.getElementById('main')?.textContent ?? '').trim(),
        `[interactions] route ${path} rendered nothing into <main> after ${label}`,
      ).not.toBe('')
    }

    await flushPromises()
    expect(
      errors.map(describeError),
      `[interactions] route ${path} raised errors after ${clicked.length} click(s)`,
    ).toEqual([])
    expect(
      seen.size,
      `[interactions] route ${path} hit the ${MAX_CLICKS}-distinct-control cap — raise MAX_CLICKS `
      + 'or the tail of its controls is going untouched.',
    ).toBeLessThan(MAX_CLICKS)

    swept.set(path, clicked.length)
  })

  /**
   * Five routes legitimately click nothing: `/pro`, `/ai`, `/compare`,
   * `/changelog` and the 404 are prose + links, with no button, tab or switch
   * inside `<main>` (measured 2026-07-21 — the nav/footer chrome they do carry
   * is out of this sweep's scope by design). A per-route "clicked at least one"
   * assertion would therefore be a lie on those, so the floor is asserted in
   * aggregate instead: if a future change breaks mounting app-wide, or narrows
   * the selector, the total collapses and this fails — which a green sweep over
   * five static pages would otherwise hide.
   */
  it('exercised a substantial number of distinct controls across the routes', () => {
    const total = [...swept.values()].reduce((sum, n) => sum + n, 0)
    expect(
      total,
      `[interactions] the whole sweep clicked ${total} controls across ${swept.size} routes `
      + `(${[...swept].map(([path, n]) => `${path}:${n}`).join(', ')}) — that is far below the `
      + 'measured floor, so the pages are not mounting their interactive content.',
    ).toBeGreaterThan(60)
  })
})
