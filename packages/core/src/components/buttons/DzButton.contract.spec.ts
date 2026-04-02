import { mount } from '@vue/test-utils'
/**
 * DzButton — Contract Spec v1 conformance tests.
 *
 * Verifies that the component's public API (props, events, slots,
 * data attributes, ARIA) conforms to the canonical contract.
 */
import { describe, expect, it } from 'vitest'
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
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
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
})
