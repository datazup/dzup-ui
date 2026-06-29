import { mount } from '@vue/test-utils'
/**
 * DzAppShell — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzAppShell from './DzAppShell.vue'

describe('dzAppShell — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzAppShell)
    expect(wrapper.exists()).toBe(true)
  })

  it('renders default slot content', () => {
    const wrapper = mount(DzAppShell, { slots: { default: '<div>Main content</div>' } })
    expect(wrapper.text()).toContain('Main content')
  })

  it('renders sidebar slot content', () => {
    const wrapper = mount(DzAppShell, { slots: { sidebar: '<nav>Sidebar</nav>' } })
    expect(wrapper.text()).toContain('Sidebar')
  })

  it('renders header slot content', () => {
    const wrapper = mount(DzAppShell, { slots: { header: '<h1>Header</h1>' } })
    expect(wrapper.text()).toContain('Header')
  })

  it('renders header-start slot', () => {
    const wrapper = mount(DzAppShell, { slots: { 'header-start': '<button>Toggle</button>' } })
    expect(wrapper.text()).toContain('Toggle')
  })

  it('renders header-end slot', () => {
    const wrapper = mount(DzAppShell, { slots: { 'header-end': '<span>User</span>' } })
    expect(wrapper.text()).toContain('User')
  })

  it('accepts hasSidebar=false', () => {
    const wrapper = mount(DzAppShell, { props: { hasSidebar: false } })
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts hasHeader=false', () => {
    const wrapper = mount(DzAppShell, { props: { hasHeader: false } })
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts custom sidebarWidth', () => {
    const wrapper = mount(DzAppShell, { props: { sidebarWidth: '20rem' } })
    expect(wrapper.exists()).toBe(true)
  })

  it('forwards ariaLabel', () => {
    const wrapper = mount(DzAppShell, { props: { ariaLabel: 'Application shell' } })
    expect(wrapper.html()).toContain('Application shell')
  })

  it('has contain: layout style on root element', () => {
    const wrapper = mount(DzAppShell)
    expect(wrapper.attributes('style')).toContain('contain: layout style')
  })
})
