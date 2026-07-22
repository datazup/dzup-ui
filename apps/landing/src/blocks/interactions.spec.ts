/**
 * Per-block interaction smoke test (TASK-FREE3-12).
 *
 * `a11y.spec.ts` next door mounts every block and scans it with axe; what it
 * cannot see is whether the block still WORKS once touched. Blocks are copy-paste
 * starters — a visitor's first act on `/blocks/:id` is to click the thing — and
 * measured before this suite their handlers were the least-covered code in the
 * app after the templates: `ContextMenuBoard.vue` ran 7 of its 18 functions,
 * `CreateDialog.vue` 8 of 21, all at 100% statements. The gap is entirely
 * "nobody ever clicked it".
 *
 * For every block this clicks each enabled in-DOM control — buttons plus the
 * ARIA widget roles — one at a time, asserting after each that the click did not
 * throw, that Vue's `errorHandler` caught nothing (where a handler exception
 * lands: Vue swallows it and the block silently stops updating), and that the
 * block still renders content.
 *
 * It does NOT assert what a handler does; per-block semantics belong with the
 * block. This is the floor — every handler runs once, no handler breaks its own
 * block. A failure here is a real defect: every control clicked is one a visitor
 * can click.
 *
 * Shape notes (the traps, in full in `../templates/interactions.spec.ts`):
 * anchors are excluded (jsdom has no navigation); controls are re-queried each
 * iteration and detached nodes skipped; `document.body` is never wiped, because
 * Teleported overlays unmount through it. Overlay blocks are swept only inside
 * their own container, so a click that opens a Teleported dialog counts as one
 * interaction and its panel's contents are not walked — the a11y suite is what
 * audits those panels.
 */

import type { Component } from 'vue'
import { render } from '@testing-library/vue'
import { flushPromises } from '@vue/test-utils'
import { beforeAll, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { BLOCKS } from './registry.ts'

/** The same jsdom gaps `a11y.spec.ts` fills — see its header for the why. */
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

/** Per-block click budget — bounded runtime, and never silently exceeded. */
const MAX_CLICKS = 40

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
 * Force-resolve the block's lazy wrapper BEFORE mount — without this the wrapper
 * stays an unresolved comment placeholder in jsdom and the sweep would find no
 * controls at all and pass. See `a11y.spec.ts` for the full explanation.
 */
async function resolveBlock(component: Component): Promise<void> {
  const loader = (component as { __asyncLoader?: () => Promise<unknown> }).__asyncLoader
  if (typeof loader === 'function')
    await loader()
}

function describeControl(el: Element): string {
  const name = el.getAttribute('aria-label') ?? el.textContent?.trim().slice(0, 40) ?? ''
  const role = el.getAttribute('role') ?? el.tagName.toLowerCase()
  return name ? `${role} "${name}"` : `<${role}>`
}

const blocks = BLOCKS.map(block => ({ block, label: block.id }))

describe('blocks — interaction smoke', () => {
  it('has a non-empty catalog to click through', () => {
    expect(BLOCKS.length).toBeGreaterThan(0)
  })

  it.each(blocks)('block "$label" survives clicking every control', async ({ block }) => {
    const errors: unknown[] = []
    await resolveBlock(block.component)
    const { container } = render(block.component, {
      global: { config: { errorHandler: (error: unknown) => errors.push(error) } },
    })
    await flushPromises()

    expect(
      container.textContent?.trim() ?? '',
      `[interactions] block "${block.id}" rendered no content — did it resolve?`,
    ).not.toBe('')

    const clicked: string[] = []
    for (let i = 0; i < MAX_CLICKS; i += 1) {
      const controls = [...container.querySelectorAll(CLICKABLE)].filter(el => el.isConnected)
      const next = controls[i]
      if (!next)
        break

      const label = describeControl(next)
      try {
        ;(next as HTMLElement).click()
        await nextTick()
      }
      catch (thrown) {
        throw new Error(
          `[interactions] block "${block.id}" threw on ${label}: ${describeError(thrown)}`,
        )
      }
      clicked.push(label)

      expect(
        errors.map(describeError),
        `[interactions] block "${block.id}" raised an error on ${label}`,
      ).toEqual([])
      expect(
        container.textContent?.trim() ?? '',
        `[interactions] block "${block.id}" rendered nothing after ${label}`,
      ).not.toBe('')
    }

    await flushPromises()
    expect(
      errors.map(describeError),
      `[interactions] block "${block.id}" raised errors after ${clicked.length} click(s)`,
    ).toEqual([])

    // A block with no controls is legal (a static card); the cap silently
    // truncating a block's tail is not.
    expect(
      clicked.length,
      `[interactions] block "${block.id}" hit the ${MAX_CLICKS}-click cap — raise MAX_CLICKS `
      + 'or the tail of its controls is going untouched.',
    ).toBeLessThan(MAX_CLICKS)
  })
})
