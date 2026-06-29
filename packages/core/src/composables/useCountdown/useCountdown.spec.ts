import type { CountdownMode, UseCountdownReturn } from './useCountdown.ts'
import { mount } from '@vue/test-utils'
/**
 * useCountdown — Unit tests (pure helpers + fake-timer engine).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import {
  formatRemaining,
  toRemainingParts,
  useCountdown,
} from './useCountdown.ts'

/** Fixed reference instant: 2026-06-14T15:00:00.000Z. */
const NOW = new Date('2026-06-14T15:00:00.000Z')

// ---------------------------------------------------------------------------
// Pure helpers — no timers involved
// ---------------------------------------------------------------------------

describe('toRemainingParts', () => {
  it('breaks a total into calendar parts', () => {
    const ms = ((((1 * 24) + 2) * 60 + 3) * 60 + 4) * 1000 + 5 // 1d 2h 3m 4s 5ms
    expect(toRemainingParts(ms)).toEqual({
      days: 1,
      hours: 2,
      minutes: 3,
      seconds: 4,
      ms: 5,
      total: ms,
    })
  })

  it('clamps negative input to zero', () => {
    expect(toRemainingParts(-5000)).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      ms: 0,
      total: 0,
    })
  })
})

describe('formatRemaining', () => {
  it('renders the default HH:mm:ss with zero-padding', () => {
    expect(formatRemaining(3_661_000, 'HH:mm:ss')).toBe('01:01:01')
  })

  it('lets the largest present unit absorb overflow', () => {
    // 25 hours has no day field in the format → hours is uncapped.
    expect(formatRemaining(25 * 3_600_000, 'HH:mm:ss')).toBe('25:00:00')
    // 90 seconds with only seconds present.
    expect(formatRemaining(90_000, 'ss')).toBe('90')
  })

  it('rolls into the day field when D is present', () => {
    expect(formatRemaining(25 * 3_600_000, 'D[d] HH:mm:ss')).toBe('1[d] 01:00:00')
  })

  it('formats milliseconds with the requested digit count', () => {
    expect(formatRemaining(1_234, 'ss.SSS')).toBe('01.234')
    expect(formatRemaining(1_234, 's.SS')).toBe('1.23')
  })

  it('clamps negatives to a zero render', () => {
    expect(formatRemaining(-1, 'mm:ss')).toBe('00:00')
  })

  it('passes through non-letter separators', () => {
    expect(formatRemaining(3_661_000, 'HH-mm-ss')).toBe('01-01-01')
    expect(formatRemaining(61_000, 'mm:ss')).toBe('01:01')
  })
})

// ---------------------------------------------------------------------------
// Composable engine — fake timers
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(NOW)
})

afterEach(() => {
  vi.useRealTimers()
})

/** Mount a throwaway host that exposes the composable's return value. */
function mountCountdown(options: {
  mode?: CountdownMode
  target: Date | number
  interval?: number
  autoStart?: boolean
  pauseOnHidden?: boolean
  onTick?: (...args: unknown[]) => void
  onFinish?: () => void
}) {
  let api!: UseCountdownReturn
  const Host = defineComponent({
    setup() {
      api = useCountdown({
        mode: options.mode ?? 'to',
        target: options.target,
        interval: options.interval,
        autoStart: options.autoStart,
        pauseOnHidden: options.pauseOnHidden,
        onTick: options.onTick,
        onFinish: options.onFinish,
      })
      return () => h('div')
    },
  })
  const wrapper = mount(Host)
  return { wrapper, api: () => api }
}

describe('useCountdown', () => {
  it('counts down to a target and ticks once per second', () => {
    const { api } = mountCountdown({ target: NOW.getTime() + 3000 })
    expect(api().remaining.value.total).toBe(3000)
    vi.advanceTimersByTime(1000)
    expect(api().remaining.value.total).toBe(2000)
    vi.advanceTimersByTime(1000)
    expect(api().remaining.value.total).toBe(1000)
  })

  it('stops at zero without going negative and fires finish once', () => {
    const onFinish = vi.fn()
    const { api } = mountCountdown({ target: NOW.getTime() + 2000, onFinish })
    vi.advanceTimersByTime(5000)
    expect(api().remaining.value.total).toBe(0)
    expect(api().finished.value).toBe(true)
    expect(onFinish).toHaveBeenCalledTimes(1)
    // Further time passes — still no negative, still a single finish.
    vi.advanceTimersByTime(5000)
    expect(api().remaining.value.total).toBe(0)
    expect(onFinish).toHaveBeenCalledTimes(1)
  })

  it('emits change on each tick', () => {
    const onTick = vi.fn()
    mountCountdown({ target: NOW.getTime() + 3000, onTick })
    vi.advanceTimersByTime(3000)
    expect(onTick).toHaveBeenCalledTimes(3)
  })

  it('does not start when autoStart is false', () => {
    // Duration mode so the resting remainder is independent of the wall clock.
    const { api } = mountCountdown({ mode: 'duration', target: 5000, autoStart: false })
    expect(api().running.value).toBe(false)
    vi.advanceTimersByTime(2000)
    expect(api().remaining.value.total).toBe(5000)
    api().start()
    vi.advanceTimersByTime(1000)
    expect(api().remaining.value.total).toBe(4000)
  })

  it('pauses and resumes a duration timer without leaking elapsed time', () => {
    const { api } = mountCountdown({ mode: 'duration', target: 10_000 })
    vi.advanceTimersByTime(3000)
    expect(api().remaining.value.total).toBe(7000)
    api().pause()
    // Real time passes while paused — the remainder must stay frozen.
    vi.advanceTimersByTime(5000)
    expect(api().remaining.value.total).toBe(7000)
    api().start()
    vi.advanceTimersByTime(2000)
    expect(api().remaining.value.total).toBe(5000)
  })

  it('resets to the initial remaining and resumes if it was running', () => {
    const { api } = mountCountdown({ mode: 'duration', target: 10_000 })
    vi.advanceTimersByTime(4000)
    expect(api().remaining.value.total).toBe(6000)
    api().reset()
    expect(api().remaining.value.total).toBe(10_000)
    // Was running → reset auto-resumes.
    vi.advanceTimersByTime(1000)
    expect(api().remaining.value.total).toBe(9000)
  })

  it('supports sub-second intervals for ms display', () => {
    const onTick = vi.fn()
    const { api } = mountCountdown({ target: NOW.getTime() + 1000, interval: 100, onTick })
    vi.advanceTimersByTime(300)
    expect(api().remaining.value.total).toBe(700)
    expect(onTick).toHaveBeenCalledTimes(3)
  })

  it('finishes immediately for a target already in the past', () => {
    const onFinish = vi.fn()
    const { api } = mountCountdown({ target: NOW.getTime() - 1000, onFinish })
    expect(api().remaining.value.total).toBe(0)
    expect(api().finished.value).toBe(true)
    expect(onFinish).toHaveBeenCalledTimes(1)
  })

  it('cleans up the timer on unmount', () => {
    const onTick = vi.fn()
    const { wrapper } = mountCountdown({ target: NOW.getTime() + 5000, onTick })
    vi.advanceTimersByTime(1000)
    expect(onTick).toHaveBeenCalledTimes(1)
    wrapper.unmount()
    vi.advanceTimersByTime(3000)
    // No further ticks after unmount.
    expect(onTick).toHaveBeenCalledTimes(1)
  })
})
