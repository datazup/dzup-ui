/**
 * Per-template render smoke test (docs/free-apps-audit.md, TASK-FREE-16).
 *
 * The 87 blocks have had a per-block gate for a while (`../blocks/a11y.spec.ts`);
 * the 44 full-page templates had NOTHING. Every one of them is a real page a
 * visitor can open at `/templates/<slug>` and copy into their own app, so the
 * floor is: it mounts, it paints something, and it does so without Vue
 * complaining. This suite is that floor — the cheapest check that catches a
 * template broken by a `@dzup-ui/core` prop rename, a bad v-model, or a missing
 * import, none of which the (typecheck-free) landing build would notice
 * (MEMORY.md → "Landing build skips typecheck").
 *
 * What each test asserts, per template:
 *   1. it mounts without throwing (setup + render + onMounted all survive),
 *   2. it renders NON-EMPTY output — the guard that keeps this honest (see
 *      `resolveTemplate` below on why an empty render is the failure mode to
 *      fear), and
 *   3. it logs no `console.warn` / `console.error` — this is where Vue reports
 *      failed prop validation, missing required props, unknown components and
 *      unhandled render errors, so a clean console is a real signal.
 *
 * The list is driven off `TEMPLATES` itself, never a hand-typed roster: a new
 * template is covered the moment its row lands, and one that is deleted takes
 * its test with it. The meta-test below makes an empty registry a loud failure
 * rather than a suite that passes by testing nothing.
 *
 * Deliberately NOT an a11y audit — that is the blocks suite's job and templates
 * are not certified. This is the render floor only.
 */

import type { Component } from 'vue'
import type { TemplateMeta } from './registry.ts'
import { render } from '@testing-library/vue'
import { flushPromises } from '@vue/test-utils'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { TEMPLATES } from './registry.ts'

/**
 * jsdom ships neither `matchMedia` nor `IntersectionObserver`, and several
 * templates reach for them at mount through composed core components
 * (DzSidebar's `useSidebar`, DzColorModeToggle, DzAnimatedNumber's on-scroll
 * count-up, DzCarousel). Both are guarded only by a `typeof` check, so their
 * absence throws rather than degrades. Static, non-matching stubs are enough:
 * we render the default desktop / no-reduced-motion state, which is the state
 * the gallery previews. `ResizeObserver` and `scrollIntoView` are already
 * polyfilled globally in `vitest.setup.ts`; `requestAnimationFrame` is native
 * to jsdom, so neither is stubbed here.
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
})

afterEach(() => {
  // Restore the console spies each test installs. Note we deliberately do NOT
  // wipe `document.body` — Teleported content (DzDialog, DzTooltip, DzToast)
  // unmounts through it, and tearing it out from under Vue turns a clean
  // unmount into an error on the NEXT test. Testing Library's own auto-cleanup
  // handles the mounted trees.
  vi.restoreAllMocks()
})

/**
 * Resolve a template's page component from its lazy `load()`.
 *
 * `TemplateMeta.load` is a bare dynamic `import()` (unlike the blocks registry,
 * which wraps each entry in `lazyComponent`/`defineAsyncComponent` — so there is
 * no `__asyncLoader` to force here; awaiting `load()` IS the force-resolve). The
 * distinction matters for the same reason it does in the blocks suite: were the
 * component mounted as an unresolved async wrapper, `<Suspense>` + a flush would
 * leave a comment placeholder behind, the assertions would run against an EMPTY
 * container, and all 44 templates would "pass" while proving nothing. Awaiting
 * the module up front means the real SFC mounts synchronously; the non-empty
 * guard in each test is the backstop that keeps that true.
 */
async function resolveTemplate(template: TemplateMeta): Promise<Component> {
  const module = await template.load()
  return module.default
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

const templates = TEMPLATES.map(template => ({ template, label: template.slug }))

describe('templates — registry', () => {
  // Without this, an empty (or broken-glob) registry would make every `it.each`
  // below vanish and the file would report "passed" having mounted nothing —
  // the same vacuous-pass trap `scripts/build-sitemap.ts` fails loudly on.
  it('has a non-empty catalogue to render', () => {
    expect(TEMPLATES.length).toBeGreaterThan(0)
  })

  it('gives every template a unique slug (the test name + the route key)', () => {
    expect(new Set(TEMPLATES.map(t => t.slug)).size).toBe(TEMPLATES.length)
  })
})

describe('templates — render smoke', () => {
  it.each(templates)('template "$label" mounts and renders cleanly', async ({ template }) => {
    // Vue reports failed prop validation, missing required props, unknown
    // components and unhandled render errors through console.warn/error, so a
    // silent console is the assertion. Spies are installed per-test (and torn
    // down in afterEach) so one template's noise can never be blamed on another.
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})

    // Render/lifecycle errors are swallowed by Vue's error handling and would
    // otherwise leave an empty DOM rather than a thrown test — capture them.
    const errors: unknown[] = []
    let container: Element
    try {
      const component = await resolveTemplate(template)
      ;({ container } = render(component, {
        global: { config: { errorHandler: (err: unknown) => errors.push(err) } },
      }))
      // Let nested onMounted hooks / microtasks settle before snapshotting.
      await flushPromises()
    }
    catch (thrown) {
      throw new Error(
        `[render] template "${template.slug}" threw while mounting: ${describeError(thrown)}`,
      )
    }

    expect(
      errors.map(describeError),
      `[render] template "${template.slug}" raised ${errors.length} error(s) while rendering`,
    ).toEqual([])

    // The anti-vacuous guard: a template that resolved to a placeholder, or
    // rendered nothing, must fail rather than quietly satisfy the console check.
    expect(
      container.textContent?.trim() ?? '',
      `[render] template "${template.slug}" rendered no text — did it resolve?`,
    ).not.toBe('')
    expect(
      container.querySelectorAll('*').length,
      `[render] template "${template.slug}" rendered no elements`,
    ).toBeGreaterThan(0)

    const noise = [
      ...warn.mock.calls.map(args => `[warn] ${formatCall(args)}`),
      ...error.mock.calls.map(args => `[error] ${formatCall(args)}`),
    ]
    expect(
      noise,
      `[render] template "${template.slug}" logged ${noise.length} console warning(s)/error(s):\n    ${noise.join('\n    ')}`,
    ).toEqual([])
  })
})
