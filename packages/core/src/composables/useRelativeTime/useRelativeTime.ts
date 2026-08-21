/**
 * useRelativeTime — Self-updating relative timestamp logic.
 *
 * Wraps the platform `Intl.RelativeTimeFormat` to render a value (Date, epoch
 * ms, or ISO string) as a human phrase like "2 minutes ago" / "in 3 hours",
 * and keeps it fresh with an adaptive timer: the closer the value is to "now",
 * the more often it re-renders (every second under a minute, every minute under
 * an hour, every hour under a day) — then it stops, since a "3 days ago" label
 * does not change within an hour.
 *
 * The formatting itself is a pure function (`formatRelativeTime`) that takes an
 * explicit `now`, so it can be unit-tested without timers. The composable layers
 * a reactive `now` and lifecycle-managed scheduling on top.
 *
 * Client-only: the timer is created on mount and is a no-op during SSR. The
 * initial render is deterministic (computed against the value's own clock), so
 * server and client markup agree before hydration.
 *
 * @module @dzup-ui/core/composables/useRelativeTime
 */

import type { ComputedRef, MaybeRefOrGetter, Ref } from 'vue'
import { computed, onBeforeUnmount, onMounted, ref, toValue, watch } from 'vue'
import { cachedDateTimeFormat, cachedRelativeTimeFormat } from '../../i18n/intl-cache.ts'
import { useDzLocale } from '../provider/useDzLocale.ts'

/** Accepted timestamp inputs: a Date, epoch milliseconds, or an ISO string. */
export type RelativeTimeValue = Date | number | string

/** Display mode — a live relative phrase or a static absolute date. */
export type RelativeTimeMode = 'relative' | 'absolute'

/** Locale(s) forwarded to the Intl formatters (defaults to the runtime locale). */
export type RelativeTimeLocale = string | string[] | undefined

/** One unit boundary used to pick the largest sensible Intl unit. */
interface Division {
  /** How many of this unit make up the next-larger one. */
  readonly amount: number
  /** The Intl.RelativeTimeFormat unit this boundary represents. */
  readonly unit: Intl.RelativeTimeFormatUnit
}

/** Largest-unit selection ladder, smallest → largest. */
const DIVISIONS: readonly Division[] = [
  { amount: 60, unit: 'second' },
  { amount: 60, unit: 'minute' },
  { amount: 24, unit: 'hour' },
  { amount: 7, unit: 'day' },
  { amount: 4.34524, unit: 'week' },
  { amount: 12, unit: 'month' },
  { amount: Number.POSITIVE_INFINITY, unit: 'year' },
]

const SECOND_MS = 1000
const MINUTE_MS = 60 * SECOND_MS
const HOUR_MS = 60 * MINUTE_MS
const DAY_MS = 24 * HOUR_MS

/** Normalise any accepted input to a Date. */
export function toDate(value: RelativeTimeValue): Date {
  return value instanceof Date ? value : new Date(value)
}

/**
 * Format `value` relative to `now` as a localised phrase.
 *
 * Pure and timer-free: pass an explicit `now` (epoch ms or Date) so the result
 * is fully deterministic and unit-testable. Picks the largest unit whose
 * magnitude is below 1 (e.g. 90 seconds → "2 minutes ago") and uses
 * `numeric: 'auto'` so near-zero values read naturally ("now", "yesterday").
 *
 * @param value - The timestamp to describe
 * @param now - The reference instant to measure against
 * @param locale - Optional locale override
 * @returns A localised relative-time string
 */
export function formatRelativeTime(
  value: RelativeTimeValue,
  now: RelativeTimeValue,
  locale?: RelativeTimeLocale,
): string {
  const target = toDate(value).getTime()
  const reference = toDate(now).getTime()
  if (Number.isNaN(target))
    return ''

  // Cached (TASK-OSS-P4-03). `locale` keeps its documented meaning — omitted
  // still means the runtime's own locale — because this is a public pure
  // function and changing what `undefined` resolves to would be a breaking
  // change for anyone calling it directly. The composable below is where the
  // provider locale enters.
  const rtf = cachedRelativeTimeFormat(locale, { numeric: 'auto' })
  // Signed seconds: negative = in the past, positive = in the future.
  let duration = (target - reference) / SECOND_MS

  for (const division of DIVISIONS) {
    if (Math.abs(duration) < division.amount)
      return rtf.format(Math.round(duration), division.unit)
    duration /= division.amount
  }
  // Unreachable (the last division is Infinity) but keeps the type checker happy.
  return rtf.format(Math.round(duration), 'year')
}

/**
 * Format `value` as a full absolute date — used for the tooltip / a11y label.
 *
 * @param value - The timestamp to describe
 * @param locale - Optional locale override
 * @returns A localised absolute date-time string (empty for invalid input)
 */
