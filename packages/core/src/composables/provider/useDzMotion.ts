import type { DzMotion, DzMotionPreference } from '@dzup-ui/contracts'
import type { ComputedRef, Ref } from 'vue'
import { DZ_MOTION_KEY, DZ_PROVIDER_DEFAULTS } from '@dzup-ui/contracts'
import { computed, inject, onScopeDispose, provide, readonly, ref } from 'vue'

/**
 * Motion policy — the read side of ADR-20 §7 (TASK-OSS-P4-01, adopted in
 * TASK-R5-O3).
 *
 * Split out of `useDzEnvironment.ts`, where it shipped alongside four one-line
 * concerns, because motion is the only one of the five with a **rendering**
 * consequence: it decides whether a component animates, which is a WCAG 2.2
 * obligation rather than a convenience. The other four stayed together; this one
 * grew a CSS surface and a deterministic test mode and earned a file.
 *
 * Nothing about the resolution rule changed in the move. `system` consults
 * `prefers-reduced-motion`, `reduced` never animates, `full` animates
 * regardless, and under SSR the honest answer is `reduced: false` — the same
 * thing the CSS media query resolves to before the client knows better.
 */

// ---------------------------------------------------------------------------
// The CSS surface
// ---------------------------------------------------------------------------

/**
 * The attribute an adopting component writes on its root when motion resolves
 * to reduced.
 *
 * Deliberately **not** `data-state`: the ADR-19 anatomy vocabulary describes
 * what a component *is*, and every value of `data-state` is declared in that
 * component's anatomy. This says what the *application* asked for, it is
 * identical on every component that emits it, and declaring it as a state per
 * component would put one host setting into twenty anatomies. The `dz-` prefix
 * marks it as a provider attribute rather than an anatomy one.
 *
 * The matching rule is emitted **once**, unlayered and `!important`, next to the
 * `prefers-reduced-motion` block in `packages/tokens/src/generate.ts` — the same
 * place, and for the same reason, that block records: twenty-six components once
 * restated that rule locally and it is expressed once, there.
 */
export const DZ_MOTION_ATTRIBUTE = 'data-dz-motion'

/** The single value {@link DZ_MOTION_ATTRIBUTE} ever takes. */
export const DZ_MOTION_REDUCED_VALUE = 'reduce'

// ---------------------------------------------------------------------------
// Deterministic test mode
// ---------------------------------------------------------------------------

/**
 * A forced preference that outranks both the provider and the OS.
 *
 * Two lanes need it and neither can get a deterministic answer without it:
 *
 *   - **Unit (jsdom).** `window.matchMedia` is not implemented in jsdom, so
 *     `createDzMotion` falls through to `systemReduced === false` and a spec
 *     asserting reduced behaviour has nothing to assert against. Stubbing
 *     `matchMedia` per spec file is how a repository ends up with forty
 *     slightly different stubs.
 *   - **Browser matrix.** The 18-project matrix's reduced-motion condition is a
 *     Playwright context option, which changes what the *engine* reports. A
 *     spec that then sniffs computed CSS is asserting that Chromium implements
 *     a media query. Forcing the mode instead asserts what this library does
 *     with the answer, which is the part that can regress.
 *
 * Set through {@link setDzMotionTestMode} from a Node lane, or by assigning
 * `globalThis.__DZ_MOTION__` — which is what a Playwright `addInitScript` can
 * reach before any component mounts. Reading `globalThis` rather than `window`
 * keeps this SSR-safe: the server has the former and not the latter.
 */
let forcedPreference: DzMotionPreference | null = null

/** Valid preferences, as a runtime guard for the `globalThis` channel. */
const PREFERENCES: readonly DzMotionPreference[] = ['system', 'reduced', 'full']

/**
 * Force (or with `null`, release) the motion preference for the current
 * process or page.
 *
 * Exported from this module but **not from the barrel**: it is a test hook, and
 * a public `setDzMotionTestMode` is an invitation to configure motion from
 * somewhere that is not the provider. Specs and lane setup import it by path,
 * which is the same code without the public promise.
 */
export function setDzMotionTestMode(preference: DzMotionPreference | null): void {
  forcedPreference = preference
}

