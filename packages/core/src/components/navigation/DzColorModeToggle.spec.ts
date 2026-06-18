/**
 * DzColorModeToggle — behaviour tests (provider-backed).
 *
 * Mounts the control inside a real DzThemeProvider so the full path is
 * exercised: cycling modes, reflecting external theme changes, live
 * system-following via `prefers-color-scheme`, and persistence — all delegated
 * to the provider (no parallel store).
 */

import type { DzThemeContext } from '../../providers/DzThemeProvider.types.ts'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import DzThemeProvider from '../../providers/DzThemeProvider.vue'
import { useTheme } from '../../providers/useTheme.ts'
import DzColorModeToggle from './DzColorModeToggle.vue'

// ---------------------------------------------------------------------------
// matchMedia mock (mirrors DzThemeProvider.spec.ts)
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
// Harness — provider + toggle + a consumer that captures the context
// ---------------------------------------------------------------------------

function mountToggle(
  toggleProps: Record<string, unknown> = {},
  providerProps: Record<string, unknown> = {},
) {
  let ctx: DzThemeContext = undefined as unknown as DzThemeContext

  const Consumer = defineComponent({
    setup() {
      ctx = useTheme()
      return () => h('div', { 'data-testid': 'consumer' })
    },
  })

  const wrapper = mount(DzThemeProvider, {
    props: providerProps,
    slots: {
      default: () => [h(DzColorModeToggle, toggleProps), h(Consumer)],
    },
  })

  const toggle = wrapper.findComponent(DzColorModeToggle)
  return { wrapper, toggle, getCtx: () => ctx }
}

// ---------------------------------------------------------------------------
// Icon variant — cycling
// ---------------------------------------------------------------------------

describe('dzColorModeToggle icon variant', () => {
  it('cycles system → light → dark → system on repeated activation', async () => {
    const { toggle, getCtx } = mountToggle({ variant: 'icon' })
    const button = toggle.find('button')

    expect(getCtx().theme.value).toBe('system')

    await button.trigger('click')
    expect(getCtx().theme.value).toBe('light')

    await button.trigger('click')
    expect(getCtx().theme.value).toBe('dark')

    await button.trigger('click')
    expect(getCtx().theme.value).toBe('system')
  })

  it('omits the system step when showSystem is false', async () => {
    const { toggle, getCtx } = mountToggle({ variant: 'icon', showSystem: false }, { defaultTheme: 'light' })
    const button = toggle.find('button')

    await button.trigger('click')
    expect(getCtx().theme.value).toBe('dark')

    await button.trigger('click')
    expect(getCtx().theme.value).toBe('light')
  })

  it('emits change with the mode it switched to', async () => {
    const { toggle } = mountToggle({ variant: 'icon' }, { defaultTheme: 'light' })
    await toggle.find('button').trigger('click')
    expect(toggle.emitted('change')![0]).toEqual(['dark'])
  })

  it('updates its accessible label to describe the next action', async () => {
    const { toggle } = mountToggle({ variant: 'icon' }, { defaultTheme: 'light' })
    expect(toggle.find('button').attributes('aria-label')).toBe('Switch to dark theme')
    await toggle.find('button').trigger('click')
    expect(toggle.find('button').attributes('aria-label')).toBe('Switch to system theme')
  })

  it('persists the chosen preference through the provider', async () => {
    const { toggle } = mountToggle({ variant: 'icon' }, { defaultTheme: 'light' })
    await toggle.find('button').trigger('click')
    await nextTick()
    expect(localStorage.getItem('dz-theme')).toBe('dark')
  })
})

// ---------------------------------------------------------------------------
// Switch variant — reflects resolved mode
// ---------------------------------------------------------------------------

describe('dzColorModeToggle switch variant', () => {
  it('exposes role="switch" with aria-checked tracking the dark mode', async () => {
    const { toggle, getCtx } = mountToggle({ variant: 'switch' }, { defaultTheme: 'light' })
    const control = toggle.find('[role="switch"]')
    expect(control.exists()).toBe(true)
    expect(control.attributes('aria-checked')).toBe('false')

    getCtx().setTheme('dark')
    await nextTick()
    expect(toggle.find('[role="switch"]').attributes('aria-checked')).toBe('true')
  })

  it('labels the switch element with the opposite-mode action', async () => {
    const { toggle } = mountToggle({ variant: 'switch' }, { defaultTheme: 'light' })
    expect(toggle.find('[role="switch"]').attributes('aria-label')).toBe('Switch to dark theme')
  })

  it('toggles light ⇄ dark on activation', async () => {
    const { toggle, getCtx } = mountToggle({ variant: 'switch' }, { defaultTheme: 'light' })
    await toggle.find('button').trigger('click')
    expect(getCtx().resolvedTheme.value).toBe('dark')
    expect(toggle.emitted('change')![0]).toEqual(['dark'])
  })

  it('reflects an external theme change made via the provider', async () => {
    const { toggle, getCtx } = mountToggle({ variant: 'switch' }, { defaultTheme: 'light' })
    expect(toggle.find('[role="switch"]').attributes('aria-checked')).toBe('false')

    getCtx().setTheme('dark')
    await nextTick()
    expect(toggle.find('[role="switch"]').attributes('aria-checked')).toBe('true')
  })

  it('follows prefers-color-scheme live when the mode is system', async () => {
    const { toggle } = mountToggle({ variant: 'switch' })
    // theme = 'system', matchMedia = light → switch off
    expect(toggle.find('[role="switch"]').attributes('aria-checked')).toBe('false')

    simulateMediaChange(true)
    await nextTick()
    expect(toggle.find('[role="switch"]').attributes('aria-checked')).toBe('true')
  })
})

// ---------------------------------------------------------------------------
// Segmented variant — explicit selection
// ---------------------------------------------------------------------------

describe('dzColorModeToggle segmented variant', () => {
  it('sets the preference to the activated segment', async () => {
    const { toggle, getCtx } = mountToggle({ variant: 'segmented' }, { defaultTheme: 'light' })
    const buttons = toggle.findAll('button')
    // order: [light, dark, system] → index 1 is dark
    await buttons[1]!.trigger('click')
    expect(getCtx().theme.value).toBe('dark')
    expect(toggle.emitted('change')![0]).toEqual(['dark'])
  })

  it('reflects the active preference as the selected segment', async () => {
    const { toggle, getCtx } = mountToggle({ variant: 'segmented' }, { defaultTheme: 'dark' })
    getCtx().setTheme('system')
    await nextTick()
    // The system segment (index 2) becomes pressed.
    const buttons = toggle.findAll('button')
    expect(buttons[2]!.attributes('data-state')).toBe('on')
  })
})

// ---------------------------------------------------------------------------
// Live region
// ---------------------------------------------------------------------------

describe('dzColorModeToggle announcements', () => {
  it('announces the resolved mode when following the system preference', async () => {
    const { toggle } = mountToggle({ variant: 'icon' })
    const live = toggle.find('[aria-live="polite"]')
    expect(live.text()).toContain('System theme (Light)')

    simulateMediaChange(true)
    await nextTick()
    expect(toggle.find('[aria-live="polite"]').text()).toContain('System theme (Dark)')
  })

  it('announces the explicit mode after a selection', async () => {
    const { toggle } = mountToggle({ variant: 'icon' }, { defaultTheme: 'light' })
    await toggle.find('button').trigger('click')
    expect(toggle.find('[aria-live="polite"]').text()).toContain('Dark theme')
  })
})
