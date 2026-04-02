import { mount } from '@vue/test-utils'
/**
 * DzEmpty — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzEmpty from './DzEmpty.vue'

describe('dzEmpty — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzEmpty)
    expect(wrapper.exists()).toBe(true)
  })

  it('displays title when provided', () => {
    const wrapper = mount(DzEmpty, { props: { title: 'No data' } })
    expect(wrapper.text()).toContain('No data')
  })

  it('displays description when provided', () => {
    const wrapper = mount(DzEmpty, { props: { description: 'Try adjusting filters' } })
    expect(wrapper.text()).toContain('Try adjusting filters')
  })

  it('renders default slot content', () => {
    const wrapper = mount(DzEmpty, {
      slots: { default: '<p data-testid="custom">Custom content</p>' },
    })
    expect(wrapper.find('[data-testid="custom"]').exists()).toBe(true)
  })

  it('renders icon slot', () => {
    const wrapper = mount(DzEmpty, {
      slots: { icon: '<span data-testid="icon">I</span>' },
    })
    expect(wrapper.find('[data-testid="icon"]').exists()).toBe(true)
  })

  it('renders actions slot', () => {
    const wrapper = mount(DzEmpty, {
      slots: { actions: '<button data-testid="action">Retry</button>' },
    })
    expect(wrapper.find('[data-testid="action"]').exists()).toBe(true)
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzEmpty, { attrs: { class: 'custom-class' } })
    expect(wrapper.html()).toContain('custom-class')
  })
})
