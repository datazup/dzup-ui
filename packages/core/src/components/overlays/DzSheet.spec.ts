import { mount } from '@vue/test-utils'
/**
 * DzSheet — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import DzSheet from './DzSheet.vue'

describe('dzSheet — Unit Tests', () => {
  it('renders the component', () => {
    const wrapper = mount(DzSheet, {
      slots: { default: '<div>Content</div>' },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('passes modal prop', () => {
    const wrapper = mount(DzSheet, {
      props: { modal: false },
      slots: { default: '<div>Content</div>' },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('default slot renders children', () => {
    const wrapper = mount(DzSheet, {
      slots: { default: '<div data-testid="child">Child</div>' },
    })
    expect(wrapper.find('[data-testid="child"]').exists()).toBe(true)
  })
})
