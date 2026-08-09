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
