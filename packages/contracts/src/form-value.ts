/**
 * Value codecs for form controls (TASK-FORM-OSS-03, renderer contract C1).
 *
 * A form renderer binds a JSON value to a control and gets one back. Between
 * the two sits a codec, and the questions it has to answer are the same for
 * every control: what does empty look like for this kind of value, is this
 * value empty, is this string a number, is this date in the profile the
 * contract names, and what does a file look like once the binary is gone.
 *
 * Answering them once here means Pro's registry writes one codec per data type
 * instead of one per control — and, more to the point, means the answers are
 * the same ones Core's own controls use, rather than a second opinion that
 * happens to agree today.
 *
 * **Why these live in `@dzup-ui/contracts` and not `@dzup-ui/core`.** Two
 * reasons, and the second is the one that decided it.
 *
 * They belong here on the merits: they define the seam between a Core control
 * and a Pro renderer, they have zero dependencies, and Pro already depends on
 * contracts. This package is types-only *with a stated exception* for
 * `assertNever` — a tiny, pure runtime helper — and these are the same kind of
 * thing for the same kind of reason.
 *
 * And they cannot go in Core. `@dzup-ui/core`'s public surface is generated
 * from `public-api.manifest.json`, and the ownership schema has no `utility`
 * kind: `cn`, `themeScript` and `getThemeScript` are already carried as
 * `unclassified` under a ceiling of 29 that **only ratchets down**. Ten more
 * pure functions of exactly that class would have taken it to 39. Raising it is
 * a maintainer decision, and quietly raising it is what the ratchet exists to
 * prevent — so the ledger asks for that decision instead of taking it.
 *
 * Every function is pure: no Vue, no DOM, no clock, no locale. That is what
 * makes them usable on a server, in a test, and inside a builder preview.
 *
 * @module @dzup-ui/contracts/form-value
 */

import type { DzFileRef } from './async-options.types.js'

/**
 * The kinds of value a form control can hold.
 *
 * Deliberately about the *value*, not the control: `DzSelect` and
 * `DzRadioGroup` are different controls holding the same kind of value, and a
 * codec keyed by control would have two identical entries.
 */
export type FormValueKind
  = | 'string'
    | 'number'
    | 'boolean'
    | 'array'
    | 'object'
    | 'date'
    | 'time'
    | 'file'
    | 'files'

/** A JSON value, which is the only thing a form document can hold. */
export type JsonValue
  = | string
    | number
    | boolean
    | null
    | readonly JsonValue[]
    | { readonly [key: string]: JsonValue }

/**
 * The empty value for a kind.
 *
 * Every Core control emits a *typed* empty rather than `undefined`, so that
 * `toControl` is total and a cleared field does not change type. Whether that
 * empty is written to the document or removes the property is the renderer's
 * decision (form spec 04's `emptyValue(context)`); this only says what the
 * control side of the seam looks like.
 *
 * `number` is the exception and is `undefined` on purpose: spec 04 says an
 * empty number input "removes the property by default rather than producing
 * `NaN`", and `undefined` is what removal looks like on the Vue side.
 * `DzNumberInput` already worked this way, and the clause was written to match
 * it rather than the other way round.
 *
 * **This is not the inverse of {@link isEmptyValue}, and `boolean` is where
 * that shows.** An unchecked box holds `false`, so `false` is what a boolean
 * control starts with — but a box that is unchecked has *answered*, so
 * `isEmptyValue(false)` is `false`. C1.7 is exactly that distinction, and
 * conflating the two is how a mandatory checkbox comes to be satisfied by never
 * being touched.
 */
export function emptyValueFor(kind: FormValueKind): unknown {
  switch (kind) {
    case 'string':
    case 'date':
    case 'time':
      return ''
    case 'number':
      return undefined
    case 'boolean':
      return false
    case 'array':
    case 'files':
      return []
    case 'object':
      return {}
    case 'file':
      return null
  }
}

/**
 * Whether a value is the empty one for its kind.
 *
 * `false` and `0` are **not** empty. This is the distinction that a truthiness
 * check gets wrong every time: an unchecked box and a missing box are different
 * answers to a mandatory question, and so are "zero" and "left blank".
 */
export function isEmptyValue(value: unknown): boolean {
  if (value === undefined || value === null || value === '')
    return true
  if (Array.isArray(value))
    return value.length === 0
  if (typeof value === 'object')
    return Object.keys(value as object).length === 0
  // Reached by `false`, `0`, `NaN`-free numbers and non-empty strings.
  return false
}

/**
 * Parse user input into a number, or `undefined`.
 *
 * Never `NaN`. A `NaN` in a form value serializes to `null` in a way no
 * validator can explain to the user, and it compares unequal to itself, so it
 * defeats the change detection every renderer relies on.
 *
 * Partially typed input — `'-'`, `'1e'`, `'.'` — is display state, not a value,
 * and returns `undefined` rather than a guess.
 */
export function toNumberValue(input: unknown): number | undefined {
  if (typeof input === 'number')
    return Number.isFinite(input) ? input : undefined
  if (typeof input !== 'string')
    return undefined
  const trimmed = input.trim()
  if (trimmed === '')
    return undefined
  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : undefined
}

