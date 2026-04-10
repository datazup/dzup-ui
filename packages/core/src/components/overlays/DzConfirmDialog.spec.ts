/**
 * DzConfirmDialog -- Unit / behavior tests.
 *
 * Tests rendering, confirm/cancel interactions, loading state,
 * variant styling, and slot overrides.
 */
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import DzConfirmDialog from './DzConfirmDialog.vue'

/** Stub portal to render inline (Reka UI portals don't work in jsdom) */
const InlinePortal = { template: '<div data-testid="portal"><slot /></div>' }

function mountConfirmDialog(
  props: Record<string, unknown> = {},
  slots: Record<string, () => string> = {},
) {
  return mount(DzConfirmDialog, {
    props: {
      open: true,
      title: 'Confirm Action',
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
    const confirmBtn = document.querySelector('[data-testid="confirm-dialog-confirm"]') as HTMLElement
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
    const confirmBtn = document.querySelector('[data-testid="confirm-dialog-confirm"]') as HTMLElement
    expect(confirmBtn).toBeTruthy()
    expect(confirmBtn.getAttribute('aria-busy')).toBe('true')
    expect(confirmBtn.getAttribute('data-state')).toBe('loading')
    wrapper.unmount()
  })

  it('disables cancel button when loading', () => {
    const wrapper = mountConfirmDialog({ loading: true })
    const cancelBtn = document.querySelector('[data-testid="confirm-dialog-cancel"]') as HTMLElement
    expect(cancelBtn).toBeTruthy()
    expect(cancelBtn.hasAttribute('disabled') || cancelBtn.getAttribute('aria-disabled') === 'true').toBe(true)
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
      props: { open: false, title: 'Hidden Dialog' },
      global: { stubs: { DialogPortal: InlinePortal } },
      attachTo: document.body,
    })
    // Confirm/cancel buttons should not be in the DOM
    const confirmBtn = document.querySelector('[data-testid="confirm-dialog-confirm"]')
    expect(confirmBtn).toBeNull()
    wrapper.unmount()
  })

  it('applies danger tone to confirm button in danger variant', () => {
    const wrapper = mountConfirmDialog({ variant: 'danger' })
    const confirmBtn = document.querySelector('[data-testid="confirm-dialog-confirm"]') as HTMLElement
    expect(confirmBtn).toBeTruthy()
    expect(confirmBtn.getAttribute('data-tone')).toBe('danger')
    wrapper.unmount()
  })

  it('applies primary tone to confirm button in default variant', () => {
    const wrapper = mountConfirmDialog({ variant: 'default' })
    const confirmBtn = document.querySelector('[data-testid="confirm-dialog-confirm"]') as HTMLElement
    expect(confirmBtn).toBeTruthy()
    expect(confirmBtn.getAttribute('data-tone')).toBe('primary')
    wrapper.unmount()
  })
})
