import { mount } from '@vue/test-utils'
/**
 * DzDropdownMenu — Unit / behavior tests.
 */
import { afterEach, describe, expect, it } from 'vitest'
import DzDropdownMenu from './DzDropdownMenu.vue'
import DzDropdownMenuContent from './DzDropdownMenuContent.vue'
import DzDropdownMenuItem from './DzDropdownMenuItem.vue'
import DzDropdownMenuTrigger from './DzDropdownMenuTrigger.vue'

/** Reka portals content through Presence, which settles over several microtasks. */
const flush = () => new Promise(resolve => setTimeout(resolve, 0))

/** Content is portalled to <body>, so assertions read the document, not the wrapper. */
function mountMenu(props: Record<string, unknown>) {
  return mount(DzDropdownMenu, {
    props,
    global: { components: { DzDropdownMenuTrigger, DzDropdownMenuContent, DzDropdownMenuItem } },
    slots: {
      default: `
        <DzDropdownMenuTrigger><button type="button">Open</button></DzDropdownMenuTrigger>
        <DzDropdownMenuContent><DzDropdownMenuItem>One</DzDropdownMenuItem></DzDropdownMenuContent>`,
    },
    attachTo: document.body,
  })
}

describe('dzDropdownMenu — Unit Tests', () => {
  afterEach(() => {
    // Portalled content outlives the wrapper; clear it so tests stay independent.
    document.body.innerHTML = ''
  })

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
})
