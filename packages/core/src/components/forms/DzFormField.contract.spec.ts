import { mount } from '@vue/test-utils'
/**
 * DzFormField — Contract Spec v1 conformance tests.
 *
 * Verifies that the compound form field wrapper provides correct
 * context to sub-parts (Label, Description, Message).
 */
import { describe, expect, it } from 'vitest'
import { defineComponent, h, inject } from 'vue'
import { DZ_FORM_FIELD_KEY } from '../../composables/useFormField/index.ts'
import DzFormDescription from './DzFormDescription.vue'
import DzFormField from './DzFormField.vue'
import DzFormLabel from './DzFormLabel.vue'
import DzFormMessage from './DzFormMessage.vue'

describe('dzFormField — Contract Spec v1', () => {
  // ── Context provision ──

  it('provides form field context to children', () => {
    let injectedContext: unknown = null
    const Child = defineComponent({
      setup() {
        injectedContext = inject(DZ_FORM_FIELD_KEY)
        return () => h('div', 'child')
      },
    })

    mount(DzFormField, {
      slots: { default: () => h(Child) },
    })

    expect(injectedContext).not.toBeNull()
    expect(injectedContext).toHaveProperty('fieldId')
    expect(injectedContext).toHaveProperty('labelId')
    expect(injectedContext).toHaveProperty('descriptionId')
    expect(injectedContext).toHaveProperty('messageId')
  })

  it('generates unique IDs for field, label, description, message', () => {
    let ctx: Record<string, unknown> | null = null
    const Child = defineComponent({
      setup() {
        ctx = inject(DZ_FORM_FIELD_KEY) as unknown as Record<string, unknown>
        return () => h('div')
      },
    })

    mount(DzFormField, {
      slots: { default: () => h(Child) },
    })

    expect(ctx).not.toBeNull()
    expect(ctx!.fieldId).toBeTruthy()
    expect(ctx!.labelId).toBeTruthy()
    expect(ctx!.descriptionId).toBeTruthy()
    expect(ctx!.messageId).toBeTruthy()
    // All IDs should be different
    const ids = [ctx!.fieldId, ctx!.labelId, ctx!.descriptionId, ctx!.messageId]
    expect(new Set(ids).size).toBe(4)
  })

  // ── Data attributes ──

  it('sets data-disabled when disabled=true', () => {
    const wrapper = mount(DzFormField, {
      props: { disabled: true },
      slots: { default: 'content' },
    })
    expect(wrapper.attributes('data-disabled')).toBe('')
  })

  it('omits data-disabled when disabled=false', () => {
    const wrapper = mount(DzFormField, {
      slots: { default: 'content' },
    })
    expect(wrapper.attributes('data-disabled')).toBeUndefined()
  })

  it('sets data-invalid when invalid=true', () => {
    const wrapper = mount(DzFormField, {
      props: { invalid: true },
      slots: { default: 'content' },
    })
    expect(wrapper.attributes('data-invalid')).toBe('')
  })

  it('sets data-invalid when error is provided', () => {
    const wrapper = mount(DzFormField, {
      props: { error: 'Required field' },
      slots: { default: 'content' },
    })
    expect(wrapper.attributes('data-invalid')).toBe('')
  })

  // ── ARIA ──

  it('renders with role="group"', () => {
    const wrapper = mount(DzFormField, {
      slots: { default: 'content' },
    })
    expect(wrapper.attributes('role')).toBe('group')
  })

  // ── Sub-part integration ──

  it('dzFormLabel connects for attribute to field ID', () => {
    const wrapper = mount(DzFormField, {
      slots: {
        default: () => h(DzFormLabel, null, { default: () => 'Email' }),
      },
    })
    const label = wrapper.findComponent(DzFormLabel)
    expect(label.element.getAttribute('for')).toBeTruthy()
  })

  it('dzFormDescription renders with correct ID', () => {
    const wrapper = mount(DzFormField, {
      slots: {
        default: () => h(DzFormDescription, null, { default: () => 'Help text' }),
      },
    })
    const desc = wrapper.findComponent(DzFormDescription)
    expect(desc.element.getAttribute('id')).toBeTruthy()
  })

  it('dzFormMessage shows error from context', () => {
    const wrapper = mount(DzFormField, {
      props: { error: 'Field is required', invalid: true },
      slots: {
        default: () => h(DzFormMessage),
      },
    })
    const msg = wrapper.findComponent(DzFormMessage)
    expect(msg.text()).toContain('Field is required')
    expect(msg.attributes('role')).toBe('alert')
  })

  it('dzFormMessage shows slot content when no error', () => {
    const wrapper = mount(DzFormField, {
      slots: {
        default: () => h(DzFormMessage, null, { default: () => 'Default message' }),
      },
    })
    const msg = wrapper.findComponent(DzFormMessage)
    expect(msg.text()).toContain('Default message')
    expect(msg.attributes('role')).toBeUndefined()
  })
})
