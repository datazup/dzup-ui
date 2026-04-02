import { mount } from '@vue/test-utils'
/**
 * DzEmpty — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import DzEmpty from './DzEmpty.vue'

describe('dzEmpty — Unit Tests', () => {
  it('renders a <div> with role="status"', () => {
    const wrapper = mount(DzEmpty, { props: { title: 'No data' } })
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.attributes('role')).toBe('status')
  })

  it('renders title when provided', () => {
    const wrapper = mount(DzEmpty, { props: { title: 'No results' } })
    expect(wrapper.text()).toContain('No results')
  })

  it('renders description when provided', () => {
    const wrapper = mount(DzEmpty, {
      props: { title: 'Empty', description: 'Try again later.' },
    })
    expect(wrapper.text()).toContain('Try again later.')
  })

  it('renders icon component when provided', () => {
    const IconComp = defineComponent({
      render() { return h('svg', { 'data-testid': 'icon' }) },
    })
    const wrapper = mount(DzEmpty, {
      props: { title: 'Empty', icon: IconComp },
    })
    expect(wrapper.find('[data-testid="icon"]').exists()).toBe(true)
  })

  it('icon slot overrides icon prop', () => {
    const IconComp = defineComponent({
      render() { return h('svg', { 'data-testid': 'prop-icon' }) },
    })
    const wrapper = mount(DzEmpty, {
      props: { title: 'Empty', icon: IconComp },
      slots: { icon: '<svg data-testid="slot-icon"></svg>' },
    })
    expect(wrapper.find('[data-testid="slot-icon"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="prop-icon"]').exists()).toBe(false)
  })

  it('renders actions slot', () => {
    const wrapper = mount(DzEmpty, {
      props: { title: 'Empty' },
      slots: { actions: '<button>Retry</button>' },
    })
    expect(wrapper.find('button').text()).toBe('Retry')
  })

  it('does not render actions area when no actions slot', () => {
    const wrapper = mount(DzEmpty, { props: { title: 'Empty' } })
    // No actions div should exist
    expect(wrapper.findAll('button')).toHaveLength(0)
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzEmpty, {
      attrs: { class: 'my-class' },
      props: { title: 'Empty' },
    })
    expect(wrapper.classes()).toContain('my-class')
  })

  it('default slot overrides built-in content', () => {
    const wrapper = mount(DzEmpty, {
      props: { title: 'Title Prop' },
      slots: { default: 'Custom content' },
    })
    expect(wrapper.text()).toContain('Custom content')
    expect(wrapper.text()).not.toContain('Title Prop')
  })
})
