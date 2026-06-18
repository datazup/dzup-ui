import { mount } from '@vue/test-utils'
/**
 * DzKbd — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzKbd from './DzKbd.vue'

describe('dzKbd — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzKbd, { slots: { default: 'Esc' } })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders as a semantic <kbd> element', () => {
    const wrapper = mount(DzKbd, { slots: { default: 'Esc' } })
    expect(wrapper.element.tagName).toBe('KBD')
  })

  it('renders default slot content', () => {
    const wrapper = mount(DzKbd, { slots: { default: 'Enter' } })
    expect(wrapper.text()).toContain('Enter')
  })

  it('accepts a keys prop and renders a chip per key', () => {
    const wrapper = mount(DzKbd, { props: { keys: ['ctrl', 'a'], platformAware: false } })
    expect(wrapper.findAll('kbd kbd')).toHaveLength(2)
  })

  it('accepts all canonical sizes', () => {
    for (const size of ['icon', 'xs', 'sm', 'md', 'lg', 'xl'] as const) {
      const wrapper = mount(DzKbd, { props: { size }, slots: { default: 'K' } })
      expect(wrapper.attributes('data-size')).toBe(size)
    }
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzKbd, {
      attrs: { class: 'custom-class' },
      slots: { default: 'K' },
    })
    expect(wrapper.html()).toContain('custom-class')
  })

  it('forwards extra HTML attributes', () => {
    const wrapper = mount(DzKbd, {
      attrs: { 'data-testid': 'my-kbd' },
      slots: { default: 'K' },
    })
    expect(wrapper.attributes('data-testid')).toBe('my-kbd')
  })

  it('sets id attribute when provided', () => {
    const wrapper = mount(DzKbd, { props: { id: 'kbd-1' }, slots: { default: 'K' } })
    expect(wrapper.attributes('id')).toBe('kbd-1')
  })
})
