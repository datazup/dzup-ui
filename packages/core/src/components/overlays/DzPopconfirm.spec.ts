import { flushPromises, mount } from '@vue/test-utils'
/**
 * DzPopconfirm -- Behavior tests.
 *
 * Covers open-on-trigger-click, the dismissal paths (confirm, cancel, Escape,
 * outside click), the async confirm/loading flow, and focus management (confirm
 * focused on open, focus returned to the trigger on close). The popover
 * teleports to document.body, so controls are located and clicked there.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import DzPopconfirm from './DzPopconfirm.vue'

/** Mount DzPopconfirm inside a host that wires v-model:open two-way. */
function mountHost(props: Record<string, unknown> = {}) {
  const onConfirm = vi.fn()
  const onCancel = vi.fn()
  const wrapper = mount(
    defineComponent({
      components: { DzPopconfirm },
      setup() {
        const { open: initialOpen, ...rest } = props
        const open = ref((initialOpen as boolean) ?? false)
        return { open, rest, onConfirm, onCancel }
      },
      template: `
        <DzPopconfirm
          v-model:open="open"
          v-bind="rest"
          title="Delete this run?"
          @confirm="onConfirm"
          @cancel="onCancel"
        >
          <button data-testid="trigger">Delete</button>
        </DzPopconfirm>
      `,
    }),
    { attachTo: document.body },
  )
  return { wrapper, onConfirm, onCancel }
}

function panel(): HTMLElement | null {
  return document.body.querySelector('[data-testid="dz-popconfirm-panel"]')
}

function clickTestId(testId: string): void {
  const el = document.body.querySelector<HTMLElement>(`[data-testid="${testId}"]`)
  el?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
}

afterEach(() => {
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

describe('dzPopconfirm -- behavior', () => {
  it('opens the popover when the trigger is clicked', async () => {
    const { wrapper } = mountHost()
    expect(panel()).toBeNull()
    await wrapper.get('[data-testid="trigger"]').trigger('click')
    await flushPromises()
    expect(panel()).not.toBeNull()
  })

  it('closes and emits confirm when confirm is clicked', async () => {
    const { wrapper, onConfirm } = mountHost({ open: true })
    await flushPromises()

    clickTestId('dz-popconfirm-confirm')
    await flushPromises()

    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(panel()).toBeNull()
    expect((wrapper.vm as unknown as { open: boolean }).open).toBe(false)
  })

  it('closes and emits cancel when cancel is clicked', async () => {
    const { wrapper, onCancel } = mountHost({ open: true })
    await flushPromises()

    clickTestId('dz-popconfirm-cancel')
    await flushPromises()

    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(panel()).toBeNull()
    expect((wrapper.vm as unknown as { open: boolean }).open).toBe(false)
  })

  it('closes on the Escape key and emits cancel', async () => {
    const { wrapper, onCancel } = mountHost({ open: true })
    await flushPromises()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await flushPromises()

    expect(onCancel).toHaveBeenCalledTimes(1)
    expect((wrapper.vm as unknown as { open: boolean }).open).toBe(false)
  })

  it('closes on an outside click and emits cancel', async () => {
    const { wrapper, onCancel } = mountHost({ open: true })
    await flushPromises()

    const outside = document.createElement('div')
    document.body.appendChild(outside)
    outside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    await flushPromises()

    expect(onCancel).toHaveBeenCalledTimes(1)
    expect((wrapper.vm as unknown as { open: boolean }).open).toBe(false)
  })

  it('does not close when clicking inside the panel', async () => {
    mountHost({ open: true })
    await flushPromises()

    panel()?.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    await flushPromises()

    expect(panel()).not.toBeNull()
  })

  it('focuses the confirm button when opened', async () => {
    mountHost({ open: true })
    await flushPromises()

    const confirmBtn = document.body.querySelector('[data-testid="dz-popconfirm-confirm"]')
    expect(document.activeElement).toBe(confirmBtn)
  })

  it('returns focus to the trigger on close', async () => {
    const { wrapper } = mountHost()
    const trigger = wrapper.get('[data-testid="trigger"]').element as HTMLElement
    await wrapper.get('[data-testid="trigger"]').trigger('click')
    await flushPromises()

    clickTestId('dz-popconfirm-cancel')
    await flushPromises()

    expect(document.activeElement).toBe(trigger)
  })

  it('traps focus within the panel while open', async () => {
    mountHost({ open: true })
    await flushPromises()
    expect(panel()?.contains(document.activeElement)).toBe(true)
  })

  // ── Async confirm / loading ────────────────────────────────────────────────

  it('keeps the popover open and shows a confirm spinner during an async confirm', async () => {
    let resolveConfirm: () => void = () => {}
    const Host = defineComponent({
      components: { DzPopconfirm },
      setup() {
        const open = ref(true)
        const loading = ref(false)
        async function onConfirm() {
          loading.value = true
          await new Promise<void>((resolve) => {
            resolveConfirm = resolve
          })
          loading.value = false
        }
        return { open, loading, onConfirm }
      },
      template: `
        <DzPopconfirm v-model:open="open" :loading="loading" title="Delete?" @confirm="onConfirm">
          <button data-testid="trigger">Delete</button>
        </DzPopconfirm>
      `,
    })
    mount(Host, { attachTo: document.body })
    await flushPromises()

    clickTestId('dz-popconfirm-confirm')
    await flushPromises()

    // Promise still pending: popover stays open, confirm button is busy.
    expect(panel()).not.toBeNull()
    const confirmBtn = document.body.querySelector('[data-testid="dz-popconfirm-confirm"]')
    expect(confirmBtn?.getAttribute('aria-busy')).toBe('true')

    // Settle the promise: loading clears and the popover closes.
    resolveConfirm()
    await flushPromises()
    await nextTick()
    expect(panel()).toBeNull()
  })

  it('ignores cancel and Escape while loading', async () => {
    const { onCancel } = mountHost({ open: true, loading: true })
    await flushPromises()

    clickTestId('dz-popconfirm-cancel')
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await flushPromises()

    expect(onCancel).not.toHaveBeenCalled()
    expect(panel()).not.toBeNull()
  })

  // ── Rendering ────────────────────────────────────────────────────────────────

  it('renders the title and description', async () => {
    mountHost({ open: true, description: 'This action cannot be undone.' })
    await flushPromises()
    expect(panel()?.textContent).toContain('Delete this run?')
    expect(panel()?.textContent).toContain('This action cannot be undone.')
  })
})
