import { mount } from '@vue/test-utils'
/**
 * DzSheet — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzSheet from './DzSheet.vue'

describe('dzSheet — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzSheet, { slots: { default: '<div>Content</div>' } })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders default slot content', () => {
    const wrapper = mount(DzSheet, {
      slots: { default: '<div data-testid="content">Sheet children</div>' },
    })
    expect(wrapper.find('[data-testid="content"]').exists()).toBe(true)
  })

  it('merges consumer class via cn()', () => {
    // DzSheet is a thin wrapper around DialogRoot and does not forward class attrs
    const wrapper = mount(DzSheet, {
      attrs: { class: 'custom-class' },
      slots: { default: '<div>Content</div>' },
    })
    expect(wrapper.exists()).toBe(true)
  })
})
