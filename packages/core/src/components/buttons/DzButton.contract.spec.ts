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
})
