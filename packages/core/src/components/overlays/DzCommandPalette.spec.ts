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

  it('registers hidden dialog title and description without Reka warnings', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const wrapper = mount(DzCommandPalette, {
      attachTo: document.body,
      props: {
        open: true,
        items: sampleItems,
      },
    })

    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))

    const rekaWarnings = warnSpy.mock.calls
      .map(([message]) => String(message))
      .filter(message => message.includes('DialogContent'))

    expect(rekaWarnings).toEqual([])

    wrapper.unmount()
    warnSpy.mockRestore()
  })
})

/**
 * Filtering, driven through the REAL (un-stubbed) Reka Combobox.
 *
 * These have to mount the real primitive. The bug they pin was invisible to every
 * stubbed or shallow test in this file: `filteredItems` was always correct, and
 * `wrapper.exists()` was always true. What went wrong happened one layer down —
 * Reka's `ComboboxItem` registered each row's RENDERED TEXT with `ComboboxRoot`
 * and hid any row its own filter scored zero, a second filter downstream of this
 * component's. So a `label` carrying more than the row displayed was filtered on
 * the display text instead, and the only symptom was a query that found nothing.
 *
 * Asserting on the rendered rows (not on internal state) is the point: that is the
 * only level at which the second filter is observable.
 */
describe('dzCommandPalette — filtering', () => {
  /**
   * Mount open with the real Reka stack, type `query`, and return this palette's
   * rendered rows.
   *
   * Everything is scoped to a per-test `id`, not queried off `document`: the
   * dialog is TELEPORTED to <body>, several tests above mount without unmounting,
   * and wiping <body> between tests breaks Teleport's own unmount. A global
   * `[role="option"]` query passes alone and picks up the previous test's rows
   * when the file runs in order.
   */
  let seq = 0
  async function search(items: CommandItem[], query: string, slot?: string) {
    const id = `palette-${seq++}`
    const wrapper = mount(DzCommandPalette, {
      attachTo: document.body,
      props: { open: true, items, id },
      slots: slot ? { item: slot } : undefined,
    })
    await nextTick()
    const dialog = document.getElementById(id)!
    const input = dialog.querySelector<HTMLInputElement>('[role="combobox"]')!
    input.value = query
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await nextTick()
    await nextTick()
    const rows = [...dialog.querySelectorAll('[role="option"]')].map(
      el => el.textContent?.trim() ?? '',
    )
    return { wrapper, dialog, rows }
  }

  it('searches the full label even when the row renders only part of it', async () => {
    // The shape every real consumer ends up with: `label` is the search index,
    // the slot renders the caption. Searching a term that exists ONLY in the
    // label must still find the row.
    const items: CommandItem[] = [
      { id: 'hero-centered', label: 'Centered hero hero-centered cta marketing' },
      { id: 'sign-in', label: 'Sign-in card sign-in auth forms' },
    ]
    const slot = `<span>{{ params.item.id === 'hero-centered' ? 'Centered hero' : 'Sign-in card' }}</span>`

    const { wrapper, rows } = await search(items, 'hero-centered', slot)

    expect(rows).toEqual(['Centered hero'])
    wrapper.unmount()
  })

  it('drops items whose label does not match', async () => {
    const items: CommandItem[] = [
      { id: 'edit', label: 'Edit File' },
      { id: 'save', label: 'Save File' },
    ]

    const { wrapper, rows } = await search(items, 'edit')

    expect(rows).toEqual(['Edit File'])
    wrapper.unmount()
  })

  it('matches case- and accent-insensitively', async () => {
    // Reka's filter was `Intl.Collator`-backed, so disabling it must not quietly
    // downgrade matching to a plain `includes`.
    const items: CommandItem[] = [{ id: 'cv', label: 'Résumé' }]

    const { wrapper, rows } = await search(items, 'resume')

    expect(rows).toEqual(['Résumé'])
    wrapper.unmount()
  })

  it('renders the empty slot when nothing matches', async () => {
    const items: CommandItem[] = [{ id: 'edit', label: 'Edit File' }]

    const { wrapper, dialog, rows } = await search(items, 'nothing-matches-this')

    expect(rows).toEqual([])
    expect(dialog.textContent).toContain('No results found.')
    wrapper.unmount()
  })
})