/** `YYYY-MM-DD` — RFC 3339 `full-date`, which JSON Schema calls `format: date`. */
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/
/** `HH:MM` or `HH:MM:SS` — RFC 3339 `partial-time`. See {@link toIsoTime}. */
const ISO_TIME = /^(\d{2}):(\d{2})(?::(\d{2}))?$/

/**
 * Format a date as `YYYY-MM-DD`, from its parts.
 *
 * Parts rather than a `Date`, because a `Date` is an instant and a calendar
 * date is not: `new Date('2026-08-24')` is midnight UTC, and in any negative
 * offset it formats as the 23rd. Every date bug of this shape starts with a
 * `Date` standing in for a day.
 *
 * Returns `''` for a date that does not exist, which is the empty value for the
 * kind.
 */
export function toIsoDate(parts: { year: number, month: number, day: number }): string {
  const { year, month, day } = parts
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day))
    return ''
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month))
    return ''
  return `${pad(year, 4)}-${pad(month, 2)}-${pad(day, 2)}`
}

/**
 * Read `YYYY-MM-DD` back into parts, or `null` when it is not one.
 *
 * Rejects a well-formed string naming a day that does not exist — `2026-02-30`
 * parses fine and means nothing.
 */
export function fromIsoDate(value: string): { year: number, month: number, day: number } | null {
  const match = ISO_DATE.exec(value)
  if (match === null)
    return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month))
    return null
  return { year, month, day }
}

/**
 * Format a local wall-clock time as `HH:MM`, or `HH:MM:SS` when seconds are
 * given.
 *
 * **No offset, deliberately.** JSON Schema's `format: time` is RFC 3339
 * `full-time` and requires one, and a control that was never given a zone
 * cannot invent it. The contract (C1.5) names this profile `partial-time` and
 * puts the zone in the renderer's codec, where the host knows it. The form
 * spec's built-in renderer table has no `dz.time` row, so nothing downstream
 * depends on the stricter reading yet.
 */
export function toIsoTime(parts: { hour: number, minute: number, second?: number }): string {
  const { hour, minute, second } = parts
  if (!Number.isInteger(hour) || !Number.isInteger(minute))
    return ''
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59)
    return ''
  const base = `${pad(hour, 2)}:${pad(minute, 2)}`
  if (second === undefined)
    return base
  if (!Number.isInteger(second) || second < 0 || second > 59)
    return ''
  return `${base}:${pad(second, 2)}`
}

/** Read `HH:MM` or `HH:MM:SS` back into parts, or `null` when it is neither. */
export function fromIsoTime(value: string): { hour: number, minute: number, second?: number } | null {
  const match = ISO_TIME.exec(value)
  if (match === null)
    return null
  const hour = Number(match[1])
  const minute = Number(match[2])
  const second = match[3] === undefined ? undefined : Number(match[3])
  if (hour > 23 || minute > 59 || (second !== undefined && second > 59))
    return null
  return second === undefined ? { hour, minute } : { hour, minute, second }
}

/**
 * Describe a `File` as a {@link DzFileRef}, without the binary.
 *
 * `status` starts `'pending'`: the reference exists in the model from the
 * moment the user picks the file, so the row renders immediately and the host
 * fills in the outcome. `id` is the caller's — a host that has already uploaded
 * passes its own handle, and one that has not passes something locally unique.
 */
export function toFileRef(file: File, id: string, status: DzFileRef['status'] = 'pending'): DzFileRef {
  return {
    id,
    name: file.name,
    size: file.size,
    // A browser that cannot identify the type reports `''`, and so do we —
    // rather than guessing from the extension, which is how an executable comes
    // to be described as an image.
    type: file.type,
    status,
  }
}

/**
 * Whether a value is shaped like a {@link DzFileRef}.
 *
 * A renderer reading a persisted document cannot assume the shape, and a
 * `File` that leaked into a document in an earlier version must be recognised
 * as *not* one of these rather than crashing the row that renders it.
 */
export function isFileRef(value: unknown): value is DzFileRef {
  if (typeof value !== 'object' || value === null)
    return false
  const ref = value as Record<string, unknown>
  return typeof ref.id === 'string'
    && typeof ref.name === 'string'
    && typeof ref.size === 'number'
    && typeof ref.type === 'string'
    && (ref.status === 'pending' || ref.status === 'uploaded' || ref.status === 'failed')
}

/**
 * Whether a value survives a JSON round trip unchanged.
 *
 * The check the renderer contract's C1.2 is about, available to anyone who
 * wants to assert it. `undefined` is accepted at the top level because it means
 * "absent", which is a thing a form value can be; a `File`, a `Date` or a
 * function is not.
 */
export function isJsonSerializable(value: unknown): boolean {
  if (value === undefined || value === null)
    return true
  switch (typeof value) {
    case 'string':
    case 'number':
    case 'boolean':
      return typeof value !== 'number' || Number.isFinite(value)
    case 'object':
      break
    default:
      return false
  }
  if (Array.isArray(value))
    return value.every(isJsonSerializable)
  if (Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null)
    return false
  return Object.values(value as object).every(v => v === undefined || isJsonSerializable(v))
}

function pad(value: number, width: number): string {
  return String(Math.abs(value)).padStart(width, '0')
}

function daysInMonth(year: number, month: number): number {
  // Day 0 of the next month is the last day of this one.
  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}
