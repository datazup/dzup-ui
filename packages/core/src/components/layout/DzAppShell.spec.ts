import { mount } from '@vue/test-utils'
/**
 * DzAppShell -- Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import DzAppShell from './DzAppShell.vue'

describe('dzAppShell -- Unit Tests', () => {
  it('renders with default props', () => {
    const wrapper = mount(DzAppShell, {
      slots: { default: 'Main content' },
    })
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.text()).toContain('Main content')
  })

  it('applies root layout classes', () => {
    const wrapper = mount(DzAppShell, {
      slots: { default: 'Content' },
    })
    expect(wrapper.classes()).toContain('relative')
    expect(wrapper.classes()).toContain('flex')
    expect(wrapper.classes()).toContain('h-screen')
    expect(wrapper.classes()).toContain('w-full')
    expect(wrapper.classes()).toContain('overflow-hidden')
  })

  it('renders sidebar slot when hasSidebar is true', () => {
    const wrapper = mount(DzAppShell, {
      props: { hasSidebar: true },
      slots: {
        sidebar: () => h('nav', { 'data-testid': 'sidebar' }, 'Sidebar'),
        default: 'Content',
      },
    })
    expect(wrapper.find('[data-testid="sidebar"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="sidebar"]').text()).toBe('Sidebar')
  })

  it('hides sidebar when hasSidebar is false', () => {
    const wrapper = mount(DzAppShell, {
      props: { hasSidebar: false },
      slots: {
        sidebar: () => h('nav', { 'data-testid': 'sidebar' }, 'Sidebar'),
        default: 'Content',
      },
    })
    expect(wrapper.find('[data-testid="sidebar"]').exists()).toBe(false)
  })

  it('renders header when hasHeader is true', () => {
    const wrapper = mount(DzAppShell, {
      props: { hasHeader: true },
      slots: {
        header: () => h('span', { 'data-testid': 'header-content' }, 'Header'),
        default: 'Content',
      },
    })
    expect(wrapper.find('header').exists()).toBe(true)
    expect(wrapper.find('[data-testid="header-content"]').text()).toBe('Header')
  })

  it('hides header when hasHeader is false', () => {
    const wrapper = mount(DzAppShell, {
      props: { hasHeader: false },
      slots: {
        header: () => h('span', 'Header'),
        default: 'Content',
      },
    })
    expect(wrapper.find('header').exists()).toBe(false)
  })

  it('renders default slot content in main', () => {
    const wrapper = mount(DzAppShell, {
      slots: {
        default: () => [
          h('h1', 'Page Title'),
          h('p', 'Page body'),
        ],
      },
    })
    const main = wrapper.find('main')
    expect(main.exists()).toBe(true)
    expect(main.find('h1').text()).toBe('Page Title')
    expect(main.find('p').text()).toBe('Page body')
  })

  it('forwards id attribute', () => {
    const wrapper = mount(DzAppShell, {
      props: { id: 'app-shell' },
      slots: { default: 'Content' },
    })
    expect(wrapper.attributes('id')).toBe('app-shell')
  })

  it('forwards aria-label attribute', () => {
    const wrapper = mount(DzAppShell, {
      props: { ariaLabel: 'Application layout' },
      slots: { default: 'Content' },
    })
    expect(wrapper.attributes('aria-label')).toBe('Application layout')
  })

  it('applies contain style on root', () => {
    const wrapper = mount(DzAppShell, {
      slots: { default: 'Content' },
    })
    expect(wrapper.attributes('style')).toContain('contain:')
  })

  it('merges custom class via attrs', () => {
    const wrapper = mount(DzAppShell, {
      attrs: { class: 'custom-class' },
      slots: { default: 'Content' },
    })
    expect(wrapper.classes()).toContain('custom-class')
  })
})
