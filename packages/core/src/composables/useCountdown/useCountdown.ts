/**
 * useCountdown — a drift-corrected countdown / elapsed-to-deadline engine.
 *
 * Owns the fiddly parts of a live timer so each consumer doesn't re-implement
 * them: a self-correcting tick (immune to `setTimeout` drift), a single
 * `finish` at zero (never negative), pause/resume, optional pause-while-hidden,
 * and SSR-safe lifecycle handling.
 *
 * Two modes:
 * - `'to'`   — count down to a fixed wall-clock target. The deadline is the
 *   target itself, so resuming (or un-hiding the tab) re-reads the real clock
 *   and the value self-corrects to the true remaining time.
 * - `'duration'` — count down a span. The deadline floats: pausing freezes the
 *   remainder and resuming anchors a fresh deadline `now + remainder`, so paused
 *   time does not "leak".
 *
 * The pure helpers ({@link toRemainingParts}, {@link formatRemaining}) are
 * exported for direct, timer-free unit testing.
 *
 * @module @dzup-ui/core/composables/useCountdown
 */

import type { MaybeRefOrGetter, Ref } from 'vue'
import { onBeforeUnmount, onMounted, ref, toValue, watch } from 'vue'

/** Whether the timer counts down to a fixed time or across a fixed span */
export type CountdownMode = 'to' | 'duration'

/** Structured breakdown of the remaining time */
export interface CountdownRemaining {
  /** Whole days remaining */
  days: number
  /** Hours within the current day (0–23) */
  hours: number
  /** Minutes within the current hour (0–59) */
  minutes: number
  /** Seconds within the current minute (0–59) */
  seconds: number
  /** Milliseconds within the current second (0–999) */
  ms: number
  /** Total remaining time in milliseconds */
  total: number
}

const MS_PER_SECOND = 1000
const MS_PER_MINUTE = 60_000
const MS_PER_HOUR = 3_600_000
const MS_PER_DAY = 86_400_000

/**
 * Break a remaining-millisecond total into its calendar parts.
 *
 * Negative inputs are clamped to zero so a finished timer never reports
 * negative parts.
 *
 * @param totalMs - Remaining time in milliseconds
 * @returns The `{ days, hours, minutes, seconds, ms, total }` breakdown
 */
export function toRemainingParts(totalMs: number): CountdownRemaining {
  const total = Math.max(0, Math.floor(totalMs))
  return {
    days: Math.floor(total / MS_PER_DAY),
    hours: Math.floor(total / MS_PER_HOUR) % 24,
    minutes: Math.floor(total / MS_PER_MINUTE) % 60,
    seconds: Math.floor(total / MS_PER_SECOND) % 60,
    ms: total % MS_PER_SECOND,
    total,
  }
}

/**
 * Render a remaining-millisecond total against a token format string.
 *
 * Supported tokens (repeat for zero-padding, e.g. `HH`, `mm`):
 * - `D` — days
 * - `H` — hours
 * - `m` — minutes
 * - `s` — seconds
 * - `S` — milliseconds (`S`/`SS`/`SSS` = leading 1/2/3 digits)
 *
 * The largest unit present in the format absorbs all overflow, so `HH:mm:ss`
 * with 25 hours renders `25:00:00` rather than rolling into an absent day
 * field. Any other characters (`:`, `.`, spaces, literals) pass through.
 *
 * @param totalMs - Remaining time in milliseconds (clamped at zero)
 * @param format - Token format string, e.g. `'HH:mm:ss'`
 * @returns The formatted string
 */
export function formatRemaining(totalMs: number, format: string): string {
  const total = Math.max(0, Math.floor(totalMs))
  const ms = total % MS_PER_SECOND

  const hasDays = format.includes('D')
  const hasHours = format.includes('H')
  const hasMinutes = format.includes('m')

  // The largest present unit is uncapped; smaller present units wrap modularly.
  const days = Math.floor(total / MS_PER_DAY)
  const hours = hasDays
    ? Math.floor(total / MS_PER_HOUR) % 24
    : Math.floor(total / MS_PER_HOUR)
  const minutes = hasDays || hasHours
    ? Math.floor(total / MS_PER_MINUTE) % 60
    : Math.floor(total / MS_PER_MINUTE)
  const seconds = hasDays || hasHours || hasMinutes
    ? Math.floor(total / MS_PER_SECOND) % 60
    : Math.floor(total / MS_PER_SECOND)

  const values: Record<string, number> = { D: days, H: hours, m: minutes, s: seconds }

  return format.replace(/D+|H+|m+|s+|S+/g, (token) => {
    const key = token.charAt(0)
    if (key === 'S')
      return String(ms).padStart(3, '0').slice(0, token.length)
    return String(values[key]).padStart(token.length, '0')
  })
}

