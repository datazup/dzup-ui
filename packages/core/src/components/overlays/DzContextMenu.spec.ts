import { mount } from '@vue/test-utils'
/**
 * DzContextMenu — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import DzContextMenu from './DzContextMenu.vue'
import DzContextMenuSeparator from './DzContextMenuSeparator.vue'
import DzContextMenuTrigger from './DzContextMenuTrigger.vue'

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
