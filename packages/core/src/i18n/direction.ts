import type { DzDirection, DzLocale } from '@dzup-ui/contracts'

/**
 * Writing direction by locale (TASK-OSS-P4-01; moved here by TASK-R5-O4).
 *
 * **Framework-free on purpose**, like `intl-cache.ts`: it imports nothing at
 * runtime, so `yarn validate:i18n-packs` can check that a locale pack's declared
 * `direction` agrees with the list `useDzDirection()` resolves `'auto'` from —
 * without importing Vue or a built `@dzup-ui/contracts`. The two answers to one
 * question must not drift apart unseen.
 *
 * @module @dzup-ui/core/i18n/direction
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
