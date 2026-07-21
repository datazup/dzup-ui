import type { InjectionKey, Ref } from 'vue'
import { computed, inject, provide, ref } from 'vue'

/**
 * useReducedMotion — central reduced-motion preference for the animations gallery.
 *
 * Resolves to `true` when EITHER the OS exposes
 * `(prefers-reduced-motion: reduce)` OR a page-level override has been turned on
 * via {@link provideMotionPreference}. This lets the gallery honour the user's
 * system setting while also letting `AnimationsPage` force "reduced" live for the
 * demo toggle. SSR-safe (guards `window`/`matchMedia`) and reactive to OS changes.
 */

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

/** Injection key carrying the page-level reduced-motion override flag. */
const MotionOverrideKey: InjectionKey<Ref<boolean>> = Symbol('dz-motion-override')

/**
 * Module-singleton ref tracking the OS `prefers-reduced-motion` setting. One
 * `matchMedia` listener is attached for the whole app lifetime so every consumer
 * shares a single source of truth.
 */
let osPreference: Ref<boolean> | null = null

function useOsReducedMotion(): Ref<boolean> {
  if (osPreference)
    return osPreference

  const state = ref(false)
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    const mql = window.matchMedia(REDUCED_MOTION_QUERY)
    state.value = mql.matches
    mql.addEventListener('change', (event: MediaQueryListEvent) => {
      state.value = event.matches
    })
  }

  osPreference = state
  return state
}

/**
 * provideMotionPreference — install the page-level override that callers of
 * {@link useReducedMotion} downstream will read.
 *
 * Returns the writable override ref so the provider (e.g. `AnimationsPage`) can
 * bind it to a "Reduce motion" toggle. When `true`, every descendant resolves
 * reduced motion regardless of the OS setting.
 *
 * @param initial - initial override value (default `false`).
 */
export function provideMotionPreference(initial = false): Ref<boolean> {
  const override = ref(initial)
  provide(MotionOverrideKey, override)
  return override
}

/**
 * useReducedMotion — reactive boolean, `true` when motion should be reduced.
 *
 * Combines the OS setting with any page-level override installed by
 * {@link provideMotionPreference}. Read-only; mutate the override via the ref
 * returned from `provideMotionPreference`.
 */
export function useReducedMotion(): Readonly<Ref<boolean>> {
  const os = useOsReducedMotion()
  const override = inject(MotionOverrideKey, null)
  return computed(() => os.value || (override?.value ?? false))
}
