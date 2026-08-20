import type { ThemeMode } from './useTheme.ts'
import { DzThemeProvider } from '@dzup-ui/core'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import { THEME_MODES, useTheme } from './useTheme.ts'

type ThemeFacade = ReturnType<typeof useTheme>
type MediaListener = (event: { matches: boolean }) => void

let prefersDark = false
const mediaListeners = new Set<MediaListener>()

function installMatchMedia(): void {
  prefersDark = false
  mediaListeners.clear()
  vi.stubGlobal('matchMedia', (query: string) => ({
    get matches() {
      return query.includes('dark') && prefersDark
    },
    media: query,
    addEventListener: (_type: string, listener: MediaListener) => mediaListeners.add(listener),
    removeEventListener: (_type: string, listener: MediaListener) => mediaListeners.delete(listener),
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
    onchange: null,
  }))
}

function setSystemDark(value: boolean): void {
  prefersDark = value
  for (const listener of mediaListeners)
    listener({ matches: value })
}

async function mountFacade(): Promise<ThemeFacade> {
  let facade: ThemeFacade | undefined
  const Consumer = defineComponent({
    setup() {
      facade = useTheme()
      return () => null
    },
  })
  mount(defineComponent({
    setup: () => () => h(DzThemeProvider, null, { default: () => h(Consumer) }),
  }))
  await nextTick()
  return facade!
}

beforeEach(() => {
  localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
  installMatchMedia()
})

describe('landing theme facade', () => {
  it('exposes every provider mode without a second store', async () => {
    const { mode, resolved, setMode } = await mountFacade()
    expect(THEME_MODES).toEqual<ThemeMode[]>(['light', 'dark', 'system'])
    expect(mode.value).toBe('system')
    expect(resolved.value).toBe('light')

    setMode('dark')
    await nextTick()
    expect(mode.value).toBe('dark')
    expect(resolved.value).toBe('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(localStorage.getItem('dz-theme')).toBe('dark')
  })

  it('follows system changes only while the provider preference is system', async () => {
    const { resolved, setMode } = await mountFacade()
    setSystemDark(true)
    await nextTick()
    expect(resolved.value).toBe('dark')

    setMode('light')
    await nextTick()
    setSystemDark(false)
    setSystemDark(true)
    await nextTick()
    expect(resolved.value).toBe('light')
  })

  it('restores the provider-owned persisted preference', async () => {
    localStorage.setItem('dz-theme', 'dark')
    const { mode, resolved } = await mountFacade()
    expect(mode.value).toBe('dark')
    expect(resolved.value).toBe('dark')
  })
})

// ---------------------------------------------------------------------------
// Browser-chrome colour (TASK-FREE3-08)
// ---------------------------------------------------------------------------

/**
 * `index.html` ships two `<meta name="theme-color">` tags with
 * `prefers-color-scheme` media. Those handle the OS preference by themselves —
 * what they cannot see is this app's MANUAL override, so a visitor on a light OS
 * who picks dark got a dark page framed in light-blue browser chrome.
 *
 * The controller resolves that by switching which tag APPLIES (`media="all"` vs
 * `media="none"`) rather than by rewriting a colour, which keeps the two brand
 * literals in the HTML where the drift guard in `@dzup-ui/tooling`
 * (`landing-token-fallbacks.spec.ts`) can still recompute them from the ramp.
 */
describe('useTheme: theme-color meta', () => {
  /** Rebuild the pair of metas the way index.html ships them. */
  function installMetas(): void {
    for (const scheme of ['light', 'dark'] as const) {
      const meta = document.createElement('meta')
      meta.name = 'theme-color'
      meta.media = `(prefers-color-scheme: ${scheme})`
      meta.dataset.scheme = scheme
      meta.content = scheme === 'light' ? '#0766ee' : '#004ecb'
      document.head.appendChild(meta)
    }
  }

  function metaFor(scheme: 'light' | 'dark'): HTMLMetaElement {
    return document.head.querySelector<HTMLMetaElement>(
      `meta[name="theme-color"][data-scheme="${scheme}"]`,
    )!
  }

  function theme(): string | null {
    return document.documentElement.getAttribute('data-theme')
  }

  beforeEach(() => {
    document.head.querySelectorAll('meta[name="theme-color"]').forEach(m => m.remove())
    installMetas()
  })

  it('leaves both metas on their media query in system mode', async () => {
    await mountFacade()

    // The OS owns the choice here, which is exactly what the media queries express.
    expect(metaFor('light').media).toBe('(prefers-color-scheme: light)')
    expect(metaFor('dark').media).toBe('(prefers-color-scheme: dark)')
  })

  it('forces the dark meta when the user overrides a light OS', async () => {
    const { setMode } = await mountFacade()
    setSystemDark(false)

    setMode('dark')
    await nextTick()

    expect(theme()).toBe('dark')
    expect(metaFor('dark').media, 'the dark meta must apply unconditionally').toBe('all')
    expect(
      metaFor('light').media,
      'the light meta must stop matching, or the chrome stays light-branded',
    ).toBe('none')
  })

  it('forces the light meta when the user overrides a dark OS', async () => {
    const { setMode } = await mountFacade()
    setSystemDark(true)
    await nextTick()

    setMode('light')
    await nextTick()

    expect(theme()).toBe('light')
    expect(metaFor('light').media).toBe('all')
    expect(metaFor('dark').media).toBe('none')
  })

  it('hands control back to the OS when the user returns to system', async () => {
    const { setMode } = await mountFacade()
    setSystemDark(false)

    setMode('dark')
    await nextTick()
    setMode('system')
    await nextTick()

    expect(metaFor('light').media).toBe('(prefers-color-scheme: light)')
    expect(metaFor('dark').media).toBe('(prefers-color-scheme: dark)')
  })

  it('never rewrites the brand literals — only which tag applies', async () => {
    const { setMode } = await mountFacade()

    setMode('dark')
    await nextTick()
    setMode('light')
    await nextTick()

    // The guard recomputes these from tokens.css; the runtime must not touch them.
    expect(metaFor('light').content).toBe('#0766ee')
    expect(metaFor('dark').content).toBe('#004ecb')
  })

  it('tracks an OS flip while in system mode', async () => {
    await mountFacade()
    setSystemDark(false)

    setSystemDark(true)
    await nextTick()

    expect(theme()).toBe('dark')
    // Still media-driven: system mode must not pin a tag.
    expect(metaFor('dark').media).toBe('(prefers-color-scheme: dark)')
  })
})
