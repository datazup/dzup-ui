import { mount } from '@vue/test-utils'
/**
 * DzAnimatedNumber — Contract Spec v1 conformance tests.
 *
 * Mounted with `duration: 0` so the figure snaps to its target synchronously,
 * keeping these structural assertions deterministic (animation behaviour is
 * covered in the unit spec).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import DzAnimatedNumber from './DzAnimatedNumber.vue'

beforeEach(() => {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }))
})

afterEach(() => {
  vi.unstubAllGlobals()
})

function mountNumber(props: Record<string, unknown> = {}, options: Record<string, unknown> = {}) {
  return mount(DzAnimatedNumber, {
    props: { value: 1000, duration: 0, startOnView: false, ...props },
    ...options,
  })
}

describe('dzAnimatedNumber — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mountNumber()
    expect(wrapper.exists()).toBe(true)
  })

  it('exposes the dz-animated-number root class for token scoping', () => {
    const wrapper = mountNumber()
    expect(wrapper.classes()).toContain('dz-animated-number')
  })

  it('has contain: layout style on root element', () => {
    const wrapper = mountNumber()
    expect(wrapper.attributes('style')).toContain('contain: layout style')
  })

  it('renders the formatted target value', () => {
    const wrapper = mountNumber({ value: 1234 })
    expect(wrapper.text()).toContain('1,234')
  })

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mountNumber({ size })
      expect(wrapper.attributes('data-size')).toBe(size)
    }
  })

  it('reflects the tone via data-tone', () => {
    const tones = ['neutral', 'primary', 'success', 'warning', 'danger', 'info'] as const
    for (const tone of tones) {
      const wrapper = mountNumber({ tone })
      expect(wrapper.attributes('data-tone')).toBe(tone)
    }
  })

  it('exposes a polite live region for screen readers', () => {
    const wrapper = mountNumber()
    expect(wrapper.find('[aria-live="polite"]').exists()).toBe(true)
  })

  it('hides the animating figure from assistive tech', () => {
    const wrapper = mountNumber()
    expect(wrapper.find('[aria-hidden="true"]').exists()).toBe(true)
  })

  it('forwards id and aria-describedby to the root', () => {
    const wrapper = mountNumber({ id: 'kpi', ariaDescribedby: 'kpi-desc' })
    expect(wrapper.attributes('id')).toBe('kpi')
    expect(wrapper.attributes('aria-describedby')).toBe('kpi-desc')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mountNumber({}, { attrs: { class: 'custom-class' } })
    expect(wrapper.classes()).toContain('custom-class')
  })
})
