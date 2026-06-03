import { mount } from '@vue/test-utils'
/**
 * DzSheet — Unit / behavior tests.
 */
import { afterEach, describe, expect, it } from 'vitest'
import { h } from 'vue'
import DzSheet from './DzSheet.vue'
import DzSheetContent from './DzSheetContent.vue'
import DzSheetTitle from './DzSheetTitle.vue'

/** Stub portal to render inline (Reka UI portals don't work in jsdom) */
const InlinePortal = { template: '<div data-testid="portal"><slot /></div>' }

describe('dzSheet — Unit Tests', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders the component', () => {
    const wrapper = mount(DzSheet, {
      slots: { default: '<div>Content</div>' },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('passes modal prop', () => {
    const wrapper = mount(DzSheet, {
      props: { modal: false },
      slots: { default: '<div>Content</div>' },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('default slot renders children', () => {
    const wrapper = mount(DzSheet, {
      slots: { default: '<div data-testid="child">Child</div>' },
    })
    expect(wrapper.find('[data-testid="child"]').exists()).toBe(true)
  })

  // Regression guard: closed sheet must unmount content via Reka Presence,
  // never leave a role="dialog" element in the DOM (the DzSidebar defect class).
  it('keeps no role="dialog" element in the DOM when closed', () => {
    const wrapper = mount(DzSheet, {
      props: { open: false },
      slots: {
        default: () => h(DzSheetContent, {}, () => h(DzSheetTitle, {}, () => 'Sheet Title')),
      },
      global: { stubs: { DialogPortal: InlinePortal } },
      attachTo: document.body,
    })
    expect(document.querySelector('[role="dialog"]')).toBeNull()
    wrapper.unmount()
  })
})
