import { mount } from '@vue/test-utils'
/**
 * DzInputMask — Contract Spec v1 conformance tests.
 *
 * Verifies that the component's public API (props, events, slots,
 * data attributes, ARIA) conforms to the canonical contract.
 */
import { describe, expect, it } from 'vitest'
import DzInputMask from './DzInputMask.vue'

describe('dzInputMask — Contract Spec v1', () => {
  // ── Prop defaults ──

  it('renders a native <input> inside a div wrapper', () => {
    const wrapper = mount(DzInputMask, { props: { mask: '999-999' } })
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.find('input').exists()).toBe(true)
    expect(wrapper.find('input').attributes('type')).toBe('text')
  })

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzInputMask, { props: { mask: '99/99', size } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('accepts all canonical variant values', () => {
    const variants = ['outline', 'filled', 'underlined'] as const
    for (const variant of variants) {
      const wrapper = mount(DzInputMask, { props: { mask: '99/99', variant } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  // ── Data attributes ──

  it('sets data-tone attribute', () => {
    const wrapper = mount(DzInputMask, { props: { mask: '99', tone: 'danger' } })
    expect(wrapper.attributes('data-tone')).toBe('danger')
  })

  it('sets data-disabled when disabled=true', () => {
    const wrapper = mount(DzInputMask, { props: { mask: '99', disabled: true } })
    expect(wrapper.attributes('data-disabled')).toBe('')
  })

  it('omits data-disabled when disabled=false', () => {
    const wrapper = mount(DzInputMask, { props: { mask: '99' } })
    expect(wrapper.attributes('data-disabled')).toBeUndefined()
  })

  it('sets data-state="disabled" when disabled', () => {
    const wrapper = mount(DzInputMask, { props: { mask: '99', disabled: true } })
    expect(wrapper.attributes('data-state')).toBe('disabled')
  })

  it('sets data-state="readonly" when readonly', () => {
    const wrapper = mount(DzInputMask, { props: { mask: '99', readonly: true } })
    expect(wrapper.attributes('data-state')).toBe('readonly')
  })

  // ── ARIA ──

  it('sets aria-invalid when invalid', () => {
    const wrapper = mount(DzInputMask, { props: { mask: '99', invalid: true } })
    expect(wrapper.find('input').attributes('aria-invalid')).toBe('true')
  })

  it('sets aria-invalid when error message is provided', () => {
    const wrapper = mount(DzInputMask, { props: { mask: '99', error: 'Required field' } })
    expect(wrapper.find('input').attributes('aria-invalid')).toBe('true')
  })

  it('sets aria-required when required', () => {
    const wrapper = mount(DzInputMask, { props: { mask: '99', required: true } })
    expect(wrapper.find('input').attributes('aria-required')).toBe('true')
  })

  it('forwards aria-label to the input element', () => {
    const wrapper = mount(DzInputMask, { props: { mask: '99', ariaLabel: 'Phone number' } })
    expect(wrapper.find('input').attributes('aria-label')).toBe('Phone number')
  })

  it('connects aria-describedby to the error element', () => {
    const wrapper = mount(DzInputMask, { props: { mask: '99', id: 'phone', error: 'Invalid' } })
    expect(wrapper.find('input').attributes('aria-describedby')).toContain('phone-error')
    expect(wrapper.find('#phone-error').text()).toBe('Invalid')
  })

  it('merges an explicit aria-describedby with the error element id', () => {
    const wrapper = mount(DzInputMask, {
      props: { mask: '99', id: 'pin', ariaDescribedby: 'format-hint', error: 'Invalid' },
    })
    const describedby = wrapper.find('input').attributes('aria-describedby')
    expect(describedby).toContain('format-hint')
    expect(describedby).toContain('pin-error')
  })

  // ── Events ──

  it('emits focus event', async () => {
    const wrapper = mount(DzInputMask, { props: { mask: '99' } })
    await wrapper.find('input').trigger('focus')
    expect(wrapper.emitted('focus')).toHaveLength(1)
  })

  it('emits blur event', async () => {
    const wrapper = mount(DzInputMask, { props: { mask: '99' } })
    await wrapper.find('input').trigger('blur')
    expect(wrapper.emitted('blur')).toHaveLength(1)
  })

  // ── Slots ──

  it('renders prefix slot', () => {
    const wrapper = mount(DzInputMask, {
      props: { mask: '99' },
      slots: { prefix: '<span data-testid="prefix-icon">P</span>' },
    })
    expect(wrapper.find('[data-testid="prefix-icon"]').exists()).toBe(true)
  })

  it('renders suffix slot', () => {
    const wrapper = mount(DzInputMask, {
      props: { mask: '99' },
      slots: { suffix: '<span data-testid="suffix-icon">S</span>' },
    })
    expect(wrapper.find('[data-testid="suffix-icon"]').exists()).toBe(true)
  })

  // ── CSS containment ──

  it('has contain: layout style on root element', () => {
    const wrapper = mount(DzInputMask, { props: { mask: '99' } })
    expect(wrapper.attributes('style')).toContain('contain: layout style')
  })

  // ── Error message ──

  it('renders error message when error prop is set', () => {
    const wrapper = mount(DzInputMask, { props: { mask: '99', error: 'This field is required' } })
    expect(wrapper.find('[role="alert"]').text()).toBe('This field is required')
  })

  it('omits error message element when error prop is not set', () => {
    const wrapper = mount(DzInputMask, { props: { mask: '99' } })
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })
})
