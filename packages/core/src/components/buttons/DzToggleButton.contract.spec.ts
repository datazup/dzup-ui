import { mount } from '@vue/test-utils'
/**
 * DzToggleButton — Contract Spec v1 conformance tests.
 *
 * Verifies that the component's public API (props, events, slots,
 * v-model, data attributes, ARIA) conforms to the canonical contract.
 */
import { describe, expect, it } from 'vitest'
import DzToggleButton from './DzToggleButton.vue'

describe('dzToggleButton — Contract Spec v1', () => {
  // ── Renders ──

  it('renders without errors', () => {
    const wrapper = mount(DzToggleButton, { slots: { default: 'Bold' } })
    expect(wrapper.exists()).toBe(true)
  })

  // ── v-model via defineModel<boolean> ──

  it('supports v-model (pressed state)', async () => {
    const wrapper = mount(DzToggleButton, {
      props: { 'modelValue': false, 'onUpdate:modelValue': (v: boolean) => wrapper.setProps({ modelValue: v }) },
      slots: { default: 'Bold' },
    })
    expect(wrapper.attributes('aria-pressed')).toBe('false')
    await wrapper.trigger('click')
    expect(wrapper.props('modelValue')).toBe(true)
  })

  // ── Data attributes ──

  it('sets data-state to "on" when pressed', () => {
    const wrapper = mount(DzToggleButton, {
      props: { modelValue: true },
      slots: { default: 'Bold' },
    })
    expect(wrapper.attributes('data-state')).toBe('on')
  })

  it('sets data-state to "off" when not pressed', () => {
    const wrapper = mount(DzToggleButton, {
      props: { modelValue: false },
      slots: { default: 'Bold' },
    })
    expect(wrapper.attributes('data-state')).toBe('off')
  })

  it('sets data-disabled when disabled=true', () => {
    const wrapper = mount(DzToggleButton, {
      props: { disabled: true },
      slots: { default: 'Bold' },
    })
    expect(wrapper.attributes('data-disabled')).toBe('')
  })

  it('sets data-tone when tone is provided', () => {
    const wrapper = mount(DzToggleButton, {
      props: { tone: 'primary' },
      slots: { default: 'Bold' },
    })
    expect(wrapper.attributes('data-tone')).toBe('primary')
  })

  // ── ARIA ──

  it('sets aria-pressed reflecting model state', () => {
    const wrapper = mount(DzToggleButton, {
      props: { modelValue: true },
      slots: { default: 'Bold' },
    })
    expect(wrapper.attributes('aria-pressed')).toBe('true')
  })

  it('forwards aria-label', () => {
    const wrapper = mount(DzToggleButton, {
      props: { ariaLabel: 'Toggle bold' },
      slots: { default: 'Bold' },
    })
    expect(wrapper.attributes('aria-label')).toBe('Toggle bold')
  })

  // ── Events ──

  it('emits change with new pressed state on click', async () => {
    const wrapper = mount(DzToggleButton, { slots: { default: 'Bold' } })
    await wrapper.trigger('click')
    expect(wrapper.emitted('change')).toHaveLength(1)
    expect(wrapper.emitted('change')![0]![0]).toBe(true)
  })

  it('does NOT emit change when disabled', async () => {
    const wrapper = mount(DzToggleButton, {
      props: { disabled: true },
      slots: { default: 'Bold' },
    })
    await wrapper.trigger('click')
    expect(wrapper.emitted('change')).toBeUndefined()
  })

  it('emits focus event', async () => {
    const wrapper = mount(DzToggleButton, { slots: { default: 'Bold' } })
    await wrapper.trigger('focus')
    expect(wrapper.emitted('focus')).toHaveLength(1)
  })

  it('emits blur event', async () => {
    const wrapper = mount(DzToggleButton, { slots: { default: 'Bold' } })
    await wrapper.trigger('blur')
    expect(wrapper.emitted('blur')).toHaveLength(1)
  })

  // ── Slots ──

  it('renders default slot content', () => {
    const wrapper = mount(DzToggleButton, { slots: { default: 'Toggle' } })
    expect(wrapper.text()).toContain('Toggle')
  })

  it('renders prefix slot', () => {
    const wrapper = mount(DzToggleButton, {
      slots: {
        default: 'Bold',
        prefix: '<span data-testid="prefix">B</span>',
      },
    })
    expect(wrapper.find('[data-testid="prefix"]').exists()).toBe(true)
  })

  it('renders suffix slot', () => {
    const wrapper = mount(DzToggleButton, {
      slots: {
        default: 'Bold',
        suffix: '<span data-testid="suffix">!</span>',
      },
    })
    expect(wrapper.find('[data-testid="suffix"]').exists()).toBe(true)
  })

  // ── Canonical sizes ──

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzToggleButton, {
        props: { size },
        slots: { default: 'Bold' },
      })
      expect(wrapper.exists()).toBe(true)
    }
  })

  // ── CSS containment ──

  it('has contain: layout style on root element', () => {
    const wrapper = mount(DzToggleButton, { slots: { default: 'Bold' } })
    expect(wrapper.attributes('style')).toContain('contain: layout style')
  })

  // ── Class merging ──

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzToggleButton, {
      attrs: { class: 'custom-class' },
      slots: { default: 'Bold' },
    })
    expect(wrapper.html()).toContain('custom-class')
  })
})
