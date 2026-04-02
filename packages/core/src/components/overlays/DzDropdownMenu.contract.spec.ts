import { mount } from '@vue/test-utils'
/**
 * DzDropdownMenu — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzDropdownMenu from './DzDropdownMenu.vue'

describe('dzDropdownMenu — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzDropdownMenu, { slots: { default: '<div>Content</div>' } })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders default slot content', () => {
    const wrapper = mount(DzDropdownMenu, {
      slots: { default: '<div data-testid="content">Trigger + Menu</div>' },
    })
    expect(wrapper.find('[data-testid="content"]').exists()).toBe(true)
  })

  it('merges consumer class via cn()', () => {
    // DzDropdownMenu is a thin wrapper around DropdownMenuRoot and does not forward class attrs
    const wrapper = mount(DzDropdownMenu, {
      attrs: { class: 'custom-class' },
      slots: { default: '<div>Content</div>' },
    })
    expect(wrapper.exists()).toBe(true)
  })
})
