/**
 * useRelativeTime — Unit tests (pure formatters + reactive composable).
 */
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import {
  formatAbsoluteTime,
  formatRelativeTime,
  resolveUpdateInterval,
  toDate,
  useRelativeTime,
} from './useRelativeTime.ts'

const NOW = new Date('2026-06-14T15:00:00.000Z')
const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

describe('toDate', () => {
  it('passes Date instances through', () => {
    const d = new Date(NOW)
    expect(toDate(d)).toBe(d)
  })

  it('parses epoch ms and ISO strings', () => {
    expect(toDate(NOW.getTime()).getTime()).toBe(NOW.getTime())
    expect(toDate(NOW.toISOString()).getTime()).toBe(NOW.getTime())
  })
})

describe('formatRelativeTime (pure)', () => {
  it('selects the largest sensible unit', () => {
    expect(formatRelativeTime(NOW.getTime() - 30 * SECOND, NOW, 'en-US')).toContain('30 seconds ago')
    expect(formatRelativeTime(NOW.getTime() - 150 * SECOND, NOW, 'en-US')).toContain('2 minutes ago')
    expect(formatRelativeTime(NOW.getTime() - 5 * HOUR, NOW, 'en-US')).toContain('5 hours ago')
    expect(formatRelativeTime(NOW.getTime() - 3 * DAY, NOW, 'en-US')).toContain('3 days ago')
    expect(formatRelativeTime(NOW.getTime() - 60 * DAY, NOW, 'en-US')).toContain('2 months ago')
    expect(formatRelativeTime(NOW.getTime() - 800 * DAY, NOW, 'en-US')).toContain('2 years ago')
  })

  it('handles future instants', () => {
    expect(formatRelativeTime(NOW.getTime() + 3 * HOUR, NOW, 'en-US')).toContain('in 3 hours')
  })

  it('localises the output', () => {
    expect(formatRelativeTime(NOW.getTime() - 2 * MINUTE, NOW, 'fr-FR')).toContain('il y a 2 minutes')
  })

  it('returns an empty string for invalid input', () => {
    expect(formatRelativeTime('not-a-date', NOW)).toBe('')
  })
})

describe('formatAbsoluteTime (pure)', () => {
  it('produces a full localised date-time', () => {
    const out = formatAbsoluteTime(NOW, 'en-US')
    expect(out).toContain('2026')
  })

  it('returns an empty string for invalid input', () => {
    expect(formatAbsoluteTime('nonsense')).toBe('')
  })
})

describe('resolveUpdateInterval (pure)', () => {
  it('derives the cadence from the value age', () => {
    expect(resolveUpdateInterval(NOW.getTime() - 10 * SECOND, NOW)).toBe(SECOND)
    expect(resolveUpdateInterval(NOW.getTime() - 10 * MINUTE, NOW)).toBe(MINUTE)
    expect(resolveUpdateInterval(NOW.getTime() - 5 * HOUR, NOW)).toBe(HOUR)
    expect(resolveUpdateInterval(NOW.getTime() - 5 * DAY, NOW)).toBeNull()
  })

  it('is symmetric for future values', () => {
    expect(resolveUpdateInterval(NOW.getTime() + 10 * SECOND, NOW)).toBe(SECOND)
  })

  it('returns null for invalid input', () => {
    expect(resolveUpdateInterval('bad', NOW)).toBeNull()
  })
})

describe('useRelativeTime (reactive)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  /** Mount a host that exposes the composable output. */
  function mountHost(initial: Record<string, unknown> = {}) {
    const value = ref(initial.value ?? NOW.getTime() - 5 * SECOND)
    const out: Record<string, unknown> = {}
    const Host = defineComponent({
      setup() {
        Object.assign(
          out,
          useRelativeTime({
            value: () => value.value as never,
            locale: () => 'en-US',
            updateInterval: () => initial.updateInterval as never,
          }),
        )
        return () => null
      },
    })
    const wrapper = mount(Host)
    return { wrapper, value, out }
  }

  it('exposes relative, absolute, datetime, and display', () => {
    const { out } = mountHost()
    expect((out.relative as { value: string }).value).toContain('5 seconds ago')
    expect((out.absolute as { value: string }).value).toContain('2026')
    expect((out.datetime as { value: string }).value).toBe(new Date(NOW.getTime() - 5 * SECOND).toISOString())
    expect((out.display as { value: string }).value).toContain('5 seconds ago')
  })

  it('ticks the reactive now as time passes', async () => {
    const { out } = mountHost()
    expect((out.relative as { value: string }).value).toContain('5 seconds ago')

    // Fake timers mock Date too, so advancing them moves Date.now() forward.
    await vi.advanceTimersByTimeAsync(10 * SECOND)
    await nextTick()

    expect((out.relative as { value: string }).value).toContain('15 seconds ago')
  })

  it('disconnects its timer on unmount', () => {
    const clearSpy = vi.spyOn(globalThis, 'clearTimeout')
    const { wrapper } = mountHost()
    wrapper.unmount()
    expect(clearSpy).toHaveBeenCalled()
    clearSpy.mockRestore()
  })
})
