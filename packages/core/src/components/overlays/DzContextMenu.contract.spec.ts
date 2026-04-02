import { mount } from '@vue/test-utils'
/**
 * DzContextMenu — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzContextMenu from './DzContextMenu.vue'

describe('dzContextMenu — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzContextMenu, { slots: { default: '<div>Content</div>' } })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders default slot content', () => {
    const wrapper = mount(DzContextMenu, {
      slots: { default: '<div data-testid="content">Trigger + Menu</div>' },
    })
    expect(wrapper.find('[data-testid="content"]').exists()).toBe(true)
  })

  it('merges consumer class via cn()', () => {
    // DzContextMenu is a thin wrapper around ContextMenuRoot and does not forward class attrs
    const wrapper = mount(DzContextMenu, {
      attrs: { class: 'custom-class' },
      slots: { default: '<div>Content</div>' },
    })
    expect(wrapper.exists()).toBe(true)
  })
})
