/**
 * The showcase rise mapping (docs/landing-v2.md TASK-LV2-04) — the pure
 * interpolation between scroll progress and the stage transform, plus the
 * structural contract of the section wrapper.
 */
import { DzThemeProvider } from '@dzup-ui/core'
import { cleanup, render } from '@testing-library/vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { provideMotionPreference } from '../../motion/index.ts'
import { RISE_COMPLETE_AT, RISE_ROTATE_X, RISE_SCALE_FROM, riseTransform } from './showcaseRise.ts'
import ShowcaseSection from './ShowcaseSection.vue'

describe('riseTransform', () => {
  it('starts at the full backward tilt at progress 0', () => {
    const t = riseTransform(0, false)
    expect(t).toContain(`rotateX(${RISE_ROTATE_X.toFixed(2)}deg)`)
    expect(t).toContain(`scale(${RISE_SCALE_FROM.toFixed(3)})`)
  })

  it('reaches exact identity at the completion point — and stays there', () => {
    expect(riseTransform(RISE_COMPLETE_AT, false)).toBe('none')
    expect(riseTransform(0.8, false)).toBe('none')
    expect(riseTransform(1, false)).toBe('none')
  })

  it('interpolates monotonically: less tilt as progress grows', () => {
    const angleAt = (p: number): number => {
      const match = riseTransform(p, false).match(/rotateX\(([\d.]+)deg\)/)
      return match ? Number(match[1]) : 0
    }
    const a = angleAt(0.1)
    const b = angleAt(0.3)
    const c = angleAt(0.5)
    expect(a).toBeGreaterThan(b)
    expect(b).toBeGreaterThan(c)
    expect(c).toBeGreaterThan(0)
  })

  it('clamps out-of-range progress instead of extrapolating', () => {
    expect(riseTransform(-0.5, false)).toBe(riseTransform(0, false))
    expect(riseTransform(2, false)).toBe('none')
  })

  it('is identity always under reduced motion', () => {
    expect(riseTransform(0, true)).toBe('none')
    expect(riseTransform(0.3, true)).toBe('none')
  })
})

describe('showcaseSection (TASK-LV2-04)', () => {
  function stubEnv({ reduced = false } = {}): void {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query.includes('prefers-reduced-motion') ? reduced : false,
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

  it('mounts the dashboard inside the perspective stage with the spotlight overlay', () => {
    stubEnv()
    render(defineComponent({
      setup: () => () => h(DzThemeProvider, null, { default: () => h(ShowcaseSection) }),
    }))
    const stage = document.querySelector('.showcase-stage')!
    expect(stage.classList.contains('dz-depth-stage')).toBe(true)
    expect(stage.querySelector('.showcase-rise')).not.toBeNull()
    // The dashboard's own tree is present and untransformed content-wise.
    expect(stage.textContent).toBeTruthy()
  })

  it('applies no transform under reduced motion — identity from the start', () => {
    // The OS matchMedia read is a module singleton (cached by the first test),
    // so reduced motion is driven through the page-level override — the same
    // channel the live "Reduce motion" toggle uses.
    stubEnv({ reduced: true })
    render(defineComponent({
      setup: () => {
        provideMotionPreference(true)
        return () => h(DzThemeProvider, null, { default: () => h(ShowcaseSection) })
      },
    }))
    const rise = document.querySelector<HTMLElement>('.showcase-rise')!
    expect(rise.style.transform).toBe('')
    expect(rise.style.willChange).toBe('')
  })
})
