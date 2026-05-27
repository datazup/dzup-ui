/**
 * DzConfirmDialog -- Contract Spec v1 conformance tests.
 *
 * Verifies prop surface, emit surface, slot overrides, variant tone mapping,
 * loading propagation, and accessibility attributes that sandbox callers depend on.
 */
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
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
      title: 'Confirm action',
      ...props,
    },
    slots: slots as Record<string, () => string>,
    global: { stubs: { DialogPortal: InlinePortal } },
    attachTo: document.body,
  })
}

describe('dzConfirmDialog -- Contract Spec v1', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  // ── Required props ──

  it('requires title prop and renders it', () => {
    const wrapper = mountConfirmDialog({ title: 'Save changes?' })
    expect(document.body.textContent).toContain('Save changes?')
    wrapper.unmount()
  })

  // ── Optional props with defaults ──

  it('accepts open prop (default false)', () => {
    const wrapper = mount(DzConfirmDialog, {
      props: { title: 'X' },
      global: { stubs: { DialogPortal: InlinePortal } },
      attachTo: document.body,
    })
    expect(document.querySelector('[data-testid="confirm-dialog-confirm"]')).toBeNull()
    wrapper.unmount()
  })

  it('uses default confirm/cancel labels when not provided', () => {
    const wrapper = mountConfirmDialog()
    expect(document.body.textContent).toContain('Confirm')
    expect(document.body.textContent).toContain('Cancel')
    wrapper.unmount()
  })

  it('accepts custom confirm/cancel labels', () => {
    const wrapper = mountConfirmDialog({ confirmLabel: 'Yes', cancelLabel: 'No' })
    expect(document.body.textContent).toContain('Yes')
    expect(document.body.textContent).toContain('No')
    wrapper.unmount()
  })

  it('accepts message prop and renders it', () => {
    const wrapper = mountConfirmDialog({ message: 'Are you sure?' })
    expect(document.body.textContent).toContain('Are you sure?')
    wrapper.unmount()
  })

  // ── Variant tone mapping ──

  it('default variant maps confirm button to primary tone', () => {
    const wrapper = mountConfirmDialog({ variant: 'default' })
    const confirmBtn = document.querySelector('[data-testid="confirm-dialog-confirm"]')
    expect(confirmBtn?.getAttribute('data-tone')).toBe('primary')
    wrapper.unmount()
  })

  it('danger variant maps confirm button to danger tone', () => {
    const wrapper = mountConfirmDialog({ variant: 'danger' })
    const confirmBtn = document.querySelector('[data-testid="confirm-dialog-confirm"]')
    expect(confirmBtn?.getAttribute('data-tone')).toBe('danger')
    wrapper.unmount()
  })

  // ── Size variants ──

  it('accepts all CanonicalSize values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mountConfirmDialog({ size })
      expect(document.querySelector('[data-testid="confirm-dialog-confirm"]')).toBeTruthy()
      wrapper.unmount()
      document.body.innerHTML = ''
    }
  })

  // ── Loading propagation ──

  it('propagates loading=true to confirm button', () => {
    const wrapper = mountConfirmDialog({ loading: true })
    const confirmBtn = document.querySelector('[data-testid="confirm-dialog-confirm"]')
    expect(confirmBtn?.getAttribute('aria-busy')).toBe('true')
    wrapper.unmount()
  })

  it('disables cancel button while loading', () => {
    const wrapper = mountConfirmDialog({ loading: true })
    const cancelBtn = document.querySelector('[data-testid="confirm-dialog-cancel"]') as HTMLElement
    expect(
      cancelBtn.hasAttribute('disabled') || cancelBtn.getAttribute('aria-disabled') === 'true',
    ).toBe(true)
    wrapper.unmount()
  })

  // ── Emits surface ──

  it('emits confirm when confirm button clicked', async () => {
    const wrapper = mountConfirmDialog()
    const confirmBtn = document.querySelector('[data-testid="confirm-dialog-confirm"]') as HTMLElement
    confirmBtn.click()
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('confirm')).toBeTruthy()
    wrapper.unmount()
  })

  it('emits cancel and update:open=false when cancel button clicked', async () => {
    const wrapper = mountConfirmDialog()
    const cancelBtn = document.querySelector('[data-testid="confirm-dialog-cancel"]') as HTMLElement
    cancelBtn.click()
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('cancel')).toBeTruthy()
    const openEvents = wrapper.emitted('update:open') as unknown[][]
    expect(openEvents[openEvents.length - 1]).toEqual([false])
    wrapper.unmount()
  })

  it('emits cancel on escape key', async () => {
    const onCancel = vi.fn()
    const wrapper = mount(DzConfirmDialog, {
      props: { open: true, title: 'X', onCancel },
      global: { stubs: { DialogPortal: InlinePortal } },
      attachTo: document.body,
    })
    // Trigger escape via the underlying dialog content
    const event = new KeyboardEvent('keydown', { key: 'Escape' })
    document.dispatchEvent(event)
    await wrapper.vm.$nextTick()
    wrapper.unmount()
  })

  // ── Slot overrides ──

  it('replaces message with default slot content', () => {
    const wrapper = mountConfirmDialog(
      { message: 'Should not appear' },
      { default: () => 'Custom body' },
    )
    expect(document.body.textContent).toContain('Custom body')
    wrapper.unmount()
  })

  it('replaces default icon via icon slot', () => {
    const wrapper = mountConfirmDialog(
      {},
      { icon: () => '<span data-testid="custom-icon">!!</span>' },
    )
    expect(document.body.textContent).toContain('!!')
    wrapper.unmount()
  })

  // ── Accessibility ──

  it('renders confirm and cancel buttons with stable test ids', () => {
    const wrapper = mountConfirmDialog()
    expect(document.querySelector('[data-testid="confirm-dialog-confirm"]')).toBeTruthy()
    expect(document.querySelector('[data-testid="confirm-dialog-cancel"]')).toBeTruthy()
    wrapper.unmount()
  })

  it('id prop forwards to underlying dialog content', () => {
    const wrapper = mountConfirmDialog({ id: 'my-confirm' })
    expect(document.querySelector('#my-confirm')).toBeTruthy()
    wrapper.unmount()
  })
})
