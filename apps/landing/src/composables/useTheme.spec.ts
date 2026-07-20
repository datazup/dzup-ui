/**
 * Tests for the landing theme controller (TASK-FREE2-08).
 *
 * Two jobs are pinned here:
 *
 *  1. The three-way mode machine — light / dark / system — including the one
 *     that used to be unreachable from the UI: `system`, and its live tracking
 *     of the OS preference.
 *  2. Persistence under the `dz-theme` key the FOUC IIFE in index.html reads.
 *
 * The other half of the story — that `<html data-theme>` is written by BOTH this
 * singleton and the DzThemeProvider App.vue wraps the site in — lives in
 * `themeSync.spec.ts`, which pins the bridge that reconciles them.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

// --- OS preference harness -------------------------------------------------

type MediaListener = (event: { matches: boolean }) => void

let osPrefersDark = false
const listeners = new Set<MediaListener>()

/** Flip the OS preference and notify everything listening, as the browser does. */
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

/** A fresh module graph, so the useTheme singleton is rebuilt per test. */
async function freshUseTheme() {
  vi.resetModules()
  return import('./useTheme.ts')
}

function theme(): string | null {
  return document.documentElement.getAttribute('data-theme')
}

beforeEach(() => {
  localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
  installMatchMedia()
})

// ---------------------------------------------------------------------------
// Mode transitions
// ---------------------------------------------------------------------------

describe('useTheme: mode transitions', () => {
  it('defaults to system and resolves against the OS', async () => {
    setOsPrefersDark(true)
    const { useTheme } = await freshUseTheme()
    const { mode, resolved } = useTheme()

    expect(mode.value).toBe('system')
    expect(resolved.value).toBe('dark')
    expect(theme()).toBe('dark')
  })

  it('setMode pins an explicit mode and applies it', async () => {
    const { useTheme } = await freshUseTheme()
    const { mode, resolved, setMode } = useTheme()

    setMode('dark')
    await nextTick()

    expect(mode.value).toBe('dark')
    expect(resolved.value).toBe('dark')
    expect(theme()).toBe('dark')
  })

  it('setMode("system") returns to following the OS — the transition the UI used to make unreachable', async () => {
    setOsPrefersDark(true)
    const { useTheme } = await freshUseTheme()
    const { mode, resolved, setMode } = useTheme()

    setMode('light')
    await nextTick()
    expect(resolved.value).toBe('light')

    setMode('system')
    await nextTick()

    expect(mode.value).toBe('system')
    expect(resolved.value).toBe('dark')
    expect(theme()).toBe('dark')
  })

  it('toggle() flips relative to what is on screen, pinning an explicit mode', async () => {
    setOsPrefersDark(true)
    const { useTheme } = await freshUseTheme()
    const { mode, toggle } = useTheme()

    // Resolved is dark (via system), so a toggle means "give me light".
    toggle()
    await nextTick()
    expect(mode.value).toBe('light')

    toggle()
    await nextTick()
    expect(mode.value).toBe('dark')
  })
})

// ---------------------------------------------------------------------------
// System tracking
// ---------------------------------------------------------------------------

describe('useTheme: system tracking', () => {
  it('follows a live OS flip while in system mode', async () => {
    const { useTheme } = await freshUseTheme()
    const { resolved } = useTheme()
    expect(resolved.value).toBe('light')

    setOsPrefersDark(true)
    await nextTick()

    expect(resolved.value).toBe('dark')
    expect(theme()).toBe('dark')
  })

  it('ignores an OS flip once a mode is pinned', async () => {
    const { useTheme } = await freshUseTheme()
    const { setMode, resolved } = useTheme()

    setMode('light')
    await nextTick()

    setOsPrefersDark(true)
    await nextTick()

    expect(resolved.value).toBe('light')
    expect(theme()).toBe('light')
  })
})

// ---------------------------------------------------------------------------
// Persistence — the FOUC script in index.html reads this key
// ---------------------------------------------------------------------------