/** Options for the useCountdown composable */
export interface UseCountdownOptions {
  /** Count down to a fixed time (`'to'`) or across a span (`'duration'`) */
  mode: MaybeRefOrGetter<CountdownMode>
  /**
   * The target. For `'to'`: a `Date` or epoch-ms timestamp. For `'duration'`:
   * the span length in milliseconds.
   */
  target: MaybeRefOrGetter<Date | number>
  /** Tick granularity in ms (default `1000`) */
  interval?: MaybeRefOrGetter<number>
  /** Start ticking automatically on mount (default `true`) */
  autoStart?: boolean
  /** Pause while the document is hidden and resume on visibility (default `false`) */
  pauseOnHidden?: MaybeRefOrGetter<boolean>
  /** Injectable clock for testing (default `Date.now`) */
  now?: () => number
  /** Called on every tick with the current remaining breakdown */
  onTick?: (remaining: CountdownRemaining) => void
  /** Called exactly once when the timer reaches zero */
  onFinish?: () => void
}

/** Return value of the useCountdown composable */
export interface UseCountdownReturn {
  /** Reactive remaining breakdown */
  remaining: Ref<CountdownRemaining>
  /** Whether the timer is actively ticking */
  running: Ref<boolean>
  /** Whether the timer has reached zero */
  finished: Ref<boolean>
  /** Start (or resume) ticking */
  start: () => void
  /** Pause ticking, freezing the current remainder */
  pause: () => void
  /** Reset to the initial remaining time (and auto-start if it was running) */
  reset: () => void
}

/**
 * Drive a live, drift-corrected countdown.
 *
 * @param options - Mode, target, and tick configuration
 * @returns Reactive remaining/state plus `start` / `pause` / `reset` controls
 */
export function useCountdown(options: UseCountdownOptions): UseCountdownReturn {
  const { autoStart = true, now = () => Date.now(), onTick, onFinish } = options

  const targetMs = (): number => {
    const v = toValue(options.target)
    return v instanceof Date ? v.getTime() : v
  }
  const step = (): number => Math.max(1, Math.floor(toValue(options.interval ?? 1000)))

  /** Remaining at rest: distance to the target (`'to'`) or the span (`'duration'`). */
  const initialRemaining = (): number =>
    toValue(options.mode) === 'to'
      ? Math.max(0, targetMs() - now())
      : Math.max(0, targetMs())

  const remaining = ref<CountdownRemaining>(toRemainingParts(initialRemaining()))
  const running = ref(false)
  const finished = ref(false)

  /** Wall-clock instant the timer hits zero; recomputed each (re)start. */
  let deadline = 0
  let timer: ReturnType<typeof setTimeout> | null = null
  /** Self-correction anchor: the wall-clock time the next tick is *due*. */
  let expected = 0
  /** Set when the visibility handler paused us, so we know to auto-resume. */
  let pausedByHidden = false

  function clearTimer(): void {
    if (timer !== null) {
      clearTimeout(timer)
      timer = null
    }
  }

  function settle(): void {
    clearTimer()
    running.value = false
    remaining.value = toRemainingParts(0)
    if (!finished.value) {
      finished.value = true
      onFinish?.()
    }
  }

  function tick(): void {
    const left = Math.max(0, deadline - now())
    remaining.value = toRemainingParts(left)
    onTick?.(remaining.value)
    if (left <= 0) {
      settle()
      return
    }
    // Self-correct: schedule against the absolute due time, not "now + step",
    // so accumulated scheduling lag cannot drift the displayed value.
    expected += step()
    timer = setTimeout(tick, Math.max(0, expected - now()))
  }

  function start(): void {
    if (running.value || finished.value)
      return
    // 'to' re-anchors to the real target (self-correcting after a pause/hide);
    // 'duration' anchors a fresh deadline from the frozen remainder.
    deadline = toValue(options.mode) === 'to'
      ? targetMs()
      : now() + remaining.value.total
    if (deadline - now() <= 0) {
      settle()
      return
    }
    running.value = true
    expected = now() + step()
    clearTimer()
    timer = setTimeout(tick, step())
  }

  function pause(): void {
    if (!running.value)
      return
    clearTimer()
    // Freeze the live remainder so 'duration' resume picks up exactly here.
    remaining.value = toRemainingParts(Math.max(0, deadline - now()))
    running.value = false
  }

  function reset(): void {
    const wasRunning = running.value
    clearTimer()
    running.value = false
    finished.value = false
    pausedByHidden = false
    remaining.value = toRemainingParts(initialRemaining())
    // Only resume automatically if the timer was running before the reset.
    if (wasRunning)
      start()
  }

  function handleVisibility(): void {
    if (document.hidden) {
      if (running.value) {
        pausedByHidden = true
        pause()
      }
    }
    else if (pausedByHidden) {
      pausedByHidden = false
      start()
    }
  }

  const visibilityEnabled = (): boolean => Boolean(toValue(options.pauseOnHidden))

  // Re-anchor when the target/mode changes while idle so the displayed resting
  // value stays correct (e.g. a deadline prop updated before start).
  watch(
    () => [toValue(options.mode), targetMs()] as const,
    () => {
      if (!running.value && !finished.value)
        remaining.value = toRemainingParts(initialRemaining())
    },
  )

  onMounted(() => {
    if (visibilityEnabled() && typeof document !== 'undefined')
      document.addEventListener('visibilitychange', handleVisibility)
    if (autoStart)
      start()
  })

  onBeforeUnmount(() => {
    clearTimer()
    if (typeof document !== 'undefined')
      document.removeEventListener('visibilitychange', handleVisibility)
  })

  return { remaining, running, finished, start, pause, reset }
}
