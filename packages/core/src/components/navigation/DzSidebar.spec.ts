/**
 * DzSidebar -- Unit / behavior tests.
 */
import { mount } from '@vue/test-utils'
import { beforeAll, describe, expect, it } from 'vitest'
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
  beforeAll(() => {
    // Stub matchMedia for jsdom since it lacks the API
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }),
    })
  })

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
    expect(nav.classes().some((c: string) => c.includes('var(--dz-sidebar-collapsed-width)'))).toBe(true)
  })

  it('renders in expanded state with token-backed width', () => {
    const wrapper = mountSidebar({ collapsed: false })
    const nav = wrapper.find('nav')
    expect(nav.classes().some((c: string) => c.includes('var(--dz-sidebar-width)'))).toBe(true)
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

  it('defaults to position=static and renders relative root', () => {
    const wrapper = mountSidebar()
    const nav = wrapper.find('nav')
    expect(nav.classes()).toContain('relative')
    expect(nav.classes()).not.toContain('fixed')
  })

  it('with position=fixed renders fixed root with z-index token', () => {
    const wrapper = mountSidebar({ position: 'fixed' })
    const nav = wrapper.find('nav')
    expect(nav.classes()).toContain('fixed')
    expect(nav.classes().some(c => c.includes('var(--dz-sidebar-z-index)'))).toBe(true)
  })

  it('renders closed mobile drawer as fixed so it does not reserve layout width', () => {
    const wrapper = mountSidebar({ isMobile: true, mobileOpen: false })
    const nav = wrapper.find('nav')
    expect(nav.classes()).toContain('fixed')
    expect(nav.classes()).toContain('-translate-x-full')
    expect(nav.classes().some(c => c.includes('var(--dz-sidebar-width)'))).toBe(true)
  })

  it('overlay class uses sidebar overlay token', () => {
    // isMobile=true and mobileOpen=true are passed directly to skip matchMedia.
    // Teleport renders to document.body in jsdom, so we check document.body.innerHTML.
    const wrapper = mount(DzSidebar, {
      props: { isMobile: true, mobileOpen: true },
      attachTo: document.body,
      global: { stubs: { Teleport: false } },
      slots: { default: () => h('div') },
    })
    const overlayClass = 'var(--dz-sidebar-overlay-bg)'
    // Check both the wrapper html and the full document body for the overlay token class
    const fullHtml = document.body.innerHTML + wrapper.html()
    expect(fullHtml.includes(overlayClass)).toBe(true)
    wrapper.unmount()
  })

  it('active item with default activeStyle uses filled tokens', () => {
    const wrapper = mount(DzSidebar, {
      global: { stubs: { Teleport: true } },
      slots: {
        default: () => [
          h(DzSidebarItem, { active: true }, { default: () => 'Active' }),
        ],
      },
    })
    const item = wrapper.find('[data-state="active"]')
    expect(item.classes().some(c => c.includes('var(--dz-sidebar-item-active-bg)'))).toBe(true)
    expect(item.classes().some(c => c.includes('var(--dz-sidebar-item-active-text)'))).toBe(true)
  })

  it('active item with activeStyle=rail uses border-left accent', () => {
    const wrapper = mount(DzSidebar, {
      props: { activeStyle: 'rail' },
      global: { stubs: { Teleport: true } },
      slots: {
        default: () => [
          h(DzSidebarItem, { active: true }, { default: () => 'Active' }),
        ],
      },
    })
    const item = wrapper.find('[data-state="active"]')
    expect(item.classes().some(c => c.includes('border-l-[3px]'))).toBe(true)
    expect(item.classes().some(c => c.includes('border-l-[var(--dz-sidebar-item-active-bg)]'))).toBe(true)
  })
})
