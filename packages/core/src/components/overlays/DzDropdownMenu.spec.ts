import { enableAutoUnmount, mount } from '@vue/test-utils'
/**
 * DzDropdownMenu — Unit / behavior tests.
 */
import { afterEach, describe, expect, it } from 'vitest'
import { h } from 'vue'
import DzDropdownMenu from './DzDropdownMenu.vue'
import DzDropdownMenuContent from './DzDropdownMenuContent.vue'
import DzDropdownMenuItem from './DzDropdownMenuItem.vue'
import DzDropdownMenuTrigger from './DzDropdownMenuTrigger.vue'

/** Reka portals content through Presence, which settles over several microtasks. */
const flush = () => new Promise(resolve => setTimeout(resolve, 0))

enableAutoUnmount(afterEach)

/** Content is portalled to <body>, so assertions read the document, not the wrapper. */
function mountMenu(
  props: Record<string, unknown>,
  contentProps: Record<string, unknown> = {},
) {
  return mount(DzDropdownMenu, {
    props,
    slots: {
      default: () => h('div', { 'data-testid': 'menu-host' }, [
        h(DzDropdownMenuTrigger, {}, () => h('button', { type: 'button' }, 'Open')),
        h(DzDropdownMenuContent, contentProps, () => h(DzDropdownMenuItem, {}, () => 'One')),
      ]),
    },
    attachTo: document.body,
  })
}

describe('dzDropdownMenu — Unit Tests', () => {
  it('renders the component', () => {
    const wrapper = mount(DzDropdownMenu, {
      slots: { default: '<div>Content</div>' },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('default slot renders children', () => {
    const wrapper = mount(DzDropdownMenu, {
      slots: { default: '<div data-testid="child">Child</div>' },
    })
    expect(wrapper.find('[data-testid="child"]').exists()).toBe(true)
  })

  it('accepts modal prop', () => {
    const wrapper = mount(DzDropdownMenu, {
      props: { modal: false },
      slots: { default: '<div>Content</div>' },
    })
    expect(wrapper.exists()).toBe(true)
  })

  // `defaultOpen` was declared on DzDropdownMenuProps but never forwarded to
  // DropdownMenuRoot, so an uncontrolled menu asked to start open stayed shut.
  it('opens on mount when defaultOpen is set', async () => {
    mountMenu({ defaultOpen: true, modal: false })
    await flush()
    expect(document.querySelector('[role="menu"]')).not.toBeNull()
    expect(document.querySelector('[aria-expanded="true"]')).not.toBeNull()
  })

  it('stays closed on mount by default', async () => {
    mountMenu({ modal: false })
    await flush()
    expect(document.querySelector('[role="menu"]')).toBeNull()
  })

  it('renders the real Reka menu inline when portalDisabled is true', async () => {
    const wrapper = mountMenu({ defaultOpen: true, modal: false }, { portalDisabled: true })
    await flush()

    expect(wrapper.find('[data-testid="menu-host"] [role="menu"]').exists()).toBe(true)
    wrapper.unmount()
  })

  it('keeps the real Reka default portal behavior', async () => {
    const wrapper = mountMenu({ defaultOpen: true, modal: false })
    await flush()

    const host = document.querySelector('[data-testid="menu-host"]')
    expect(host?.querySelector('[role="menu"]')).toBeNull()
    expect(document.body.querySelector('[role="menu"]')?.textContent).toContain('One')
    wrapper.unmount()
  })
})
