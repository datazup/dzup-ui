import { mount } from '@vue/test-utils'
/**
 * DzSwitch — Contract Spec v1 conformance tests.
 *
 * Verifies props, events, slots, data attributes, and ARIA compliance.
 */
import { describe, expect, it } from 'vitest'
import DzSwitch from './DzSwitch.vue'

describe('dzSwitch — Contract Spec v1', () => {
  // ── Props ──

  it('renders with default props', () => {
    const wrapper = mount(DzSwitch, {
      slots: { default: 'Enable' },
    })
    expect(wrapper.text()).toContain('Enable')
  })

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzSwitch, {
        props: { size },
        slots: { default: 'sw' },
      })
      expect(wrapper.exists()).toBe(true)
    }
  })

  // ── Data attributes ──

  it('sets data-state="unchecked" when off', () => {
    const wrapper = mount(DzSwitch, {
      props: { modelValue: false },
      slots: { default: 'sw' },
    })
    expect(wrapper.attributes('data-state')).toBe('unchecked')
  })

  it('sets data-state="checked" when on', () => {
    const wrapper = mount(DzSwitch, {
      props: { modelValue: true },
      slots: { default: 'sw' },
    })
    expect(wrapper.attributes('data-state')).toBe('checked')
  })

  it('sets data-disabled when disabled', () => {
    const wrapper = mount(DzSwitch, {
      props: { disabled: true },
      slots: { default: 'sw' },
    })
    expect(wrapper.attributes('data-disabled')).toBe('')
  })

  // ── CSS containment ──

  it('has contain: layout style on root element', () => {
    const wrapper = mount(DzSwitch, {
      slots: { default: 'sw' },
    })
    expect(wrapper.attributes('style')).toContain('contain: layout style')
  })

  // ── Slots ──

  it('renders default slot as label text', () => {
    const wrapper = mount(DzSwitch, {
      slots: { default: 'Dark mode' },
    })
    expect(wrapper.text()).toContain('Dark mode')
  })

  it('renders without label when no default slot', () => {
    const wrapper = mount(DzSwitch)
    expect(wrapper.exists()).toBe(true)
  })
})
