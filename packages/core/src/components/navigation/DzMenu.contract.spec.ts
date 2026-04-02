import { mount } from '@vue/test-utils'
/**
 * DzMenu — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzMenu from './DzMenu.vue'

describe('dzMenu — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzMenu, { slots: { default: '<div>Menu Items</div>' } })
    expect(wrapper.exists()).toBe(true)
  })

  it('has contain: layout style on root element', () => {
    const wrapper = mount(DzMenu, { slots: { default: '<div>Items</div>' } })
    expect(wrapper.attributes('style')).toContain('contain: layout style')
  })

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzMenu, { props: { size }, slots: { default: '<div>Items</div>' } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('forwards aria-label', () => {
    const wrapper = mount(DzMenu, {
      props: { ariaLabel: 'Main navigation' },
      slots: { default: '<div>Items</div>' },
    })
    expect(wrapper.html()).toContain('Main navigation')
  })

  it('renders default slot content', () => {
    const wrapper = mount(DzMenu, {
      slots: { default: '<div data-testid="item">Item</div>' },
    })
    expect(wrapper.find('[data-testid="item"]').exists()).toBe(true)
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzMenu, {
      attrs: { class: 'custom-class' },
      slots: { default: '<div>Items</div>' },
    })
    expect(wrapper.html()).toContain('custom-class')
  })
})
