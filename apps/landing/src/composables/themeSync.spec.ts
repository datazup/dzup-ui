/**
 * The dual-writer contract for `<html data-theme>` (TASK-FREE2-08 <sync>).
 *
 * App.vue wraps the site in `DzThemeProvider` so library components that bind to
 * the theme context (DzColorModeToggle, used inside the nav-bar and footer
 * blocks) resolve. That provider keeps its OWN preference state, reads the SAME
 * `dz-theme` storage key, and writes the SAME `data-theme` attribute as the
 * landing's `useTheme` singleton.
 *
 * Sharing a storage key only makes them agree at load. After that they are two
 * independent state machines, and the OS-flip path below is where that shows:
 * the provider, still sitting on the `system` preference it read at mount, would
 * happily overwrite an explicit choice the visitor made through the landing
 * control. These tests pin the bridge that prevents it.
 */

import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'

// NOTE: `@dzup-ui/core` is imported dynamically inside mountShell, never at the
// top of this file. `vi.resetModules()` (needed to rebuild the useTheme
// singleton per test) gives the re-imported bridge a FRESH core module — and
// DZ_THEME_KEY is a `Symbol()`, so a statically-imported DzThemeProvider would
// provide under a different key than the bridge injects with. `inject` would
// miss, `useTheme({ optional: true })` would hand back its no-op sentinel, and
// every test here would pass or fail for reasons unrelated to the bridge.

type MediaListener = (event: { matches: boolean }) => void

let osPrefersDark = false
const listeners = new Set<MediaListener>()

function setOsPrefersDark(value: boolean): void {
  osPrefersDark = value
  for (const listener of listeners) listener({ matches: value })
}

function installMatchMedia(): void {
  listeners.clear()
  osPrefersDark = false
  vi.stubGlobal('matchMedia', (query: string) => ({
    get matches() {
      return query.includes('dark') && osPrefersDark
    },
    media: query,
    addEventListener: (_: string, fn: MediaListener) => void listeners.add(fn),
    removeEventListener: (_: string, fn: MediaListener) => void listeners.delete(fn),
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
    onchange: null,
  }))
}

function theme(): string | null {
  return document.documentElement.getAttribute('data-theme')
}

beforeEach(() => {
  localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
  installMatchMedia()
})

/**
 * Mount the App.vue arrangement: the landing singleton initialised at the root,
 * wrapped in DzThemeProvider with the bridge that keeps the two in step.
 */
async function mountShell() {
  vi.resetModules()
  const { DzThemeProvider } = await import('@dzup-ui/core')
  const { useTheme } = await import('./useTheme.ts')
  const { useProviderThemeSync } = await import('./useProviderThemeSync.ts')

  let bridge: ReturnType<typeof useProviderThemeSync> | undefined
  const Bridge = defineComponent({
    setup() {
      bridge = useProviderThemeSync()
      return () => null
    },
  })

  const api = useTheme()
  const wrapper = mount(defineComponent({
    setup: () => () => h(DzThemeProvider, null, { default: () => h(Bridge) }),
  }))

  await nextTick()
  return {
    ...api,
    wrapper,
    providerTheme: bridge!.providerTheme,
    setProviderTheme: bridge!.setProviderTheme,
  }
}

describe('data-theme: the landing singleton is the authority', () => {
  it('an explicit choice survives an OS flip', async () => {
    // The regression this bridge exists for. Without it, the provider — still on
    // the `system` preference it read at mount — recomputes on the OS flip and
    // overwrites the light theme the visitor explicitly asked for.
    const { setMode, resolved } = await mountShell()

    setMode('light')
    await nextTick()
    expect(theme()).toBe('light')

    setOsPrefersDark(true)
    await nextTick()
    await nextTick()

    expect(resolved.value).toBe('light')
    expect(theme()).toBe('light')
  })

  it('both writers agree while following the OS in system mode', async () => {
    const { setMode, resolved } = await mountShell()

    setMode('system')
    await nextTick()

    setOsPrefersDark(true)
    await nextTick()
    await nextTick()

    expect(resolved.value).toBe('dark')
    expect(theme()).toBe('dark')

    setOsPrefersDark(false)
    await nextTick()
    await nextTick()

    expect(resolved.value).toBe('light')
    expect(theme()).toBe('light')
  })

  it('a mode set on the singleton propagates to the provider context', async () => {
    // DzColorModeToggle instances inside block previews read the provider's
    // preference. If it lags the singleton, they render the wrong active state.
    const { setMode, providerTheme } = await mountShell()

    setMode('dark')
    await nextTick()
    expect(providerTheme.value).toBe('dark')

    setMode('system')
    await nextTick()
    expect(providerTheme.value).toBe('system')
  })

  it('a mode set through the provider (a block preview toggle) propagates back', async () => {
    // The reverse direction: DzColorModeToggle mutates the provider context
    // directly, and the singleton — which the nav control and hero button read —
    // has to adopt that edit rather than sit on a stale mode.
    const { mode, setProviderTheme } = await mountShell()

    setProviderTheme('dark')
    await nextTick()
    await nextTick()

    expect(mode.value).toBe('dark')
    expect(theme()).toBe('dark')
  })
})
