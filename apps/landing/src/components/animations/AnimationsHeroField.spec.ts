/**
 * TASK-AV2-02 — the /animations hero depth field (docs/animations-v2.md).
 *
 * The field floats five live "mini-performances" built from the gallery's own
 * motion primitives — no image bytes. These specs pin the contract:
 *
 *   1. decoration only — aria-hidden + inert host, no interactive descendants;
 *   2. the composition is the five expected performances, each tinted with a
 *      REAL category accent from the catalog's own accent map;
 *   3. under reduced motion (the page-level toggle) every CSS-utility
 *      performance carries its `--reduced` modifier, so the field stills.
 *
 * The parallax/float motion is CSS + pointer driven — jsdom asserts none of it.
 */

import { cleanup, render } from '@testing-library/vue'
import { flushPromises } from '@vue/test-utils'
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import { CATEGORY_ACCENTS } from '../../gallery/catalog.ts'
import { provideMotionPreference } from '../../motion/index.ts'
import AnimationsHeroField from './AnimationsHeroField.vue'

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
})

afterEach(() => {
  cleanup()
})

async function renderField(reduced = false) {
  const utils = render(
    defineComponent({
      setup: () => {
        provideMotionPreference(reduced)
        return () => h(AnimationsHeroField)
      },
    }),
  )
  // The field renders nothing until its post-paint `ready` gate flips.
  await flushPromises()
  return utils.container as HTMLElement
}

function fieldHost(container: HTMLElement): HTMLElement {
  const host = container.querySelector<HTMLElement>('.av2-hero-field')
  if (!host)
    throw new Error('hero field not rendered')
  return host
}

describe('animationsHeroField (TASK-AV2-02)', () => {
  it('is pure decoration: aria-hidden + inert, nothing interactive, no images', async () => {
    const container = await renderField()
    const host = fieldHost(container)
    expect(host.getAttribute('aria-hidden')).toBe('true')
    expect(host.hasAttribute('inert')).toBe(true)
    expect(host.querySelector('a, button, input, [tabindex]')).toBeNull()
    // The "imagery" is the product performing — never an image file.
    expect(host.querySelector('img, svg image')).toBeNull()
  })

  it('floats the five expected performances, each in a real category accent', async () => {
    const container = await renderField()
    const host = fieldHost(container)
    const tiles = [...host.querySelectorAll<HTMLElement>('.av2-perf')]
    expect(tiles).toHaveLength(5)

    // Each tile's --accent must be a real gallery accent hue for its category.
    const expectations: Array<[string, keyof typeof CATEGORY_ACCENTS]> = [
      ['.av2-perf--orbit', 'connections'],
      ['.av2-perf--pill', 'text'],
      ['.av2-perf--meteors', 'backgrounds'],
      ['.av2-perf--ping', 'attention'],
      ['.av2-perf--shimmer', 'lists'],
    ]
    for (const [selector, category] of expectations) {
      const tile = host.querySelector<HTMLElement>(selector)
      expect(tile, selector).not.toBeNull()
      const [primary] = CATEGORY_ACCENTS[category]!
      expect(tile!.getAttribute('style')).toContain(`--accent: var(--dz-colors-${primary}-500)`)
    }

    // The meteor patch caps its own concurrency by markup (the tokens.css rule).
    expect(host.querySelectorAll('.dz-meteors__streak')).toHaveLength(3)
  })

  it('stills every CSS-utility performance under the page-level reduce toggle', async () => {
    const container = await renderField(true)
    const host = fieldHost(container)
    expect(host.querySelector('.dz-meteors')!.classList.contains('dz-meteors--reduced')).toBe(true)
    expect(host.querySelector('.dz-ping')!.classList.contains('dz-ping--reduced')).toBe(true)
    expect(host.querySelector('.dz-shimmer')!.classList.contains('dz-shimmer--reduced')).toBe(true)
  })
})
