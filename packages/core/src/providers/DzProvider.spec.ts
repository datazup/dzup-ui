import type { DzDefaults, DzMessages } from '@dzup-ui/contracts'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import {
  useDzDefaults,
  useDzDirection,
  useDzFormats,
  useDzLocale,
  useDzMessages,
  useDzMotion,
  useDzNonce,
  useDzPortalTarget,
  useDzTestIds,
} from '../composables/provider/index.ts'
import { clearFormatterCache } from '../composables/provider/useDzFormats.ts'
import DzProvider from './DzProvider.vue'
import { useTheme } from './useTheme.ts'

/**
 * DzProvider — the write half of ADR-20 (TASK-OSS-P4-02).
 *
 * The three properties worth breaking a build over, each tested in both
 * directions:
 *
 *   1. **A prop that is not set provides nothing.** ADR-20 §3 says a provider
 *      overrides the keys it *sets* — so a nested provider that only changes
 *      the locale must leave the theme, the portal target and the defaults
 *      exactly as its ancestor left them. The negative case is the interesting
 *      one and it is what `leaves every other concern alone` covers.
 *   2. **Messages deep-merge; everything else replaces.** The one exception in
 *      the contract, and the one a shallow implementation passes by accident
 *      when the test catalog has a single key.
 *   3. **The provider and the consumer are different components.** `inject`
 *      resolves against the parent chain, so a spec that provides and consumes
 *      in one `setup` reads the default and looks like a library bug. Every
 *      helper here mounts a child.
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Mount `DzProvider` with the given props and capture what a descendant reads.
 *
 * `nest` wraps the child in a second provider, which is how every nesting case
 * below is expressed without each one rebuilding the tree.
 */
function underProvider<T>(
  props: Record<string, unknown>,
  use: () => T,
  nest?: Record<string, unknown>,
): { value: T, wrapper: ReturnType<typeof mount> } {
  let captured!: T

  const Child = defineComponent({
    setup() {
      captured = use()
      return () => h('div', { 'data-testid': 'child' })
    },
  })

  const wrapper = mount(DzProvider, {
    props,
    slots: {
      default: () => (nest === undefined
        ? h(Child)
        : h(DzProvider, nest, { default: () => h(Child) })),
    },
  })

  return { value: captured, wrapper }
}

let matchesValue = false
let reducedMotionValue = false

