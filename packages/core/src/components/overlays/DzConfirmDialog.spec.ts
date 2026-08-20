/**
 * DzConfirmDialog -- Unit / behavior tests.
 *
 * Tests rendering, confirm/cancel interactions, loading state,
 * variant styling, and slot overrides.
 */
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import DzConfirmDialog from './DzConfirmDialog.vue'

/** Unit tests keep the transport boundary synchronous; integration cases below use the real portal. */
const InlinePortal = { template: '<div data-testid="portal"><slot /></div>' }

function mountConfirmDialog(
  props: Record<string, unknown> = {},
  slots: Record<string, () => string> = {},
) {
  return mount(DzConfirmDialog, {
    props: {
      open: true,
      title: 'Confirm Action',
      portalDisabled: true,
      ...props,
    },
    slots: slots as Record<string, () => string>,
    global: {
      stubs: { DialogPortal: InlinePortal },
    },
    attachTo: document.body,
  })
}

describe('dzConfirmDialog -- Unit Tests', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders title text', () => {
    const wrapper = mountConfirmDialog({ title: 'Delete Item?' })
    expect(document.body.textContent).toContain('Delete Item?')
    wrapper.unmount()
  })

  it('renders message text', () => {
    const wrapper = mountConfirmDialog({ message: 'This cannot be undone.' })
    expect(document.body.textContent).toContain('This cannot be undone.')
    wrapper.unmount()
  })

  it('renders default button labels', () => {
    const wrapper = mountConfirmDialog()
    expect(document.body.textContent).toContain('Confirm')
    expect(document.body.textContent).toContain('Cancel')
    wrapper.unmount()
  })

  it('renders custom button labels', () => {
    const wrapper = mountConfirmDialog({
      confirmLabel: 'Delete',
      cancelLabel: 'Keep',
    })
    expect(document.body.textContent).toContain('Delete')
    expect(document.body.textContent).toContain('Keep')
    wrapper.unmount()
  })

  it('emits confirm on confirm button click', async () => {
    const wrapper = mountConfirmDialog()
    const confirmBtn = document.querySelector(
      '[data-testid="confirm-dialog-confirm"]',
    ) as HTMLElement
    expect(confirmBtn).toBeTruthy()
    confirmBtn.click()
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('confirm')).toBeTruthy()
    wrapper.unmount()
  })

  it('emits cancel and update:open on cancel button click', async () => {
    const wrapper = mountConfirmDialog()
    const cancelBtn = document.querySelector('[data-testid="confirm-dialog-cancel"]') as HTMLElement
    expect(cancelBtn).toBeTruthy()
    cancelBtn.click()
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('cancel')).toBeTruthy()
    expect(wrapper.emitted('update:open')).toBeTruthy()
    const openEvents = wrapper.emitted('update:open') as unknown[][]
    expect(openEvents[openEvents.length - 1]).toEqual([false])
    wrapper.unmount()
  })

  it('shows loading state on confirm button', () => {
    const wrapper = mountConfirmDialog({ loading: true })
    const confirmBtn = document.querySelector(
      '[data-testid="confirm-dialog-confirm"]',
    ) as HTMLElement
    expect(confirmBtn).toBeTruthy()
    expect(confirmBtn.getAttribute('aria-busy')).toBe('true')
    expect(confirmBtn.getAttribute('data-state')).toBe('loading')
    wrapper.unmount()
  })

  it('disables cancel button when loading', () => {
    const wrapper = mountConfirmDialog({ loading: true })
    const cancelBtn = document.querySelector('[data-testid="confirm-dialog-cancel"]') as HTMLElement
    expect(cancelBtn).toBeTruthy()
    expect(
      cancelBtn.hasAttribute('disabled') || cancelBtn.getAttribute('aria-disabled') === 'true',
    ).toBe(true)
    wrapper.unmount()
  })

  it('renders danger variant icon', () => {
    const wrapper = mountConfirmDialog({ variant: 'danger' })
    // Danger variant should have a warning triangle icon (exclamation path)
    const svgs = document.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThanOrEqual(1)
    wrapper.unmount()
  })

  it('renders default variant icon', () => {
    const wrapper = mountConfirmDialog({ variant: 'default' })
    // Default variant should have a question mark icon
    const svgs = document.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThanOrEqual(1)
    wrapper.unmount()
  })

  it('renders custom slot content instead of message', () => {
    const wrapper = mountConfirmDialog(
      { message: 'Should not show' },
      { default: () => 'Custom body content' },
    )
    expect(document.body.textContent).toContain('Custom body content')
    wrapper.unmount()
  })

  it('renders custom icon slot', () => {
    const wrapper = mountConfirmDialog(
      {},
      { icon: () => '<span data-testid="custom-icon">!</span>' },
    )
    expect(document.body.textContent).toContain('!')
    wrapper.unmount()
  })

  it('does not render content when open is false', () => {
    const wrapper = mount(DzConfirmDialog, {
      props: { open: false, title: 'Hidden Dialog', portalDisabled: true },
      global: { stubs: { DialogPortal: InlinePortal } },
      attachTo: document.body,
    })
    // Confirm/cancel buttons should not be in the DOM
    const confirmBtn = document.querySelector('[data-testid="confirm-dialog-confirm"]')
    expect(confirmBtn).toBeNull()
    wrapper.unmount()
  })

  // Regression guard: closed dialog must unmount content via Reka Presence,
  // never leave a role="dialog" element in the DOM (the DzSidebar defect class).
  it('keeps no role="dialog" element in the DOM when closed', () => {
    const wrapper = mountConfirmDialog({ open: false, title: 'Hidden Dialog' })
    expect(document.querySelector('[role="dialog"]')).toBeNull()
    wrapper.unmount()
  })

  it('applies danger tone to confirm button in danger variant', () => {
    const wrapper = mountConfirmDialog({ variant: 'danger' })
    const confirmBtn = document.querySelector(
      '[data-testid="confirm-dialog-confirm"]',
    ) as HTMLElement
    expect(confirmBtn).toBeTruthy()
    expect(confirmBtn.getAttribute('data-tone')).toBe('danger')
    wrapper.unmount()
  })

  // Regression guard: handler functions bound as attributes (e.g. Storybook's
  // `action` argTypes via `v-bind="args"`) must never be serialized onto the
  // role="dialog" element. Filtered out of the $attrs spread in the component.
  it('does not serialize function-valued attrs onto the dialog content node', () => {
    const wrapper = mountConfirmDialog({
      confirm: () => {},
      cancel: () => {},
    } as Record<string, unknown>)
    const dialog = document.querySelector('[role="dialog"]') as HTMLElement
    expect(dialog).toBeTruthy()
    expect(dialog.hasAttribute('confirm')).toBe(false)
    expect(dialog.hasAttribute('cancel')).toBe(false)
    wrapper.unmount()
  })

  // Legitimate pass-through attrs (id, data-*, aria-*) survive the filter.
  it('forwards non-function fallthrough attrs to the dialog content node', () => {
    const wrapper = mountConfirmDialog({
      'data-custom': 'kept',
      'aria-keyshortcuts': 'Enter',
    } as Record<string, unknown>)
    const dialog = document.querySelector('[role="dialog"]') as HTMLElement
    expect(dialog).toBeTruthy()
    expect(dialog.getAttribute('data-custom')).toBe('kept')
    expect(dialog.getAttribute('aria-keyshortcuts')).toBe('Enter')
    wrapper.unmount()
  })

  // B0: open content must expose modal semantics + an accessible name.
  it('marks the open dialog as modal with an accessible name', () => {
    const wrapper = mountConfirmDialog({ title: 'Delete item?' })
    const dialog = document.querySelector('[role="dialog"]') as HTMLElement
    expect(dialog).toBeTruthy()
    expect(dialog.getAttribute('aria-modal')).toBe('true')
    // Reka wires aria-labelledby from DzDialogTitle.
    const labelledby = dialog.getAttribute('aria-labelledby')
    expect(labelledby).toBeTruthy()
    const label = document.getElementById(labelledby as string)
    expect(label?.textContent).toContain('Delete item?')
    wrapper.unmount()
  })

  it('applies primary tone to confirm button in default variant', () => {
    const wrapper = mountConfirmDialog({ variant: 'default' })
    const confirmBtn = document.querySelector(
      '[data-testid="confirm-dialog-confirm"]',
    ) as HTMLElement
    expect(confirmBtn).toBeTruthy()
    expect(confirmBtn.getAttribute('data-tone')).toBe('primary')
    wrapper.unmount()
  })

  it('uses one owned overlay and forwards its customization class', () => {
    const wrapper = mountConfirmDialog({ overlayClass: 'consumer-overlay' })
    const overlays = document.querySelectorAll('[data-dz-dialog-overlay]')
    expect(overlays).toHaveLength(1)
    expect(overlays.item(0)?.classList.contains('consumer-overlay')).toBe(true)
    wrapper.unmount()
  })

  it('keeps the default production behavior portalled to document.body', async () => {
    const host = document.createElement('div')
    document.body.append(host)
    const wrapper = mount(DzConfirmDialog, {
      props: { open: true, title: 'Portalled dialog' },
      attachTo: host,
    })
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))

    const dialog = document.querySelector('[role="dialog"]')
    expect(dialog).toBeTruthy()
    expect(host.contains(dialog)).toBe(false)
    wrapper.unmount()
  })
})
