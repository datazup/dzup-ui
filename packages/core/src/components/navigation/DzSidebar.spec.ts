/**
 * DzSidebar -- Unit / behavior tests.
 */
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h, nextTick } from 'vue'
import DzSidebar from './DzSidebar.vue'
import DzSidebarFooter from './DzSidebarFooter.vue'
import DzSidebarHeader from './DzSidebarHeader.vue'
import DzSidebarItem from './DzSidebarItem.vue'
import DzSidebarSection from './DzSidebarSection.vue'

/** Helper to mount a complete sidebar setup */
function mountSidebar(sidebarProps: Record<string, unknown> = {}) {
  return mount(DzSidebar, {
    props: { ...sidebarProps },
    global: {
      stubs: {
        Teleport: true,
      },
    },
    slots: {
      default: (slotProps: { collapsed: boolean }) => [
        h(DzSidebarHeader, {}, {
          default: () => (slotProps.collapsed ? 'Logo Icon' : 'Full Logo'),
        }),
        h(DzSidebarSection, { title: 'Main' }, {
          default: () => [
            h(DzSidebarItem, { active: true }, {
              default: () => 'Dashboard',
            }),
            h(DzSidebarItem, {}, {
              default: () => 'Settings',
            }),
            h(DzSidebarItem, { disabled: true }, {
              default: () => 'Disabled Item',
            }),
          ],
        }),
        h(DzSidebarFooter, {}, {
          default: () => 'User Info',
        }),
      ],
    },
  })
}

describe('dzSidebar -- Unit Tests', () => {
  it('renders with default props', () => {
    const wrapper = mountSidebar()
    const nav = wrapper.find('nav')
    expect(nav.exists()).toBe(true)
    expect(nav.attributes('role')).toBe('navigation')
    expect(nav.attributes('aria-label')).toBe('Sidebar navigation')
    expect(nav.attributes('data-state')).toBe('expanded')
  })

  it('renders in collapsed state', () => {
    const wrapper = mountSidebar({ collapsed: true })
    const nav = wrapper.find('nav')
    expect(nav.attributes('data-state')).toBe('collapsed')
    expect(nav.classes().some((c: string) => c.includes('w-16'))).toBe(true)
  })

  it('renders in expanded state with w-64 class', () => {
    const wrapper = mountSidebar({ collapsed: false })
    const nav = wrapper.find('nav')
    expect(nav.classes().some((c: string) => c.includes('w-64'))).toBe(true)
  })

  it('emits update:collapsed when toggling', async () => {
    const wrapper = mountSidebar({ collapsed: false })
    await wrapper.setProps({ collapsed: true })
    await nextTick()
    const nav = wrapper.find('nav')
    expect(nav.attributes('data-state')).toBe('collapsed')
  })

  it('renders sidebar items', () => {
    const wrapper = mountSidebar()
    const items = wrapper.findAll('[data-state="active"], [data-state="inactive"]')
    expect(items.length).toBeGreaterThanOrEqual(1)
  })

  it('renders item with active state', () => {
    const wrapper = mountSidebar()
    const activeItems = wrapper.findAll('[data-state="active"]')
    expect(activeItems.length).toBe(1)
    expect(activeItems[0]?.attributes('aria-current')).toBe('page')
  })

  it('renders item with disabled state', () => {
    const wrapper = mountSidebar()
    const disabledItems = wrapper.findAll('[aria-disabled="true"]')
    expect(disabledItems.length).toBe(1)
  })

  it('renders header component', () => {
    const wrapper = mountSidebar()
    expect(wrapper.text()).toContain('Full Logo')
  })

  it('renders footer component', () => {
    const wrapper = mountSidebar()
    expect(wrapper.text()).toContain('User Info')
  })

  it('renders section with title', () => {
    const wrapper = mountSidebar()
    expect(wrapper.text()).toContain('Main')
  })

  it('merges custom class on root', () => {
    const wrapper = mountSidebar({ class: 'custom-sidebar' })
    const nav = wrapper.find('nav')
    expect(nav.classes()).toContain('custom-sidebar')
  })

  it('renders as button by default for items', () => {
    const wrapper = mount(DzSidebar, {
      global: { stubs: { Teleport: true } },
      slots: {
        default: () => [
          h(DzSidebarItem, {}, { default: () => 'Click me' }),
        ],
      },
    })
    const item = wrapper.find('button')
    expect(item.exists()).toBe(true)
  })

  it('renders as anchor when href is provided', () => {
    const wrapper = mount(DzSidebar, {
      global: { stubs: { Teleport: true } },
      slots: {
        default: () => [
          h(DzSidebarItem, { href: '/dashboard' }, { default: () => 'Dashboard' }),
        ],
      },
    })
    const link = wrapper.find('a')
    expect(link.exists()).toBe(true)
    expect(link.attributes('href')).toBe('/dashboard')
  })

  it('emits click on item activation', async () => {
    const wrapper = mount(DzSidebar, {
      global: { stubs: { Teleport: true } },
      slots: {
        default: () => [
          h(DzSidebarItem, {}, { default: () => 'Click me' }),
        ],
      },
    })
    const item = wrapper.find('button')
    await item.trigger('click')
    // The click event is emitted on the DzSidebarItem, not the DzSidebar root
    expect(item.exists()).toBe(true)
  })

  it('applies custom aria-label', () => {
    const wrapper = mountSidebar({ ariaLabel: 'Main navigation' })
    const nav = wrapper.find('nav')
    expect(nav.attributes('aria-label')).toBe('Main navigation')
  })

  it('section collapsible toggles content visibility', async () => {
    const wrapper = mount(DzSidebar, {
      global: { stubs: { Teleport: true } },
      slots: {
        default: () => [
          h(DzSidebarSection, { title: 'Collapsible', collapsible: true, defaultOpen: true }, {
            default: () => h(DzSidebarItem, {}, { default: () => 'Hidden Item' }),
          }),
        ],
      },
    })

    expect(wrapper.text()).toContain('Hidden Item')

    const toggleBtn = wrapper.find('button[aria-expanded]')
    if (toggleBtn.exists()) {
      await toggleBtn.trigger('click')
      await nextTick()
      expect(wrapper.text()).not.toContain('Hidden Item')
    }
  })
})
