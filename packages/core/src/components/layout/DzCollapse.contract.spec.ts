import { mount } from '@vue/test-utils'
/**
 * DzCollapse — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzCollapse from './DzCollapse.vue'

describe('dzCollapse — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzCollapse, { slots: { default: '<div>Content</div>' } })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders default slot content', () => {
    const wrapper = mount(DzCollapse, {
      props: { modelValue: true },
      slots: { default: '<div data-testid="content">Content</div>' },
    })
    expect(wrapper.find('[data-testid="content"]').exists()).toBe(true)
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzCollapse, {
      attrs: { class: 'custom-class' },
      slots: { default: '<div>Content</div>' },
    })
    expect(wrapper.html()).toContain('custom-class')
  })
})
