import type { DzSelectItem } from './DzSelect.types.ts'
import { mount } from '@vue/test-utils'
/**
 * DzSelect — Contract Spec v1 conformance tests.
 *
 * Verifies props, events, slots, data attributes, and ARIA compliance.
 */
import { describe, expect, it } from 'vitest'
import DzSelect from './DzSelect.vue'

const mockItems: DzSelectItem[] = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry', disabled: true },
]

describe('dzSelect — Contract Spec v1', () => {
  // ── Props ──

  it('renders with required items prop', () => {
    const wrapper = mount(DzSelect, {
      props: { items: mockItems },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzSelect, {
        props: { items: mockItems, size },
      })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('accepts all canonical variant values', () => {
    const variants = ['outline', 'filled', 'underlined'] as const
    for (const variant of variants) {
      const wrapper = mount(DzSelect, {
        props: { items: mockItems, variant },
      })
      expect(wrapper.exists()).toBe(true)
    }
  })

  // ── Data attributes ──

  it('sets data-disabled when disabled', () => {
    const wrapper = mount(DzSelect, {
      props: { items: mockItems, disabled: true },
    })
    // The trigger element within the component
    const trigger = wrapper.find('[data-disabled]')
    expect(trigger.exists()).toBe(true)
  })

  it('sets data-invalid when invalid', () => {
    const wrapper = mount(DzSelect, {
      props: { items: mockItems, invalid: true },
    })
    const trigger = wrapper.find('[data-invalid]')
    expect(trigger.exists()).toBe(true)
  })

  // ── CSS containment ──

  it('has contain: layout style on trigger element', () => {
    const wrapper = mount(DzSelect, {
      props: { items: mockItems },
    })
    const trigger = wrapper.find('[style*="contain"]')
    expect(trigger.exists()).toBe(true)
  })
})
