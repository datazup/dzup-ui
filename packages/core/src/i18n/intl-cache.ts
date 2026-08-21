/**
 * The shared `Intl` formatter cache (TASK-OSS-P4-01, moved here by P4-03).
 *
 * **Framework-free on purpose.** This module imports nothing — not Vue, not
 * `@dzup-ui/contracts`. It started life inside `useDzFormats.ts`, which imports
 * `inject`/`provide` from Vue, and that made it unreachable from the two places
 * that needed it most: `DzAnimatedNumber.tween.ts`, whose own header promises it
 * is "framework-free ... so the animation logic can be unit-tested without a DOM
 * or `requestAnimationFrame`", and any pure exported helper a consumer calls
 * outside a component. A cache that the hot paths cannot reach is not a cache.
 *
 * Constructing an `Intl.NumberFormat` is not free: ECMA-402 requires locale data
 * to be resolved on construction, which is why every serious i18n layer caches
 * them. `DzAnimatedNumber.tween.ts` built one *inside* `format()` — a function a
 * running tween calls once per frame.
 *
 * @module @dzup-ui/core/i18n/intl-cache
 */

/**
 * A locale as `Intl` accepts it: one tag, a priority list, or nothing at all
 * (which means "the runtime's own locale").
 *
 * Wider than `DzLocale` because the cache serves two kinds of caller. A
 * component reads a resolved locale from the provider and always has one; the
 * pure exported helpers — `formatRelativeTime`, `formatNumber` — take whatever
 * their caller passes, and `undefined` is a documented, public part of their
 * signature. Narrowing here would mean either breaking those signatures or
 * leaving them outside the cache.
 */
export type IntlLocaleArg = string | readonly string[] | undefined

/**
 * Module-level so the cache survives component unmounts.
 *
 * Bounded by the number of distinct (locale, options) pairs an application
 * actually uses, which is small and fixed — not by anything a user can grow at
 * runtime.
 */
const cache = new Map<string, unknown>()

/** Visible for testing: the number of distinct formatters constructed. */
export function formatterCacheSize(): number {
  return cache.size
}

/** Visible for testing: drop every cached formatter. */
export function clearFormatterCache(): void {
  cache.clear()
}

function cached<T>(kind: string, locale: IntlLocaleArg, options: object | undefined, make: () => T): T {
  // `Object.entries().sort()` rather than raw `JSON.stringify(options)`: two
  // callers asking for the same format with keys in a different order mean the
  // same thing and must hit the same entry.
  const shape = options === undefined
    ? ''
    : JSON.stringify(Object.entries(options).sort(([a], [b]) => (a < b ? -1 : 1)))
  const key = `${kind}|${String(locale)}|${shape}`

  const hit = cache.get(key)
  if (hit !== undefined)
    return hit as T

  const made = make()
  cache.set(key, made)
  return made
}

export function cachedNumberFormat(
  locale: IntlLocaleArg,
  options?: Intl.NumberFormatOptions,
): Intl.NumberFormat {
  return cached('number', locale, options, () => new Intl.NumberFormat(locale as string, options))
}

export function cachedDateTimeFormat(
  locale: IntlLocaleArg,
  options?: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  return cached('date', locale, options, () => new Intl.DateTimeFormat(locale as string, options))
}

export function cachedRelativeTimeFormat(
  locale: IntlLocaleArg,
  options?: Intl.RelativeTimeFormatOptions,
): Intl.RelativeTimeFormat {
  return cached(
    'relativeTime',
    locale,
    options,
    () => new Intl.RelativeTimeFormat(locale as string, options),
  )
}

export function cachedListFormat(
  locale: IntlLocaleArg,
  options?: Intl.ListFormatOptions,
): Intl.ListFormat {
  return cached('list', locale, options, () => new Intl.ListFormat(locale as string, options))
}
