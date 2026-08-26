/**
 * The reading thread (docs/landing-v2.md TASK-LV2-09):
 * `useDocumentScrollProgress` arithmetic + the bar's decorative contract.
 * jsdom has no layout, so document/viewport metrics are stubbed — the unit
 * under test is the normalisation and the transform write, not the scrolling.
 */
import { cleanup, render } from '@testing-library/vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import ScrollProgressBar from './ScrollProgressBar.vue'

function stubScroll({ scrollY, scrollHeight, innerHeight }: { scrollY: number, scrollHeight: number, innerHeight: number }): void {
  vi.stubGlobal('scrollY', scrollY)
  vi.stubGlobal('innerHeight', innerHeight)
  Object.defineProperty(document.documentElement, 'scrollHeight', {
    configurable: true,
    value: scrollHeight,
  })
}

/** Run pending rAF callbacks immediately. */
function immediateFrames(): void {
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    cb(0)
    return 1
  })
  vi.stubGlobal('cancelAnimationFrame', () => {})
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('scrollProgressBar (TASK-LV2-09)', () => {
  it('is decorative: aria-hidden, transform-only', async () => {
    immediateFrames()
    stubScroll({ scrollY: 0, scrollHeight: 4000, innerHeight: 800 })
    const { container } = render(ScrollProgressBar)
    await nextTick()
    const bar = container.querySelector<HTMLElement>('.scroll-thread')!
    expect(bar.getAttribute('aria-hidden')).toBe('true')
    expect(bar.style.transform).toBe('scaleX(0)')
  })

  it('tracks the document reading position, clamped to 0..1', async () => {
    immediateFrames()
    stubScroll({ scrollY: 1600, scrollHeight: 4000, innerHeight: 800 })
    const { container } = render(ScrollProgressBar)
    await nextTick()
    const bar = container.querySelector<HTMLElement>('.scroll-thread')!
    expect(bar.style.transform).toBe('scaleX(0.5)')

    stubScroll({ scrollY: 99999, scrollHeight: 4000, innerHeight: 800 })
    immediateFrames()
    window.dispatchEvent(new Event('scroll'))
    await nextTick()
    expect(bar.style.transform).toBe('scaleX(1)')
  })

  it('reports "fully read" on a page with nothing to scroll', async () => {
    immediateFrames()
    stubScroll({ scrollY: 0, scrollHeight: 700, innerHeight: 800 })
    const { container } = render(ScrollProgressBar)
    await nextTick()
    const bar = container.querySelector<HTMLElement>('.scroll-thread')!
    expect(bar.style.transform).toBe('scaleX(1)')
  })
})
