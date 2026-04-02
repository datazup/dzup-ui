import { mount } from '@vue/test-utils'
/**
 * DzNumberInput — Contract Spec v1 conformance tests.
 *
 * Verifies that the component's public API (props, events, slots,
 * data attributes, ARIA) conforms to the canonical contract.
 */
import { describe, expect, it } from 'vitest'
import DzNumberInput from './DzNumberInput.vue'

describe('dzNumberInput — Contract Spec v1', () => {
  // ── Prop defaults ──

  it('renders with default props (variant=outline, size=md)', () => {
    const wrapper = mount(DzNumberInput)
    expect(wrapper.find('input').exists()).toBe(true)
    expect(wrapper.find('input').attributes('role')).toBe('spinbutton')
  })

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzNumberInput, { props: { size } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('accepts all canonical variant values', () => {
    const variants = ['outline', 'filled', 'underlined'] as const
    for (const variant of variants) {
      const wrapper = mount(DzNumberInput, { props: { variant } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  // ── Data attributes ──

  it('sets data-tone attribute', () => {
    const wrapper = mount(DzNumberInput, { props: { tone: 'success' } })
    expect(wrapper.attributes('data-tone')).toBe('success')
  })

  it('sets data-disabled when disabled=true', () => {
    const wrapper = mount(DzNumberInput, { props: { disabled: true } })
    expect(wrapper.attributes('data-disabled')).toBe('')
  })

  it('sets data-state="disabled" when disabled', () => {
    const wrapper = mount(DzNumberInput, { props: { disabled: true } })
    expect(wrapper.attributes('data-state')).toBe('disabled')
  })

  // ── ARIA ──

  it('uses spinbutton role', () => {
    const wrapper = mount(DzNumberInput)
    expect(wrapper.find('input').attributes('role')).toBe('spinbutton')
  })

  it('sets aria-valuemin when min is provided', () => {
    const wrapper = mount(DzNumberInput, { props: { min: 0 } })
    expect(wrapper.find('input').attributes('aria-valuemin')).toBe('0')
  })

  it('sets aria-valuemax when max is provided', () => {
    const wrapper = mount(DzNumberInput, { props: { max: 100 } })
    expect(wrapper.find('input').attributes('aria-valuemax')).toBe('100')
  })

  it('sets aria-valuenow to current value', () => {
    const wrapper = mount(DzNumberInput, { props: { modelValue: 42 } })
    expect(wrapper.find('input').attributes('aria-valuenow')).toBe('42')
  })

  it('sets aria-invalid when invalid', () => {
    const wrapper = mount(DzNumberInput, { props: { invalid: true } })
    expect(wrapper.find('input').attributes('aria-invalid')).toBe('true')
  })

  it('forwards aria-label to the input element', () => {
    const wrapper = mount(DzNumberInput, { props: { ariaLabel: 'Quantity' } })
    expect(wrapper.find('input').attributes('aria-label')).toBe('Quantity')
  })

  // ── Increment/Decrement buttons ──

  it('renders increment and decrement buttons', () => {
    const wrapper = mount(DzNumberInput)
    expect(wrapper.find('button[aria-label="Decrease value"]').exists()).toBe(true)
    expect(wrapper.find('button[aria-label="Increase value"]').exists()).toBe(true)
  })

  it('emits increment event when + button is clicked', async () => {
    const wrapper = mount(DzNumberInput, { props: { modelValue: 5 } })
    await wrapper.find('button[aria-label="Increase value"]').trigger('click')
    expect(wrapper.emitted('increment')).toHaveLength(1)
  })

  it('emits decrement event when - button is clicked', async () => {
    const wrapper = mount(DzNumberInput, { props: { modelValue: 5 } })
    await wrapper.find('button[aria-label="Decrease value"]').trigger('click')
    expect(wrapper.emitted('decrement')).toHaveLength(1)
  })

  it('disables increment button when value equals max', () => {
    const wrapper = mount(DzNumberInput, { props: { modelValue: 10, max: 10 } })
    const btn = wrapper.find('button[aria-label="Increase value"]')
    expect((btn.element as HTMLButtonElement).disabled).toBe(true)
  })

  it('disables decrement button when value equals min', () => {
    const wrapper = mount(DzNumberInput, { props: { modelValue: 0, min: 0 } })
    const btn = wrapper.find('button[aria-label="Decrease value"]')
    expect((btn.element as HTMLButtonElement).disabled).toBe(true)
  })

  // ── Events ──

  it('emits focus event', async () => {
    const wrapper = mount(DzNumberInput)
    await wrapper.find('input').trigger('focus')
    expect(wrapper.emitted('focus')).toHaveLength(1)
  })

  it('emits blur event', async () => {
    const wrapper = mount(DzNumberInput)
    await wrapper.find('input').trigger('blur')
    expect(wrapper.emitted('blur')).toHaveLength(1)
  })

  it('emits change event when increment button is clicked', async () => {
    const wrapper = mount(DzNumberInput, { props: { modelValue: 5 } })
    await wrapper.find('button[aria-label="Increase value"]').trigger('click')
    expect(wrapper.emitted('change')).toHaveLength(1)
  })

  // ── CSS containment ──

  it('has contain: layout style on root element', () => {
    const wrapper = mount(DzNumberInput)
    expect(wrapper.attributes('style')).toContain('contain: layout style')
  })

  // ── Error message ──

  it('renders error message when error prop is set', () => {
    const wrapper = mount(DzNumberInput, { props: { error: 'Must be a number' } })
    expect(wrapper.find('[role="alert"]').text()).toBe('Must be a number')
  })

  // ── Slots ──

  it('renders prefix slot', () => {
    const wrapper = mount(DzNumberInput, {
      slots: {
        prefix: '<span data-testid="prefix">$</span>',
      },
    })
    expect(wrapper.find('[data-testid="prefix"]').exists()).toBe(true)
  })
})
