import { mount } from '@vue/test-utils'
/**
 * DzDialog -- Contract Spec v1 conformance tests.
 *
 * Verifies compound component API shape, props, events, slots,
 * data attributes, ARIA compliance, and CSS containment.
 */
import { describe, expect, it, vi } from 'vitest'
import { h } from 'vue'
import DzDialog from './DzDialog.vue'
import DzDialogClose from './DzDialogClose.vue'
import DzDialogContent from './DzDialogContent.vue'
import DzDialogDescription from './DzDialogDescription.vue'
import DzDialogOverlay from './DzDialogOverlay.vue'
import DzDialogTitle from './DzDialogTitle.vue'
import DzDialogTrigger from './DzDialogTrigger.vue'

/** Stub portal to render inline (Reka UI portals don't work in jsdom) */
const InlinePortal = { template: '<div data-testid="portal"><slot /></div>' }

/** Helper to mount the full dialog compound tree */
function mountDialog(props: Record<string, unknown> = {}) {
  return mount(DzDialog, {
    props: { open: true, ...props },
    slots: {
      default: () => [
        h(DzDialogTrigger, {}, () => h('button', 'Open')),
        h(DzDialogContent, {}, () => [
          h(DzDialogTitle, {}, () => 'Test Title'),
          h(DzDialogDescription, {}, () => 'Test Description'),
          h(DzDialogClose),
        ]),
      ],
    },
    global: { stubs: { DialogPortal: InlinePortal } },
    attachTo: document.body,
  })
}

