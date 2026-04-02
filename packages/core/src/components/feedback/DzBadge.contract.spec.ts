import { mount } from '@vue/test-utils'
/**
 * DzBadge — Contract Spec v1 conformance tests.
 *
 * Verifies that the component's public API (props, slots,
 * data attributes) conforms to the canonical contract.
 */
import { describe, expect, it } from 'vitest'
import DzBadge from './DzBadge.vue'

describe('dzBadge — Contract Spec v1', () => {
  // -- Prop defaults --

  it('renders with default props (variant=solid, size=md, tone=neutral)', () => {
    const wrapper = mount(DzBadge, { slots: { default: 'New' } })
    expect(wrapper.attributes('data-tone')).toBe('neutral')
    expect(wrapper.text()).toContain('New')
  })

  it('accepts all canonical variant values', () => {
    const variants = ['solid', 'outline', 'subtle'] as const
    for (const variant of variants) {
      const wrapper = mount(DzBadge, { props: { variant }, slots: { default: 'badge' } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('accepts all canonical tone values', () => {
    const tones = ['neutral', 'primary', 'success', 'warning', 'danger', 'info'] as const
    for (const tone of tones) {
      const wrapper = mount(DzBadge, { props: { tone }, slots: { default: 'badge' } })
      expect(wrapper.attributes('data-tone')).toBe(tone)
    }
  })

  it('accepts all badge size values', () => {
    const sizes = ['sm', 'md', 'lg'] as const
    for (const size of sizes) {
      const wrapper = mount(DzBadge, { props: { size }, slots: { default: 'badge' } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  // -- Element type --

  it('renders as a <span> element', () => {
    const wrapper = mount(DzBadge, { slots: { default: 'Badge' } })
    expect(wrapper.element.tagName).toBe('SPAN')
  })

  // -- Data attributes --

  it('sets data-tone attribute', () => {
    const wrapper = mount(DzBadge, { props: { tone: 'success' }, slots: { default: 'Ok' } })
    expect(wrapper.attributes('data-tone')).toBe('success')
  })

  // -- Slots --

  it('renders default slot content', () => {
    const wrapper = mount(DzBadge, { slots: { default: 'Active' } })
    expect(wrapper.text()).toContain('Active')
  })

  it('renders HTML in default slot', () => {
    const wrapper = mount(DzBadge, {
      slots: { default: '<strong data-testid="bold">Bold</strong>' },
    })
    expect(wrapper.find('[data-testid="bold"]').exists()).toBe(true)
  })

  // -- No ARIA requirements (purely visual) --

  it('does not have role attribute (purely visual)', () => {
    const wrapper = mount(DzBadge, { slots: { default: 'badge' } })
    expect(wrapper.attributes('role')).toBeUndefined()
  })
})
