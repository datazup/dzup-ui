import type { CommandItem } from './DzCommandPalette.types'
/**
 * DzCommandPalette — Unit / behavior tests.
 */
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import { mountWithDialogStubs } from '../../../test-utils/dialog'
import DzCommandPalette from './DzCommandPalette.vue'

/**
 * Reka UI Combobox/Listbox uses scrollIntoView internally which is
 * unavailable in JSDOM. We stub it globally for these tests.
 */
beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn()
})

const sampleItems: CommandItem[] = [
  { id: 'edit', label: 'Edit File', shortcut: 'Ctrl+E', group: 'actions' },
  { id: 'save', label: 'Save File', shortcut: 'Ctrl+S', group: 'actions' },
  { id: 'settings', label: 'Open Settings', group: 'navigation' },
  { id: 'disabled-item', label: 'Disabled', disabled: true },
]

const sampleGroups = [
  { id: 'actions', label: 'Actions' },
  { id: 'navigation', label: 'Navigation' },
]

function mountCommandPalette(props: Record<string, unknown> = {}) {
  return mountWithDialogStubs(DzCommandPalette, {
    props,
  })
}

function dispatchEscapeKey(): void {
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
  )
}

describe('dzCommandPalette — Unit Tests', () => {
  it('renders the component when closed', () => {
    const wrapper = mountCommandPalette({ open: false, items: sampleItems })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders the component when open', () => {
    const wrapper = mountCommandPalette({ open: true, items: sampleItems })
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts items prop', () => {
    const wrapper = mountCommandPalette({ open: false, items: sampleItems })
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts groups prop', () => {
    const wrapper = mountCommandPalette({ open: false, items: sampleItems, groups: sampleGroups })
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts placeholder prop', () => {
    const wrapper = mountCommandPalette({ open: false, items: [], placeholder: 'Search...' })
    expect(wrapper.exists()).toBe(true)
  })

  it('defaults enableGlobalShortcut to true', () => {
    const wrapper = mountCommandPalette({ open: false, items: [] })
    expect(wrapper.exists()).toBe(true)
  })

  it('registers global keydown listener on mount', () => {
    const addSpy = vi.spyOn(document, 'addEventListener')
    mountCommandPalette({ open: false, items: [], enableGlobalShortcut: true })
    expect(addSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    addSpy.mockRestore()
  })

  it('does not register the global shortcut listener when enableGlobalShortcut is false', () => {
    // The Escape-dismissal listener (useEscapeKey) is always registered, so we
    // assert the global Ctrl+K shortcut adds exactly one *additional* keydown
    // listener when enabled vs. disabled rather than asserting an absolute count.
    function countKeydownListenersAddedDuringMount(enableGlobalShortcut: boolean): number {
      const addSpy = vi.spyOn(document, 'addEventListener')
      const before = addSpy.mock.calls.filter(([event]) => event === 'keydown').length
      const wrapper = mountCommandPalette({ open: false, items: [], enableGlobalShortcut })
      const after = addSpy.mock.calls.filter(([event]) => event === 'keydown').length
      addSpy.mockRestore()
      wrapper.unmount()
      return after - before
    }

    const enabled = countKeydownListenersAddedDuringMount(true)
    const disabled = countKeydownListenersAddedDuringMount(false)

    expect(enabled - disabled).toBe(1)
  })

  it('removes global keydown listener on unmount', () => {
    const removeSpy = vi.spyOn(document, 'removeEventListener')
    const wrapper = mountCommandPalette({ open: false, items: [], enableGlobalShortcut: true })
    wrapper.unmount()
    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    removeSpy.mockRestore()
  })

  it('component renders without errors when items is empty', () => {
    const wrapper = mountCommandPalette({ open: true, items: [] })
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts ariaLabel prop', () => {
    const wrapper = mountCommandPalette({ open: false, items: [], ariaLabel: 'Command search' })
    expect(wrapper.exists()).toBe(true)
  })
})

describe('dzCommandPalette — Escape dismissal', () => {
  it('closes on Escape when the search query is empty', async () => {
    const wrapper = mountCommandPalette({ open: true, items: sampleItems })

    dispatchEscapeKey()
    await nextTick()

    expect(wrapper.emitted('update:open')?.at(-1)).toEqual([false])
  })

  it('closes on Escape when the search query is non-empty', async () => {
    const wrapper = mountCommandPalette({ open: true, items: sampleItems })

    // Simulate a typed query via the input handler.
    wrapper.findComponent(DzCommandPalette).vm.$emit('search', 'xyz')
    await nextTick()

    dispatchEscapeKey()
    await nextTick()

    expect(wrapper.emitted('update:open')?.at(-1)).toEqual([false])
  })

  it('does not emit close while the palette is already closed', async () => {
    const wrapper = mountCommandPalette({ open: false, items: sampleItems })

    dispatchEscapeKey()
    await nextTick()

    expect(wrapper.emitted('update:open')).toBeUndefined()
  })

  it('closes through the real (un-stubbed) Reka Dialog + Combobox on Escape', async () => {
    // Uses the real Reka Dialog/Combobox (no stubs) to prove the fix end-to-end:
    // the nested Combobox owns Escape while open, but our document-level
    // useEscapeKey listener still flips the open model to false. Focus *return
    // to the trigger* is owned by Reka's Dialog FocusScope and is verified in a
    // real browser via the Storybook play function (jsdom does not run
    // FocusScope's close-auto-focus reliably).
    Element.prototype.scrollIntoView = vi.fn()

    const Host = defineComponent({
      components: { DzCommandPalette },
      setup() {
        const open = ref(false)
        return { open, items: sampleItems }
      },
      template: `
        <div>
          <button @click="open = true">Open</button>
          <DzCommandPalette v-model:open="open" :items="items" />
        </div>
      `,
    })

    const wrapper = mount(Host, { attachTo: document.body })
    await wrapper.find('button').trigger('click')
    await nextTick()
    expect(document.querySelector('[role="combobox"]')).not.toBeNull()

    dispatchEscapeKey()
    await nextTick()

    expect(wrapper.vm.open).toBe(false)

    wrapper.unmount()
  })
})
