import { mount } from '@vue/test-utils'
/**
 * DzList — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzList from './DzList.vue'

describe('dzList — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzList, { slots: { default: '<li>Item</li>' } })
    expect(wrapper.exists()).toBe(true)
  })

  it('has contain: layout style on root element', () => {
    const wrapper = mount(DzList, { slots: { default: '<li>Item</li>' } })
    expect(wrapper.attributes('style')).toContain('contain: layout style')
  })

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzList, {
        props: { size },
        slots: { default: '<li>Item</li>' },
      })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('accepts variant values', () => {
    const variants = ['plain', 'bordered', 'divided'] as const
    for (const variant of variants) {
      const wrapper = mount(DzList, {
        props: { variant },
        slots: { default: '<li>Item</li>' },
      })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('forwards aria-label', () => {
    const wrapper = mount(DzList, {
      props: { ariaLabel: 'Items' },
      slots: { default: '<li>Item</li>' },
    })
    expect(wrapper.html()).toContain('Items')
  })

  it('renders default slot content', () => {
    const wrapper = mount(DzList, {
      slots: { default: '<li>Item content</li>' },
    })
    expect(wrapper.text()).toContain('Item content')
  })

  it('renders empty slot when no default slot provided', () => {
    const wrapper = mount(DzList as unknown as ReturnType<typeof import('vue').defineComponent>, {
      slots: { empty: '<div data-testid="empty">No items</div>' },
    })
    expect(wrapper.find('[data-testid="empty"]').exists()).toBe(true)
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzList, {
      attrs: { class: 'custom-class' },
      slots: { default: '<li>Item</li>' },
    })
    expect(wrapper.html()).toContain('custom-class')
  })
})
