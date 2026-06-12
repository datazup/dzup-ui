import { mount } from '@vue/test-utils'
/**
 * DzFloatLabel — unit / behaviour tests.
 *
 * Covers float-on-focus, stay-floated-when-filled, the three positioning
 * variants, label↔control id association (reuse + generation), and the
 * explicit `filled` override for non-native controls.
 */
import { describe, expect, it } from 'vitest'
import { h, nextTick } from 'vue'
import DzFloatLabel from './DzFloatLabel.vue'

describe('dzFloatLabel — behaviour', () => {
  // ── Floats on focus ──

  it('floats the label while the control is focused', async () => {
    const wrapper = mount(DzFloatLabel, {
      props: { label: 'Email' },
      slots: { default: () => h('input', { 'data-testid': 'control' }) },
    })
    expect(wrapper.attributes('data-floated')).toBeUndefined()

    await wrapper.find('[data-testid="control"]').trigger('focusin')
    expect(wrapper.attributes('data-floated')).toBe('')

    await wrapper.find('[data-testid="control"]').trigger('focusout', { relatedTarget: null })
    expect(wrapper.attributes('data-floated')).toBeUndefined()
  })

  // ── Stays floated when filled ──

  it('stays floated after blur when the control has a value', async () => {
    const wrapper = mount(DzFloatLabel, {
      props: { label: 'Email' },
      slots: { default: () => h('input', { 'data-testid': 'control' }) },
    })
    const control = wrapper.find('[data-testid="control"]')

    await control.trigger('focusin')
    await control.setValue('hello@example.com')
    await control.trigger('focusout', { relatedTarget: null })

    // Still floated because the field is filled.
    expect(wrapper.attributes('data-floated')).toBe('')
  })

  it('auto-detects a pre-filled native control on mount', async () => {
    const wrapper = mount(DzFloatLabel, {
      props: { label: 'Email' },
      slots: { default: () => h('input', { value: 'preset' }) },
    })
    // Filled state is read on mount and reflects on the next tick.
    await nextTick()
    expect(wrapper.attributes('data-floated')).toBe('')
  })

  // ── Variants ──

  it('renders all three positioning variants', () => {
    for (const variant of ['over', 'in', 'on'] as const) {
      const wrapper = mount(DzFloatLabel, {
        props: { label: 'Email', variant },
        slots: { default: () => h('input') },
      })
      expect(wrapper.attributes('data-variant')).toBe(variant)
      // The label carries variant-appropriate floated classes when floated.
      expect(wrapper.find('label').exists()).toBe(true)
    }
  })

  it('applies the active color class to the label when floated', async () => {
    const wrapper = mount(DzFloatLabel, {
      props: { label: 'Email', filled: true },
      slots: { default: () => h('input') },
    })
    await nextTick()
    expect(wrapper.find('label').classes().join(' ')).toContain('--dz-float-label-active-color')
  })

  // ── Label / id association ──

  it('reuses an existing control id for the label association', async () => {
    const wrapper = mount(DzFloatLabel, {
      props: { label: 'Email' },
      slots: { default: () => h('input', { id: 'my-email' }) },
    })
    await nextTick()
    expect(wrapper.find('input').attributes('id')).toBe('my-email')
    expect(wrapper.find('label').attributes('for')).toBe('my-email')
  })

  it('generates and assigns an id when the control has none', async () => {
    const wrapper = mount(DzFloatLabel, {
      props: { label: 'Email' },
      slots: { default: () => h('input') },
    })
    await nextTick()
    const id = wrapper.find('input').attributes('id')
    expect(id).toBeTruthy()
    expect(wrapper.find('label').attributes('for')).toBe(id)
  })

  // ── Explicit filled override (non-native controls) ──

  it('honors the explicit `filled` prop over auto-detection', () => {
    const wrapper = mount(DzFloatLabel, {
      props: { label: 'Country', filled: true },
      // A non-native control with an empty value would not auto-detect as filled.
      slots: { default: () => h('button', { role: 'combobox' }, 'United States') },
    })
    expect(wrapper.attributes('data-floated')).toBe('')
  })

  it('keeps focus state while focus moves within the wrapper', async () => {
    const wrapper = mount(DzFloatLabel, {
      props: { label: 'Email' },
      attachTo: document.body,
      slots: {
        default: () => h('div', [
          h('input', { 'data-testid': 'a' }),
          h('button', { 'data-testid': 'b' }, 'clear'),
        ]),
      },
    })
    const inner = wrapper.find('[data-testid="b"]').element
    await wrapper.find('[data-testid="a"]').trigger('focusin')
    // Focus moves to a sibling still inside the wrapper → stays floated.
    await wrapper.find('[data-testid="a"]').trigger('focusout', { relatedTarget: inner })
    expect(wrapper.attributes('data-floated')).toBe('')
    wrapper.unmount()
  })
})
