import type { DzDefaults, DzMotion, DzMotionPreference, DzTestIds } from '@dzup-ui/contracts'
import type { Ref } from 'vue'
import {
  DZ_DEFAULTS_KEY,
  DZ_MOTION_KEY,
  DZ_NONCE_KEY,
  DZ_PORTAL_TARGET_KEY,
  DZ_PROVIDER_DEFAULTS,
  DZ_TEST_IDS_KEY,
} from '@dzup-ui/contracts'
import { computed, inject, onScopeDispose, provide, readonly, ref } from 'vue'

/**
 * Host environment concerns: portal target, motion, defaults, nonce, test ids
 * (TASK-OSS-P4-01, ADR-20).
 *
 * Grouped in one file because each is a handful of lines and they share one
 * property worth stating once: **every one of them must be safe under SSR.**
 * No `window`, `document` or `matchMedia` is touched at module scope, and the
 * only one that needs a browser API guards it and returns the server-safe
 * answer without it.
 */

// ---------------------------------------------------------------------------
// Portal target
// ---------------------------------------------------------------------------

/**
 * Where overlays teleport to.
 *
 * 15 components currently take their own `portalTo` prop, which means an
 * application embedding the library in a shell — a shadow root, a dialog of its
 * own, a micro-frontend container — has to pass the same selector to every one
 * of them and cannot fix the one it forgot.
 *
 * `undefined` means "the portal's own default", which is `document.body`. The
 * default is deliberately not the string `'body'`: resolving a selector is the
 * portal's job at render time, and encoding it here would make SSR resolve a
 * DOM query that has no DOM.
 */
export function useDzPortalTarget(): Readonly<Ref<string | undefined>> {
  const injected = inject(DZ_PORTAL_TARGET_KEY, null)
  return readonly(injected ?? ref(DZ_PROVIDER_DEFAULTS.portalTarget))
}

export function provideDzPortalTarget(target: Ref<string | undefined>): void {
  provide(DZ_PORTAL_TARGET_KEY, target)
}

// ---------------------------------------------------------------------------
// Motion
// ---------------------------------------------------------------------------

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
 * Resolve a stated preference against the OS, and keep resolving as the OS
 * changes.
 *
 * Exported from this module but **not from the barrel**: `DzProvider` builds one
 * from an application's `motion` prop, and `useDzMotion` builds one from the
 * default for a tree with no provider. Both need the identical resolution rule,
 * and a second copy of it is how the provider and the fallback come to disagree
 * about what `'system'` means.
 *
 * The listener is registered on the caller's effect scope, so it is removed when
 * the provider unmounts.
 */
export function createDzMotion(preference: Ref<DzMotionPreference>): DzMotion {
  const systemReduced = ref(false)

  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    systemReduced.value = query.matches

    const listen = (event: MediaQueryListEvent): void => {
      systemReduced.value = event.matches
    }
    query.addEventListener('change', listen)
    onScopeDispose(() => query.removeEventListener('change', listen))
  }

  return {
    preference: readonly(preference) as Ref<DzMotionPreference>,
    reduced: readonly(computed(() => {
      if (preference.value === 'reduced')
        return true
      if (preference.value === 'full')
        return false
      return systemReduced.value
    })) as Ref<boolean>,
  }
}

export function provideDzMotion(motion: DzMotion): void {
  provide(DZ_MOTION_KEY, motion)
}

// ---------------------------------------------------------------------------
// Component defaults
// ---------------------------------------------------------------------------

/**
 * Application-wide prop defaults.
 *
 * `resolve` implements the precedence ADR-20 fixes — **prop, then compound
 * context, then provider, then the component's own default** — in one place, so
 * that no component invents its own order. A component passes what it has and
 * takes back the answer.
 */
export function useDzDefaults(): {
  defaults: Readonly<Ref<DzDefaults>>
  resolve: <T>(component: string, prop: string, chain: (T | undefined)[]) => T | undefined
} {
  const injected = inject(DZ_DEFAULTS_KEY, null)
  const defaults = readonly(injected ?? ref<DzDefaults>({}))

  return {
    defaults,
    resolve: <T>(component: string, prop: string, chain: (T | undefined)[]) => {
      for (const candidate of chain) {
        if (candidate !== undefined)
          return candidate
      }

      const perComponent = defaults.value.components?.[component]?.[prop]
      if (perComponent !== undefined)
        return perComponent as T

      // A shared axis (`size`, `tone`, `density`) applies to every component
      // that has one, which is what makes "make the whole app compact" a single
      // setting rather than a list.
      const shared = (defaults.value as Record<string, unknown>)[prop]
      return shared === undefined ? undefined : shared as T
    },
  }
}

export function provideDzDefaults(defaults: Ref<DzDefaults>): void {
  provide(DZ_DEFAULTS_KEY, defaults)
}

// ---------------------------------------------------------------------------
// CSP nonce
// ---------------------------------------------------------------------------

/**
 * The Content-Security-Policy nonce for any style or script this library
 * injects at runtime.
 *
 * `DzThemeProvider`'s transition-suppression `<style>` tag (ADR-15) is the one
 * that exists today; under a strict CSP it is dropped silently, and the symptom
 * is a colour sweep on theme change that nobody can reproduce locally.
 */
export function useDzNonce(): Readonly<Ref<string | undefined>> {
  const injected = inject(DZ_NONCE_KEY, null)
  return readonly(injected ?? ref(DZ_PROVIDER_DEFAULTS.nonce))
}

export function provideDzNonce(nonce: Ref<string | undefined>): void {
  provide(DZ_NONCE_KEY, nonce)
}

// ---------------------------------------------------------------------------
// Test ids
// ---------------------------------------------------------------------------

/**
 * Stable test hooks, off unless a host asks for them.
 *
 * `testId` returns `undefined` when disabled, which `v-bind` drops — so a
 * production build carries no attribute rather than an empty one.
 *
 * A `prefix` is prepended with a `-`, so one page embedding two instances of an
 * application can give each its own namespace without every component learning
 * about namespaces. An empty prefix is the same as none: `'-submit'` is a
 * selector nobody meant to write.
 */
export function useDzTestIds(): {
  testIds: Readonly<Ref<DzTestIds>>
  testId: (name: string) => Record<string, string> | undefined
} {
  const injected = inject(DZ_TEST_IDS_KEY, null)
  const testIds = readonly(injected ?? ref<DzTestIds>(DZ_PROVIDER_DEFAULTS.testIds))

  return {
    testIds,
    testId: (name) => {
      if (!testIds.value.enabled)
        return undefined
      const prefix = testIds.value.prefix
      return {
        [testIds.value.attribute]: prefix === undefined || prefix === '' ? name : `${prefix}-${name}`,
      }
    },
  }
}

export function provideDzTestIds(testIds: Ref<DzTestIds>): void {
  provide(DZ_TEST_IDS_KEY, testIds)
}