export function formatAbsoluteTime(
  value: RelativeTimeValue,
  locale?: RelativeTimeLocale,
): string {
  const date = toDate(value)
  if (Number.isNaN(date.getTime()))
    return ''
  return cachedDateTimeFormat(locale, {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(date)
}

/**
 * Pick the refresh interval (ms) appropriate for a value's current age, or
 * `null` once the displayed phrase can no longer change within the hour.
 *
 * @param value - The timestamp being displayed
 * @param now - The reference instant
 * @returns Milliseconds until the next meaningful re-render, or `null` to stop
 */
export function resolveUpdateInterval(
  value: RelativeTimeValue,
  now: RelativeTimeValue,
): number | null {
  const target = toDate(value).getTime()
  if (Number.isNaN(target))
    return null
  const age = Math.abs(toDate(now).getTime() - target)
  if (age < MINUTE_MS)
    return SECOND_MS
  if (age < HOUR_MS)
    return MINUTE_MS
  if (age < DAY_MS)
    return HOUR_MS
  // Day-or-older labels change at most once a day — stop ticking.
  return null
}

/** Options for the {@link useRelativeTime} composable. */
export interface UseRelativeTimeOptions {
  /** The timestamp to render (Date, epoch ms, or ISO string) */
  value: MaybeRefOrGetter<RelativeTimeValue>
  /** Display mode — `'relative'` (live) or `'absolute'` (static) */
  mode?: MaybeRefOrGetter<RelativeTimeMode>
  /**
   * Locale override.
   *
   * Defaults to the application's `DzProvider` locale, and to `en-US` when no
   * provider declares one (ADR-20). It used to default to the *runtime* locale,
   * which is not the same value on a Node server as in the visitor's browser —
   * so a server-rendered "2 minutes ago" and its hydrated replacement could be
   * in different languages.
   */
  locale?: MaybeRefOrGetter<RelativeTimeLocale>
  /**
   * Fixed refresh interval in ms. Omit (or pass `undefined`) to derive the
   * cadence from the value's age; pass `null` to disable auto-updates.
   */
  updateInterval?: MaybeRefOrGetter<number | null | undefined>
}

/** Reactive output of {@link useRelativeTime}. */
export interface UseRelativeTimeReturn {
  /** The live relative phrase, e.g. "2 minutes ago" */
  relative: ComputedRef<string>
  /** The full absolute date, e.g. "Saturday, 14 June 2026 at 15:00" */
  absolute: ComputedRef<string>
  /** ISO 8601 string for the `<time datetime>` attribute (empty if invalid) */
  datetime: ComputedRef<string>
  /** The string to render, honouring `mode` */
  display: ComputedRef<string>
  /** The reactive reference instant (epoch ms); ticks as time passes */
  now: Ref<number>
}

/**
 * Reactive, self-updating relative-time formatter.
 *
 * @param options - The value plus reactive mode / locale / interval overrides
 * @returns Computed relative, absolute, datetime, and display strings
 */
export function useRelativeTime(options: UseRelativeTimeOptions): UseRelativeTimeReturn {
  const { value, mode, locale, updateInterval } = options

  // The provider locale, used when the caller states none. This is the one
  // behavioural change TASK-OSS-P4-03 makes to this composable, and it is the
  // point of it: an application sets its locale once and every relative time
  // follows, deterministically on both sides of hydration.
  const dzLocale = useDzLocale()
  const activeLocale = (): RelativeTimeLocale => toValue(locale) ?? dzLocale.value

  // Seed `now` from the wall clock at setup so the first render already reads
  // correctly (server and client clocks agree closely enough); the mounted
  // timer then keeps it fresh.
  const now = ref<number>(Date.now())

  const datetime = computed(() => {
    const date = toDate(toValue(value))
    return Number.isNaN(date.getTime()) ? '' : date.toISOString()
  })

  const relative = computed(() =>
    formatRelativeTime(toValue(value), now.value, activeLocale()),
  )

  const absolute = computed(() =>
    formatAbsoluteTime(toValue(value), activeLocale()),
  )

  const display = computed(() =>
    toValue(mode) === 'absolute' ? absolute.value : relative.value,
  )

  let timer: ReturnType<typeof setTimeout> | null = null

  function clear(): void {
    if (timer !== null) {
      clearTimeout(timer)
      timer = null
    }
  }

  /** Recompute the cadence and schedule the next tick (recursive setTimeout). */
  function schedule(): void {
    clear()
    if (typeof window === 'undefined')
      return

    const override = toValue(updateInterval)
    // `null` disables updates; a positive number is used verbatim; otherwise
    // the cadence is derived from the value's current age.
    const interval = override === null
      ? null
      : typeof override === 'number'
        ? override
        : resolveUpdateInterval(toValue(value), Date.now())

    if (interval === null || interval <= 0)
      return

    timer = setTimeout(() => {
      now.value = Date.now()
      schedule()
    }, interval)
  }

  onMounted(() => {
    now.value = Date.now()
    schedule()
  })
  onBeforeUnmount(clear)

  // A new value (or interval/mode change) can shorten the appropriate cadence —
  // reschedule so a freshly-set "just now" starts ticking every second again.
  watch(
    () => [toValue(value), toValue(updateInterval), toValue(mode)],
    () => schedule(),
  )

  return { relative, absolute, datetime, display, now }
}
