import { mount } from '@vue/test-utils'
/**
 * DzDropdownMenu — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import DzDropdownMenu from './DzDropdownMenu.vue'

describe('dzDropdownMenu — Unit Tests', () => {
  it('renders the component', () => {
    const wrapper = mount(DzDropdownMenu, {
      slots: { default: '<div>Content</div>' },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('default slot renders children', () => {
    const wrapper = mount(DzDropdownMenu, {
      slots: { default: '<div data-testid="child">Child</div>' },
    })
    expect(wrapper.find('[data-testid="child"]').exists()).toBe(true)
  })

  it('accepts modal prop', () => {
    const wrapper = mount(DzDropdownMenu, {
      props: { modal: false },
      slots: { default: '<div>Content</div>' },
    })
    expect(wrapper.exists()).toBe(true)
  })
})