describe('useTheme: persistence', () => {
  // Seeded with a *different* stored mode each time, so every case is a real
  // transition. Selecting the mode you are already in is a no-op that persists
  // nothing — harmless, because an absent key already reads back as `system`.
  it.each([
    { from: 'system', to: 'light' },
    { from: 'system', to: 'dark' },
    { from: 'light', to: 'system' },
    { from: 'dark', to: 'light' },
  ] as const)('persists $to under dz-theme when coming from $from', async ({ from, to }) => {
    localStorage.setItem('dz-theme', from)
    const { useTheme } = await freshUseTheme()
    const { setMode } = useTheme()

    setMode(to)
    await nextTick()

    expect(localStorage.getItem('dz-theme')).toBe(to)
  })

  it('restores a stored system preference on load', async () => {
    localStorage.setItem('dz-theme', 'system')
    setOsPrefersDark(true)

    const { useTheme } = await freshUseTheme()
    const { mode, resolved } = useTheme()

    expect(mode.value).toBe('system')
    expect(resolved.value).toBe('dark')
  })

  it('restores a stored explicit preference on load', async () => {
    localStorage.setItem('dz-theme', 'light')
    setOsPrefersDark(true)

    const { useTheme } = await freshUseTheme()
    const { mode, resolved } = useTheme()

    expect(mode.value).toBe('light')
    expect(resolved.value).toBe('light')
    expect(theme()).toBe('light')
  })

  it('falls back to system for a corrupt stored value', async () => {
    localStorage.setItem('dz-theme', 'chartreuse')
    const { useTheme } = await freshUseTheme()
    expect(useTheme().mode.value).toBe('system')
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

  beforeEach(() => {
    document.head.querySelectorAll('meta[name="theme-color"]').forEach(m => m.remove())
    installMetas()
  })

  it('leaves both metas on their media query in system mode', async () => {
    const { useTheme } = await freshUseTheme()
    useTheme()

    // The OS owns the choice here, which is exactly what the media queries express.
    expect(metaFor('light').media).toBe('(prefers-color-scheme: light)')
    expect(metaFor('dark').media).toBe('(prefers-color-scheme: dark)')
  })

  it('forces the dark meta when the user overrides a light OS', async () => {
    setOsPrefersDark(false)
    const { useTheme } = await freshUseTheme()
    const { setMode } = useTheme()

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
    setOsPrefersDark(true)
    const { useTheme } = await freshUseTheme()
    const { setMode } = useTheme()

    setMode('light')
    await nextTick()

    expect(theme()).toBe('light')
    expect(metaFor('light').media).toBe('all')
    expect(metaFor('dark').media).toBe('none')
  })

  it('hands control back to the OS when the user returns to system', async () => {
    setOsPrefersDark(false)
    const { useTheme } = await freshUseTheme()
    const { setMode } = useTheme()

    setMode('dark')
    await nextTick()
    setMode('system')
    await nextTick()

    expect(metaFor('light').media).toBe('(prefers-color-scheme: light)')
    expect(metaFor('dark').media).toBe('(prefers-color-scheme: dark)')
  })

  it('never rewrites the brand literals — only which tag applies', async () => {
    const { useTheme } = await freshUseTheme()
    const { setMode } = useTheme()

    setMode('dark')
    await nextTick()
    setMode('light')
    await nextTick()

    // The guard recomputes these from tokens.css; the runtime must not touch them.
    expect(metaFor('light').content).toBe('#0766ee')
    expect(metaFor('dark').content).toBe('#004ecb')
  })

  it('tracks an OS flip while in system mode', async () => {
    setOsPrefersDark(false)
    const { useTheme } = await freshUseTheme()
    useTheme()

    setOsPrefersDark(true)
    await nextTick()

    expect(theme()).toBe('dark')
    // Still media-driven: system mode must not pin a tag.
    expect(metaFor('dark').media).toBe('(prefers-color-scheme: dark)')
  })
})
