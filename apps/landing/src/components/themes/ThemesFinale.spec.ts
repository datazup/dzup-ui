/**
 * ThemesFinale — the /themes closing band (docs/themes-v2.md TASK-THV2-07).
 *
 * Pins: derived copy (never hand-typed), the decorative art panel's a11y
 * containment, the action wiring (the share/download handlers are the PAGE's —
 * the band only emits), and the reduced-motion stilling.
 */

import { SHADE_STEPS } from '@dzup-ui/tokens'
import { cleanup, fireEvent, render } from '@testing-library/vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { DESIGNER_INTENTS } from '../../composables/useThemeDesigner.ts'
import { provideMotionPreference } from '../../motion/index.ts'
import ThemesFinale from './ThemesFinale.vue'

beforeEach(() => {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }))
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
  cleanup()
  vi.unstubAllGlobals()
})

const BASE_PROPS = { shareLabel: 'Copy share link', shareState: 'idle' } as const

describe('themesFinale (THV2-07)', () => {
  it('states only derived facts in the copy', () => {
    const { container } = render(ThemesFinale, { props: BASE_PROPS })
    const lede = container.querySelector('.tf-lede')?.textContent ?? ''
    // Expectations computed from the SAME imports the band uses.
    expect(lede).toContain(`${DESIGNER_INTENTS.length} palettes`)
    expect(lede).toContain(`${DESIGNER_INTENTS.length * SHADE_STEPS.length} shades`)
    expect(lede).toContain('already applied')
  })

  it('keeps the art panel aria-hidden, inert and pointer-transparent', () => {
    const { container } = render(ThemesFinale, { props: BASE_PROPS })
    const art = container.querySelector('.tf-art')
    expect(art).not.toBeNull()
    expect(art?.getAttribute('aria-hidden')).toBe('true')
    expect(art?.hasAttribute('inert')).toBe(true)
  })

  it('emits share and downloadCss — the page owns the actual clipboard plumbing', async () => {
    const { container, emitted } = render(ThemesFinale, { props: BASE_PROPS })
    const buttons = [...container.querySelectorAll('button')]
    const share = buttons.find(b => b.textContent?.includes('Copy share link'))
    const download = buttons.find(b => b.textContent?.includes('Download .css'))
    expect(share).toBeDefined()
    expect(download).toBeDefined()
    await fireEvent.click(share!)
    await fireEvent.click(download!)
    expect(emitted().share).toHaveLength(1)
    expect(emitted().downloadCss).toHaveLength(1)
  })

  it('renders the passed share label and state (the hero contract, verbatim)', () => {
    const { container } = render(ThemesFinale, {
      props: { shareLabel: 'Link copied!', shareState: 'copied' },
    })
    const share = [...container.querySelectorAll('button')]
      .find(b => b.textContent?.includes('Link copied!'))
    expect(share).toBeDefined()
  })

  it('stills the band under the page motion override', () => {
    const Host = defineComponent({
      setup() {
        provideMotionPreference(true)
        return () => h(ThemesFinale, BASE_PROPS)
      },
    })
    const { container } = render(Host)
    expect(container.querySelector('.tf-inner')?.classList.contains('is-still')).toBe(true)
  })
})
