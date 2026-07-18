/**
 * Per-effect demo render smoke test (docs/free-apps-audit.md, TASK-FREE-16).
 *
 * Every `CATALOG` entry ships a live `demo` component that `AnimationCard`
 * mounts in its preview stage on `/animations` — the whole point of the gallery
 * is that you can see the effect run. Those demos had no test at all, while the
 * blocks next door have had a per-block gate for a while
 * (`../blocks/a11y.spec.ts`). This suite is the floor for them: each demo
 * mounts, paints something, and does so without Vue complaining.
 *
 * That floor earns its keep here more than almost anywhere else in the app: the
 * demos are the heaviest users of the motion layer (directives, composables,
 * IntersectionObserver, rAF loops, canvas), and the landing build runs no
 * typecheck (MEMORY.md → "Landing build skips typecheck"), so a demo broken by a
 * renamed motion export or a changed core prop ships green today.
 *
 * What each test asserts, per demo:
 *   1. it mounts without throwing,
 *   2. it renders NON-EMPTY output (see `resolveDemo` — the empty render is the
 *      failure mode to fear), and
 *   3. it logs no `console.warn` / `console.error` — Vue's channel for failed
 *      prop validation, missing required props, unknown components and
 *      unhandled render errors.
 *
 * The roster is driven off `CATALOG` itself, never hand-typed: an effect is
 * covered the moment its entry lands. The meta-test makes an empty catalog a
 * loud failure instead of a suite that passes by testing nothing — the same
 * reason `scripts/build-counts.ts` refuses to bake a zero.
 *
 * Scope: this checks the demos RENDER, not that they animate. jsdom has no
 * layout, paint or real IntersectionObserver, so the observed state is the
 * static, no-reduced-motion, nothing-in-view baseline — which is exactly the
 * state that must never be blank or broken.
 */

import type { Component } from 'vue'
import type { CatalogEntry } from './catalog.ts'
import { render } from '@testing-library/vue'
import { flushPromises } from '@vue/test-utils'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { CATALOG } from './catalog.ts'

/**
 * jsdom ships neither `matchMedia` nor `IntersectionObserver` — and the motion
 * layer is built on both (`useReducedMotion` reads `matchMedia`, `useInView` /
 * `v-reveal` / `DzStagger` own an IntersectionObserver), so their absence throws
 * rather than degrades. Static, non-matching stubs give the honest baseline:
 * motion allowed, nothing in view yet. `ResizeObserver` and `scrollIntoView` are
 * already polyfilled globally in `vitest.setup.ts`, and `requestAnimationFrame`
 * is native to jsdom, so neither is stubbed here.
 *
 * `HTMLCanvasElement.getContext` is the third gap, and the subtle one. jsdom has
 * no canvas without the optional `canvas` npm package (which this repo does not
 * install), so it returns null AND narrates that through its virtual console —
 * as a `console.error`, which this suite reads as failure. That message is jsdom
 * describing its own limitation, not Vue reporting a defect, so silencing it is
 * not papering over anything: the stub returns exactly the null jsdom already
 * returned, leaving the canvas-backed demo (DzParticles) on precisely the code
 * path it was already taking. That path is real and guarded — DzParticles does
 * `const ctx = canvas.getContext('2d'); if (!ctx) return` — so what this suite
 * verifies for it is that it mounts and paints its DOM without a context, which
 * is the honest limit of what jsdom can show. Whether the particles actually
 * draw is a browser concern, checked by eye and by the Playwright suite.
 */
beforeAll(() => {
  if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
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
  // Return the same null jsdom does, minus jsdom's console.error about it (see
  // the block comment above). Callers must already handle a null context.
  if (typeof HTMLCanvasElement !== 'undefined') {
    HTMLCanvasElement.prototype.getContext = (() => null) as unknown as typeof HTMLCanvasElement.prototype.getContext
  }
})

