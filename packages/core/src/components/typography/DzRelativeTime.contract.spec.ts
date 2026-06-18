import { mount } from '@vue/test-utils'
/**
 * DzRelativeTime — Contract Spec v1 conformance tests.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import DzRelativeTime from './DzRelativeTime.vue'

/** Fixed reference instant: 2026-06-14T15:00:00.000Z. */
const NOW = new Date('2026-06-14T15:00:00.000Z')

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(NOW)
})

afterEach(() => {
  vi.useRealTimers()
})

function mountTime(props: Record<string, unknown> = {}, options: Record<string, unknown> = {}) {
  return mount(DzRelativeTime, {
    props: { value: NOW.getTime() - 2 * 60 * 1000, tooltip: false, ...props },
    ...options,
  })
}

describe('dzRelativeTime — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mountTime()
    expect(wrapper.exists()).toBe(true)
  })

  it('renders a <time> element', () => {
    const wrapper = mountTime()
    expect(wrapper.find('time').exists()).toBe(true)
  })

  it('sets a machine-readable datetime attribute (ISO 8601)', () => {
    const value = new Date('2026-06-14T14:58:00.000Z')
    const wrapper = mountTime({ value })
    expect(wrapper.find('time').attributes('datetime')).toBe(value.toISOString())
  })

  it('exposes the dz-relative-time class for token scoping', () => {
    const wrapper = mountTime()
    expect(wrapper.find('time').classes()).toContain('dz-relative-time')
  })

  it('accepts all tone values', () => {
    const tones = ['default', 'muted', 'success', 'warning', 'danger', 'info'] as const
    for (const tone of tones) {
      const wrapper = mountTime({ tone })
      expect(wrapper.find('time').exists()).toBe(true)
    }
  })

  it('forwards an explicit aria-label to the time element', () => {
    const wrapper = mountTime({ ariaLabel: 'Started two minutes ago' })
    expect(wrapper.find('time').attributes('aria-label')).toBe('Started two minutes ago')
  })

  it('forwards the id to the time element', () => {
    const wrapper = mountTime({ id: 'run-started' })
    expect(wrapper.find('time').attributes('id')).toBe('run-started')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mountTime({}, { attrs: { class: 'custom-class' } })
    expect(wrapper.find('time').classes()).toContain('custom-class')
  })

  it('accepts Date, epoch ms, and ISO string values', () => {
    const iso = '2026-06-14T14:00:00.000Z'
    for (const value of [new Date(iso), Date.parse(iso), iso]) {
      const wrapper = mountTime({ value })
      expect(wrapper.find('time').attributes('datetime')).toBe(iso)
    }
  })
})
