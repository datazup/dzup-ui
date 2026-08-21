import type { DzFormatDefaults, DzFormats, DzLocale } from '@dzup-ui/contracts'
import type { Ref } from 'vue'
import { DZ_FORMATS_KEY } from '@dzup-ui/contracts'
import { inject, provide } from 'vue'
import {
  cachedDateTimeFormat,
  cachedListFormat,
  cachedNumberFormat,
  cachedRelativeTimeFormat,
} from '../../i18n/intl-cache.ts'
import { useDzLocale } from './useDzLocale.ts'

/**
 * Cached `Intl` formatters bound to the active locale (TASK-OSS-P4-01, ADR-20).
 *
 * Four files in `packages/core/src` construct `Intl` formatters today, across
 * five call sites — `DzAnimatedNumber.vue`, `DzAnimatedNumber.tween.ts`,
 * `DzTimePicker.vue` and `useRelativeTime` — each with its own locale argument
 * or none at all. Two problems follow: an application cannot set the locale
 * once, and a component that formats per row constructs a formatter per row.
 * `DzAnimatedNumber.tween.ts` is the sharp case: its constructor sits inside
 * `format()`, which a running tween calls once per frame.
 *
 * Constructing an `Intl.NumberFormat` is not free; the ECMA-402 spec requires
 * resolving locale data on construction, and it is the reason every serious
 * i18n layer caches them. This one caches across the whole application, keyed
 * by locale plus the exact options object.
 */

// The cache itself now lives in `../../i18n/intl-cache.ts`, which imports
// nothing. It moved there in TASK-OSS-P4-03 so that `DzAnimatedNumber.tween.ts`
// — framework-free by design, and the one file that was constructing a
// formatter per animation frame — could reach it. Re-exported here because this
// module is where the provider specs already look for the test hooks.
export {
  cachedDateTimeFormat,
  cachedListFormat,
  cachedNumberFormat,
  cachedRelativeTimeFormat,
  clearFormatterCache,
  formatterCacheSize,
} from '../../i18n/intl-cache.ts'
export type { IntlLocaleArg } from '../../i18n/intl-cache.ts'

/**
 * Merge an application's default options under a caller's own.
 *
 * The caller wins on every key it states. A component asking for
 * `{ style: 'percent' }` must not silently become a currency because the host
 * set one — the host is declaring what to do when nobody said, not overruling
 * a component that did.
 *
 * `undefined` in, `undefined` out: an empty options object is not the same
 * cache key as no options, and constructing `Intl.NumberFormat(locale, {})`
 * where `Intl.NumberFormat(locale)` was meant would double the cache for no
 * behavioural difference.
 */
function withDefaults<T extends object>(
  options: T | undefined,
  fallback: T | undefined,
): T | undefined {
  if (fallback === undefined)
    return options
  if (options === undefined)
    return { ...fallback }
  return { ...fallback, ...options }
}

/**
 * Build a `DzFormats` bound to a locale ref, sharing the module cache.
 *
 * Exported from this module but **not from the barrel**: `DzProvider` needs to
 * construct one from an application's `formats` prop, and `useDzFormats` needs
 * the same thing for its uninjected fallback. Two constructions, one cache —
 * which is the whole point of the cache being module-level.
 */
export function createDzFormats(
  locale: Readonly<Ref<DzLocale>>,
  defaults?: DzFormatDefaults,
): DzFormats {
  /**
   * `style: 'currency'` with no `currency` is a `TypeError`, not a fallback —
   * so a host's `currency` default is the only thing that lets a component ask
   * for currency formatting at all without knowing the application's money.
   */
  const numberOptions = (options?: Intl.NumberFormatOptions): Intl.NumberFormatOptions | undefined => {
    const merged = withDefaults(options, defaults?.number)
    if (defaults?.currency === undefined || merged?.style !== 'currency' || merged.currency !== undefined)
      return merged
    return { ...merged, currency: defaults.currency }
  }

  return {
    number: options => cachedNumberFormat(locale.value, numberOptions(options)),
    date: options => cachedDateTimeFormat(locale.value, withDefaults(options, defaults?.date)),
    relativeTime: options =>
      cachedRelativeTimeFormat(locale.value, withDefaults(options, defaults?.relativeTime)),
    list: options => cachedListFormat(locale.value, withDefaults(options, defaults?.list)),
  }
}

/**
 * Formatters for the active locale.
 *
 * Returns plain functions rather than refs: each call reads the locale at call
 * time, so a locale change is picked up without the caller re-subscribing, and
 * a component can format inside a render without a watcher.
 */
export function useDzFormats(): DzFormats {
  const injected = inject(DZ_FORMATS_KEY, null)
  if (injected !== null)
    return injected

  return createDzFormats(useDzLocale())
}

/**
 * The write half, for a host that has its own formatter cache already.
 *
 * Rare, and supported because an application with an existing i18n layer should
 * not end up with two caches and two locale sources.
 */
export function provideDzFormats(formats: DzFormats): void {
  provide(DZ_FORMATS_KEY, formats)
}
