/**
 * DzButton — Contract Spec v1 conformance tests.
 *
 * Verifies that the component's public API (props, events, slots,
 * data attributes, ARIA) conforms to the canonical contract.
 */
import type { DzButtonProps } from './DzButton.types.ts'
import { expectAnatomy } from '@dzup-ui/testing'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { anatomy } from './DzButton.anatomy.ts'
import DzButton from './DzButton.vue'

describe('dzButton — Contract Spec v1', () => {
  // ── Prop defaults ──

  it('renders with default props (variant=solid, size=md, tone=primary)', () => {
    const wrapper = mount(DzButton, { slots: { default: 'Click me' } })
    expect(wrapper.attributes('data-tone')).toBe('primary')
    expect(wrapper.attributes('type')).toBe('button')
    expect(wrapper.text()).toContain('Click me')
  })

  it('accepts all canonical size values', () => {
    const sizes = ['icon', 'xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzButton, { props: { size }, slots: { default: 'btn' } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('accepts all canonical variant values', () => {
    const variants = ['solid', 'outline', 'ghost', 'text', 'link'] as const
    for (const variant of variants) {
      const wrapper = mount(DzButton, { props: { variant }, slots: { default: 'btn' } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('accepts all canonical tone values', () => {
    const tones = ['neutral', 'primary', 'success', 'warning', 'danger', 'info'] as const
    for (const tone of tones) {
      const wrapper = mount(DzButton, { props: { tone }, slots: { default: 'btn' } })
      expect(wrapper.attributes('data-tone')).toBe(tone)
    }
  })

  // ── Data attributes ──

  it('sets data-tone attribute', () => {
    const wrapper = mount(DzButton, { props: { tone: 'danger' }, slots: { default: 'btn' } })
    expect(wrapper.attributes('data-tone')).toBe('danger')
  })

  it('sets data-loading when loading=true', () => {
    const wrapper = mount(DzButton, { props: { loading: true }, slots: { default: 'btn' } })
    expect(wrapper.attributes('data-loading')).toBe('')
  })

  it('omits data-loading when loading=false', () => {
    const wrapper = mount(DzButton, { props: { loading: false }, slots: { default: 'btn' } })
    expect(wrapper.attributes('data-loading')).toBeUndefined()
  })

  it('sets data-disabled when disabled=true', () => {
    const wrapper = mount(DzButton, { props: { disabled: true }, slots: { default: 'btn' } })
    expect(wrapper.attributes('data-disabled')).toBe('')
  })

  it('omits data-disabled when disabled=false', () => {
    const wrapper = mount(DzButton, { slots: { default: 'btn' } })
    expect(wrapper.attributes('data-disabled')).toBeUndefined()
  })

  // ── ARIA ──

  it('sets aria-disabled when disabled', () => {
    const wrapper = mount(DzButton, { props: { disabled: true }, slots: { default: 'btn' } })
    expect(wrapper.attributes('aria-disabled')).toBe('true')
  })

  it('sets aria-busy when loading', () => {
    const wrapper = mount(DzButton, { props: { loading: true }, slots: { default: 'btn' } })
    expect(wrapper.attributes('aria-busy')).toBe('true')
  })

  it('sets aria-disabled when loading (interaction blocked)', () => {
    const wrapper = mount(DzButton, { props: { loading: true }, slots: { default: 'btn' } })
    expect(wrapper.attributes('aria-disabled')).toBe('true')
  })

  it('forwards aria-label', () => {
    const wrapper = mount(DzButton, {
      props: { ariaLabel: 'Save changes' },
      slots: { default: 'Save' },
    })
    expect(wrapper.attributes('aria-label')).toBe('Save changes')
  })

  // ── Events ──

  it('emits click on button click', async () => {
    const wrapper = mount(DzButton, { slots: { default: 'btn' } })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
    expect(wrapper.emitted('click')![0]![0]).toBeInstanceOf(MouseEvent)
  })

  it('does NOT emit click when disabled', async () => {
    const wrapper = mount(DzButton, { props: { disabled: true }, slots: { default: 'btn' } })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('does NOT emit click when loading', async () => {
    const wrapper = mount(DzButton, { props: { loading: true }, slots: { default: 'btn' } })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('emits focus event', async () => {
    const wrapper = mount(DzButton, { slots: { default: 'btn' } })
    await wrapper.trigger('focus')
    expect(wrapper.emitted('focus')).toHaveLength(1)
  })

  it('emits blur event', async () => {
    const wrapper = mount(DzButton, { slots: { default: 'btn' } })
    await wrapper.trigger('blur')
    expect(wrapper.emitted('blur')).toHaveLength(1)
  })

  // ── Slots ──

  it('renders default slot content', () => {
    const wrapper = mount(DzButton, { slots: { default: 'Submit' } })
    expect(wrapper.text()).toContain('Submit')
  })

  it('renders prefix slot', () => {
    const wrapper = mount(DzButton, {
      slots: {
        default: 'Save',
        prefix: '<span data-testid="prefix">+</span>',
      },
    })
    expect(wrapper.find('[data-testid="prefix"]').exists()).toBe(true)
  })

  it('renders suffix slot', () => {
    const wrapper = mount(DzButton, {
      slots: {
        default: 'Next',
        suffix: '<span data-testid="suffix">→</span>',
      },
    })
    expect(wrapper.find('[data-testid="suffix"]').exists()).toBe(true)
  })

  // ── CSS containment ──

  it('has contain: layout style on root element', () => {
    const wrapper = mount(DzButton, { slots: { default: 'btn' } })
    expect(wrapper.attributes('style')).toContain('contain: layout style')
  })

  // ── HTML type attribute ──

  it('defaults to type="button"', () => {
    const wrapper = mount(DzButton, { slots: { default: 'btn' } })
    expect(wrapper.attributes('type')).toBe('button')
  })

  it('accepts type="submit"', () => {
    const wrapper = mount(DzButton, { props: { type: 'submit' }, slots: { default: 'btn' } })
    expect(wrapper.attributes('type')).toBe('submit')
  })

  // ── Loading spinner ──

  it('shows spinner SVG when loading', () => {
    const wrapper = mount(DzButton, { props: { loading: true }, slots: { default: 'btn' } })
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('hides prefix slot when loading', () => {
    const wrapper = mount(DzButton, {
      props: { loading: true },
      slots: {
        default: 'Save',
        prefix: '<span data-testid="prefix">icon</span>',
      },
    })
    expect(wrapper.find('[data-testid="prefix"]').exists()).toBe(false)
  })

  // ── Polymorphic rendering (as / href / to) ──

  it('accepts as prop for polymorphic rendering', () => {
    const wrapper = mount(DzButton, {
      props: { as: 'a', href: '/test' },
      slots: { default: 'Link' },
    })
    expect(wrapper.element.tagName).toBe('A')
  })

  it('renders as <a> when href prop is set', () => {
    const wrapper = mount(DzButton, {
      props: { href: 'https://example.com' },
      slots: { default: 'Link' },
    })
    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.attributes('href')).toBe('https://example.com')
  })

  it('renders with to prop (router-link fallback to <a>)', () => {
    const wrapper = mount(DzButton, {
      props: { to: '/dashboard' },
      slots: { default: 'Dashboard' },
    })
    // Without router installed, falls back to <a>
    expect(wrapper.element.tagName).toBe('A')
  })

  it('omits type attribute for non-button elements', () => {
    const wrapper = mount(DzButton, {
      props: { href: '/test' },
      slots: { default: 'Link' },
    })
    expect(wrapper.attributes('type')).toBeUndefined()
  })

  it('sets role="button" for non-button elements', () => {
    const wrapper = mount(DzButton, {
      props: { as: 'div' },
      slots: { default: 'Div' },
    })
    expect(wrapper.attributes('role')).toBe('button')
  })

  it('does not set role for native button element', () => {
    const wrapper = mount(DzButton, { slots: { default: 'btn' } })
    expect(wrapper.attributes('role')).toBeUndefined()
  })

  it('disabled anchor omits href and gets tabindex=-1', () => {
    const wrapper = mount(DzButton, {
      props: { href: '/test', disabled: true },
      slots: { default: 'Link' },
    })
    expect(wrapper.attributes('href')).toBeUndefined()
    expect(wrapper.attributes('tabindex')).toBe('-1')
    expect(wrapper.attributes('aria-disabled')).toBe('true')
  })

  it('preserves data-tone on polymorphic elements', () => {
    const wrapper = mount(DzButton, {
      props: { as: 'a', href: '/test', tone: 'danger' },
      slots: { default: 'Link' },
    })
    expect(wrapper.attributes('data-tone')).toBe('danger')
  })

  it('preserves contain: layout style on polymorphic elements', () => {
    const wrapper = mount(DzButton, {
      props: { href: '/test' },
      slots: { default: 'Link' },
    })
    expect(wrapper.attributes('style')).toContain('contain: layout style')
  })
  // ── Anatomy (Contract Spec v1 styling surface, ADR-19) ──

  it('conforms to its declared anatomy in the default render', () => {
    expectAnatomy(mount(DzButton, { slots: { default: 'Save' } }), anatomy)
  })

  it('conforms while loading, when the spinner part is present', () => {
    const wrapper = mount(DzButton, { props: { loading: true }, slots: { default: 'Save' } })

    expect(wrapper.find('[data-part="spinner"]').exists()).toBe(true)
    expectAnatomy(wrapper, anatomy)
  })

  it('conforms while disabled', () => {
    expectAnatomy(mount(DzButton, { props: { disabled: true }, slots: { default: 'Save' } }), anatomy)
  })

  it('keeps its parts when rendered as another element', () => {
    // Polymorphism is where a part attribute is most likely to be dropped: the
    // root is a different element every time.
    const wrapper = mount(DzButton, { props: { href: '/x' }, slots: { default: 'Link' } })

    expect(wrapper.attributes('data-part')).toBe('root')
    expectAnatomy(wrapper, anatomy)
  })

  it('declares every data-state value it can emit', () => {
    const cases: DzButtonProps[] = [{}, { loading: true }, { disabled: true }]
    const emitted = new Set<string>()
    for (const props of cases) {
      const wrapper = mount(DzButton, { props, slots: { default: 'btn' } })
      emitted.add(wrapper.attributes('data-state') as string)
    }

    expect([...emitted].sort()).toEqual([...anatomy.states].sort())
  })

  it('emits data-tone, and not yet data-variant or data-size', () => {
    // ADR-19 §4 makes recipe attributes public: the library's own stylesheet
    // already selects on them (`.dz-panel[data-size=lg]`). DzButton mirrors only
    // `tone` today. This asserts the GAP rather than hiding it — when P3-03
    // emits the other two, this test fails and is updated to an empty list,
    // which is how a ratchet is supposed to behave.
    const wrapper = mount(DzButton, {
      props: { variant: 'outline', size: 'lg', tone: 'danger' },
      slots: { default: 'btn' },
    })

    const missing = anatomy.recipes.filter(axis => wrapper.attributes(`data-${axis}`) === undefined)
    expect(missing).toEqual(['variant', 'size'])
    expect(wrapper.attributes('data-tone')).toBe('danger')
  })
  // ── Per-part overrides (`ui`, ADR-19 §5) ──

  it('applies a ui override to the part it names', () => {
    const wrapper = mount(DzButton, {
      props: { loading: true, ui: { spinner: 'h-8 w-8' } },
      slots: { default: 'Save' },
    })

    expect(wrapper.find('[data-part="spinner"]').classes()).toContain('h-8')
  })

  it('lets a ui override beat the component own utility without !important', () => {
    // The whole point of routing overrides through cn()/tailwind-merge: the
    // consumer's `h-8` replaces the size recipe's `h-4` rather than fighting it.
    const wrapper = mount(DzButton, {
      props: { loading: true, size: 'md', ui: { spinner: 'h-8' } },
      slots: { default: 'Save' },
    })

    const spinner = wrapper.find('[data-part="spinner"]').classes()
    expect(spinner).toContain('h-8')
    expect(spinner).not.toContain('h-4')
    expect(wrapper.html()).not.toContain('!important')
  })

  it('applies ui.root to the root and leaves class working alongside it', () => {
    const wrapper = mount(DzButton, {
      props: { ui: { root: 'rounded-none' } },
      attrs: { class: 'tracking-wide' },
      slots: { default: 'Save' },
    })

    expect(wrapper.classes()).toContain('rounded-none')
    expect(wrapper.classes()).toContain('tracking-wide')
  })

  it('gives class the last word over ui.root, since it is the narrower request', () => {
    const wrapper = mount(DzButton, {
      props: { ui: { root: 'p-2' } },
      attrs: { class: 'p-8' },
      slots: { default: 'Save' },
    })

    expect(wrapper.classes()).toContain('p-8')
    expect(wrapper.classes()).not.toContain('p-2')
  })

  it('changes nothing when no ui is given', () => {
    const withUi = mount(DzButton, { props: { ui: {} }, slots: { default: 'Save' } })
    const without = mount(DzButton, { slots: { default: 'Save' } })

    expect(withUi.html()).toBe(without.html())
  })
})
