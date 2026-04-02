import { mount } from '@vue/test-utils'
/**
 * DzResult — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import DzResult from './DzResult.vue'

describe('dzResult — Unit Tests', () => {
  it('renders a <div> with role="status"', () => {
    const wrapper = mount(DzResult, {
      props: { status: 'success', title: 'Done' },
    })
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.attributes('role')).toBe('status')
  })

  it('renders title text', () => {
    const wrapper = mount(DzResult, {
      props: { status: 'success', title: 'Payment Complete' },
    })
    expect(wrapper.text()).toContain('Payment Complete')
  })

  it('renders description when provided', () => {
    const wrapper = mount(DzResult, {
      props: { status: 'error', title: 'Failed', description: 'Try again' },
    })
    expect(wrapper.text()).toContain('Try again')
  })

  it('does not render description when not provided', () => {
    const wrapper = mount(DzResult, {
      props: { status: 'info', title: 'Info' },
    })
    // Only the title and icon should be present
    expect(wrapper.findAll('p')).toHaveLength(0)
  })

  it('sets data-state to the status value', () => {
    const wrapper = mount(DzResult, {
      props: { status: 'warning', title: 'Warning' },
    })
    expect(wrapper.attributes('data-state')).toBe('warning')
  })

  it('renders success icon for success status', () => {
    const wrapper = mount(DzResult, {
      props: { status: 'success', title: 'Done' },
    })
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('renders error icon for error status', () => {
    const wrapper = mount(DzResult, {
      props: { status: 'error', title: 'Error' },
    })
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('icon slot overrides default status icon', () => {
    const wrapper = mount(DzResult, {
      props: { status: 'success', title: 'Done' },
      slots: { icon: '<span data-testid="custom-icon">*</span>' },
    })
    expect(wrapper.find('[data-testid="custom-icon"]').exists()).toBe(true)
  })

  it('renders actions slot', () => {
    const wrapper = mount(DzResult, {
      props: { status: 'success', title: 'Done' },
      slots: { actions: '<button>OK</button>' },
    })
    expect(wrapper.find('button').text()).toBe('OK')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzResult, {
      attrs: { class: 'my-class' },
      props: { status: 'info', title: 'Info' },
    })
    expect(wrapper.classes()).toContain('my-class')
  })
})
