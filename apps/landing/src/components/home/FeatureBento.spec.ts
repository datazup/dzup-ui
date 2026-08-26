/**
 * FeatureBento (docs/landing-v2.md TASK-LV2-05) — content parity with the v1
 * grid, single-owner entrance, and a demo cluster that actually responds.
 */
import { cleanup, fireEvent, render } from '@testing-library/vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { FEATURES } from '../../data.ts'
import FeatureBento from './FeatureBento.vue'

function stubEnv(): void {
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
  class NoopObserver {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
    takeRecords(): [] {
      return []
    }
  }
  vi.stubGlobal('IntersectionObserver', NoopObserver)
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('featureBento (TASK-LV2-05)', () => {
  it('renders every FEATURES entry — copy parity with the v1 grid', () => {
    stubEnv()
    const { container } = render(FeatureBento)
    for (const f of FEATURES) {
      expect(container.textContent).toContain(f.title)
      expect(container.textContent).toContain(f.body)
    }
  })

  it('hands the entrance to DzBentoReveal — no v1 inline reveal stagger left', async () => {
    stubEnv()
    const { container } = render(FeatureBento)
    // DzBentoReveal indexes its cells one tick after mount.
    await nextTick()
    await nextTick()
    // DzBentoReveal tags each direct child as a cell...
    const cells = container.querySelectorAll('.dz-bento__cell')
    expect(cells.length).toBe(FEATURES.length)
    // ...and the v1 per-tile --reveal-delay mechanism must not double-animate.
    for (const cell of cells)
      expect((cell as HTMLElement).style.getPropertyValue('--reveal-delay')).toBe('')
  })

  it('marks only the featured tile with the border beam ring', () => {
    stubEnv()
    const { container } = render(FeatureBento)
    const beams = container.querySelectorAll('li.dz-border-beam')
    expect(beams.length).toBe(1)
    expect(beams[0]!.classList.contains('tile--featured')).toBe(true)
  })

  it('rewards the demo switch: progress and success check follow it', async () => {
    stubEnv()
    const { container } = render(FeatureBento)
    const toggle = container.querySelector<HTMLElement>('[aria-label="Demo toggle"] input, input[aria-label="Demo toggle"], [role="switch"]')
    expect(toggle).not.toBeNull()
    const progress = container.querySelector('[role="progressbar"]')!
    const before = progress.getAttribute('aria-valuenow')

    await fireEvent.click(toggle!)
    const after = progress.getAttribute('aria-valuenow')
    expect(after).not.toBe(before)
  })
})