beforeEach(() => {
  localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
  document.documentElement.removeAttribute('dir')
  clearFormatterCache()
  matchesValue = false
  reducedMotionValue = false

  vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query: string) => ({
    matches: query.includes('prefers-reduced-motion') ? reducedMotionValue : matchesValue,
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
  document.documentElement.removeAttribute('dir')
  document.querySelectorAll('#dz-theme-no-transition').forEach(node => node.remove())
})

// ---------------------------------------------------------------------------
// One provider, every concern
// ---------------------------------------------------------------------------

describe('dzProvider configures every concern from one props object', () => {
  it('provides locale, direction, portal, motion, nonce and test ids together', () => {
    const { value } = underProvider(
      {
        locale: 'ar-EG',
        portal: '#dz-portal',
        motion: 'reduced',
        nonce: 'abc123',
        testIdPrefix: 'e2e',
      },
      () => ({
        locale: useDzLocale(),
        direction: useDzDirection(),
        portal: useDzPortalTarget(),
        motion: useDzMotion(),
        nonce: useDzNonce(),
        testIds: useDzTestIds(),
      }),
    )

    expect(value.locale.value).toBe('ar-EG')
    // Derived from the locale, because `direction` was not stated.
    expect(value.direction.value).toBe('rtl')
    expect(value.portal.value).toBe('#dz-portal')
    expect(value.motion.reduced.value).toBe(true)
    expect(value.nonce.value).toBe('abc123')
    expect(value.testIds.testId('submit')).toEqual({ 'data-testid': 'e2e-submit' })
  })

  it('renders no element of its own', () => {
    const wrapper = mount(DzProvider, {
      slots: { default: () => h('span', { 'data-testid': 'child' }, 'Hello') },
    })
    expect(wrapper.find('[data-testid="child"]').text()).toBe('Hello')
    // The rendered output IS the slot content: no wrapper element, no
    // comment anchor, nothing between the provider and what it was given.
    expect(wrapper.html()).toBe('<span data-testid="child">Hello</span>')
  })

  it('an explicit direction overrides the locale', () => {
    // The two are independent: an RTL widget embedded in an LTR page is a real
    // configuration, and deriving direction from locale is a default, not a law.
    const { value } = underProvider(
      { locale: 'ar-EG', direction: 'ltr' },
      () => useDzDirection(),
    )
    expect(value.value).toBe('ltr')
  })
})

// ---------------------------------------------------------------------------
// Nesting
// ---------------------------------------------------------------------------

describe('nested providers override per key', () => {
  it('a child overrides the locale it sets', () => {
    const { value } = underProvider(
      { locale: 'ar-EG' },
      () => useDzLocale(),
      { locale: 'bs-BA' },
    )
    expect(value.value).toBe('bs-BA')
  })

  it('leaves every other concern alone', () => {
    // The load-bearing negative. A nested provider that only names the locale
    // must not reset the portal target to the default, which is what an
    // implementation that provides every key unconditionally would do.
    const { value } = underProvider(
      { locale: 'ar-EG', portal: '#outer', nonce: 'outer-nonce' },
      () => ({
        locale: useDzLocale(),
        portal: useDzPortalTarget(),
        nonce: useDzNonce(),
      }),
      { locale: 'bs-BA' },
    )

    expect(value.locale.value).toBe('bs-BA')
    expect(value.portal.value).toBe('#outer')
    expect(value.nonce.value).toBe('outer-nonce')
  })

  it('inherits an ancestor locale when only the direction is overridden', () => {
    const { value } = underProvider(
      { locale: 'ar-EG' },
      () => ({ locale: useDzLocale(), direction: useDzDirection() }),
      { direction: 'ltr' },
    )
    expect(value.locale.value).toBe('ar-EG')
    expect(value.direction.value).toBe('ltr')
  })

  it('deep-merges messages instead of replacing them', () => {
    const outer: DzMessages = {
      DzSelect: { noResults: 'No results found', loading: 'Loading…' },
      DzPagination: { next: 'Next' },
    }
    const { value } = underProvider(
      { messages: outer },
      () => useDzMessages(),
      { messages: { DzSelect: { noResults: 'Nothing here' } } },
    )

    expect(value.read('DzSelect.noResults', 'fallback')).toBe('Nothing here')
    // The sibling the child never mentioned, and the group it never mentioned.
    expect(value.read('DzSelect.loading', 'fallback')).toBe('Loading…')
    expect(value.read('DzPagination.next', 'fallback')).toBe('Next')
  })

  it('does not take over the theme when a themed ancestor already owns it', async () => {
    const { value, wrapper } = underProvider(
      { theme: { default: 'dark' } },
      () => useTheme(),
      { locale: 'bs-BA' },
    )

    expect(value.theme.value).toBe('dark')

    // Proves it is the SAME context object, not a second one that happens to
    // agree: a set through the inner tree moves the outer provider's state.
    value.setTheme('light')
    await nextTick()
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    wrapper.unmount()
  })
})

// ---------------------------------------------------------------------------
// Theme
// ---------------------------------------------------------------------------

describe('dzProvider theme', () => {
  it('owns the theme when nothing above it does, with no theme prop', () => {
    // `<DzProvider>` alone behaves like `<DzThemeProvider>`; a consumer is not
    // required to know that theme has a separate history.
    const { value } = underProvider({}, () => useTheme())
    expect(value.theme.value).toBe('system')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  it('honours persist: false in both directions', async () => {
    localStorage.setItem('dz-theme', 'dark')

    const { value } = underProvider(
      { theme: { default: 'light', persist: false } },
      () => useTheme(),
    )

    // The stale key another deployment wrote does not win over the stated
    // default...
    expect(value.theme.value).toBe('light')

    // ...and nothing is written back either. Asserting the key is *unchanged*
    // rather than absent is the sharper check: a write-only implementation
    // would leave the seeded value in place too, but only until it wrote.
    value.setTheme('system')
    await nextTick()
    expect(localStorage.getItem('dz-theme')).toBe('dark')
  })

  it('forwards the nonce to the transition-suppression style tag', async () => {
    const { value } = underProvider({ nonce: 'csp-nonce-1', theme: {} }, () => useTheme())

    value.setTheme('dark')
    await nextTick()

    const style = document.querySelector('#dz-theme-no-transition')
    expect(style).not.toBeNull()
    expect(style?.getAttribute('nonce')).toBe('csp-nonce-1')
  })

  it('injects no nonce attribute when the host has none', async () => {
    const { value } = underProvider({ theme: {} }, () => useTheme())

    value.setTheme('dark')
    await nextTick()

    expect(document.querySelector('#dz-theme-no-transition')?.hasAttribute('nonce')).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Direction reflection
// ---------------------------------------------------------------------------

describe('direction reflection onto <html>', () => {
  it('writes dir when the host declared a locale', () => {
    underProvider({ locale: 'he-IL' }, () => useDzDirection())
    expect(document.documentElement.getAttribute('dir')).toBe('rtl')
  })

  it('writes nothing when the host declared neither locale nor direction', () => {
    // A provider mounted only to set a portal target has no opinion about
    // writing direction, and stamping dir="ltr" on a document that never asked
    // is an opinion.
    underProvider({ portal: '#dz-portal' }, () => useDzPortalTarget())
    expect(document.documentElement.hasAttribute('dir')).toBe(false)
  })

  it('leaves <html> to the root when a nested provider changes direction', () => {
    underProvider(
      { locale: 'en-US' },
      () => useDzDirection(),
      { locale: 'ar-EG' },
    )
    // The nested provider changes what its subtree reads, but a subtree's
    // direction is not the document's.
    expect(document.documentElement.getAttribute('dir')).toBe('ltr')
  })

  it('follows a locale change', async () => {
    const wrapper = mount(DzProvider, {
      props: { locale: 'en-US' },
      slots: { default: () => h('div') },
    })
    expect(document.documentElement.getAttribute('dir')).toBe('ltr')

    await wrapper.setProps({ locale: 'fa-IR' })
    expect(document.documentElement.getAttribute('dir')).toBe('rtl')
  })
})

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

describe('component defaults', () => {
  it('accepts the contract shape', () => {
    const defaults: DzDefaults = { size: 'lg', components: { DzButton: { size: 'sm' } } }
    const { value } = underProvider({ defaults }, () => useDzDefaults())

    expect(value.resolve('DzButton', 'size', [])).toBe('sm')
    // The shared axis still applies to everything that did not name itself.
    expect(value.resolve('DzInput', 'size', [])).toBe('lg')
  })

  it('accepts the component-name shorthand', () => {
    const { value } = underProvider(
      { defaults: { DzButton: { size: 'sm' } } },
      () => useDzDefaults(),
    )
    expect(value.resolve('DzButton', 'size', [])).toBe('sm')
  })

  it('lets an explicit components entry win over the shorthand', () => {
    const { value } = underProvider(
      { defaults: { DzButton: { size: 'sm' }, components: { DzButton: { size: 'xl' } } } },
      () => useDzDefaults(),
    )
    expect(value.resolve('DzButton', 'size', [])).toBe('xl')
  })

  it('never outranks a prop or a compound context', () => {
    const { value } = underProvider(
      { defaults: { DzButton: { size: 'sm' } } },
      () => useDzDefaults(),
    )
    // The chain is what a component passes: prop first, then its group context.
    expect(value.resolve('DzButton', 'size', ['xl'])).toBe('xl')
    expect(value.resolve('DzButton', 'size', [undefined, 'lg'])).toBe('lg')
  })
})

// ---------------------------------------------------------------------------
// Formats
// ---------------------------------------------------------------------------

describe('format defaults', () => {
  it('supplies a currency a component cannot know', () => {
    // `style: 'currency'` with no currency is a TypeError, not a fallback — so
    // without this a component simply cannot offer currency formatting.
    const { value } = underProvider(
      { locale: 'en-US', formats: { currency: 'EUR' } },
      () => useDzFormats(),
    )
    expect(value.number({ style: 'currency' }).format(12)).toContain('€')
  })

  it('lets a caller override a default it actually stated', () => {
    const { value } = underProvider(
      { locale: 'en-US', formats: { number: { style: 'percent' } } },
      () => useDzFormats(),
    )
    expect(value.number({ style: 'decimal' }).format(0.42)).toBe('0.42')
  })

  it('formats in the provider locale', () => {
    const { value } = underProvider({ locale: 'de-DE' }, () => useDzFormats())
    expect(value.number().format(1234.5)).toBe('1.234,5')
  })
})

// ---------------------------------------------------------------------------
// Test ids
// ---------------------------------------------------------------------------

describe('test ids', () => {
  it('stay off unless a host asks', () => {
    const { value } = underProvider({ locale: 'en-US' }, () => useDzTestIds())
    expect(value.testId('submit')).toBeUndefined()
  })

  it('honour a custom attribute', () => {
    const { value } = underProvider(
      { testIds: { enabled: true, attribute: 'data-qa' } },
      () => useDzTestIds(),
    )
    expect(value.testId('submit')).toEqual({ 'data-qa': 'submit' })
  })

  it('let an explicit enabled: false overrule the prefix shorthand', () => {
    const { value } = underProvider(
      { testIdPrefix: 'e2e', testIds: { enabled: false } },
      () => useDzTestIds(),
    )
    expect(value.testId('submit')).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// Motion
// ---------------------------------------------------------------------------

describe('motion', () => {
  it('follows the OS under the default policy', () => {
    reducedMotionValue = true
    const { value } = underProvider({ locale: 'en-US' }, () => useDzMotion())
    expect(value.reduced.value).toBe(true)
  })

  it('lets a host that has already asked the user override it', () => {
    // ADR-20 §7 admits `full` as an explicit override of a stated accessibility
    // preference, on the reasoning that a host that asked is better placed to
    // decide than this library. It is the one setting that can produce a worse
    // outcome than having no provider at all, so it is tested rather than
    // assumed.
    reducedMotionValue = true
    const { value } = underProvider({ motion: 'full' }, () => useDzMotion())
    expect(value.reduced.value).toBe(false)
  })
})
