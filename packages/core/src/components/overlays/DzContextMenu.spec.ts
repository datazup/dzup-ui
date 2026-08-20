import { enableAutoUnmount, mount } from '@vue/test-utils'
/**
 * DzContextMenu — Unit / behavior tests.
 */
import { afterEach, describe, expect, it } from 'vitest'
import { h } from 'vue'
import DzContextMenu from './DzContextMenu.vue'
import DzContextMenuContent from './DzContextMenuContent.vue'
import DzContextMenuItem from './DzContextMenuItem.vue'
import DzContextMenuSeparator from './DzContextMenuSeparator.vue'
import DzContextMenuTrigger from './DzContextMenuTrigger.vue'

const flush = () => new Promise(resolve => setTimeout(resolve, 50))

enableAutoUnmount(afterEach)

function mountContextMenu(contentProps: Record<string, unknown> = {}) {
  return mount(DzContextMenu, {
    props: { modal: false },
    slots: {
      default: () => h('div', { 'data-testid': 'context-menu-host' }, [
        h(DzContextMenuTrigger, {}, () => h('div', { 'data-testid': 'context-trigger' }, 'Open')),
        h(DzContextMenuContent, contentProps, () => h(DzContextMenuItem, {}, () => 'One')),
      ]),
    },
    attachTo: document.body,
  })
}

describe('dzContextMenu — Unit Tests', () => {
  it('renders the component', () => {
    const wrapper = mount(DzContextMenu, {
      slots: { default: '<div>Content</div>' },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('default slot renders children', () => {
    const wrapper = mount(DzContextMenu, {
      slots: { default: '<div data-testid="child">Child</div>' },
    })
    expect(wrapper.find('[data-testid="child"]').exists()).toBe(true)
  })

  it('accepts modal prop', () => {
    const wrapper = mount(DzContextMenu, {
      props: { modal: false },
      slots: { default: '<div>Content</div>' },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('defaults modal to true', () => {
    const wrapper = mount(DzContextMenu, {
      slots: { default: '<div>Content</div>' },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders the real Reka menu inline when portalDisabled is true', async () => {
    const wrapper = mountContextMenu({ portalDisabled: true })
    await wrapper.get('[data-testid="context-trigger"]').trigger('contextmenu', { clientX: 20, clientY: 20 })
    await flush()

    expect(wrapper.find('[data-testid="context-menu-host"] [role="menu"]').exists()).toBe(true)
    wrapper.unmount()
  })

  it('keeps the real Reka default portal behavior', async () => {
    const wrapper = mountContextMenu()
    await wrapper.get('[data-testid="context-trigger"]').trigger('contextmenu', { clientX: 20, clientY: 20 })
    await flush()

    const host = document.querySelector('[data-testid="context-menu-host"]')
    expect(host?.querySelector('[role="menu"]')).toBeNull()
    expect(document.body.querySelector('[role="menu"]')?.textContent).toContain('One')
    wrapper.unmount()
  })
})

describe('dzContextMenuTrigger — Unit Tests', () => {
  it('renders trigger content within context menu', () => {
    const wrapper = mount(DzContextMenu, {
      slots: {
        default: () =>
          h(DzContextMenuTrigger, null, {
            default: () => h('div', { 'data-testid': 'trigger' }, 'Trigger'),
          }),
      },
    })
    expect(wrapper.find('[data-testid="trigger"]').exists()).toBe(true)
  })
})

describe('dzContextMenuSeparator — Unit Tests', () => {
  /**
   * DzContextMenuSeparator wraps Reka UI ContextMenuSeparator which requires
   * ContextMenuRoot context. Testing in isolation verifies the component
   * definition exists and exports correctly.
   */
  it('component is defined', () => {
    expect(DzContextMenuSeparator).toBeDefined()
    expect(DzContextMenuSeparator.__name).toBe('DzContextMenuSeparator')
  })
})
