import { mount } from '@vue/test-utils'
/**
 * DzCountdown — Unit / behavior tests (fake timers).
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

describe('dzCountdown', () => {
  it('renders the initial value with the default format', () => {
    const wrapper = mountCountdown({ target: NOW.getTime() + 3_661_000 })
    expect(wrapper.text()).toContain('01:01:01')
  })

  it('respects a custom format token string', () => {
    const wrapper = mountCountdown({ target: NOW.getTime() + 90_000, format: 'mm:ss' })
    expect(wrapper.text()).toContain('01:30')
  })

  it('ticks down over time', async () => {
    const wrapper = mountCountdown({ target: NOW.getTime() + 5000, format: 'ss' })
    expect(wrapper.text()).toContain('05')
    vi.advanceTimersByTime(2000)
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('03')
  })

  it('emits change on each tick with the structured remainder', () => {
    const wrapper = mountCountdown({ target: NOW.getTime() + 3000 })
    vi.advanceTimersByTime(2000)
    const events = wrapper.emitted('change')
    expect(events).toBeTruthy()
    expect(events!.length).toBe(2)
    // Payload is the structured remaining breakdown.
    expect(events![0]![0]).toMatchObject({ total: 2000, seconds: 2 })
  })

  it('emits finish exactly once at zero', () => {
    const wrapper = mountCountdown({ target: NOW.getTime() + 2000 })
    vi.advanceTimersByTime(10_000)
    expect(wrapper.emitted('finish')).toHaveLength(1)
  })

  it('never renders a negative value', async () => {
    const wrapper = mountCountdown({ target: NOW.getTime() + 1000, format: 'mm:ss' })
    vi.advanceTimersByTime(5000)
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('00:00')
    expect(wrapper.text()).not.toContain('-')
  })

  it('does not auto-start when autoStart is false', async () => {
    const wrapper = mountCountdown({ target: NOW.getTime() + 5000, format: 'ss', autoStart: false })
    vi.advanceTimersByTime(3000)
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('05')
  })

  it('pause() freezes and start() resumes via the exposed methods', async () => {
    const wrapper = mountCountdown({ mode: 'duration', target: 10_000, format: 'ss' })
    vi.advanceTimersByTime(3000)
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('07')

    const vm = wrapper.vm as unknown as { pause: () => void, start: () => void }
    vm.pause()
    vi.advanceTimersByTime(4000)
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('07')

    vm.start()
    vi.advanceTimersByTime(2000)
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('05')
  })

  it('reset() restores the initial duration', async () => {
    const wrapper = mountCountdown({ mode: 'duration', target: 10_000, format: 'ss' })
    vi.advanceTimersByTime(4000)
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('06')

    const vm = wrapper.vm as unknown as { reset: () => void }
    vm.reset()
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('10')
  })

  it('marks data-finished once complete', async () => {
    const wrapper = mountCountdown({ target: NOW.getTime() + 1000 })
    vi.advanceTimersByTime(2000)
    await wrapper.vm.$nextTick()
    expect(wrapper.attributes('data-finished')).toBe('')
  })

  it('announces the remaining time politely (humanised, per second)', () => {
    const wrapper = mountCountdown({ target: NOW.getTime() + 65_000 })
    const live = wrapper.find('[aria-live="polite"]')
    expect(live.text()).toContain('1 minute')
    expect(live.text()).toContain('5 seconds')
    expect(live.text()).toContain('remaining')
  })

  it('exposes the structured remainder + formatted value to the default slot', () => {
    const wrapper = mount(DzCountdown, {
      props: { target: NOW.getTime() + 3_661_000, format: 'HH:mm:ss' },
      slots: {
        default: `<template #default="{ remaining, formatted }">
          <span class="parts">{{ remaining.hours }}h {{ remaining.minutes }}m</span>
          <span class="fmt">{{ formatted }}</span>
        </template>`,
      },
    })
    expect(wrapper.find('.parts').text()).toBe('1h 1m')
    expect(wrapper.find('.fmt').text()).toBe('01:01:01')
  })

  it('tears down its timer on unmount without throwing', () => {
    // The composable spec asserts (via spy) that no ticks fire post-unmount;
    // here we just confirm the component unmounts and the timer is released.
    const wrapper = mountCountdown({ target: NOW.getTime() + 5000 })
    vi.advanceTimersByTime(1000)
    expect(() => wrapper.unmount()).not.toThrow()
    expect(() => vi.advanceTimersByTime(10_000)).not.toThrow()
  })
})
