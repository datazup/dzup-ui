/**
 * useThemeTransition — the "re-theme the page" behaviour (TASK-FREE3-12).
 *
 * The theme swap itself is `useTheme`'s job and is pinned in `useTheme.spec.ts`;
 * what this composable adds is the View Transition around it plus the
 * `dz-theming` marker class that makes `tailwind.css` REPLACE the route
 * fade+slide with a pure cross-fade for that one swap. Both are progressive
 * enhancement, and neither had a test: `retheme` had never been called, so the
 * reduced-motion path — where the theme must still change, just without the
 * cross-fade — was unverified. That is the path a motion-sensitive visitor takes.
 *
 * The View Transitions API does not exist in jsdom, so it is stubbed per test:
 * the branch selection is the unit here, the browser's cross-fade is not.
 *
 * Reduced motion is driven through `provideMotionPreference` (the page-level
 * override the gallery's own toggle uses) rather than by resetting the module
 * graph: `useReducedMotion`'s OS reading is a module singleton, and re-importing
 * to change it drags all ~35 motion components back through the transform for
 * every test — 15s a test, measured.
 *
 * ## What shapes the harness
 *
 * `useTheme` is a facade over the DzThemeProvider context, so every case must
 * mount a provider — calling it without one throws by design. The provider owns
 * the state, which is what makes each case independent: the watcher that
 * publishes `resolved` and writes `data-theme` lives in the provider's scope, so
 * mounting and unmounting a host per test cannot leave a later test asserting
 * against a disposed scope.
 *
 * (This file previously kept one long-lived `warm` host mounted for exactly that
 * reason, back when `useTheme` was a module singleton whose watcher belonged to
 * whichever component's `setup` reached it first. The provider retired both the
 * singleton and the workaround.)
 */

import { DzThemeProvider } from '@dzup-ui/core'
import { mount } from '@vue/test-utils'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import { provideMotionPreference } from '../motion/useReducedMotion.ts'
import { useThemeTransition } from './useThemeTransition.ts'

/**
 * `document` as the composable itself sees it — through `unknown`, because
 * `lib.dom` types `startViewTransition` as a REQUIRED method returning a full
 * `ViewTransition`, so neither a partial stub nor `delete` typechecks against
 * the real `Document`. The composable only ever touches `updateCallbackDone`.
 */
const doc = document as unknown as {
  startViewTransition?: (cb: () => void | Promise<void>) => { updateCallbackDone: Promise<void> }
}

/** Install a fake View Transitions API that runs the callback like the real one. */
function stubViewTransitions(): { calls: number } {
  const state = { calls: 0 }
  doc.startViewTransition = (cb: () => void | Promise<void>) => {
    state.calls += 1
    return { updateCallbackDone: Promise.resolve(cb()).then(() => undefined) }
  }
  return state
}

/**
 * Mount a parent that installs the page-level reduced-motion override around a
 * child that calls the composable — it registers lifecycle hooks and injects, so
 * it belongs inside a component instance. The levels are required, not
 * decorative: Vue resolves `inject` against the PARENT's provides, so a
 * component that provides and injects in one `setup` never sees its own value.
 *
 * `DzThemeProvider` sits between them because `useThemeTransition` calls
 * `useTheme`, which injects the provider context and throws without an ancestor.
 */
function mountTransition(reduced = false) {
  let api!: ReturnType<typeof useThemeTransition>
  const Child = defineComponent({
    setup() {
      api = useThemeTransition()
      return () => h('div')
    },
  })
  const wrapper = mount(defineComponent({
    setup() {
      provideMotionPreference(reduced)
      return () => h(DzThemeProvider, null, { default: () => h(Child) })
    },
  }))
  return { wrapper, ...api }
}

beforeAll(() => {
  // jsdom has no matchMedia; DzThemeProvider reads it for the system colour
  // scheme and `useReducedMotion` for the OS motion setting. A non-matching stub
  // gives the light / full-motion baseline; the reduced case is driven by the
  // page-level override instead.
  if (typeof window.matchMedia !== 'function') {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }))
  }
})

beforeEach(() => {
  document.documentElement.classList.remove('dz-theming')
})

afterEach(() => {
  vi.useRealTimers()
  delete doc.startViewTransition
})

describe('useThemeTransition', () => {
  it('swaps the theme through a View Transition and marks the document while it runs', async () => {
    vi.useFakeTimers()
    const vt = stubViewTransitions()
    const { wrapper, resolved, retheme } = mountTransition()

    const before = resolved.value
    retheme()

    expect(vt.calls, 'the swap goes through the View Transitions API when it exists').toBe(1)
    // The marker class is what swaps the route animation for the theme
    // cross-fade; it must be present for the whole transition.
    expect(document.documentElement.classList.contains('dz-theming')).toBe(true)

    await vi.runAllTimersAsync()
    expect(resolved.value).not.toBe(before)
    expect(document.documentElement.getAttribute('data-theme')).toBe(resolved.value)
    // …and gone afterwards, or every later route change would cross-fade too.
    expect(document.documentElement.classList.contains('dz-theming')).toBe(false)
    wrapper.unmount()
  })

  it('still swaps the theme under reduced motion — with no transition and no marker', async () => {
    const vt = stubViewTransitions()
    const { wrapper, resolved, reduced, retheme } = mountTransition(true)

    expect(reduced.value).toBe(true)
    const before = resolved.value
    retheme()
    // `useTheme` publishes `resolved` from a watcher on `mode`, so the swap is
    // only observable after a tick — not after a bare microtask drain.
    await nextTick()
    await nextTick()

    expect(vt.calls, 'reduced motion must not start a View Transition').toBe(0)
    expect(document.documentElement.classList.contains('dz-theming')).toBe(false)
    // The point of the test: the preference is honoured by dropping the
    // ANIMATION, never by dropping the theme change.
    expect(resolved.value).not.toBe(before)
    expect(document.documentElement.getAttribute('data-theme')).toBe(resolved.value)
    wrapper.unmount()
  })

  it('swaps the theme in a browser with no View Transitions API', async () => {
    // No stubViewTransitions() here — this is Firefox before 144.
    const { wrapper, resolved, retheme } = mountTransition()

    const before = resolved.value
    retheme()
    // `useTheme` publishes `resolved` from a watcher on `mode`, so the swap is
    // only observable after a tick — not after a bare microtask drain.
    await nextTick()
    await nextTick()

    expect(resolved.value).not.toBe(before)
    expect(document.documentElement.classList.contains('dz-theming')).toBe(false)
    wrapper.unmount()
  })

  it('restarts the cleanup timer when re-themed twice in quick succession', async () => {
    vi.useFakeTimers()
    stubViewTransitions()
    const { wrapper, retheme } = mountTransition()

    retheme()
    vi.advanceTimersByTime(400)
    retheme()
    // The first timer would have fired at 700ms; the second swap has to hold the
    // marker for its own full duration or the second cross-fade is cut short.
    vi.advanceTimersByTime(400)
    expect(document.documentElement.classList.contains('dz-theming')).toBe(true)

    await vi.runAllTimersAsync()
    expect(document.documentElement.classList.contains('dz-theming')).toBe(false)
    wrapper.unmount()
  })
})