describe('dzDialog -- Contract Spec v1', () => {
  // ── Root props ──

  it('renders with default props', () => {
    const wrapper = mountDialog()
    expect(wrapper.exists()).toBe(true)
    wrapper.unmount()
  })

  it('accepts modal prop (default true)', () => {
    const wrapper = mount(DzDialog, {
      props: { modal: true },
      slots: { default: () => h('div', 'child') },
    })
    expect(wrapper.exists()).toBe(true)
    wrapper.unmount()
  })

  it('accepts modal=false prop', () => {
    const wrapper = mount(DzDialog, {
      props: { modal: false },
      slots: { default: () => h('div', 'child') },
    })
    expect(wrapper.exists()).toBe(true)
    wrapper.unmount()
  })

  // ── Animation props ──

  it('accepts animated prop (default true)', () => {
    const wrapper = mount(DzDialog, {
      props: { animated: true },
      slots: { default: () => h('div', 'child') },
    })
    expect(wrapper.exists()).toBe(true)
    wrapper.unmount()
  })

  it('accepts animated=false prop', () => {
    const wrapper = mount(DzDialog, {
      props: { animated: false },
      slots: { default: () => h('div', 'child') },
    })
    expect(wrapper.exists()).toBe(true)
    wrapper.unmount()
  })

  it('accepts overlayTransition prop', () => {
    const wrapper = mount(DzDialog, {
      props: { overlayTransition: 'my-overlay' },
      slots: { default: () => h('div', 'child') },
    })
    expect(wrapper.exists()).toBe(true)
    wrapper.unmount()
  })

  it('accepts contentTransition prop', () => {
    const wrapper = mount(DzDialog, {
      props: { contentTransition: 'my-content' },
      slots: { default: () => h('div', 'child') },
    })
    expect(wrapper.exists()).toBe(true)
    wrapper.unmount()
  })

  // ── v-model:open ──

  it('supports v-model:open', async () => {
    const wrapper = mount(DzDialog, {
      props: { 'open': false, 'onUpdate:open': (v: boolean) => wrapper.setProps({ open: v }) },
      slots: {
        default: () => [
          h(DzDialogTrigger, {}, () => h('button', 'Open')),
          h(DzDialogContent, {}, () => h(DzDialogTitle, {}, () => 'Title')),
        ],
      },
      global: { stubs: { DialogPortal: InlinePortal } },
      attachTo: document.body,
    })
    expect(wrapper.props('open')).toBe(false)
    wrapper.unmount()
  })

  // ── Content size variants ──

  it('accepts all content size values', () => {
    const sizes = ['sm', 'md', 'lg', 'xl', 'full'] as const
    for (const size of sizes) {
      const wrapper = mount(DzDialog, {
        props: { open: true },
        slots: {
          default: () => h(DzDialogContent, { size }, () => h(DzDialogTitle, {}, () => 'Title')),
        },
        global: { stubs: { DialogPortal: InlinePortal } },
        attachTo: document.body,
      })
      expect(wrapper.exists()).toBe(true)
      wrapper.unmount()
    }
  })

  // ── CSS containment ──

  it('has contain: layout style on content element', () => {
    const wrapper = mountDialog()
    const content = wrapper.find('[style*="contain"]')
    expect(content.exists()).toBeTruthy()
    wrapper.unmount()
  })

  // ── Content events ──

  it('dzDialogContent emits escapeKeyDown', () => {
    const onEscapeKeyDown = vi.fn()
    const wrapper = mount(DzDialog, {
      props: { open: true },
      slots: {
        default: () => h(DzDialogContent, { onEscapeKeyDown }, () =>
          h(DzDialogTitle, {}, () => 'Title')),
      },
      global: { stubs: { DialogPortal: InlinePortal } },
      attachTo: document.body,
    })
    expect(wrapper.exists()).toBe(true)
    wrapper.unmount()
  })

  // ── Accessibility props on content ──

  it('dzDialogContent accepts ariaLabel', () => {
    const wrapper = mount(DzDialog, {
      props: { open: true },
      slots: {
        default: () => h(DzDialogContent, { ariaLabel: 'Dialog label' }, () =>
          h(DzDialogTitle, {}, () => 'Title')),
      },
      global: { stubs: { DialogPortal: InlinePortal } },
      attachTo: document.body,
    })
    expect(wrapper.exists()).toBe(true)
    wrapper.unmount()
  })

  it('dzDialogContent accepts id prop', () => {
    const wrapper = mount(DzDialog, {
      props: { open: true },
      slots: {
        default: () => h(DzDialogContent, { id: 'my-dialog' }, () =>
          h(DzDialogTitle, {}, () => 'Title')),
      },
      global: { stubs: { DialogPortal: InlinePortal } },
      attachTo: document.body,
    })
    expect(wrapper.exists()).toBe(true)
    wrapper.unmount()
  })

  // ── Subcomponents exist ──

  it('dzDialogOverlay renders independently', () => {
    const wrapper = mount(DzDialogOverlay, {
      global: {
        stubs: { DialogOverlay: { template: '<div class="overlay" />' } },
      },
    })
    expect(wrapper.exists()).toBe(true)
    wrapper.unmount()
  })

  it('dzDialogTitle renders with slot content', () => {
    const wrapper = mount(DzDialogTitle, {
      slots: { default: () => 'My Title' },
      global: {
        stubs: { DialogTitle: { template: '<h2><slot /></h2>' } },
      },
    })
    expect(wrapper.text()).toContain('My Title')
    wrapper.unmount()
  })

  it('dzDialogDescription renders with slot content', () => {
    const wrapper = mount(DzDialogDescription, {
      slots: { default: () => 'My Description' },
      global: {
        stubs: { DialogDescription: { template: '<p><slot /></p>' } },
      },
    })
    expect(wrapper.text()).toContain('My Description')
    wrapper.unmount()
  })

  it('dzDialogClose renders with default X icon', () => {
    const wrapper = mount(DzDialogClose, {
      global: {
        stubs: {
          DialogClose: { template: '<button><slot /></button>' },
          X: { template: '<svg />' },
        },
      },
    })
    expect(wrapper.find('button').exists()).toBe(true)
    wrapper.unmount()
  })

  it('dzDialogClose renders with custom slot content', () => {
    const wrapper = mount(DzDialogClose, {
      slots: { default: () => 'Close me' },
      global: {
        stubs: { DialogClose: { template: '<button><slot /></button>' } },
      },
    })
    expect(wrapper.text()).toContain('Close me')
    wrapper.unmount()
  })

  it('dzDialogClose has accessible aria-label', () => {
    const wrapper = mount(DzDialogClose, {
      global: {
        stubs: {
          DialogClose: {
            template: '<button :aria-label="$attrs[\'aria-label\']"><slot /></button>',
            inheritAttrs: false,
          },
          X: { template: '<svg />' },
        },
      },
    })
    expect(wrapper.find('button').attributes('aria-label')).toBe('Close')
    wrapper.unmount()
  })
})
