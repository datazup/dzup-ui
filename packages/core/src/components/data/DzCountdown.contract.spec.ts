import { mount } from '@vue/test-utils'
/**
 * DzCountdown — Contract Spec v1 conformance tests.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import DzCountdown from './DzCountdown.vue'

/** Fixed reference instant: 2026-06-14T15:00:00.000Z. */
const NOW = new Date('2026-06-14T15:00:00.000Z')

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(NOW)
})

afterEach(() => {
  vi.useRealTimers()
})

function mountCountdown(props: Record<string, unknown> = {}, options: Record<string, unknown> = {}) {
  return mount(DzCountdown, {
    props: { target: NOW.getTime() + 60_000, ...props },
    ...options,
  })
}

describe('dzCountdown — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mountCountdown()
    expect(wrapper.exists()).toBe(true)
  })

  it('exposes the dz-countdown root class for token scoping', () => {
    const wrapper = mountCountdown()
    expect(wrapper.classes()).toContain('dz-countdown')
  })

  it('has contain: layout style on root element', () => {
    const wrapper = mountCountdown()
    expect(wrapper.attributes('style')).toContain('contain: layout style')
  })

  it('renders with the role of a timer', () => {
    const wrapper = mountCountdown()
    expect(wrapper.attributes('role')).toBe('timer')
  })

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mountCountdown({ size })
      expect(wrapper.attributes('data-size')).toBe(size)
    }
  })

  it('accepts all canonical tone values', () => {
    const tones = ['neutral', 'primary', 'success', 'warning', 'danger', 'info'] as const
    for (const tone of tones) {
      const wrapper = mountCountdown({ tone })
      expect(wrapper.attributes('data-tone')).toBe(tone)
    }
  })

  it('exposes a polite live region', () => {
    const wrapper = mountCountdown()
    expect(wrapper.find('[aria-live="polite"]').exists()).toBe(true)
  })

  it('forwards aria-label to the root', () => {
    const wrapper = mountCountdown({ ariaLabel: 'Sale ends in' })
    expect(wrapper.attributes('aria-label')).toBe('Sale ends in')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mountCountdown({}, { attrs: { class: 'custom-class' } })
    expect(wrapper.classes()).toContain('custom-class')
  })

  it('exposes start/pause/reset via template ref', () => {
    const wrapper = mountCountdown()
    const exposed = wrapper.vm as unknown as Record<string, unknown>
    expect(typeof exposed.start).toBe('function')
    expect(typeof exposed.pause).toBe('function')
    expect(typeof exposed.reset).toBe('function')
  })
})
