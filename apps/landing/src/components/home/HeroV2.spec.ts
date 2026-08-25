/**
 * HeroV2 — the v2 "stage" hero (docs/landing-v2.md TASK-LV2-03).
 *
 * Guards the four promises the redesign made:
 *
 *   1. **Copy parity & reduced-motion**: every word of the v1 copy — including
 *      the word-revealed accent line — is present in the accessible text from
 *      the first render, reduced motion or not. The reveal is presentation;
 *      the sentence is never withheld from AT or from a reduced-motion user.
 *   2. **Decoration is inert**: the parallax depth field renders `aria-hidden`
 *      with pointer-events disabled by class contract.
 *   3. **The beam is post-paint**: the code panel's border beam is NOT armed on
 *      first render; it arms only after the idle/rAF gate fires — the first
 *      painted frame never carries the animation.
 *   4. **CTA parity**: both hero actions keep their v1 destinations.
 */
import { DzThemeProvider } from '@dzup-ui/core'
import { cleanup, render } from '@testing-library/vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import { LINKS } from '../../config.ts'
import HeroV2 from './HeroV2.vue'

/** The visual column's RethemeButton needs the theme provider above it. */
function renderHero() {
  return render(defineComponent({
    setup: () => () => h(DzThemeProvider, null, { default: () => h(HeroV2) }),
  }))
}

function text(el: Element | null): string {
  return (el?.textContent ?? '').replace(/\s+/g, ' ')
}

/**
 * matchMedia per query: `min-width` (the visual column gate) answers `wide`,
 * `prefers-reduced-motion` answers `reduced`, hover capability answers `hover`.
 * The default is narrow/no-hover so the heavy ShowcaseFrame column stays
 * unmounted and pointer directives correctly decline — each test opts in.
 */
function stubMedia({ wide = false, reduced = false, hover = false } = {}): void {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query.includes('min-width')
      ? wide
      : query.includes('prefers-reduced-motion')
        ? reduced
        : hover,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }))
}

/** jsdom lacks IntersectionObserver; DzStagger (word reveal) observes through it. */
class NoopObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): [] {
    return []
  }
}
vi.stubGlobal('IntersectionObserver', NoopObserver)

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.stubGlobal('IntersectionObserver', NoopObserver)
})

describe('heroV2 (TASK-LV2-03)', () => {
  it('renders the full headline — accent words included — from the first render', () => {
    stubMedia()
    renderHero()
    const title = document.getElementById('hero-title')
    expect(text(title)).toContain('The Vue 3 component library')
    expect(text(title)).toContain('for serious products')
  })

  it('renders the full copy under reduced motion with the depth field inert', () => {
    stubMedia({ reduced: true })
    renderHero()
    expect(text(document.getElementById('hero-title'))).toContain('for serious products')

    const depth = document.querySelector('.hero-depth')!
    expect(depth.getAttribute('aria-hidden')).toBe('true')
    expect(depth.classList.contains('dz-parallax')).toBe(true)
  })

  it('holds the code-panel border beam until the post-paint gate fires', async () => {
    stubMedia()
    // Deterministic idle: capture the callback, fire it by hand.
    let idle: (() => void) | undefined
    vi.stubGlobal('requestIdleCallback', (cb: () => void) => {
      idle = cb
      return 1
    })
    renderHero()
    const beam = document.querySelector('.hero-code')!
    expect(beam.classList.contains('hero-code--armed')).toBe(false)

    idle?.()
    await nextTick()
    expect(beam.classList.contains('hero-code--armed')).toBe(true)
  })

  it('keeps both v1 CTA destinations', () => {
    stubMedia()
    renderHero()
    const links = [...document.querySelectorAll('.hero-ctas a')]
    const browse = links.find(a => text(a).includes('Browse components'))
    expect(browse?.getAttribute('href')).toBe(LINKS.components)
    const star = links.find(a => text(a).includes('Star on GitHub'))
    expect(star?.getAttribute('href')).toBe(LINKS.github)
    expect(star?.getAttribute('rel')).toContain('noreferrer')
  })

  it('mounts the visual column only at the wide breakpoint', () => {
    stubMedia({ wide: false })
    renderHero()
    expect(document.querySelector('.hero-visual')).toBeNull()

    cleanup()
    stubMedia({ wide: true })
    renderHero()
    expect(document.querySelector('.hero-visual')).not.toBeNull()
    // The tilt wrapper hosts the frame; the directive itself declines to attach
    // here (no hover capability stubbed) — which is exactly the touch contract.
    expect(document.querySelector('.hero-frame-tilt')).not.toBeNull()
  })
})
