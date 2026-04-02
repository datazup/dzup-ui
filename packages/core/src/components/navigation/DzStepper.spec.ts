import { mount } from '@vue/test-utils'
/**
 * DzStepper — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import DzStepper from './DzStepper.vue'
import DzStepperItem from './DzStepperItem.vue'

describe('dzStepper — Unit Tests', () => {
  it('renders a <div> with role="group"', () => {
    const wrapper = mount(DzStepper, {
      slots: { default: () => h(DzStepperItem, { title: 'Step 1' }) },
    })
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.attributes('role')).toBe('group')
  })

  it('has aria-label for accessibility', () => {
    const wrapper = mount(DzStepper, {
      slots: { default: () => h(DzStepperItem, { title: 'Step 1' }) },
    })
    expect(wrapper.attributes('aria-label')).toBe('Progress steps')
  })

  it('renders stepper items', () => {
    const wrapper = mount(DzStepper, {
      slots: {
        default: () => [
          h(DzStepperItem, { title: 'Account' }),
          h(DzStepperItem, { title: 'Profile' }),
        ],
      },
    })
    expect(wrapper.findAllComponents(DzStepperItem)).toHaveLength(2)
  })

  it('renders step titles', () => {
    const wrapper = mount(DzStepper, {
      slots: {
        default: () => h(DzStepperItem, { title: 'Account Setup' }),
      },
    })
    expect(wrapper.text()).toContain('Account Setup')
  })

  it('renders step description', () => {
    const wrapper = mount(DzStepper, {
      slots: {
        default: () => h(DzStepperItem, { title: 'Step', description: 'Details here' }),
      },
    })
    expect(wrapper.text()).toContain('Details here')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzStepper, {
      attrs: { class: 'my-class' },
      slots: { default: () => h(DzStepperItem, { title: 'Step 1' }) },
    })
    expect(wrapper.classes()).toContain('my-class')
  })

  it('supports custom aria-label', () => {
    const wrapper = mount(DzStepper, {
      props: { ariaLabel: 'Checkout progress' },
      slots: { default: () => h(DzStepperItem, { title: 'Step 1' }) },
    })
    expect(wrapper.attributes('aria-label')).toBe('Checkout progress')
  })
})
