/**
 * DzRelativeTime — Unit / behavior tests (fake timers, fixed "now").
 */
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import DzRelativeTime from './DzRelativeTime.vue'

/** Fixed reference instant: 2026-06-14T15:00:00.000Z. */
const NOW = new Date('2026-06-14T15:00:00.000Z')
const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(NOW)
})

afterEach(() => {
  vi.useRealTimers()
})

function mountTime(props: Record<string, unknown> = {}) {
  return mount(DzRelativeTime, {
    props: { value: NOW.getTime(), tooltip: false, locale: 'en-US', ...props },
  })
}

/**
 * Advance the (faked) wall clock and fire any due timers, then flush Vue
 * updates. `vi.useFakeTimers()` mocks `Date` too, so advancing timers also
 * moves `Date.now()` forward — no separate `setSystemTime` needed.
 */
async function advance(ms: number): Promise<void> {
  await vi.advanceTimersByTimeAsync(ms)
  await nextTick()
}

describe('dzRelativeTime — formatting', () => {
  it('renders the largest sensible unit for the past', () => {
    expect(mountTime({ value: NOW.getTime() - 2 * MINUTE }).text()).toContain('2 minutes ago')
    expect(mountTime({ value: NOW.getTime() - 3 * HOUR }).text()).toContain('3 hours ago')
    expect(mountTime({ value: NOW.getTime() - 2 * DAY }).text()).toContain('2 days ago')
  })

  it('renders future values with the "in …" framing', () => {
    expect(mountTime({ value: NOW.getTime() + 5 * MINUTE }).text()).toContain('in 5 minutes')
  })

  it('reads near-zero values naturally', () => {
    expect(mountTime({ value: NOW.getTime() }).text()).toContain('now')
    expect(mountTime({ value: NOW.getTime() - 1 * DAY }).text()).toContain('yesterday')
  })

  it('respects a locale override', () => {
    const wrapper = mountTime({ value: NOW.getTime() - 2 * MINUTE, locale: 'fr-FR' })
    expect(wrapper.text()).toContain('il y a 2 minutes')
  })
})

describe('dzRelativeTime — live updates', () => {
  it('re-renders as the value ages (second cadence under a minute)', async () => {
    const wrapper = mountTime({ value: NOW.getTime() - 5 * SECOND })
    expect(wrapper.text()).toContain('5 seconds ago')

    await advance(55 * SECOND)
    expect(wrapper.text()).toContain('1 minute ago')
  })

  it('honours a fixed updateInterval override', async () => {
    const wrapper = mountTime({ value: NOW.getTime() - 5 * SECOND, updateInterval: 10 * SECOND })
    expect(wrapper.text()).toContain('5 seconds ago')

    await advance(20 * SECOND)
    expect(wrapper.text()).toContain('25 seconds ago')
  })

  it('does not auto-update when updateInterval is null', async () => {
    const wrapper = mountTime({ value: NOW.getTime() - 5 * SECOND, updateInterval: null })
    expect(wrapper.text()).toContain('5 seconds ago')

    await advance(2 * MINUTE)
    // Frozen — still shows the originally-rendered value.
    expect(wrapper.text()).toContain('5 seconds ago')
  })
})

describe('dzRelativeTime — modes & accessibility', () => {
  it('renders an absolute date in absolute mode', () => {
    const wrapper = mountTime({ value: new Date('2026-06-14T12:00:00.000Z'), mode: 'absolute' })
    expect(wrapper.text()).toContain('2026')
    expect(wrapper.text()).not.toContain('ago')
  })

  it('defaults the accessible name to the absolute date in relative mode', () => {
    const wrapper = mountTime({ value: NOW.getTime() - 2 * MINUTE })
    const label = wrapper.find('time').attributes('aria-label')
    expect(label).toBeTruthy()
    expect(label).toContain('2026')
  })

  it('does not override aria-label in absolute mode', () => {
    const wrapper = mountTime({ value: NOW.getTime(), mode: 'absolute' })
    expect(wrapper.find('time').attributes('aria-label')).toBeUndefined()
  })

  it('sets the datetime attribute to the ISO value', () => {
    const value = new Date('2026-06-14T14:58:00.000Z')
    const wrapper = mountTime({ value })
    expect(wrapper.find('time').attributes('datetime')).toBe(value.toISOString())
  })

  it('exposes formatted strings to the default slot', () => {
    const wrapper = mount(DzRelativeTime, {
      props: { value: NOW.getTime() - 2 * MINUTE, tooltip: false, locale: 'en-US' },
      slots: {
        default: `<template #default="{ relative, datetime }">
          <span class="custom">{{ relative }} @ {{ datetime }}</span>
        </template>`,
      },
    })
    expect(wrapper.find('.custom').text()).toContain('2 minutes ago')
  })
})

describe('dzRelativeTime — lifecycle', () => {
  it('clears its timer on unmount (no further ticks)', async () => {
    const clearSpy = vi.spyOn(globalThis, 'clearTimeout')
    const wrapper = mountTime({ value: NOW.getTime() - 5 * SECOND })
    wrapper.unmount()
    expect(clearSpy).toHaveBeenCalled()
    clearSpy.mockRestore()
  })

  it('reschedules to a faster cadence when the value changes to "just now"', async () => {
    const wrapper = mountTime({ value: NOW.getTime() - 3 * DAY })
    expect(wrapper.text()).toContain('3 days ago')

    // Swap to a fresh value — should begin ticking every second again.
    await wrapper.setProps({ value: Date.now() - 1 * SECOND })
    expect(wrapper.text()).toContain('1 second ago')

    await advance(2 * SECOND)
    expect(wrapper.text()).toContain('3 seconds ago')
  })
})
