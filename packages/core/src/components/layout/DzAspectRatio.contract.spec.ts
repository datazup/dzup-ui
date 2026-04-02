import { mount } from '@vue/test-utils'
/**
 * DzAspectRatio — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzAspectRatio from './DzAspectRatio.vue'

describe('dzAspectRatio — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzAspectRatio, { slots: { default: '<img src="x" alt="y" />' } })
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts ratio prop', () => {
    const wrapper = mount(DzAspectRatio, {
      props: { ratio: 16 / 9 },
      slots: { default: '<img src="x" alt="y" />' },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders default slot content', () => {
    const wrapper = mount(DzAspectRatio, {
      slots: { default: '<div data-testid="content">Content</div>' },
    })
    expect(wrapper.find('[data-testid="content"]').exists()).toBe(true)
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzAspectRatio, {
      attrs: { class: 'custom-class' },
      slots: { default: '<div>Content</div>' },
    })
    expect(wrapper.html()).toContain('custom-class')
  })
})