afterEach(() => {
  // Restore the console spies each test installs. We deliberately do NOT wipe
  // `document.body`: Teleported content unmounts through it, and tearing it out
  // from under Vue turns a clean unmount into an error on the NEXT test.
  vi.restoreAllMocks()
})

/**
 * Force-resolve a demo's lazy `defineAsyncComponent` BEFORE mount.
 *
 * Critical, and the exact trap `../blocks/a11y.spec.ts` documents: rendering the
 * async wrapper and flushing promises does NOT settle the dynamic `import()` in
 * this jsdom run — the wrapper stays an unresolved comment placeholder, the
 * assertions run against an EMPTY container, and all 59 demos "pass" having
 * mounted nothing. Awaiting the wrapper's internal `__asyncLoader()` resolves the
 * real SFC up front, after which it mounts synchronously. The non-empty guard in
 * each test is the backstop that keeps this honest.
 */
async function resolveDemo(component: Component): Promise<void> {
  const loader = (component as { __asyncLoader?: () => Promise<unknown> }).__asyncLoader
  if (typeof loader === 'function')
    await loader()
}

/**
 * Errors give their message; anything else is JSON'd so the report is never
 *  a useless "[object Object]".
 */
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

/** One captured console line, flattened to a readable string. */
function formatCall(args: unknown[]): string {
  return args.map(arg => (arg instanceof Error ? arg.message : String(arg))).join(' ')
}

const demos = CATALOG.map((entry: CatalogEntry) => ({ entry, label: entry.id }))

describe('animation gallery — catalog', () => {
  // Without this, an empty catalog would make every `it.each` below vanish and
  // the file would report "passed" having mounted nothing.
  it('has a non-empty catalog to render', () => {
    expect(CATALOG.length).toBeGreaterThan(0)
  })

  it('gives every effect a unique id (the test name + the demo :key seed)', () => {
    expect(new Set(CATALOG.map(entry => entry.id)).size).toBe(CATALOG.length)
  })

  it('pairs every effect with a demo component to mount', () => {
    const missing = CATALOG.filter(entry => entry.demo == null).map(entry => entry.id)
    expect(missing, `Effects with no demo: ${missing.join(', ')}`).toEqual([])
  })
})

describe('animation gallery — demo render smoke', () => {
  it.each(demos)('demo "$label" mounts and renders cleanly', async ({ entry }) => {
    // Vue reports failed prop validation, missing required props, unknown
    // components and unhandled render errors through console.warn/error, so a
    // silent console is the assertion. Spies are per-test (torn down in
    // afterEach) so one demo's noise can never be blamed on another.
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})

    // Render/lifecycle errors are swallowed by Vue's error handling and would
    // otherwise leave an empty DOM rather than a thrown test — capture them.
    const errors: unknown[] = []
    let container: Element
    try {
      await resolveDemo(entry.demo)
      ;({ container } = render(entry.demo, {
        global: { config: { errorHandler: (err: unknown) => errors.push(err) } },
      }))
      // Let nested onMounted hooks / microtasks settle before snapshotting.
      await flushPromises()
    }
    catch (thrown) {
      throw new Error(`[render] demo "${entry.id}" threw while mounting: ${describeError(thrown)}`)
    }

    expect(
      errors.map(describeError),
      `[render] demo "${entry.id}" raised ${errors.length} error(s) while rendering`,
    ).toEqual([])

    // The anti-vacuous guard: a demo that stayed an unresolved async placeholder
    // renders only a comment node — no elements — and must fail here rather than
    // quietly satisfy the console check.
    expect(
      container.querySelectorAll('*').length,
      `[render] demo "${entry.id}" rendered no elements — did the async wrapper resolve?`,
    ).toBeGreaterThan(0)

    const noise = [
      ...warn.mock.calls.map(args => `[warn] ${formatCall(args)}`),
      ...error.mock.calls.map(args => `[error] ${formatCall(args)}`),
    ]
    expect(
      noise,
      `[render] demo "${entry.id}" logged ${noise.length} console warning(s)/error(s):\n    ${noise.join('\n    ')}`,
    ).toEqual([])
  })
})
