import type { DzDirection, DzDirectionPreference, DzLocale } from '@dzup-ui/contracts'
import type { Ref } from 'vue'
import {
  DZ_DIRECTION_KEY,
  DZ_LOCALE_KEY,
  DZ_PROVIDER_DEFAULTS,
} from '@dzup-ui/contracts'
import { computed, inject, provide, readonly, ref } from 'vue'
import { directionForLocale } from '../../i18n/direction.ts'

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

// `directionForLocale` and its subtag list moved to `../../i18n/direction.ts`
// in TASK-R5-O4 — unchanged — so the locale-pack gate can check a pack's declared
// direction against the same list without importing Vue. Re-exported here, where
// `DzProvider` and the provider specs already import it from.
export { directionForLocale } from '../../i18n/direction.ts'

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
