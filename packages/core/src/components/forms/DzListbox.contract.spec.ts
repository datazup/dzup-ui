import type { DzListboxOption } from './DzListbox.types.ts'
import { mount } from '@vue/test-utils'
/**
 * DzListbox — Contract Spec v1 conformance tests.
 *
 * Verifies props, slots, data attributes, and ARIA compliance.
 */
import { describe, expect, it } from 'vitest'
import DzListbox from './DzListbox.vue'

const options: DzListboxOption[] = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry', disabled: true },
]

describe('dzListbox — Contract Spec v1', () => {
  // ── Props ──

  it('renders with required options prop', () => {
    const wrapper = mount(DzListbox, { props: { options } })
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzListbox, { props: { options, size } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('renders one option per provided option', () => {
    const wrapper = mount(DzListbox, { props: { options } })
    expect(wrapper.findAll('[role="option"]')).toHaveLength(options.length)
  })

  it('accepts the multiple prop', () => {
    const wrapper = mount(DzListbox, { props: { options, multiple: true } })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders a filter input when filter is enabled', () => {
    const wrapper = mount(DzListbox, { props: { options, filter: true } })
    expect(wrapper.find('input').exists()).toBe(true)
  })

  it('accepts the checkmark prop', () => {
    const wrapper = mount(DzListbox, { props: { options, checkmark: true } })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders emptyMessage when there are no options', () => {
    const wrapper = mount(DzListbox, {
      props: { options: [], emptyMessage: 'Nothing here' },
    })
    expect(wrapper.text()).toContain('Nothing here')
  })

  // ── Data attributes ──

  it('sets data-disabled when disabled', () => {
    const wrapper = mount(DzListbox, { props: { options, disabled: true } })
    expect(wrapper.find('[data-disabled]').exists()).toBe(true)
  })

  it('sets data-invalid when invalid', () => {
    const wrapper = mount(DzListbox, { props: { options, invalid: true } })
    expect(wrapper.find('[data-invalid]').exists()).toBe(true)
  })

  it('renders an error message with role=alert when error is set', () => {
    const wrapper = mount(DzListbox, { props: { options, error: 'Required' } })
    const alert = wrapper.find('[role="alert"]')
    expect(alert.exists()).toBe(true)
    expect(alert.text()).toBe('Required')
  })

  // ── ARIA ──

  it('exposes role=listbox', () => {
    const wrapper = mount(DzListbox, { props: { options } })
    expect(wrapper.find('[role="listbox"]').exists()).toBe(true)
  })

  it('sets aria-multiselectable when multiple', () => {
    const wrapper = mount(DzListbox, { props: { options, multiple: true } })
    const listbox = wrapper.find('[role="listbox"]')
    expect(listbox.attributes('aria-multiselectable')).toBe('true')
  })

  it('forwards ariaLabel to the listbox', () => {
    const wrapper = mount(DzListbox, { props: { options, ariaLabel: 'Fruits' } })
    const listbox = wrapper.find('[role="listbox"]')
    expect(listbox.attributes('aria-label')).toBe('Fruits')
  })

  it('marks selected options with aria-selected', () => {
    const wrapper = mount(DzListbox, {
      props: { options, modelValue: 'banana' },
    })
    const selected = wrapper.findAll('[role="option"]').find(o =>
      o.text().includes('Banana'),
    )
    expect(selected?.attributes('aria-selected')).toBe('true')
  })

  // ── CSS containment ──

  it('has contain: layout style on the root element', () => {
    const wrapper = mount(DzListbox, { props: { options } })
    expect(wrapper.find('[style*="contain"]').exists()).toBe(true)
  })
})
