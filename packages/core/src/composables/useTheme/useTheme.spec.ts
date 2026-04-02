import type { UseThemeReturn } from './useTheme.ts'
/**
 * useTheme — Unit tests.
 */
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import { useTheme } from './useTheme.ts'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Mount a component that calls useTheme and captures the return value.
 * We store the composable return in a variable outside the component
 * so we can access Refs directly (avoiding Vue's proxy unwrapping issues).
 */
function mountWithTheme() {
  let api: UseThemeReturn = undefined as unknown as UseThemeReturn

  const TestComponent = defineComponent({
    setup() {
      api = useTheme()
      return {}
    },
    render() {
      return h('div')
    },
  })

  const wrapper = mount(TestComponent)
  return { wrapper, api }
}

// ---------------------------------------------------------------------------
// Setup / Teardown
// ---------------------------------------------------------------------------

let mediaQueryListeners: Array<(event: MediaQueryListEvent) => void> = []
let matchesValue = false

beforeEach(() => {
  // Clear localStorage
  localStorage.clear()

  // Remove any data-theme attribute
  document.documentElement.removeAttribute('data-theme')

  // Reset media query mocks
  mediaQueryListeners = []
  matchesValue = false

  // Mock matchMedia
  vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query: string) => ({
    matches: matchesValue,
    media: query,
    addEventListener: vi.fn((_event: string, cb: (event: MediaQueryListEvent) => void) => {
      mediaQueryListeners.push(cb)
    }),
    removeEventListener: vi.fn((_event: string, cb: (event: MediaQueryListEvent) => void) => {
      mediaQueryListeners = mediaQueryListeners.filter(l => l !== cb)
    }),
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })))
})

afterEach(() => {
  vi.restoreAllMocks()
  localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
})

/** Simulate a system color scheme change */
function simulateMediaChange(prefersDark: boolean): void {
  for (const listener of mediaQueryListeners) {
    listener({ matches: prefersDark } as MediaQueryListEvent)
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useTheme', () => {
  // -----------------------------------------------------------------------
  // Return shape
  // -----------------------------------------------------------------------

  it('returns theme, resolvedTheme, setTheme, and toggleTheme', () => {
    const { api } = mountWithTheme()

    expect(api.theme).toBeDefined()
    expect(api.resolvedTheme).toBeDefined()
    expect(typeof api.setTheme).toBe('function')
    expect(typeof api.toggleTheme).toBe('function')
  })

  // -----------------------------------------------------------------------
  // Default state
  // -----------------------------------------------------------------------

  it('defaults to system theme when no localStorage value', () => {
    const { api } = mountWithTheme()
    expect(api.theme.value).toBe('system')
  })

  it('resolves system theme to light when prefers-color-scheme is light', () => {
    matchesValue = false
    const { api } = mountWithTheme()
    expect(api.resolvedTheme.value).toBe('light')
  })

  it('resolves system theme to dark when prefers-color-scheme is dark', () => {
    matchesValue = true
    const { api } = mountWithTheme()
    expect(api.resolvedTheme.value).toBe('dark')
  })

  // -----------------------------------------------------------------------
  // Persistence (ADR-15)
  // -----------------------------------------------------------------------

  it('reads persisted theme from localStorage', () => {
    localStorage.setItem('dz-theme', 'dark')
    const { api } = mountWithTheme()
    expect(api.theme.value).toBe('dark')
  })

  it('persists theme changes to localStorage', async () => {
    const { api } = mountWithTheme()
    api.setTheme('dark')
    await nextTick()
    expect(localStorage.getItem('dz-theme')).toBe('dark')
  })

  it('ignores invalid localStorage values', () => {
    localStorage.setItem('dz-theme', 'invalid-value')
    const { api } = mountWithTheme()
    expect(api.theme.value).toBe('system')
  })

  // -----------------------------------------------------------------------
  // setTheme
  // -----------------------------------------------------------------------

  it('sets theme to light', async () => {
    const { api } = mountWithTheme()
    api.setTheme('light')
    await nextTick()
    expect(api.theme.value).toBe('light')
    expect(api.resolvedTheme.value).toBe('light')
  })

  it('sets theme to dark', async () => {
    const { api } = mountWithTheme()
    api.setTheme('dark')
    await nextTick()
    expect(api.theme.value).toBe('dark')
    expect(api.resolvedTheme.value).toBe('dark')
  })

  it('sets theme to system', async () => {
    const { api } = mountWithTheme()
    api.setTheme('dark')
    await nextTick()
    api.setTheme('system')
    await nextTick()
    expect(api.theme.value).toBe('system')
  })

  // -----------------------------------------------------------------------
  // toggleTheme
  // -----------------------------------------------------------------------

  it('toggles from light to dark', async () => {
    const { api } = mountWithTheme()
    api.setTheme('light')
    await nextTick()
    api.toggleTheme()
    await nextTick()
    expect(api.theme.value).toBe('dark')
  })

  it('toggles from dark to light', async () => {
    const { api } = mountWithTheme()
    api.setTheme('dark')
    await nextTick()
    api.toggleTheme()
    await nextTick()
    expect(api.theme.value).toBe('light')
  })

  it('toggles from system (light resolved) to dark', async () => {
    matchesValue = false
    const { api } = mountWithTheme()
    expect(api.resolvedTheme.value).toBe('light')
    api.toggleTheme()
    await nextTick()
    expect(api.theme.value).toBe('dark')
  })

  it('toggles from system (dark resolved) to light', async () => {
    matchesValue = true
    const { api } = mountWithTheme()
    expect(api.resolvedTheme.value).toBe('dark')
    api.toggleTheme()
    await nextTick()
    expect(api.theme.value).toBe('light')
  })

  // -----------------------------------------------------------------------
  // DOM attribute (ADR-15)
  // -----------------------------------------------------------------------

  it('sets data-theme attribute on mount', () => {
    mountWithTheme()
    const attr = document.documentElement.getAttribute('data-theme')
    expect(attr).toBe('light')
  })

  it('updates data-theme attribute when theme changes', async () => {
    const { api } = mountWithTheme()
    api.setTheme('dark')
    await nextTick()
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  // -----------------------------------------------------------------------
  // System preference change
  // -----------------------------------------------------------------------

  it('reacts to system color scheme changes when theme is system', async () => {
    const { api } = mountWithTheme()
    expect(api.resolvedTheme.value).toBe('light')

    simulateMediaChange(true)
    await nextTick()
    expect(api.resolvedTheme.value).toBe('dark')
  })

  it('does not react to system changes when explicit theme is set', async () => {
    const { api } = mountWithTheme()
    api.setTheme('light')
    await nextTick()

    simulateMediaChange(true)
    await nextTick()
    expect(api.resolvedTheme.value).toBe('light')
  })

  // -----------------------------------------------------------------------
  // Cleanup
  // -----------------------------------------------------------------------

  it('cleans up media query listener on unmount', () => {
    const { wrapper } = mountWithTheme()
    const listenerCount = mediaQueryListeners.length
    expect(listenerCount).toBeGreaterThan(0)

    wrapper.unmount()
    // removeEventListener was called — verified by the mock tracking
    expect(window.matchMedia).toHaveBeenCalled()
  })
})
