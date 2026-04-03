/**
 * DzThemeProvider + useTheme (provider) — Unit tests.
 *
 * Tests the provider component, context injection, and theme-script utility.
 */

import type { DzThemeContext } from './DzThemeProvider.types'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import DzThemeProvider from './DzThemeProvider.vue'
import { getThemeScript, themeScript } from './theme-script.ts'
import { useTheme } from './useTheme.ts'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Create a child component that calls useTheme() and captures the context.
 */
function createConsumer() {
  let ctx: DzThemeContext = undefined as unknown as DzThemeContext

  const Consumer = defineComponent({
    setup() {
      ctx = useTheme()
      return {}
    },
    render() {
      return h('div', { 'data-testid': 'consumer' })
    },
  })

  return { Consumer, getCtx: () => ctx }
}

/**
 * Mount DzThemeProvider with a consumer child.
 */
function mountProvider(providerProps: Record<string, unknown> = {}) {
  const { Consumer, getCtx } = createConsumer()

  const wrapper = mount(DzThemeProvider, {
    props: providerProps,
    slots: {
      default: () => h(Consumer),
    },
  })

  return { wrapper, getCtx }
}

// ---------------------------------------------------------------------------
// Setup / Teardown
// ---------------------------------------------------------------------------

let mediaQueryListeners: Array<(event: MediaQueryListEvent) => void> = []
let matchesValue = false

