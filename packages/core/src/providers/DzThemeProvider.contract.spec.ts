import { expectAnatomy } from '@dzup-ui/testing'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import { anatomy } from './DzThemeProvider.anatomy.ts'
import DzThemeProvider from './DzThemeProvider.vue'
import { useTheme } from './useTheme.ts'

/**
 * DzThemeProvider — Contract Spec v1 conformance tests.
 *
 * `DzThemeProvider.spec.ts` already covers the behaviour, and it passes
 * unchanged across TASK-OSS-P4-02 — which is the evidence that turning this
 * component into a wrapper over `DzProvider` changed nothing. This file exists
 * for the other half: the component had **no contract spec at all**, because
 * `validate:contract-parity` only ever looked inside
 * `packages/core/src/components`, and everything in `src/providers` was
 * invisible to it. P4-02 widened that validator, so the promise is now written
 * down and gated rather than merely true.
 */

let matchesValue = false

beforeEach(() => {
  localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
  matchesValue = false

  vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query: string) => ({
    matches: matchesValue,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
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

/** Mount the provider around a child that captures the ADR-09 context. */
function mountWithConsumer(props: Record<string, unknown> = {}) {
  let context!: ReturnType<typeof useTheme>
  const Consumer = defineComponent({
    setup() {
      context = useTheme()
      return () => h('div', { 'data-testid': 'consumer' })
    },
  })
  const wrapper = mount(DzThemeProvider, { props, slots: { default: () => h(Consumer) } })
  return { wrapper, context: () => context }
}

describe('dzThemeProvider — Contract Spec v1', () => {
  // ── Renders ──

  it('renders without errors', () => {
    expect(mount(DzThemeProvider, { slots: { default: '<span>child</span>' } }).exists()).toBe(true)
  })

  // ── Anatomy ──

  it('conforms to its declared anatomy', () => {
    expectAnatomy(
      mount(DzThemeProvider, { slots: { default: '<span>child</span>' } }),
      anatomy,
    )
  })

  it('emits no element of its own', () => {
    // The Styling Cookbook's shadow-DOM recipe states this as a fact a reader
    // may rely on. Now something checks it.
    const wrapper = mount(DzThemeProvider, { slots: { default: '<span>child</span>' } })
    expect(wrapper.html()).toBe('<span>child</span>')
  })

  // ── Slots ──

  it('renders default slot content', () => {
    const wrapper = mount(DzThemeProvider, { slots: { default: '<p>Application</p>' } })
    expect(wrapper.text()).toBe('Application')
  })

  // ── Context (ADR-09 minimal API) ──

  it('provides exactly the four ADR-09 members', () => {
    const { context } = mountWithConsumer()
    expect(Object.keys(context()).sort()).toEqual([
      'resolvedTheme',
      'setTheme',
      'theme',
      'toggleTheme',
    ])
  })

  it('resolves system to a concrete theme, never to "system"', () => {
    matchesValue = true
    const { context } = mountWithConsumer()
    expect(context().theme.value).toBe('system')
    expect(context().resolvedTheme.value).toBe('dark')
  })

  // ── Props ──

  it('honours defaultTheme, storageKey and attribute', async () => {
    const { context } = mountWithConsumer({
      defaultTheme: 'dark',
      storageKey: 'my-theme',
      attribute: 'data-mode',
    })

    expect(context().theme.value).toBe('dark')

    context().setTheme('light')
    await nextTick()
    expect(localStorage.getItem('my-theme')).toBe('light')
    expect(document.documentElement.getAttribute('data-mode')).toBe('light')
  })

  it('prefers a persisted value over defaultTheme', () => {
    localStorage.setItem('dz-theme', 'light')
    expect(mountWithConsumer({ defaultTheme: 'dark' }).context().theme.value).toBe('light')
  })

  // ── The wrapper does not leak DzProvider's other concerns ──

  it('takes ownership of the theme and nothing else', () => {
    // A `DzThemeProvider` that quietly started providing a locale, a portal
    // target and a motion policy would be a different component wearing the
    // same name. The delegation is an implementation detail, and this is what
    // keeps it one.
    const wrapper = mount(DzThemeProvider, { slots: { default: '<span>child</span>' } })
    expect(wrapper.html()).not.toContain('dir=')
    expect(document.documentElement.hasAttribute('dir')).toBe(false)
  })
})
