/**
 * DzThemeProvider + useTheme (provider) — Unit tests.
 *
 * Tests the provider component, context injection, and theme-script utility.
 */

import type { DzThemeContext } from './DzThemeProvider.types'
import { renderToString } from '@vue/server-renderer'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createSSRApp, defineComponent, h, nextTick } from 'vue'
import DzColorModeToggle from '../components/navigation/DzColorModeToggle.vue'
import DzProvider from './DzProvider.vue'
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

describe('dzThemeProvider transition-suppression nonce (UI-DZUP-UI-SEC-L-09)', () => {
  /** Keep the suppression tag in <head> past the frame that would remove it. */
  // Tags injected by earlier tests may still be waiting for their frame.
  function removeSuppressionTags(): void {
    document.querySelectorAll('#dz-theme-no-transition').forEach(tag => tag.remove())
  }

  beforeEach(() => {
    removeSuppressionTags()
    vi.stubGlobal('requestAnimationFrame', () => 0)
  })

  afterEach(() => {
    removeSuppressionTags()
    vi.unstubAllGlobals()
  })

  function suppressionTag(): HTMLStyleElement | null {
    const tags = document.querySelectorAll<HTMLStyleElement>('#dz-theme-no-transition')
    expect(tags).toHaveLength(1)
    return tags[0] ?? null
  }

  it('puts its own nonce on the injected style tag', async () => {
    const { getCtx } = mountProvider({ nonce: 'abc' })
    getCtx().setTheme('dark')
    await nextTick()
    expect(suppressionTag()?.getAttribute('nonce')).toBe('abc')
  })

  it('inherits the nonce of an outer DzProvider when it has none of its own', async () => {
    const { Consumer, getCtx } = createConsumer()
    mount(DzProvider, {
      props: { nonce: 'outer' },
      slots: { default: () => h(DzThemeProvider, null, { default: () => h(Consumer) }) },
    })
    getCtx().setTheme('dark')
    await nextTick()
    expect(suppressionTag()?.getAttribute('nonce')).toBe('outer')
  })

  it('carries no nonce when neither it nor an ancestor supplies one', async () => {
    const { getCtx } = mountProvider()
    getCtx().setTheme('dark')
    await nextTick()
    expect(suppressionTag()).not.toBeNull()
    expect(suppressionTag()?.hasAttribute('nonce')).toBe(false)
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
// SSR + hydration (UI-DZUP-UI-DESIGN-M-09)
// ---------------------------------------------------------------------------

describe('dzThemeProvider hydration with a persisted theme', () => {
  const root = () => h(DzThemeProvider, { defaultTheme: 'light' }, {
    default: () => h(DzColorModeToggle),
  })

  it('first client render matches the server; the persisted value applies after mount', async () => {
    // The server has no storage: render with nothing persisted.
    const server = await renderToString(createSSRApp({ render: root }))
    expect(server).toContain('data-mode="light"')

    // The browser has "dark" persisted from an earlier visit.
    localStorage.setItem('dz-theme', 'dark')
    const container = document.createElement('div')
    container.innerHTML = server
    const baseline = container.innerHTML
    document.body.appendChild(container)

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const app = createSSRApp({ render: root })
    app.mount(container)

    // Hydration claimed the server markup unchanged and raised no mismatch.
    expect(container.innerHTML).toBe(baseline)
    const diagnostics = [...warn.mock.calls, ...error.mock.calls].map(args => String(args[0]))
    expect(diagnostics.filter(m => /hydration/i.test(m))).toEqual([])

    // After mount the persisted preference is applied.
    await nextTick()
    expect(container.querySelector('[data-mode]')!.getAttribute('data-mode')).toBe('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')

    app.unmount()
    container.remove()
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

  it('cannot be broken out of its <script> element by an option value (UI-DZUP-UI-SEC-L-06)', () => {
    const script = getThemeScript({ storageKey: '</script><b>', attribute: 'data-x<!--' })
    expect(script).not.toMatch(/<\/script/i)
    expect(script).not.toContain('<!--')
    expect(script).not.toMatch(/[<>&\u2028\u2029]/)
  })

  it('still reads and writes the exact escaped values at run time', () => {
    const key = '</script><b>&\u2028'
    const { attributes, reads } = runThemeScript(getThemeScript({ storageKey: key, attribute: 'data-a&b' }), { stored: 'dark' })
    expect(reads).toEqual([key])
    expect(attributes).toEqual({ 'data-a&b': 'dark' })
  })

  it('rejects a defaultTheme or direction outside its union', () => {
    expect(() => getThemeScript({ defaultTheme: '"-alert(1)-"' as never })).toThrow(TypeError)
    expect(() => getThemeScript({ direction: 'sideways' as never })).toThrow(TypeError)
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

/**
 * Run a generated script against a recording `<html>`, a stubbed storage and a
 * stubbed `prefers-color-scheme`, and return the attributes it wrote. The
 * behaviour is asserted, not the string: a substring check passes a script
 * that reads the right key and then ignores what it read.
 */
function runThemeScript(
  script: string,
  { stored = null, osDark = false, storageThrows = false }: { stored?: string | null, osDark?: boolean, storageThrows?: boolean } = {},
): { attributes: Record<string, string>, reads: string[] } {
  const attributes: Record<string, string> = {}
  const reads: string[] = []
  const localStorage = {
    getItem: (key: string) => {
      if (storageThrows)
        throw new Error('SecurityError')
      reads.push(key)
      return stored
    },
  }
  const window = { matchMedia: (query: string) => ({ matches: osDark && query.includes('dark') }) }
  const document = {
    documentElement: {
      setAttribute: (name: string, value: string) => {
        attributes[name] = value
      },
    },
  }
  // eslint-disable-next-line no-new-func -- evaluating the generated script is the point of the test
  new Function('window', 'document', 'localStorage', script)(window, document, localStorage)
  return { attributes, reads }
}

describe('getThemeScript behaviour (UI-DZUP-UI-DESIGN-M-08)', () => {
  it('honours a persisted "system" over a light default, resolving it from the OS', () => {
    const script = getThemeScript({ defaultTheme: 'light' })
    expect(runThemeScript(script, { stored: 'system', osDark: true }).attributes['data-theme']).toBe('dark')
    expect(runThemeScript(script, { stored: 'system', osDark: false }).attributes['data-theme']).toBe('light')
  })

  it('honours a persisted "system" over a dark default', () => {
    const script = getThemeScript({ defaultTheme: 'dark' })
    expect(runThemeScript(script, { stored: 'system', osDark: false }).attributes['data-theme']).toBe('light')
  })

  it('uses a persisted light or dark as-is', () => {
    const script = getThemeScript({ defaultTheme: 'system' })
    expect(runThemeScript(script, { stored: 'dark', osDark: false }).attributes['data-theme']).toBe('dark')
    expect(runThemeScript(script, { stored: 'light', osDark: true }).attributes['data-theme']).toBe('light')
  })

  it('uses a persisted high-contrast as-is, as the provider does (UI-DZUP-UI-DESIGN-M-07)', () => {
    const script = getThemeScript({ defaultTheme: 'light' })
    expect(runThemeScript(script, { stored: 'high-contrast', osDark: true }).attributes['data-theme']).toBe('high-contrast')
  })

  it('falls back to defaultTheme for nothing stored or a foreign value', () => {
    expect(runThemeScript(getThemeScript({ defaultTheme: 'dark' })).attributes['data-theme']).toBe('dark')
    expect(runThemeScript(getThemeScript({ defaultTheme: 'light' }), { stored: 'sepia', osDark: true }).attributes['data-theme']).toBe('light')
    expect(runThemeScript(getThemeScript(), { osDark: true }).attributes['data-theme']).toBe('dark')
  })

  it('reads the configured key and writes the configured attribute', () => {
    const { attributes, reads } = runThemeScript(getThemeScript({ storageKey: 'acme-mode', attribute: 'data-mode' }), { stored: 'dark' })
    expect(reads).toEqual(['acme-mode'])
    expect(attributes).toEqual({ 'data-mode': 'dark' })
  })

  it('still applies the default when storage access throws', () => {
    const { attributes } = runThemeScript(getThemeScript({ defaultTheme: 'dark' }), { storageThrows: true })
    expect(attributes['data-theme']).toBe('dark')
  })

  it('ignores storage entirely when persist is false, as the provider does', () => {
    const { attributes, reads } = runThemeScript(getThemeScript({ persist: false, defaultTheme: 'light' }), { stored: 'dark' })
    expect(reads).toEqual([])
    expect(attributes['data-theme']).toBe('light')
  })

  it('writes dir beside the theme only when a direction is declared', () => {
    expect(runThemeScript(getThemeScript({ locale: 'ar-EG' })).attributes.dir).toBe('rtl')
    expect(runThemeScript(getThemeScript({ locale: 'ar-EG', direction: 'ltr' })).attributes.dir).toBe('ltr')
    expect(runThemeScript(getThemeScript()).attributes).not.toHaveProperty('dir')
  })
})