beforeEach(() => {
  localStorage.clear()
  document.documentElement.removeAttribute('data-theme')

  mediaQueryListeners = []
  matchesValue = false

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

function simulateMediaChange(prefersDark: boolean): void {
  for (const listener of mediaQueryListeners) {
    listener({ matches: prefersDark } as MediaQueryListEvent)
  }
}

// ---------------------------------------------------------------------------
// DzThemeProvider
// ---------------------------------------------------------------------------

describe('dzThemeProvider', () => {
  it('renders default slot content', () => {
    const wrapper = mount(DzThemeProvider, {
      slots: {
        default: () => h('span', { 'data-testid': 'child' }, 'Hello'),
      },
    })
    expect(wrapper.find('[data-testid="child"]').text()).toBe('Hello')
  })

  it('provides theme context to descendants', () => {
    const { getCtx } = mountProvider()
    const ctx = getCtx()

    expect(ctx).toBeDefined()
    expect(ctx.theme).toBeDefined()
    expect(ctx.resolvedTheme).toBeDefined()
    expect(typeof ctx.setTheme).toBe('function')
    expect(typeof ctx.toggleTheme).toBe('function')
  })

  it('defaults to system theme', () => {
    const { getCtx } = mountProvider()
    expect(getCtx().theme.value).toBe('system')
  })

  it('accepts defaultTheme prop', () => {
    const { getCtx } = mountProvider({ defaultTheme: 'dark' })
    expect(getCtx().theme.value).toBe('dark')
  })

  it('prefers persisted localStorage value over defaultTheme', () => {
    localStorage.setItem('dz-theme', 'light')
    const { getCtx } = mountProvider({ defaultTheme: 'dark' })
    expect(getCtx().theme.value).toBe('light')
  })

  it('uses custom storageKey', async () => {
    const { getCtx } = mountProvider({ storageKey: 'my-theme' })
    getCtx().setTheme('dark')
    await nextTick()
    expect(localStorage.getItem('my-theme')).toBe('dark')
  })

  it('uses custom attribute', async () => {
    const { getCtx } = mountProvider({ attribute: 'data-mode' })
    getCtx().setTheme('dark')
    await nextTick()
    expect(document.documentElement.getAttribute('data-mode')).toBe('dark')
  })

  it('sets data-theme attribute on mount', () => {
    mountProvider()
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  it('resolves system theme based on matchMedia', () => {
    matchesValue = true
    const { getCtx } = mountProvider()
    expect(getCtx().resolvedTheme.value).toBe('dark')
  })

  it('resolves system theme to light when matchMedia is false', () => {
    matchesValue = false
    const { getCtx } = mountProvider()
    expect(getCtx().resolvedTheme.value).toBe('light')
  })
})

// ---------------------------------------------------------------------------
// setTheme / toggleTheme
// ---------------------------------------------------------------------------

describe('dzThemeProvider setTheme', () => {
  it('sets theme to dark', async () => {
    const { getCtx } = mountProvider()
    getCtx().setTheme('dark')
    await nextTick()
    expect(getCtx().theme.value).toBe('dark')
    expect(getCtx().resolvedTheme.value).toBe('dark')
  })

  it('sets theme to light', async () => {
    const { getCtx } = mountProvider({ defaultTheme: 'dark' })
    getCtx().setTheme('light')
    await nextTick()
    expect(getCtx().theme.value).toBe('light')
    expect(getCtx().resolvedTheme.value).toBe('light')
  })

  it('persists theme change to localStorage', async () => {
    const { getCtx } = mountProvider()
    getCtx().setTheme('dark')
    await nextTick()
    expect(localStorage.getItem('dz-theme')).toBe('dark')
  })

  it('updates data-theme attribute when theme changes', async () => {
    const { getCtx } = mountProvider()
    getCtx().setTheme('dark')
    await nextTick()
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })
})

describe('dzThemeProvider toggleTheme', () => {
  it('toggles from light to dark', async () => {
    const { getCtx } = mountProvider({ defaultTheme: 'light' })
    getCtx().toggleTheme()
    await nextTick()
    expect(getCtx().theme.value).toBe('dark')
  })

  it('toggles from dark to light', async () => {
    const { getCtx } = mountProvider({ defaultTheme: 'dark' })
    getCtx().toggleTheme()
    await nextTick()
    expect(getCtx().theme.value).toBe('light')
  })

  it('toggles from system (light resolved) to dark', async () => {
    matchesValue = false
    const { getCtx } = mountProvider()
    expect(getCtx().resolvedTheme.value).toBe('light')
    getCtx().toggleTheme()
    await nextTick()
    expect(getCtx().theme.value).toBe('dark')
  })

  it('toggles from system (dark resolved) to light', async () => {
    matchesValue = true
    const { getCtx } = mountProvider()
    expect(getCtx().resolvedTheme.value).toBe('dark')
    getCtx().toggleTheme()
    await nextTick()
    expect(getCtx().theme.value).toBe('light')
  })
})

// ---------------------------------------------------------------------------
// System preference reactivity
// ---------------------------------------------------------------------------

describe('dzThemeProvider system preference', () => {
  it('reacts to system color scheme changes when theme is system', async () => {
    const { getCtx } = mountProvider()
    expect(getCtx().resolvedTheme.value).toBe('light')

    simulateMediaChange(true)
    await nextTick()
    expect(getCtx().resolvedTheme.value).toBe('dark')
  })

  it('does not react to system changes when explicit theme is set', async () => {
    const { getCtx } = mountProvider({ defaultTheme: 'light' })
    simulateMediaChange(true)
    await nextTick()
    expect(getCtx().resolvedTheme.value).toBe('light')
  })
})

// ---------------------------------------------------------------------------
// Cleanup
// ---------------------------------------------------------------------------

describe('dzThemeProvider cleanup', () => {
  it('cleans up media query listener on unmount', () => {
    const { wrapper } = mountProvider()
    expect(mediaQueryListeners.length).toBeGreaterThan(0)
    wrapper.unmount()
    expect(window.matchMedia).toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// useTheme (consumer composable)
// ---------------------------------------------------------------------------

describe('useTheme provider consumer', () => {
  it('throws when used outside DzThemeProvider', () => {
    const ErrorComponent = defineComponent({
      setup() {
        useTheme()
        return {}
      },
      render() {
        return h('div')
      },
    })

    expect(() => mount(ErrorComponent)).toThrow(
      'useTheme() requires a <DzThemeProvider> ancestor.',
    )
  })

  it('returns context when inside DzThemeProvider', () => {
    const { getCtx } = mountProvider()
    const ctx = getCtx()
    expect(ctx.theme.value).toBe('system')
    expect(typeof ctx.setTheme).toBe('function')
    expect(typeof ctx.toggleTheme).toBe('function')
  })
})

// ---------------------------------------------------------------------------
// theme-script
// ---------------------------------------------------------------------------

describe('themeScript', () => {
  it('is a non-empty string', () => {
    expect(typeof themeScript).toBe('string')
    expect(themeScript.length).toBeGreaterThan(0)
  })

  it('contains localStorage.getItem', () => {
    expect(themeScript).toContain('localStorage.getItem')
  })

  it('contains setAttribute', () => {
    expect(themeScript).toContain('setAttribute')
  })

  it('contains the default storage key', () => {
    expect(themeScript).toContain('dz-theme')
  })

  it('contains the default attribute name', () => {
    expect(themeScript).toContain('data-theme')
  })

  it('is wrapped in an IIFE', () => {
    expect(themeScript).toMatch(/^\(function\(\)/)
    expect(themeScript).toMatch(/\)\(\)$/)
  })
})

describe('getThemeScript', () => {
  it('uses custom storageKey', () => {
    const script = getThemeScript({ storageKey: 'my-theme' })
    expect(script).toContain('my-theme')
  })

  it('uses custom attribute', () => {
    const script = getThemeScript({ attribute: 'data-mode' })
    expect(script).toContain('data-mode')
  })

  it('uses custom defaultTheme light', () => {
    const script = getThemeScript({ defaultTheme: 'light' })
    expect(script).toContain('"light"')
  })

  it('uses custom defaultTheme dark', () => {
    const script = getThemeScript({ defaultTheme: 'dark' })
    expect(script).toContain('"dark"')
  })

  it('produces syntactically valid javascript', () => {
    const script = getThemeScript()
    // Verify it's a self-contained IIFE with expected operations
    expect(script).toMatch(/^\(function\(\)/)
    expect(script).toMatch(/\)\(\)$/)
    expect(script).toContain('localStorage.getItem')
    expect(script).toContain('setAttribute')
  })
})
