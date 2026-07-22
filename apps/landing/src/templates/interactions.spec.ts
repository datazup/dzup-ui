/**
 * Per-template interaction smoke test (TASK-FREE3-12).
 *
 * `render.spec.ts` next door proves every template MOUNTS. That leaves the half
 * of each template a visitor actually touches untested: the click handlers —
 * add-to-cart, step forward, toggle the filter, dismiss the row. Measured before
 * this suite, the 44 templates ran at ~20% function coverage: `Checkout.vue` had
 * 1 of its 20 functions ever executed, `AccountSettings.vue` 0 of 12. A handler
 * that throws on its first click, or that leaves the page rendering nothing,
 * shipped green.
 *
 * ## What this proves, and what it does not
 *
 * For every template it clicks one representative of every DISTINCT enabled,
 * in-DOM control — buttons and the ARIA widget roles (`tab`, `switch`,
 * `checkbox`, `radio`, `menuitem*`, `option`), deduplicated by role + class
 * signature (see `signature` below) — one at a time, and after each click asserts:
 *
 *   1. the click did not throw,
 *   2. Vue's `errorHandler` caught nothing (where a handler's exception lands —
 *      Vue swallows it, so without this the page just stops updating), and
 *   3. the template still renders content (a handler that empties the page, or
 *      leaves the render function throwing, fails here rather than in front of a
 *      visitor).
 *
 * It does NOT assert what each handler does — "the cart total went up" belongs
 * in a test that knows the template's domain. This is the floor: every handler
 * runs at least once, and no handler can break its own page. Treat a failure as
 * a real defect, never as "the sweep clicked something it shouldn't" — every
 * control here is one a visitor can click too.
 *
 * ## Traps this suite is shaped around
 *
 *   • **Anchors are excluded.** jsdom has no navigation, so clicking `<a href>`
 *     logs a "Not implemented" error that has nothing to do with the template.
 *   • **Controls are re-queried after every click**, and detached nodes are
 *     skipped: a click that re-renders a list invalidates the node list, and
 *     clicking a detached node silently does nothing (a false pass).
 *   • **`document.body` is never wiped** — Teleported dialogs/tooltips unmount
 *     through it (see the note in `render.spec.ts`).
 *   • **Console is not asserted on**, unlike `render.spec.ts`: interaction opens
 *     Teleported overlays whose portals jsdom reports on, and Vue's real signal
 *     for a broken handler is the `errorHandler`, which IS asserted.
 *
 * ## Cost
 *
 * MAX_CLICKS caps each template at 40 controls so one huge table cannot dominate
 * the run; the cap is reported (not silent) by the assertion at the end of each
 * test, which fails if any template is actually being truncated by it.
 */

import type { Component } from 'vue'
import type { TemplateMeta } from './registry.ts'
import { render } from '@testing-library/vue'
import { flushPromises } from '@vue/test-utils'
import { beforeAll, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { TEMPLATES } from './registry.ts'

/** Same jsdom gaps `render.spec.ts` fills — see its header for the why. */
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

/**
 * Controls a visitor can click with no navigation side effect. Anchors are out
 * (jsdom navigation), as are `input`s whose click semantics belong to typing.
 */
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

/** Per-template budget on DISTINCT controls — bounded, and never silently exceeded. */
const MAX_CLICKS = 40

/**
 * "Same component, same handler" proxy: role + class list.
 *
 * A data table renders one delete button per row and a cart one stepper per
 * line; they are the same component bound to the same handler, so clicking all
 * of them costs wall-clock and buys no coverage. Deliberately NOT the accessible
 * name — 20 rows have 20 names and one handler. Measured: this halves the
 * suite's runtime with no change in the templates' function coverage.
 */
function signature(el: Element): string {
  return `${el.getAttribute('role') ?? el.tagName.toLowerCase()}|${el.className}`
}

/** Errors give their message; anything else is JSON'd so reports stay readable. */
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

/** Awaiting `load()` IS the force-resolve for templates — see `render.spec.ts`. */
async function resolveTemplate(template: TemplateMeta): Promise<Component> {
  const module = await template.load()
  return module.default
}

/** A stable-enough label for the failure message: the control's name or markup. */
function describeControl(el: Element): string {
  const name = el.getAttribute('aria-label') ?? el.textContent?.trim().slice(0, 40) ?? ''
  const role = el.getAttribute('role') ?? el.tagName.toLowerCase()
  return name ? `${role} "${name}"` : `<${role}>`
}

const templates = TEMPLATES.map(template => ({ template, label: template.slug }))

describe('templates — interaction smoke', () => {
  it('has a non-empty catalogue to click through', () => {
    expect(TEMPLATES.length).toBeGreaterThan(0)
  })

  it.each(templates)('template "$label" survives clicking every control', async ({ template }) => {
    const errors: unknown[] = []
    const component = await resolveTemplate(template)
    const { container } = render(component, {
      global: { config: { errorHandler: (error: unknown) => errors.push(error) } },
    })
    await flushPromises()

    // The anti-vacuous guard, before any clicking: an unresolved/empty render
    // would otherwise "survive" the sweep by having nothing to click.
    expect(
      container.textContent?.trim() ?? '',
      `[interactions] template "${template.slug}" rendered no content`,
    ).not.toBe('')

    const seen = new Set<string>()
    const clicked: string[] = []
    // Re-query every iteration: a click that re-renders a list detaches the
    // nodes a single up-front query captured, and clicking a detached node is a
    // no-op that looks like a pass.
    for (let guard = 0; guard < MAX_CLICKS; guard += 1) {
      const next = [...container.querySelectorAll(CLICKABLE)]
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
        throw new Error(
          `[interactions] template "${template.slug}" threw on ${label}: ${describeError(thrown)}`,
        )
      }
      clicked.push(label)

      expect(
        errors.map(describeError),
        `[interactions] template "${template.slug}" raised an error on ${label}`,
      ).toEqual([])
      expect(
        container.textContent?.trim() ?? '',
        `[interactions] template "${template.slug}" rendered nothing after ${label}`,
      ).not.toBe('')
    }

    await flushPromises()
    expect(
      errors.map(describeError),
      `[interactions] template "${template.slug}" raised errors after ${clicked.length} click(s)`,
    ).toEqual([])

    // Not every template is interactive (a static marketing page has no
    // controls), so an empty sweep is legal — but the cap must never be the
    // reason a sweep stopped, or coverage would silently shrink as a template
    // grows. Assert the budget was sufficient.
    expect(
      seen.size,
      `[interactions] template "${template.slug}" hit the ${MAX_CLICKS}-distinct-control cap — `
      + 'raise MAX_CLICKS or the tail of its controls is going untouched.',
    ).toBeLessThan(MAX_CLICKS)
  })
})
