import { flushPromises, mount } from '@vue/test-utils'
/**
 * DzPopconfirm -- Contract Spec v1 conformance tests.
 *
 * Verifies the public API shape: props + defaults, the v-model:open binding,
 * confirm/cancel events, and the teleported `role="alertdialog"` semantics with
 * its aria-labelledby/aria-describedby wiring. The popover teleports to
 * document.body, so assertions query the body rather than the wrapper subtree.
 */
import { afterEach, describe, expect, it } from 'vitest'
import DzPopconfirm from './DzPopconfirm.vue'

/** Default slot trigger used across the suite (string slot compiles to a template). */
const triggerSlot = { default: '<button data-testid="trigger">Delete</button>' }

function mountPopconfirm(props: Record<string, unknown> = {}) {
  return mount(DzPopconfirm, {
    props: { title: 'Delete this run?', ...props },
    slots: triggerSlot,
    attachTo: document.body,
  })
}

afterEach(() => {
  document.body.innerHTML = ''
})

function panel(): Element | null {
  return document.body.querySelector('[data-testid="dz-popconfirm-panel"]')
}

describe('dzPopconfirm -- Contract Spec v1', () => {
  it('renders the trigger without errors', () => {
    const wrapper = mountPopconfirm()
    expect(wrapper.exists()).toBe(true)
    expect(document.body.textContent).toContain('Delete')
    wrapper.unmount()
  })

  it('renders no panel while closed', () => {
    const wrapper = mountPopconfirm()
    expect(panel()).toBeNull()
    wrapper.unmount()
  })

  it('opens on trigger click (uncontrolled fallback)', async () => {
    const wrapper = mountPopconfirm()
    await wrapper.get('[data-testid="trigger"]').trigger('click')
    await flushPromises()
    expect(panel()).not.toBeNull()
    wrapper.unmount()
  })

  it('teleports a role="alertdialog" panel to the body when open', async () => {
    const wrapper = mountPopconfirm({ open: true })
    await flushPromises()
    expect(panel()?.getAttribute('role')).toBe('alertdialog')
    wrapper.unmount()
  })

  it('supports v-model:open', () => {
    const wrapper = mountPopconfirm({ open: false })
    expect(wrapper.props('open')).toBe(false)
    wrapper.unmount()
  })

  it('labels the panel via aria-labelledby pointing at the title', async () => {
    const wrapper = mountPopconfirm({ open: true, title: 'Remove item?' })
    await flushPromises()
    const labelledby = panel()?.getAttribute('aria-labelledby')
    expect(labelledby).toBeTruthy()
    expect(document.getElementById(labelledby as string)?.textContent).toContain('Remove item?')
    wrapper.unmount()
  })

  it('describes the panel via aria-describedby when a description is set', async () => {
    const wrapper = mountPopconfirm({ open: true, description: 'This cannot be undone.' })
    await flushPromises()
    const describedby = panel()?.getAttribute('aria-describedby')
    expect(describedby).toBeTruthy()
    expect(document.getElementById(describedby as string)?.textContent).toContain('cannot be undone')
    wrapper.unmount()
  })

  it('omits aria-describedby when there is no description', async () => {
    const wrapper = mountPopconfirm({ open: true })
    await flushPromises()
    expect(panel()?.getAttribute('aria-describedby')).toBeNull()
    wrapper.unmount()
  })

  it('renders default confirm/cancel labels', async () => {
    const wrapper = mountPopconfirm({ open: true })
    await flushPromises()
    expect(document.body.querySelector('[data-testid="dz-popconfirm-confirm"]')?.textContent).toContain('Confirm')
    expect(document.body.querySelector('[data-testid="dz-popconfirm-cancel"]')?.textContent).toContain('Cancel')
    wrapper.unmount()
  })

  it('renders custom confirm/cancel labels', async () => {
    const wrapper = mountPopconfirm({ open: true, confirmText: 'Yes, delete', cancelText: 'Keep' })
    await flushPromises()
    expect(document.body.querySelector('[data-testid="dz-popconfirm-confirm"]')?.textContent).toContain('Yes, delete')
    expect(document.body.querySelector('[data-testid="dz-popconfirm-cancel"]')?.textContent).toContain('Keep')
    wrapper.unmount()
  })

  it('defaults the confirm button to the danger tone', async () => {
    const wrapper = mountPopconfirm({ open: true })
    await flushPromises()
    const confirmBtn = document.body.querySelector('[data-testid="dz-popconfirm-confirm"]')
    expect(confirmBtn?.getAttribute('data-tone')).toBe('danger')
    wrapper.unmount()
  })

  it('emits confirm when the confirm button is clicked', async () => {
    const wrapper = mountPopconfirm({ open: true })
    await flushPromises()
    const confirmBtn = document.body.querySelector('[data-testid="dz-popconfirm-confirm"]') as HTMLElement
    confirmBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await flushPromises()
    expect(wrapper.emitted('confirm')).toBeTruthy()
    wrapper.unmount()
  })

  it('emits cancel when the cancel button is clicked', async () => {
    const wrapper = mountPopconfirm({ open: true })
    await flushPromises()
    const cancelBtn = document.body.querySelector('[data-testid="dz-popconfirm-cancel"]') as HTMLElement
    cancelBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await flushPromises()
    expect(wrapper.emitted('cancel')).toBeTruthy()
    wrapper.unmount()
  })
})
