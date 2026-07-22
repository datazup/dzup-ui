/**
 * SocialProof — the five stat tiles. Guards the three properties that make the
 * strip trustworthy and cheap:
 *
 *   1. CLS: every figure reserves its final width before `DzCountUp` tweens up
 *      to it, so the count-up cannot reflow the row (landing-perf budgets
 *      CLS < 0.1).
 *   2. Honesty: a live metric whose API is unavailable renders a call-to-action,
 *      never a fabricated number, and never a bare glyph with no accessible name.
 *   3. A11y: each tile's accessible name is a full phrase ("<n> free
 *      components"), not a bare number read out of context.
 *
 * Every assertion about a live metric STUBS it, never reading the value off
 * `generated/liveStats.ts` — that file is build output whose values move on
 * their own (the GitHub repo is public now, so `githubStars` bakes a real
 * figure; `@dzup-ui/core` is still unpublished, so `npmDownloads` is `null`).
 * A spec that reads it asserts on today's fetch rather than on behaviour, and
 * this one broke in exactly that way once.
 */
import { cleanup, render } from '@testing-library/vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

import { FACTS } from '../config.ts'
import { PRO_FACTS } from '../data.ts'

/** jsdom lacks matchMedia; DzCountUp reads it through useReducedMotion. */
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
    onchange: null,
  })) as unknown as typeof window.matchMedia
}

/** jsdom lacks IntersectionObserver; DzCountUp gates its tween on useInView. */
if (typeof window !== 'undefined' && !('IntersectionObserver' in window)) {
  class NoopObserver {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
    takeRecords(): [] {
      return []
    }
  }
  ;(window as unknown as { IntersectionObserver: unknown }).IntersectionObserver = NoopObserver
}

async function mount() {
  const { default: SocialProof } = await import('./SocialProof.vue')
  return render(SocialProof)
}

afterEach(() => {
  cleanup()
  vi.resetModules()
  vi.unstubAllGlobals()
  vi.doUnmock('../composables/useLiveStats.ts')
})

describe('socialProof — layout stability', () => {
  it('reserves each figure\'s final width so the count-up cannot reflow', async () => {
    const { container } = await mount()
    const figures = [...container.querySelectorAll('.stat-value')]
    expect(figures).toHaveLength(5)
    for (const figure of figures) {
      const style = figure.getAttribute('style') ?? ''
      expect(style, 'every figure reserves a width').toMatch(/--reserve:\s*\d+ch/)
    }
  })

  it('reserves a width wide enough for the formatted value, not the start value', async () => {
    const { container } = await mount()
    // freeComponents is 3 digits today; DzCountUp starts at 0 (1 glyph).
    const first = container.querySelector('.stat-value')
    const expected = new Intl.NumberFormat().format(FACTS.freeComponents).length
    expect(first?.getAttribute('style')).toContain(`--reserve: ${expected}ch`)
  })
})

describe('socialProof — accessible names', () => {
  it('names each static tile with a full phrase, not a bare number', async () => {
    const { getByLabelText } = await mount()
    expect(getByLabelText(`${FACTS.freeComponents} free components`)).toBeTruthy()
    expect(getByLabelText(`${FACTS.families} component families`)).toBeTruthy()
    // The Pro tile shows a ROADMAP figure, and its name has to say so — the two
    // tiles beside it are present-tense facts. See PRO_FACTS in data.ts.
    expect(getByLabelText(`${PRO_FACTS.plannedComponents} Pro components planned`)).toBeTruthy()
  })

  it('degrades an unavailable metric to a call-to-action, never a number', async () => {
    // Stubbed to null rather than read off the committed `generated/liveStats.ts`:
    // that file is build output, and the day the GitHub repo went public it
    // started baking a real `githubStars` — which flipped this tile to the
    // number path and failed an assertion about the DEGRADED path. The
    // behaviour under test is "no number → CTA", so the absence is the input.
    vi.doMock('../composables/useLiveStats.ts', () => ({
      useLiveStats: () => ({
        githubStars: ref(null),
        npmDownloads: ref(null),
        asOf: '2 Jul 2026',
      }),
    }))
    const { getByLabelText, queryByTitle } = await mount()
    expect(getByLabelText('Star dzup-ui on GitHub')).toBeTruthy()
    expect(getByLabelText('Install dzup-ui from npm')).toBeTruthy()
    // No freshness tooltip on a tile with no number to date.
    expect(queryByTitle(/As of the last site build/)).toBeNull()
  })

  it('names a zero metric as a number, not as a missing one', async () => {
    // `0` is a real, fetched, publishable figure — a public repo with no stars
    // yet. It must not fall down the `null` CTA path (`value === null`, never a
    // truthiness check), and it must carry the freshness date every baked
    // number carries. This is the live shape of `generated/liveStats.ts` today.
    vi.doMock('../composables/useLiveStats.ts', () => ({
      useLiveStats: () => ({
        githubStars: ref(0),
        npmDownloads: ref(null),
        asOf: '2 Jul 2026',
      }),
    }))
    const { getByLabelText, getAllByTitle } = await mount()
    expect(getByLabelText('0 GitHub stars')).toBeTruthy()
    expect(getAllByTitle('As of the last site build, 2 Jul 2026')).toHaveLength(1)
  })
})

describe('socialProof — freshness', () => {
  it('dates a real number so a static figure is never read as live', async () => {
    // Must be real refs: `<script setup>` template auto-unwrapping only applies
    // to refs, so a plain `{ value }` object would reach the label helpers whole.
    vi.doMock('../composables/useLiveStats.ts', () => ({
      useLiveStats: () => ({
        githubStars: ref(12_400),
        npmDownloads: ref(8_300),
        asOf: '2 Jul 2026',
      }),
    }))
    const { getByLabelText, getAllByTitle } = await mount()
    expect(getByLabelText('12,400 GitHub stars')).toBeTruthy()
    expect(getByLabelText('8,300 npm downloads in the last week')).toBeTruthy()
    expect(getAllByTitle('As of the last site build, 2 Jul 2026')).toHaveLength(2)
  })

  it('reserves the full width of a five-figure star count', async () => {
    // Must be real refs: `<script setup>` template auto-unwrapping only applies
    // to refs, so a plain `{ value }` object would reach the label helpers whole.
    vi.doMock('../composables/useLiveStats.ts', () => ({
      useLiveStats: () => ({
        githubStars: ref(12_400),
        npmDownloads: ref(8_300),
        asOf: '2 Jul 2026',
      }),
    }))
    const { container } = await mount()
    const styles = [...container.querySelectorAll('.stat-value')].map(n => n.getAttribute('style'))
    // "12,400" formats to 6 glyphs.
    expect(styles.some(s => s?.includes('--reserve: 6ch'))).toBe(true)
  })
})
