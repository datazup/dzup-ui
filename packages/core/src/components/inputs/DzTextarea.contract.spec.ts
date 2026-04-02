import { mount } from '@vue/test-utils'
/**
 * DzTextarea — Contract Spec v1 conformance tests.
 *
 * Verifies that the component's public API (props, events, slots,
 * data attributes, ARIA) conforms to the canonical contract.
 */
import { describe, expect, it } from 'vitest'
import DzTextarea from './DzTextarea.vue'

describe('dzTextarea — Contract Spec v1', () => {
  // ── Prop defaults ──

  it('renders with default props (variant=outline, size=md)', () => {
    const wrapper = mount(DzTextarea)
    expect(wrapper.find('textarea').exists()).toBe(true)
  })

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzTextarea, { props: { size } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('accepts all canonical variant values', () => {
    const variants = ['outline', 'filled', 'underlined'] as const
    for (const variant of variants) {
      const wrapper = mount(DzTextarea, { props: { variant } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  // ── Data attributes ──

  it('sets data-tone attribute', () => {
    const wrapper = mount(DzTextarea, { props: { tone: 'info' } })
    expect(wrapper.attributes('data-tone')).toBe('info')
  })

  it('sets data-disabled when disabled=true', () => {
    const wrapper = mount(DzTextarea, { props: { disabled: true } })
    expect(wrapper.attributes('data-disabled')).toBe('')
  })

  it('sets data-state="disabled" when disabled', () => {
    const wrapper = mount(DzTextarea, { props: { disabled: true } })
    expect(wrapper.attributes('data-state')).toBe('disabled')
  })

  it('sets data-state="readonly" when readonly', () => {
    const wrapper = mount(DzTextarea, { props: { readonly: true } })
    expect(wrapper.attributes('data-state')).toBe('readonly')
  })

  // ── ARIA ──

  it('sets aria-invalid when invalid', () => {
    const wrapper = mount(DzTextarea, { props: { invalid: true } })
    expect(wrapper.find('textarea').attributes('aria-invalid')).toBe('true')
  })

  it('sets aria-required when required', () => {
    const wrapper = mount(DzTextarea, { props: { required: true } })
    expect(wrapper.find('textarea').attributes('aria-required')).toBe('true')
  })

  it('forwards aria-label to the textarea element', () => {
    const wrapper = mount(DzTextarea, { props: { ariaLabel: 'Description' } })
    expect(wrapper.find('textarea').attributes('aria-label')).toBe('Description')
  })

  it('connects aria-describedby to the error element', () => {
    const wrapper = mount(DzTextarea, { props: { id: 'desc', error: 'Too short' } })
    expect(wrapper.find('textarea').attributes('aria-describedby')).toContain('desc-error')
    expect(wrapper.find('#desc-error').text()).toBe('Too short')
  })

  // ── Events ──

  it('emits focus event', async () => {
    const wrapper = mount(DzTextarea)
    await wrapper.find('textarea').trigger('focus')
    expect(wrapper.emitted('focus')).toHaveLength(1)
  })

  it('emits blur event', async () => {
    const wrapper = mount(DzTextarea)
    await wrapper.find('textarea').trigger('blur')
    expect(wrapper.emitted('blur')).toHaveLength(1)
  })

  it('emits change event on native change', async () => {
    const wrapper = mount(DzTextarea)
    await wrapper.find('textarea').trigger('change')
    expect(wrapper.emitted('change')).toHaveLength(1)
  })

  // ── CSS containment ──

  it('has contain: layout style on root element', () => {
    const wrapper = mount(DzTextarea)
    expect(wrapper.attributes('style')).toContain('contain: layout style')
  })

  // ── Error message ──

  it('renders error message when error prop is set', () => {
    const wrapper = mount(DzTextarea, { props: { error: 'This field is required' } })
    expect(wrapper.find('[role="alert"]').text()).toBe('This field is required')
  })

  it('omits error message element when error prop is not set', () => {
    const wrapper = mount(DzTextarea)
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })

  // ── Textarea-specific ──

  it('sets rows attribute on the textarea', () => {
    const wrapper = mount(DzTextarea, { props: { rows: 5 } })
    expect(wrapper.find('textarea').attributes('rows')).toBe('5')
  })

  it('defaults to 3 rows', () => {
    const wrapper = mount(DzTextarea)
    expect(wrapper.find('textarea').attributes('rows')).toBe('3')
  })
})
