/**
 * DzDialog -- Contract Spec v1 conformance tests.
 *
 * Verifies compound component API shape, props, events, slots,
 * data attributes, ARIA compliance, and CSS containment.
 */
import { expectAnatomy } from '@dzup-ui/testing'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { h } from 'vue'
import { anatomy as dialogAnatomy } from './DzDialog.anatomy.ts'
import DzDialog from './DzDialog.vue'
import DzDialogClose from './DzDialogClose.vue'
import { anatomy as contentAnatomy } from './DzDialogContent.anatomy.ts'
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

  // ── Modal semantics & ARIA wiring (regression: aria-modal + auto labelledby) ──

  it('open modal content exposes aria-modal="true"', () => {
    const wrapper = mountDialog()
    const content = document.querySelector('[role="dialog"]')
    expect(content).not.toBeNull()
    expect(content?.getAttribute('aria-modal')).toBe('true')
    wrapper.unmount()
  })

  it('non-modal content does not set aria-modal="true"', () => {
    const wrapper = mountDialog({ modal: false })
    const content = document.querySelector('[role="dialog"]')
    expect(content).not.toBeNull()
    expect(content?.getAttribute('aria-modal')).not.toBe('true')
    wrapper.unmount()
  })

  it('resolves accessible name via Reka auto aria-labelledby pointing at the title', () => {
    const wrapper = mountDialog()
    const content = document.querySelector('[role="dialog"]')
    const labelledby = content?.getAttribute('aria-labelledby')
    expect(labelledby).toBeTruthy()
    const titleEl = document.getElementById(labelledby as string)
    expect(titleEl).not.toBeNull()
    expect(titleEl?.textContent).toContain('Test Title')
    wrapper.unmount()
  })

  it('resolves aria-describedby to the description element', () => {
    const wrapper = mountDialog()
    const content = document.querySelector('[role="dialog"]')
    const describedby = content?.getAttribute('aria-describedby')
    expect(describedby).toBeTruthy()
    const descEl = document.getElementById(describedby as string)
    expect(descEl).not.toBeNull()
    expect(descEl?.textContent).toContain('Test Description')
    wrapper.unmount()
  })

  it('does not clobber Reka auto aria-labelledby when consumer omits it', () => {
    // ariaLabelledby defaults to undefined -- must NOT remove Reka's generated id.
    const wrapper = mount(DzDialog, {
      props: { open: true },
      slots: {
        default: () => h(DzDialogContent, {}, () => [
          h(DzDialogTitle, {}, () => 'Only Title'),
        ]),
      },
      global: { stubs: { DialogPortal: InlinePortal } },
      attachTo: document.body,
    })
    const content = document.querySelector('[role="dialog"]')
    expect(content?.getAttribute('aria-labelledby')).toBeTruthy()
    wrapper.unmount()
  })

  it('forwards a consumer-provided ariaLabelledby override', () => {
    const wrapper = mount(DzDialog, {
      props: { open: true },
      slots: {
        default: () => h(DzDialogContent, { ariaLabelledby: 'external-heading' }, () =>
          h(DzDialogTitle, {}, () => 'Title')),
      },
      global: { stubs: { DialogPortal: InlinePortal } },
      attachTo: document.body,
    })
    const content = document.querySelector('[role="dialog"]')
    expect(content?.getAttribute('aria-labelledby')).toBe('external-heading')
    wrapper.unmount()
  })
  // ── Anatomy (ADR-19) ──

  it('renders no element of its own, as parts: none declares', () => {
    // The claim and the DOM checked against each other: DialogRoot is a
    // provider, so a `data-part` appearing here would mean the declaration is
    // wrong, not that a part was forgotten.
    const wrapper = mount(DzDialog, {
      props: { open: false },
      slots: { default: () => h('div', 'child') },
    })

    expect(wrapper.find('[data-part]').exists()).toBe(false)
    expectAnatomy(wrapper, dialogAnatomy)
    wrapper.unmount()
  })

  it('emits the content anatomy from DzDialogContent', () => {
    const wrapper = mountDialog()

    for (const part of ['overlay', 'content'])
      expect(wrapper.find(`[data-part="${part}"]`).exists(), part).toBe(true)

    expectAnatomy(wrapper.find('[data-part="content"]').element, contentAnatomy, {
      // The overlay is a sibling of the content, not a descendant.
      absentParts: ['root', 'overlay'],
    })
    wrapper.unmount()
  })

  it('emits header, viewport and footer only in the scrollable layout', () => {
    const wrapper = mount(DzDialog, {
      props: { open: true },
      slots: {
        default: () => h(
          DzDialogContent,
          { scrollable: true },
          { header: () => 'H', default: () => 'B', footer: () => 'F' },
        ),
      },
      global: { stubs: { DialogPortal: InlinePortal } },
      attachTo: document.body,
    })

    for (const part of ['header', 'viewport', 'footer'])
      expect(wrapper.find(`[data-part="${part}"]`).exists(), part).toBe(true)

    expectAnatomy(wrapper.find('[data-part="content"]').element, contentAnatomy, {
      absentParts: ['root', 'overlay'],
    })
    wrapper.unmount()
  })

  it('keeps the legacy overlay hook alongside the new part (dual-emit)', () => {
    const wrapper = mountDialog()
    const overlay = wrapper.find('[data-dz-dialog-overlay]')

    expect(overlay.exists()).toBe(true)
    expect(overlay.attributes('data-part')).toBe('overlay')
    wrapper.unmount()
  })

  // ── Per-part overrides (`ui`) ──

  it('reaches the overlay and the panel by name', () => {
    const wrapper = mount(DzDialog, {
      props: { open: true },
      slots: {
        default: () => h(
          DzDialogContent,
          { ui: { overlay: 'backdrop-blur-sm', content: 'rounded-none' } },
          () => 'body',
        ),
      },
      global: { stubs: { DialogPortal: InlinePortal } },
      attachTo: document.body,
    })

    expect(wrapper.find('[data-part="overlay"]').classes()).toContain('backdrop-blur-sm')
    expect(wrapper.find('[data-part="content"]').classes()).toContain('rounded-none')
    expect(wrapper.html()).not.toContain('!important')
    wrapper.unmount()
  })

  it('keeps overlayClass working, with ui.overlay taking precedence', () => {
    // Dual-emit for props, not just attributes: a consumer on `overlayClass`
    // sees no change, and one adopting `ui` gets the last word (ADR-19 §6).
    const wrapper = mount(DzDialog, {
      props: { open: true },
      slots: {
        default: () => h(
          DzDialogContent,
          { overlayClass: 'bg-red-500/50 p-2', ui: { overlay: 'p-8' } },
          () => 'body',
        ),
      },
      global: { stubs: { DialogPortal: InlinePortal } },
      attachTo: document.body,
    })

    const overlay = wrapper.find('[data-part="overlay"]').classes()
    expect(overlay).toContain('bg-red-500/50')
    expect(overlay).toContain('p-8')
    expect(overlay).not.toContain('p-2')
    wrapper.unmount()
  })
})
