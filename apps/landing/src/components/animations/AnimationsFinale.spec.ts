/**
 * TASK-AV2-06 — the /animations curtain call (docs/animations-v2.md).
 *
 * Pins the finale's contract: derived (never hand-typed) copy, a purely
 * decorative beam/orbit art panel, both actions reachable by role, and a
 * back-to-top that honours the combined motion preference. The beam drawing
 * and orbit spin are SVG/CSS — jsdom asserts none of that.
 */

import { cleanup, fireEvent, render } from '@testing-library/vue'
import { flushPromises } from '@vue/test-utils'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { CATALOG } from '../../gallery/catalog.ts'
import { provideMotionPreference } from '../../motion/index.ts'
import AnimationsFinale from './AnimationsFinale.vue'

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

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

async function renderFinale(reduced = false) {
  const utils = render(
    defineComponent({
      setup: () => {
        provideMotionPreference(reduced)
        return () => h(AnimationsFinale)
      },
    }),
  )
  await flushPromises()
  return utils
}

describe('animationsFinale (TASK-AV2-06)', () => {
  it('states only derived truth — the effect count comes from the catalog', async () => {
    const { container } = await renderFinale()
    expect(container.textContent).toContain(`All ${CATALOG.length} effects`)
    // No claim of a published motion package (the module is landing-local).
    expect(container.textContent).not.toContain('@dzup-ui/motion')
  })

  it('keeps the architecture diagram purely decorative', async () => {
    const { container } = await renderFinale()
    const art = container.querySelector('.finale-art')!
    expect(art.getAttribute('aria-hidden')).toBe('true')
    expect(art.hasAttribute('inert')).toBe(true)
    expect(art.querySelector('a, button, input, [tabindex]')).toBeNull()
  })

  it('offers both actions by role', async () => {
    const { getByRole } = await renderFinale()
    // DzButton as="a" renders an anchor with role="button" (core's contract).
    const browse = getByRole('button', { name: /Browse components/ })
    expect(browse.getAttribute('href')).toBeTruthy()
    expect(getByRole('button', { name: /Back to top/ })).toBeTruthy()
  })

  it('back-to-top scrolls smoothly with motion, instantly under the reduce toggle', async () => {
    const scrollTo = vi.fn()
    vi.stubGlobal('scrollTo', scrollTo)

    const motion = await renderFinale(false)
    await fireEvent.click(motion.getByRole('button', { name: /Back to top/ }))
    expect(scrollTo).toHaveBeenLastCalledWith({ top: 0, behavior: 'smooth' })
    cleanup()

    const still = await renderFinale(true)
    await fireEvent.click(still.getByRole('button', { name: /Back to top/ }))
    expect(scrollTo).toHaveBeenLastCalledWith({ top: 0, behavior: 'auto' })
  })
})
