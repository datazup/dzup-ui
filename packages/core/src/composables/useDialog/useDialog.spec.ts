import type { UseDialogOptions, UseDialogReturn } from './useDialog.ts'
/**
 * useDialog — Unit tests.
 */
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { useDialog } from './useDialog.ts'

/**
 * Helper: mount a test component that calls useDialog and exposes its return.
 * Renders a trigger button and a dialog content div (only when open).
 */
function mountDialog(options: UseDialogOptions = {}) {
  let dialogReturn: UseDialogReturn

  const TestComponent = defineComponent({
    setup() {
      dialogReturn = useDialog(options)
      return { dialog: dialogReturn }
    },
    render() {
      return h('div', [
        h('button', {
          ref: (el: unknown) => {
            dialogReturn.triggerRef.value = el as HTMLElement | null
          },
          onClick: () => dialogReturn.toggle(),
        }, 'Trigger'),
        dialogReturn.isOpen.value
          ? h('div', {
              'ref': (el: unknown) => {
                dialogReturn.contentRef.value = el as HTMLElement | null
              },
              'role': 'dialog',
              'aria-labelledby': dialogReturn.titleId,
              'aria-describedby': dialogReturn.descriptionId,
            }, [
              h('h2', { id: dialogReturn.titleId }, 'Dialog Title'),
              h('p', { id: dialogReturn.descriptionId }, 'Description'),
              h('button', { class: 'action' }, 'Action'),
              h('button', { class: 'close' }, 'Close'),
            ])
          : null,
      ])
    },
  })

  const wrapper = mount(TestComponent, { attachTo: document.body })
  return { wrapper, getDialog: () => wrapper.vm.dialog as UseDialogReturn }
}

