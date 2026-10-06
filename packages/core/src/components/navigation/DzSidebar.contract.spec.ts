import { expectFallthrough } from '@dzup-ui/testing'
import { mount } from '@vue/test-utils'
/**
 * DzSidebar — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import { anatomy } from './DzSidebar.anatomy.ts'
import DzSidebar from './DzSidebar.vue'

describe('dzSidebar — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzSidebar)
    expect(wrapper.exists()).toBe(true)
  })

  it('renders default slot content', () => {
    const wrapper = mount(DzSidebar, { slots: { default: '<nav>Nav items</nav>' } })
    expect(wrapper.text()).toContain('Nav items')
  })

  it('accepts collapsed=true', () => {
    const wrapper = mount(DzSidebar, { props: { collapsed: true } })
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts collapsed=false', () => {
    const wrapper = mount(DzSidebar, { props: { collapsed: false } })
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts mobileOpen=true', () => {
    const wrapper = mount(DzSidebar, { props: { mobileOpen: true } })
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts position="static"', () => {
    const wrapper = mount(DzSidebar, { props: { position: 'static' } })
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts position="fixed"', () => {
    const wrapper = mount(DzSidebar, { props: { position: 'fixed' } })
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts activeStyle="filled"', () => {
    const wrapper = mount(DzSidebar, { props: { activeStyle: 'filled' } })
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts activeStyle="rail"', () => {
    const wrapper = mount(DzSidebar, { props: { activeStyle: 'rail' } })
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts custom width', () => {
    const wrapper = mount(DzSidebar, { props: { width: '20rem' } })
    expect(wrapper.exists()).toBe(true)
  })

  it('forwards ariaLabel', () => {
    const wrapper = mount(DzSidebar, { props: { ariaLabel: 'Main navigation' } })
    expect(wrapper.html()).toContain('Main navigation')
  })

  it('applies contain: layout style within the template', () => {
    const wrapper = mount(DzSidebar)
    expect(wrapper.html()).toContain('[contain:layout_style]')
  })

  // ── ARIA ──

  it('is a navigation landmark with the default accessible name', () => {
    const wrapper = mount(DzSidebar, { props: { isMobile: false } })
    const nav = wrapper.get('[role="navigation"]')
    expect(nav.attributes('aria-label')).toBe('Sidebar navigation')
    expect(nav.attributes('aria-hidden')).toBeUndefined()
  })

  it('hides a closed mobile drawer from the accessibility tree', async () => {
    const wrapper = mount(DzSidebar, { props: { isMobile: true, mobileOpen: false } })
    const nav = wrapper.get('[role="navigation"]')
    expect(nav.attributes('aria-hidden')).toBe('true')
    expect(nav.attributes('inert')).toBeDefined()
    await wrapper.setProps({ mobileOpen: true })
    expect(wrapper.get('[role="navigation"]').attributes('aria-hidden')).toBeUndefined()
  })

  // ── Events ──

  it('emits update:mobileOpen false when the mobile overlay is clicked', async () => {
    const wrapper = mount(DzSidebar, {
      props: { isMobile: true, mobileOpen: true },
      global: { stubs: { teleport: true } },
    })
    await wrapper.get('[data-part="overlay"]').trigger('click')
    expect(wrapper.emitted('update:mobileOpen')).toEqual([[false]])
  })

  it('emits update:collapsed with the value restored from storageKey', async () => {
    window.localStorage.setItem('dz-sidebar-contract', '1')
    try {
      const wrapper = mount(DzSidebar, { props: { storageKey: 'dz-sidebar-contract', isMobile: false } })
      await wrapper.vm.$nextTick()
      expect(wrapper.emitted('update:collapsed')).toEqual([[true]])
      expect(wrapper.get('[role="navigation"]').attributes('data-state')).toBe('collapsed')
    }
    finally {
      window.localStorage.removeItem('dz-sidebar-contract')
    }
  })
})

// ---------------------------------------------------------------------------
// Attribute fallthrough (TASK-R5-O6)
// ---------------------------------------------------------------------------

describe('dzSidebar — attribute fallthrough', () => {
  // Multi-root: a teleported mobile overlay and the <nav>. The overlay renders
  // behind a viewport `v-if`, so a consumer's `id` on it would exist at some
  // widths and not others — which is why the nav is the declared target.
  it('a consumer\'s class and id land on the declared target', () => {
    const wrapper = mount(DzSidebar, {
      attrs: { class: 'dz-fallthrough-probe', id: 'dz-fallthrough-id' },
      attachTo: document.body,
    })

    expectFallthrough(
      wrapper.element.parentElement ?? wrapper.element,
      anatomy.fallthrough,
      { className: 'dz-fallthrough-probe', id: 'dz-fallthrough-id' },
      'DzSidebar',
    )
    wrapper.unmount()
  })
})
