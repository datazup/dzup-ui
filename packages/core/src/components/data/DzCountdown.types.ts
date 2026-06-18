/**
 * DzCountdown — type definitions.
 *
 * A live countdown / elapsed timer that ticks towards a deadline (`mode: 'to'`)
 * or down across a span (`mode: 'duration'`). It standardises drift-free
 * ticking, token formatting, a single `finish` at zero, and pause/resume so
 * sales timers, token-expiry warnings, scheduled-run ETAs, and OTP resend
 * windows don't each re-implement `setInterval` logic.
 *
 * @module @dzup-ui/core/components/data/DzCountdown
 */

import type { BaseAccessibilityProps, CanonicalSize, CanonicalTone } from '@dzup-ui/contracts'
import type { CountdownMode, CountdownRemaining } from '../../composables/useCountdown/index.ts'

export type { CountdownMode, CountdownRemaining }

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzCountdown component */
export interface DzCountdownProps extends BaseAccessibilityProps {
  /**
   * The target. For `mode: 'to'` — a `Date` or epoch-ms timestamp to count down
   * to. For `mode: 'duration'` — the span length in milliseconds.
   */
  target: Date | number
  /** Count down to a fixed time (`'to'`) or across a span (`'duration'`) */
  mode?: CountdownMode
  /**
   * Token format string. Tokens: `D` days, `H` hours, `m` minutes, `s` seconds,
   * `S` milliseconds (repeat for zero-padding). The largest present unit absorbs
   * overflow. Defaults to `'HH:mm:ss'`.
   */
  format?: string
  /** Tick granularity in ms — use `<1000` (e.g. `100`) to animate `S` (default `1000`) */
  interval?: number
  /** Start ticking automatically on mount (default `true`) */
  autoStart?: boolean
  /** Pause while the document is hidden and resume on visibility (default `false`) */
  pauseOnHidden?: boolean
  /** Value typographic scale */
  size?: CanonicalSize
  /** Value colour tone */
  tone?: CanonicalTone
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzCountdown */
export interface DzCountdownEmits {
  /** Fired on every tick with the current remaining breakdown */
  change: [remaining: CountdownRemaining]
  /** Fired exactly once when the timer reaches zero */
  finish: []
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Props passed to the default/value slot */
export interface DzCountdownSlotProps {
  /** The structured remaining time for custom rendering */
  remaining: CountdownRemaining
  /** The remaining time formatted against the `format` prop */
  formatted: string
}

/** Slot definitions for DzCountdown */
export interface DzCountdownSlots {
  /** Custom value rendering; receives the structured + formatted remaining time */
  default?: (props: DzCountdownSlotProps) => unknown
}

// ---------------------------------------------------------------------------
// Expose
// ---------------------------------------------------------------------------

/** Imperative methods exposed via template ref */
export interface DzCountdownExpose {
  /** Start (or resume) the timer */
  start: () => void
  /** Pause the timer, freezing the current value */
  pause: () => void
  /** Reset to the initial remaining time */
  reset: () => void
}
