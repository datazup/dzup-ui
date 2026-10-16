/**
 * DzDialog -- Contract Spec v1 conformance tests.
 *
 * Verifies compound component API shape, props, events, slots,
 * data attributes, ARIA compliance, and CSS containment.
 */
import { expectAnatomy } from '@dzup-ui/testing'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { h, nextTick } from 'vue'
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

  // Each prop test asserts the prop's observable effect, not that the mount
  // survived it (UI-DZUP-UI-TEST-M-09).

  it('renders an open dialog with its title, description and close control by default', () => {
    const wrapper = mountDialog()
    const content = document.querySelector('[role="dialog"]')
    expect(content).not.toBeNull()
    expect(content?.textContent).toContain('Test Title')
    expect(content?.textContent).toContain('Test Description')
    expect(content?.querySelector('button[aria-label="Close"]')).not.toBeNull()
    wrapper.unmount()
  })

  it('modal defaults to true and marks the content aria-modal', () => {
    const wrapper = mountDialog()
    expect(document.querySelector('[role="dialog"]')?.getAttribute('aria-modal')).toBe('true')
    wrapper.unmount()
  })

  it('modal=false drops aria-modal from the content', () => {
    const wrapper = mountDialog({ modal: false })
    expect(document.querySelector('[role="dialog"]')).not.toBeNull()
    expect(document.querySelector('[role="dialog"]')?.hasAttribute('aria-modal')).toBe(false)
    wrapper.unmount()
  })

  // ── Animation props ──

  /** The `name` each `<Transition>` in the open dialog was given, overlay first. */
  function transitionNames(props: Record<string, unknown>): string[] {
    const wrapper = mountDialog(props)
    const names = wrapper.findAllComponents({ name: 'transition' }).map(t => String(t.props('name') ?? t.attributes('name') ?? ''))
    wrapper.unmount()
    return names
  }

  it('animated (default true) names the overlay and content transitions', () => {
    expect(transitionNames({})).toEqual(['dz-dialog-overlay', 'dz-dialog-content'])
  })

  it('animated=false clears both transition names', () => {
    expect(transitionNames({ animated: false })).toEqual(['', ''])
  })

  it('overlayTransition renames the overlay transition only', () => {
    expect(transitionNames({ overlayTransition: 'my-overlay' })).toEqual(['my-overlay', 'dz-dialog-content'])
  })

  it('contentTransition renames the content transition only', () => {
    expect(transitionNames({ contentTransition: 'my-content' })).toEqual(['dz-dialog-overlay', 'my-content'])
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

  it('maps every content size to its own max width', () => {
    const sizes = ['sm', 'md', 'lg', 'xl', 'full'] as const
    const expectedWidth = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      full: 'max-w-[calc(100vw-var(--dz-spacing-8))]',
    } as const
    for (const size of sizes) {
      const wrapper = mount(DzDialog, {
        props: { open: true },
        slots: {
          default: () => h(DzDialogContent, { size }, () => h(DzDialogTitle, {}, () => 'Title')),
        },
        global: { stubs: { DialogPortal: InlinePortal } },
        attachTo: document.body,
      })
      const classes = wrapper.get('[data-part="content"]').classes()
      expect(classes, size).toContain(expectedWidth[size])
      for (const other of sizes.filter(s => s !== size))
        expect(classes, `${size} vs ${other}`).not.toContain(expectedWidth[other])
      wrapper.unmount()
    }
  })

  // ── CSS containment ──

  it('has contain: layout style on content element', () => {
    const wrapper = mountDialog()
    const content = wrapper.find('[class~="[contain:layout_style]"]')
    expect(content.exists()).toBeTruthy()
    wrapper.unmount()
  })

  // ── Content events ──

  it('dzDialogContent emits escapeKeyDown', async () => {
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
    await nextTick()
    document.querySelector('[role="dialog"]')!
      .dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await vi.waitFor(() => expect(onEscapeKeyDown).toHaveBeenCalledTimes(1), { timeout: 5000, interval: 10 })
    expect(onEscapeKeyDown.mock.calls[0]![0]).toBeInstanceOf(KeyboardEvent)
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
    expect(document.querySelector('[role="dialog"]')?.getAttribute('aria-label')).toBe('Dialog label')
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
    expect(document.querySelector('[role="dialog"]')?.id).toBe('my-dialog')
    wrapper.unmount()
  })

  // ── Subcomponents exist ──

  it('dzDialogOverlay renders independently, with the overlay surface', () => {
    const wrapper = mount(DzDialogOverlay, {
      global: {
        stubs: { DialogOverlay: { template: '<div class="overlay" />' } },
      },
    })
    const overlay = wrapper.get('.overlay')
    // The recipe's classes reach the Reka overlay, so the stub is not all that rendered.
    expect(overlay.classes().length).toBeGreaterThan(1)
    expect(overlay.classes().some(cls => cls.startsWith('bg-'))).toBe(true)
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
    // Mounted unstubbed inside a real dialog: a stubbed DialogClose only proves
    // the stub's own <button> rendered (UI-DZUP-UI-TEST-M-09).
    const wrapper = mountDialog()
    const close = document.querySelector('[role="dialog"] button[aria-label="Close"]')
    expect(close).not.toBeNull()
    const icon = close!.querySelector('svg')
    expect(icon).not.toBeNull()
    expect(icon!.classList.contains('lucide')).toBe(true)
    expect(icon!.getAttribute('aria-hidden')).toBe('true')
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