/** The forced preference, or `null` when nothing has forced one. */
export function dzMotionTestMode(): DzMotionPreference | null {
  if (forcedPreference !== null)
    return forcedPreference

  const declared = (globalThis as { __DZ_MOTION__?: unknown }).__DZ_MOTION__
  return PREFERENCES.includes(declared as DzMotionPreference)
    ? declared as DzMotionPreference
    : null
}

// ---------------------------------------------------------------------------
// Resolution
// ---------------------------------------------------------------------------

/**
 * Resolve a stated preference against the OS, and keep resolving as the OS
 * changes.
 *
 * Exported from this module but **not from the barrel**: `DzProvider`
 * (TASK-OSS-P4-02) builds one from an application's `motion` prop, and
 * `useDzMotion` builds one from the default for a tree with no provider. Both
 * need the identical resolution rule, and a second copy of it is how the
 * provider and the fallback come to disagree about what `'system'` means.
 *
 * The listener is registered on the caller's effect scope, so it is removed when
 * the provider unmounts.
 */
export function createDzMotion(preference: Ref<DzMotionPreference>): DzMotion {
  const systemReduced = ref(false)

  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    systemReduced.value = query.matches

    /**
     * Subscribing is guarded separately from reading (TASK-R5-O3).
     *
     * `MediaQueryList.addEventListener` is newer than `matchMedia` itself —
     * Safari shipped the query with only the deprecated `addListener` for years
     * — and a host that polyfills `matchMedia` for SSR or a test rig usually
     * returns `{ matches }` and nothing else. Reading the current value is the
     * part that matters; staying subscribed is the improvement. Throwing
     * because the second is missing would take the first down with it, in
     * `setup()`, where it fails the whole component.
     */
    if (typeof query.addEventListener === 'function') {
      const listen = (event: MediaQueryListEvent): void => {
        systemReduced.value = event.matches
      }
      query.addEventListener('change', listen)
      onScopeDispose(() => query.removeEventListener('change', listen))
    }
  }

  /**
   * The test hook outranks the application, which outranks the OS. It is read
   * inside the computed rather than captured once, so a lane that forces the
   * mode after a component has mounted still gets the new answer.
   */
  const resolved = computed<DzMotionPreference>(() => dzMotionTestMode() ?? preference.value)

  return {
    preference: readonly(resolved) as Ref<DzMotionPreference>,
    reduced: readonly(computed(() => {
      if (resolved.value === 'reduced')
        return true
      if (resolved.value === 'full')
        return false
      return systemReduced.value
    })) as Ref<boolean>,
  }
}

/**
 * Whether components may animate.
 *
 * Under SSR there is no `matchMedia`, and the honest server answer is
 * **`reduced: false`** — the same thing the CSS `prefers-reduced-motion` media
 * query resolves to before the client knows better. Answering `true` on the
 * server would produce markup that never animates and then hydrates into markup
 * that does, which is a visible jump rather than a safe default.
 */
export function useDzMotion(): DzMotion {
  const injected = inject(DZ_MOTION_KEY, null)
  if (injected !== null)
    return injected

  return createDzMotion(ref(DZ_PROVIDER_DEFAULTS.motion))
}

/**
 * The value an animated component binds to `data-dz-motion` on the element that
 * carries its transition, so the policy reaches CSS.
 *
 * A single value rather than an attribute record, because a record has to be
 * spread with `v-bind` and most of these elements already carry a
 * `v-bind="{ ...$attrs }"` — two argument-less `v-bind`s on one element are a
 * duplicate attribute and Vue's template parser rejects them outright.
 *
 * `undefined` renders no attribute at all, so a tree under the default policy is
 * byte-identical to what it was before adoption. That is the same bargain
 * `useDzTestIds` strikes: off costs nothing.
 *
 * A component uses it **in addition to** whatever it already does for
 * `prefers-reduced-motion`: the media query answers for the OS, this answers for
 * the application, and a host that has its own accessibility setting is exactly
 * the case the media query cannot see.
 */
export function useDzMotionAttribute(): ComputedRef<typeof DZ_MOTION_REDUCED_VALUE | undefined> {
  const { reduced } = useDzMotion()
  return computed(() => (reduced.value ? DZ_MOTION_REDUCED_VALUE : undefined))
}

export function provideDzMotion(motion: DzMotion): void {
  provide(DZ_MOTION_KEY, motion)
}
