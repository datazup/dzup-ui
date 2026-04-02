import { mount } from '@vue/test-utils'
/**
 * DzResult — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzResult from './DzResult.vue'

describe('dzResult — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzResult, { props: { status: 'success', title: 'Done' } })
    expect(wrapper.exists()).toBe(true)
  })

  it('displays title text', () => {
    const wrapper = mount(DzResult, { props: { status: 'success', title: 'Payment Complete' } })
    expect(wrapper.text()).toContain('Payment Complete')
  })

  it('displays description text', () => {
    const wrapper = mount(DzResult, {
      props: { status: 'error', title: 'Error', description: 'Something went wrong' },
    })
    expect(wrapper.text()).toContain('Something went wrong')
  })

  it('accepts all status values', () => {
    const statuses = ['success', 'error', 'warning', 'info'] as const
    for (const status of statuses) {
      const wrapper = mount(DzResult, { props: { status, title: 'Result' } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('renders icon slot', () => {
    const wrapper = mount(DzResult, {
      props: { status: 'success', title: 'Done' },
      slots: { icon: '<span data-testid="icon">V</span>' },
    })
    expect(wrapper.find('[data-testid="icon"]').exists()).toBe(true)
  })

  it('renders actions slot', () => {
    const wrapper = mount(DzResult, {
      props: { status: 'success', title: 'Done' },
      slots: { actions: '<button data-testid="action">Home</button>' },
    })
    expect(wrapper.find('[data-testid="action"]').exists()).toBe(true)
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzResult, {
      props: { status: 'success', title: 'Done' },
      attrs: { class: 'custom-class' },
    })
    expect(wrapper.html()).toContain('custom-class')
  })
})
