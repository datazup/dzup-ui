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
