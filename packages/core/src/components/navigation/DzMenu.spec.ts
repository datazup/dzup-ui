import { mount } from '@vue/test-utils'
/**
 * DzMenu — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import DzMenu from './DzMenu.vue'
import DzMenuItem from './DzMenuItem.vue'
import DzMenuSeparator from './DzMenuSeparator.vue'

describe('dzMenu — Unit Tests', () => {
  it('renders a <nav> element with role="navigation"', () => {
    const wrapper = mount(DzMenu, {
      slots: { default: () => h(DzMenuItem, null, { default: () => 'Home' }) },
    })
    expect(wrapper.element.tagName).toBe('NAV')
    expect(wrapper.attributes('role')).toBe('navigation')
  })

  it('sets aria-label', () => {
    const wrapper = mount(DzMenu, {
      props: { ariaLabel: 'Main nav' },
      slots: { default: () => h(DzMenuItem, null, { default: () => 'Home' }) },
    })
    expect(wrapper.attributes('aria-label')).toBe('Main nav')
  })

  it('renders menu items', () => {
    const wrapper = mount(DzMenu, {
      slots: {
        default: () => [
          h(DzMenuItem, null, { default: () => 'Home' }),
          h(DzMenuItem, null, { default: () => 'About' }),
        ],
      },
    })
    expect(wrapper.findAllComponents(DzMenuItem)).toHaveLength(2)
  })

  it('renders separator', () => {
    const wrapper = mount(DzMenu, {
      slots: {
        default: () => [
          h(DzMenuItem, null, { default: () => 'Home' }),
          h(DzMenuSeparator),
          h(DzMenuItem, null, { default: () => 'Settings' }),
        ],
      },
    })
    expect(wrapper.findComponent(DzMenuSeparator).exists()).toBe(true)
  })

  it('active item has aria-current="page"', () => {
    const wrapper = mount(DzMenu, {
      slots: {
        default: () => h(DzMenuItem, { active: true }, { default: () => 'Home' }),
      },
    })
    const item = wrapper.findComponent(DzMenuItem)
    expect(item.find('button').attributes('aria-current')).toBe('page')
  })

  it('disabled item has disabled attribute', () => {
    const wrapper = mount(DzMenu, {
      slots: {
        default: () => h(DzMenuItem, { disabled: true }, { default: () => 'Disabled' }),
      },
    })
    const item = wrapper.findComponent(DzMenuItem)
    expect(item.find('button').attributes('disabled')).toBeDefined()
  })

  it('item with href renders as <a>', () => {
    const wrapper = mount(DzMenu, {
      slots: {
        default: () => h(DzMenuItem, { href: '/home' }, { default: () => 'Home' }),
      },
    })
    const item = wrapper.findComponent(DzMenuItem)
    expect(item.find('a').exists()).toBe(true)
    expect(item.find('a').attributes('href')).toBe('/home')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzMenu, {
      attrs: { class: 'my-class' },
      slots: { default: () => h(DzMenuItem, null, { default: () => 'Home' }) },
    })
    expect(wrapper.classes()).toContain('my-class')
  })
})
