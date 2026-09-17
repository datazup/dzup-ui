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
    expect(wrapper.html()).toContain('contain: layout style')
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
