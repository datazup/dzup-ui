import type { DzFormFieldContext } from '../../composables/useFormField/index.ts'
import { mount } from '@vue/test-utils'
/**
 * DzFormField compound — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import { defineComponent, h, inject } from 'vue'
import { DZ_FORM_FIELD_KEY } from '../../composables/useFormField/index.ts'
import DzFormDescription from './DzFormDescription.vue'
import DzFormField from './DzFormField.vue'
import DzFormLabel from './DzFormLabel.vue'
import DzFormMessage from './DzFormMessage.vue'

describe('dzFormField — Unit Tests', () => {
  it('renders a <div> element', () => {
    const wrapper = mount(DzFormField, {
      slots: { default: 'content' },
    })
    expect(wrapper.element.tagName).toBe('DIV')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzFormField, {
      attrs: { class: 'my-field' },
      slots: { default: 'content' },
    })
    expect(wrapper.classes()).toContain('my-field')
  })

  it('propagates error to context isInvalid', () => {
    let ctx: DzFormFieldContext | null = null
    const Child = defineComponent({
      setup() {
        ctx = inject(DZ_FORM_FIELD_KEY, null)
        return () => h('div')
      },
    })

    mount(DzFormField, {
      props: { error: 'Something went wrong' },
      slots: { default: () => h(Child) },
    })

    expect(ctx).not.toBeNull()
    expect(ctx!.isInvalid.value).toBe(true)
    expect(ctx!.error.value).toBe('Something went wrong')
  })

  it('propagates required to context', () => {
    let ctx: DzFormFieldContext | null = null
    const Child = defineComponent({
      setup() {
        ctx = inject(DZ_FORM_FIELD_KEY, null)
        return () => h('div')
      },
    })

    mount(DzFormField, {
      props: { required: true },
      slots: { default: () => h(Child) },
    })

    expect(ctx!.isRequired.value).toBe(true)
  })

  it('propagates disabled to context', () => {
    let ctx: DzFormFieldContext | null = null
    const Child = defineComponent({
      setup() {
        ctx = inject(DZ_FORM_FIELD_KEY, null)
        return () => h('div')
      },
    })

    mount(DzFormField, {
      props: { disabled: true },
      slots: { default: () => h(Child) },
    })

    expect(ctx!.isDisabled.value).toBe(true)
  })
})

describe('dzFormLabel — Unit Tests', () => {
  it('renders a <label> element', () => {
    const wrapper = mount(DzFormField, {
      slots: {
        default: () => h(DzFormLabel, null, { default: () => 'Name' }),
      },
    })
    const label = wrapper.find('label')
    expect(label.exists()).toBe(true)
    expect(label.text()).toContain('Name')
  })

  it('shows required asterisk when field is required', () => {
    const wrapper = mount(DzFormField, {
      props: { required: true },
      slots: {
        default: () => h(DzFormLabel, null, { default: () => 'Email' }),
      },
    })
    expect(wrapper.find('label').text()).toContain('*')
  })

  it('sets data-required on label when required', () => {
    const wrapper = mount(DzFormField, {
      props: { required: true },
      slots: {
        default: () => h(DzFormLabel, null, { default: () => 'Email' }),
      },
    })
    const label = wrapper.find('label')
    expect(label.attributes('data-required')).toBe('')
  })
})

describe('dzFormDescription — Unit Tests', () => {
  it('renders a <p> element with content', () => {
    const wrapper = mount(DzFormField, {
      slots: {
        default: () => h(DzFormDescription, null, { default: () => 'Help text here' }),
      },
    })
    const desc = wrapper.find('p')
    expect(desc.exists()).toBe(true)
    expect(desc.text()).toContain('Help text here')
  })

  it('has an ID from form field context', () => {
    const wrapper = mount(DzFormField, {
      slots: {
        default: () => h(DzFormDescription, null, { default: () => 'Help' }),
      },
    })
    expect(wrapper.find('p').attributes('id')).toBeTruthy()
  })
})

describe('dzFormMessage — Unit Tests', () => {
  it('renders error message when error is present', () => {
    const wrapper = mount(DzFormField, {
      props: { error: 'Required', invalid: true },
      slots: {
        default: () => h(DzFormMessage),
      },
    })
    expect(wrapper.findComponent(DzFormMessage).text()).toContain('Required')
  })

  it('sets role="alert" when showing error', () => {
    const wrapper = mount(DzFormField, {
      props: { error: 'Error!', invalid: true },
      slots: {
        default: () => h(DzFormMessage),
      },
    })
    expect(wrapper.findComponent(DzFormMessage).attributes('role')).toBe('alert')
  })

  it('does not set role="alert" when no error', () => {
    const wrapper = mount(DzFormField, {
      slots: {
        default: () => h(DzFormMessage, null, { default: () => 'Info' }),
      },
    })
    expect(wrapper.findComponent(DzFormMessage).attributes('role')).toBeUndefined()
  })

  it('shows slot content when no error', () => {
    const wrapper = mount(DzFormField, {
      slots: {
        default: () => h(DzFormMessage, null, { default: () => 'Default info' }),
      },
    })
    expect(wrapper.findComponent(DzFormMessage).text()).toContain('Default info')
  })
})