describe('useDialog', () => {
  // ---- Return shape ----

  it('returns the expected API shape', () => {
    const { getDialog } = mountDialog()
    const dialog = getDialog()

    expect(dialog.isOpen).toBeDefined()
    expect(typeof dialog.open).toBe('function')
    expect(typeof dialog.close).toBe('function')
    expect(typeof dialog.toggle).toBe('function')
    expect(dialog.triggerRef).toBeDefined()
    expect(dialog.contentRef).toBeDefined()
    expect(typeof dialog.titleId).toBe('string')
    expect(typeof dialog.descriptionId).toBe('string')
  })

  it('generates unique title and description IDs', () => {
    const { getDialog } = mountDialog()
    const dialog = getDialog()

    expect(dialog.titleId).toContain('dialog-title')
    expect(dialog.descriptionId).toContain('dialog-description')
    expect(dialog.titleId).not.toBe(dialog.descriptionId)
  })

  // ---- Open / Close / Toggle ----

  it('starts closed by default', () => {
    const { getDialog } = mountDialog()
    expect(getDialog().isOpen.value).toBe(false)
  })

  it('starts open when open option is true', () => {
    const { getDialog } = mountDialog({ open: true })
    expect(getDialog().isOpen.value).toBe(true)
  })

  it('open() sets isOpen to true', async () => {
    const { getDialog } = mountDialog()
    const dialog = getDialog()

    dialog.open()
    expect(dialog.isOpen.value).toBe(true)
  })

  it('close() sets isOpen to false', async () => {
    const { getDialog } = mountDialog({ open: true })
    const dialog = getDialog()

    dialog.close()
    expect(dialog.isOpen.value).toBe(false)
  })

  it('toggle() flips isOpen state', () => {
    const { getDialog } = mountDialog()
    const dialog = getDialog()

    expect(dialog.isOpen.value).toBe(false)
    dialog.toggle()
    expect(dialog.isOpen.value).toBe(true)
    dialog.toggle()
    expect(dialog.isOpen.value).toBe(false)
  })

  it('calls onOpenChange callback on state transitions', () => {
    const onOpenChange = vi.fn()
    const { getDialog } = mountDialog({ onOpenChange })
    const dialog = getDialog()

    dialog.open()
    expect(onOpenChange).toHaveBeenCalledWith(true)

    dialog.close()
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('does not fire onOpenChange when already in target state', () => {
    const onOpenChange = vi.fn()
    const { getDialog } = mountDialog({ onOpenChange })
    const dialog = getDialog()

    dialog.close() // already closed
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  // ---- External open prop sync ----

  it('syncs with external reactive open ref', async () => {
    const externalOpen = ref(false)
    const { getDialog } = mountDialog({ open: externalOpen })
    const dialog = getDialog()

    expect(dialog.isOpen.value).toBe(false)

    externalOpen.value = true
    await nextTick()
    expect(dialog.isOpen.value).toBe(true)

    externalOpen.value = false
    await nextTick()
    expect(dialog.isOpen.value).toBe(false)
  })

  // ---- Escape key ----

  it('closes on Escape key press', async () => {
    const { wrapper, getDialog } = mountDialog()
    const dialog = getDialog()

    dialog.open()
    await nextTick()
    // Wait for rAF to apply side effects
    await new Promise(resolve => requestAnimationFrame(resolve))
    await nextTick()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(dialog.isOpen.value).toBe(false)

    wrapper.unmount()
  })

  it('does not close on Escape when preventClose is true', async () => {
    const { wrapper, getDialog } = mountDialog({ preventClose: true })
    const dialog = getDialog()

    dialog.open()
    await nextTick()
    await new Promise(resolve => requestAnimationFrame(resolve))
    await nextTick()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(dialog.isOpen.value).toBe(true)

    wrapper.unmount()
  })

  // ---- Scroll lock ----

  it('applies scroll lock to body when modal is open', async () => {
    const { wrapper, getDialog } = mountDialog({ modal: true })
    const dialog = getDialog()

    dialog.open()
    await nextTick()
    await new Promise(resolve => requestAnimationFrame(resolve))
    await nextTick()

    expect(document.body.style.overflow).toBe('hidden')

    dialog.close()
    await nextTick()

    // Overflow should be restored (empty string = default)
    expect(document.body.style.overflow).not.toBe('hidden')

    wrapper.unmount()
  })

  it('does not apply scroll lock when modal is false', async () => {
    const originalOverflow = document.body.style.overflow
    const { wrapper, getDialog } = mountDialog({ modal: false })
    const dialog = getDialog()

    dialog.open()
    await nextTick()
    await new Promise(resolve => requestAnimationFrame(resolve))
    await nextTick()

    expect(document.body.style.overflow).toBe(originalOverflow)

    wrapper.unmount()
  })

  // ---- Click outside ----

  it('closes on click outside the content', async () => {
    const { wrapper, getDialog } = mountDialog()
    const dialog = getDialog()

    dialog.open()
    await nextTick()
    await new Promise(resolve => requestAnimationFrame(resolve))
    await nextTick()

    // The setTimeout(0) in click-outside setup needs to fire
    await new Promise(resolve => setTimeout(resolve, 10))

    document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    expect(dialog.isOpen.value).toBe(false)

    wrapper.unmount()
  })

  it('does not close on click outside when preventClose is true', async () => {
    const { wrapper, getDialog } = mountDialog({ preventClose: true })
    const dialog = getDialog()

    dialog.open()
    await nextTick()
    await new Promise(resolve => requestAnimationFrame(resolve))
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 10))

    document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    expect(dialog.isOpen.value).toBe(true)

    wrapper.unmount()
  })

  // ---- Focus restoration ----

  it('restores focus to trigger element on close', async () => {
    const { wrapper, getDialog } = mountDialog()
    const dialog = getDialog()

    // Focus the trigger
    const triggerButton = wrapper.find('button')
    await triggerButton.trigger('focus')

    dialog.triggerRef.value = triggerButton.element as HTMLElement

    dialog.open()
    await nextTick()
    await new Promise(resolve => requestAnimationFrame(resolve))
    await nextTick()

    dialog.close()
    await nextTick()

    expect(document.activeElement).toBe(triggerButton.element)

    wrapper.unmount()
  })

  // ---- Cleanup on unmount ----

  it('cleans up side effects on component unmount', async () => {
    const { wrapper, getDialog } = mountDialog()
    const dialog = getDialog()

    dialog.open()
    await nextTick()
    await new Promise(resolve => requestAnimationFrame(resolve))
    await nextTick()

    expect(document.body.style.overflow).toBe('hidden')

    wrapper.unmount()

    // Scroll lock should be removed
    expect(document.body.style.overflow).not.toBe('hidden')
  })

  // ---- Non-modal behavior ----

  it('works in non-modal mode without focus trap or scroll lock', async () => {
    const { wrapper, getDialog } = mountDialog({ modal: false })
    const dialog = getDialog()

    dialog.open()
    await nextTick()
    await new Promise(resolve => requestAnimationFrame(resolve))
    await nextTick()

    // Scroll lock should not be applied
    expect(document.body.style.overflow).not.toBe('hidden')

    // Escape should still work
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(dialog.isOpen.value).toBe(false)

    wrapper.unmount()
  })

  // ---- ARIA IDs ----

  it('provides consistent IDs for aria-labelledby and aria-describedby', () => {
    const { getDialog } = mountDialog()
    const dialog = getDialog()

    // Both IDs share the same base prefix
    const titleBase = dialog.titleId.replace('-dialog-title', '')
    const descBase = dialog.descriptionId.replace('-dialog-description', '')
    expect(titleBase).toBe(descBase)
  })
})
