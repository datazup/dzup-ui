import { mount } from '@vue/test-utils'
/**
 * DzSplitButton — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import DzSplitButton from './DzSplitButton.vue'
import DzSplitButtonAction from './DzSplitButtonAction.vue'
import DzSplitButtonMenu from './DzSplitButtonMenu.vue'

describe('dzSplitButton — Unit Tests', () => {
  it('renders a <div> with role="group"', () => {
    const wrapper = mount(DzSplitButton, {
      slots: { default: 'content' },
    })
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.attributes('role')).toBe('group')
  })

  it('renders action and menu children', () => {
    const wrapper = mount(DzSplitButton, {
      slots: {
        default: () => [
          h(DzSplitButtonAction, null, { default: () => 'Save' }),
          h(DzSplitButtonMenu),
        ],
      },
    })
    expect(wrapper.findComponent(DzSplitButtonAction).exists()).toBe(true)
    expect(wrapper.findComponent(DzSplitButtonMenu).exists()).toBe(true)
  })

  it('propagates tone context to action child', () => {
    const wrapper = mount(DzSplitButton, {
      props: { tone: 'danger' },
      slots: {
        default: () => h(DzSplitButtonAction, null, { default: () => 'Delete' }),
      },
    })
    const action = wrapper.findComponent(DzSplitButtonAction)
    const classStr = action.find('button').classes().join(' ')
    expect(classStr).toContain('bg-[var(--dz-danger)]')
  })

  it('propagates disabled state to action child', () => {
    const wrapper = mount(DzSplitButton, {
      props: { disabled: true },
      slots: {
        default: () => h(DzSplitButtonAction, null, { default: () => 'Save' }),
      },
    })
    const action = wrapper.findComponent(DzSplitButtonAction)
    expect(action.find('button').attributes('disabled')).toBeDefined()
  })

  it('action emits click event', async () => {
    const wrapper = mount(DzSplitButton, {
      slots: {
        default: () => h(DzSplitButtonAction, null, { default: () => 'Save' }),
      },
    })
    const action = wrapper.findComponent(DzSplitButtonAction)
    await action.find('button').trigger('click')
    expect(action.emitted('click')).toHaveLength(1)
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzSplitButton, {
      attrs: { class: 'my-class' },
      slots: { default: 'content' },
    })
    expect(wrapper.classes()).toContain('my-class')
  })

  it('sets data-disabled when disabled', () => {
    const wrapper = mount(DzSplitButton, {
      props: { disabled: true },
      slots: { default: 'content' },
    })
    expect(wrapper.attributes('data-disabled')).toBe('')
  })

  it('sets data-loading when loading', () => {
    const wrapper = mount(DzSplitButton, {
      props: { loading: true },
      slots: { default: 'content' },
    })
    expect(wrapper.attributes('data-loading')).toBe('')
  })
})
