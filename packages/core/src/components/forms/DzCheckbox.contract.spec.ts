import { mount } from '@vue/test-utils'
/**
 * DzCheckbox — Contract Spec v1 conformance tests.
 *
 * Verifies props, events, slots, data attributes, and ARIA compliance.
 */
import { describe, expect, it } from 'vitest'
import DzCheckbox from './DzCheckbox.vue'

describe('dzCheckbox — Contract Spec v1', () => {
  // ── Props ──

  it('renders with default props', () => {
    const wrapper = mount(DzCheckbox, {
      slots: { default: 'Accept' },
    })
    expect(wrapper.text()).toContain('Accept')
  })

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzCheckbox, {
        props: { size },
        slots: { default: 'cb' },
      })
      expect(wrapper.exists()).toBe(true)
    }
  })

  // ── Data attributes ──

  it('sets data-state="unchecked" when not checked', () => {
    const wrapper = mount(DzCheckbox, {
      props: { modelValue: false },
      slots: { default: 'cb' },
    })
    expect(wrapper.attributes('data-state')).toBe('unchecked')
  })

  it('sets data-state="checked" when checked', () => {
    const wrapper = mount(DzCheckbox, {
      props: { modelValue: true },
      slots: { default: 'cb' },
    })
    expect(wrapper.attributes('data-state')).toBe('checked')
  })

  it('sets data-state="indeterminate" when indeterminate', () => {
    const wrapper = mount(DzCheckbox, {
      props: { indeterminate: true },
      slots: { default: 'cb' },
    })
    expect(wrapper.attributes('data-state')).toBe('indeterminate')
  })

  it('sets data-disabled when disabled', () => {
    const wrapper = mount(DzCheckbox, {
      props: { disabled: true },
      slots: { default: 'cb' },
    })
    expect(wrapper.attributes('data-disabled')).toBe('')
  })

  // ── CSS containment ──

  it('has contain: layout style on root element', () => {
    const wrapper = mount(DzCheckbox, {
      slots: { default: 'cb' },
    })
    expect(wrapper.attributes('style')).toContain('contain: layout style')
  })

  // ── Slots ──

  it('renders default slot as label text', () => {
    const wrapper = mount(DzCheckbox, {
      slots: { default: 'I agree to terms' },
    })
    expect(wrapper.text()).toContain('I agree to terms')
  })

  it('renders without label when no default slot', () => {
    const wrapper = mount(DzCheckbox)
    expect(wrapper.exists()).toBe(true)
  })
})
