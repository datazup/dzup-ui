import type { DzDirection, DzDirectionPreference, DzLocale } from '@dzup-ui/contracts'
import type { Ref } from 'vue'
import {
  DZ_DIRECTION_KEY,
  DZ_LOCALE_KEY,
  DZ_PROVIDER_DEFAULTS,
} from '@dzup-ui/contracts'
import { computed, inject, provide, readonly, ref } from 'vue'

/**
 * Locale and direction (TASK-OSS-P4-01, ADR-20).
 *
 * Both concerns live in one file because direction is derived from locale
 * unless a host overrides it, and splitting them would mean one importing the
 * other's key anyway.
 *
 * Every composable here returns a **readonly** ref: a component that could
 * write the application's locale from inside a render is a bug waiting for a
 * loop, and the write side belongs to `DzProvider` (TASK-OSS-P4-02).
 */

/**
 * Scripts written right-to-left, by ISO 639 language subtag.
 *
 * A list rather than `Intl.Locale.prototype.getTextInfo()`, which is
 * Baseline-2023 and unavailable in the repository's Node floor
 * (`^20.19.0 || >=22.13.0`) on every platform. When the floor moves past it,
 * this becomes a one-line delegation — the ADR records that as the intended
 * direction rather than leaving a hand-maintained list to discover.
 */
const RTL_LANGUAGES = new Set([
  'ar', // Arabic
  'arc', // Aramaic
  'ckb', // Central Kurdish
  'dv', // Divehi
  'fa', // Persian
  'ha', // Hausa (Ajami)
  'he', // Hebrew
  'khw', // Khowar
  'ks', // Kashmiri
  'ps', // Pashto
  'sd', // Sindhi
  'ur', // Urdu
  'uz-AF', // Uzbek (Afghanistan)
  'yi', // Yiddish
])

/** Resolve a BCP-47 tag to a writing direction. */
export function directionForLocale(locale: DzLocale): DzDirection {
  const normalised = locale.toLowerCase()
  if (RTL_LANGUAGES.has(normalised))
    return 'rtl'

  const language = normalised.split('-')[0] ?? ''
  return RTL_LANGUAGES.has(language) ? 'rtl' : 'ltr'
}

/**
 * The active locale.
 *
 * Falls back to `en-US` with no provider mounted, so every component works
 * unconfigured — the property that lets a consumer adopt one component without
 * adopting a provider.
 */
export function useDzLocale(): Readonly<Ref<DzLocale>> {
  const injected = inject(DZ_LOCALE_KEY, null)
  return readonly(injected ?? ref(DZ_PROVIDER_DEFAULTS.locale))
}

/**
 * The resolved writing direction — never `'auto'`.
 *
 * A component asking "am I in RTL?" wants a yes or no. `'auto'` is a thing
 * that a *host* declares; resolving it here means no component has to know
 * the script direction of every language the application ships.
 */
export function useDzDirection(): Readonly<Ref<DzDirection>> {
  const preference = inject(DZ_DIRECTION_KEY, null)
  const locale = useDzLocale()

  return readonly(computed(() => {
    const declared = preference?.value ?? DZ_PROVIDER_DEFAULTS.direction
    return declared === 'auto' ? directionForLocale(locale.value) : declared
  }))
}

/**
 * The write half, used by `DzProvider` (TASK-OSS-P4-02) and by tests.
 *
 * **Each key is provided only when the caller has one.** ADR-20 §3's rule is
 * that a provider overrides the keys it *sets*; providing a locale nobody asked
 * for would make `<DzProvider direction="rtl">` silently reset an ancestor's
 * `ar-EG` back to `en-US`, which is a truncation dressed up as an override.
 */
export function provideDzLocale(
  locale?: Ref<DzLocale>,
  direction?: Ref<DzDirectionPreference>,
): void {
  if (locale !== undefined)
    provide(DZ_LOCALE_KEY, locale)
  if (direction !== undefined)
    provide(DZ_DIRECTION_KEY, direction)
}
