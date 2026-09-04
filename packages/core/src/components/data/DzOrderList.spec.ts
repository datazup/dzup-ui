import { mount } from '@vue/test-utils'
/**
 * DzOrderList — unit / behaviour tests.
 *
 * Covers control-button reorder, multi-select group moves, keyboard grab /
 * move / drop / cancel, pointer drag reorder, selection, and live-region
 * announcements.
 */
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import DzOrderList from './DzOrderList.vue'

interface Row { id: number, label: string }

function makeItems(): Row[] {
  return [
    { id: 1, label: 'Alpha' },
    { id: 2, label: 'Bravo' },
    { id: 3, label: 'Charlie' },
    { id: 4, label: 'Delta' },
  ]
}

function mountList(props: Record<string, unknown> = {}) {
  return mount(DzOrderList, {
    props: { value: makeItems(), dataKey: 'id', ...props },
    slots: { item: `<template #item="{ item }"><span class="cell">{{ item.label }}</span></template>` },
  })
}

function labels(value: Row[]): string[] {
  return value.map(r => r.label)
}

describe('dzOrderList — control buttons', () => {
  it('moves the focused row down with the Move Down control', async () => {
    const wrapper = mountList()
    // activeIndex defaults to 0 (Alpha)
    const down = wrapper.get(`[aria-label="Move down"]`)
    await down.trigger('click')
    const value = wrapper.emitted('update:value')!.at(-1)![0] as Row[]
    expect(labels(value)).toEqual(['Bravo', 'Alpha', 'Charlie', 'Delta'])
  })

  it('moves the focused row up with the Move Up control', async () => {
    const wrapper = mountList()
    // focus the third row first
    await wrapper.findAll('[role="listitem"]')[2]!.trigger('keydown', { key: 'ArrowUp' })
    // now active is index 1 (Bravo); move it up
    await wrapper.get(`[aria-label="Move up"]`).trigger('click')
    const value = wrapper.emitted('update:value')!.at(-1)![0] as Row[]
    expect(labels(value)).toEqual(['Bravo', 'Alpha', 'Charlie', 'Delta'])
  })

  it('moves the focused row to the top', async () => {
    const wrapper = mountList()
    await wrapper.findAll('[role="listitem"]')[2]!.trigger('keydown', { key: 'ArrowDown' }) // not grabbed → moves focus? no
    // Set focus to index 3 via End
    await wrapper.findAll('[role="listitem"]')[0]!.trigger('keydown', { key: 'End' })
    await wrapper.get(`[aria-label="Move to top"]`).trigger('click')
    const value = wrapper.emitted('update:value')!.at(-1)![0] as Row[]
    expect(labels(value)).toEqual(['Delta', 'Alpha', 'Bravo', 'Charlie'])
  })

  it('moves the focused row to the bottom', async () => {
    const wrapper = mountList()
    await wrapper.get(`[aria-label="Move to bottom"]`).trigger('click')
    const value = wrapper.emitted('update:value')!.at(-1)![0] as Row[]
    expect(labels(value)).toEqual(['Bravo', 'Charlie', 'Delta', 'Alpha'])
  })

  it('emits reorder with from/to', async () => {
    const wrapper = mountList()
    await wrapper.get(`[aria-label="Move to bottom"]`).trigger('click')
    expect(wrapper.emitted('reorder')!.at(-1)![0]).toEqual({ from: 0, to: 3 })
  })

  it('disables Up/Top when the target is already at the top', () => {
    const wrapper = mountList()
    // activeIndex 0 → cannot move up
    expect(wrapper.get(`[aria-label="Move up"]`).attributes('disabled')).toBeDefined()
    expect(wrapper.get(`[aria-label="Move to top"]`).attributes('disabled')).toBeDefined()
  })

  it('hides the controls when showControls is false', () => {
    const wrapper = mountList({ showControls: false })
    expect(wrapper.find(`[aria-label="Move up"]`).exists()).toBe(false)
  })
})

describe('dzOrderList — multi-select group moves', () => {
  it('moves a selected group down together', async () => {
    const wrapper = mountList({ selectable: true })
    const rows = wrapper.findAll('[role="option"]')
    await rows[0]!.trigger('click') // select Alpha
    await rows[1]!.trigger('click') // select Bravo
    await wrapper.get(`[aria-label="Move down"]`).trigger('click')
    const value = wrapper.emitted('update:value')!.at(-1)![0] as Row[]
    expect(labels(value)).toEqual(['Charlie', 'Alpha', 'Bravo', 'Delta'])
  })

  it('moves a non-contiguous selection to the top preserving order', async () => {
    const wrapper = mountList({ selectable: true })
    const rows = wrapper.findAll('[role="option"]')
    await rows[1]!.trigger('click') // Bravo
    await rows[3]!.trigger('click') // Delta
    await wrapper.get(`[aria-label="Move to top"]`).trigger('click')
    const value = wrapper.emitted('update:value')!.at(-1)![0] as Row[]
    expect(labels(value)).toEqual(['Bravo', 'Delta', 'Alpha', 'Charlie'])
  })

  it('emits selectionChange with the selected keys', async () => {
    const wrapper = mountList({ selectable: true })
    await wrapper.findAll('[role="option"]')[0]!.trigger('click')
    expect(wrapper.emitted('selectionChange')!.at(-1)![0]).toEqual([1])
  })

  it('marks selected rows with aria-selected', async () => {
    const wrapper = mountList({ selectable: true })
    await wrapper.findAll('[role="option"]')[0]!.trigger('click')
    expect(wrapper.findAll('[role="option"]')[0]!.attributes('aria-selected')).toBe('true')
  })
})

describe('dzOrderList — keyboard grab / move / drop', () => {
  it('grabs, moves down, and drops a row', async () => {
    const wrapper = mountList()
    const rows = wrapper.findAll('[role="listitem"]')
    await rows[0]!.trigger('keydown', { key: ' ' }) // grab Alpha
    expect(rows[0]!.attributes('aria-grabbed')).toBe('true')
    await rows[0]!.trigger('keydown', { key: 'ArrowDown' }) // move down
    const value = wrapper.emitted('update:value')!.at(-1)![0] as Row[]
    expect(labels(value)).toEqual(['Bravo', 'Alpha', 'Charlie', 'Delta'])
  })

  it('cancels a grab with Escape, restoring the original position', async () => {
    const wrapper = mountList()
    const rows = wrapper.findAll('[role="listitem"]')
    await rows[0]!.trigger('keydown', { key: ' ' }) // grab Alpha at 0
    await rows[0]!.trigger('keydown', { key: 'ArrowDown' }) // → index 1
    await nextTick()
    // Escape should move it back to index 0
    await wrapper.findAll('[role="listitem"]')[1]!.trigger('keydown', { key: 'Escape' })
    const value = wrapper.emitted('update:value')!.at(-1)![0] as Row[]
    expect(labels(value)).toEqual(['Alpha', 'Bravo', 'Charlie', 'Delta'])
  })

  it('moves focus (not the row) with arrows when no row is grabbed', async () => {
    const wrapper = mountList()
    await wrapper.findAll('[role="listitem"]')[0]!.trigger('keydown', { key: 'ArrowDown' })
    // no reorder should have occurred
    expect(wrapper.emitted('update:value')).toBeUndefined()
    // focus moved to index 1
    expect(wrapper.findAll('[role="listitem"]')[1]!.attributes('tabindex')).toBe('0')
  })

  it('announces position changes via the live region', async () => {
    const wrapper = mountList()
    await wrapper.findAll('[role="listitem"]')[0]!.trigger('keydown', { key: ' ' })
    await wrapper.findAll('[role="listitem"]')[0]!.trigger('keydown', { key: 'ArrowDown' })
    await nextTick()
    await nextTick()
    expect(wrapper.find('[role="status"]').text()).toContain('position 2 of 4')
  })
})

describe('dzOrderList — pointer drag', () => {
  it('reorders by dropping a dragged row onto a lower target', async () => {
    const wrapper = mountList()
    const rows = wrapper.findAll('[role="listitem"]')

    // Arm the handle on Alpha, then start the drag.
    await rows[0]!.get('[data-dz-order-list-handle]').trigger('pointerdown')
    await rows[0]!.trigger('dragstart', { dataTransfer: { setData() {}, effectAllowed: '' } })

    // Drag over Charlie's lower half → drop after index 2.
    const charlie = wrapper.findAll('[role="listitem"]')[2]!
    const rect = { top: 0, height: 40 }
    charlie.element.getBoundingClientRect = () => rect as DOMRect
    await charlie.trigger('dragover', { clientY: 30, dataTransfer: {} })
    await charlie.trigger('drop', { dataTransfer: {} })

    const value = wrapper.emitted('update:value')!.at(-1)![0] as Row[]
    expect(labels(value)).toEqual(['Bravo', 'Charlie', 'Alpha', 'Delta'])
  })

  it('does not start a drag when the handle was not armed', async () => {
    const wrapper = mountList()
    const row = wrapper.findAll('[role="listitem"]')[0]!
    await row.trigger('dragstart', { dataTransfer: { setData() {}, effectAllowed: '' } })
    // dragstart was prevented → no dragging state, dropping is a no-op
    await row.trigger('drop', { dataTransfer: {} })
    expect(wrapper.emitted('update:value')).toBeUndefined()
  })
})

describe('dzOrderList — disabled', () => {
  it('does not reorder when disabled', async () => {
    const wrapper = mountList({ disabled: true })
    await wrapper.findAll('[role="listitem"]')[0]!.trigger('keydown', { key: ' ' })
    await wrapper.findAll('[role="listitem"]')[0]!.trigger('keydown', { key: 'ArrowDown' })
    expect(wrapper.emitted('update:value')).toBeUndefined()
  })
})

/**
 * TASK-N5-02 — `dragHandleLabel` was documented and nothing rendered it.
 *
 * It now reaches the DOM as the handle's `title`. It is deliberately not an
 * accessible name: the handle stays `aria-hidden="true"` because its function is
 * already reachable from the keyboard, and naming it would fold "Drag to
 * reorder" into the accessible name of every row under `selectable`, where each
 * row is `role="option"` and takes its name from its contents.
 */
describe('dzOrderList — drag handle label', () => {
  const handles = (wrapper: ReturnType<typeof mountList>) =>
    wrapper.findAll('[data-dz-order-list-handle]')

  it('renders the default label on every handle', () => {
    const wrapper = mountList()
    const found = handles(wrapper)
    expect(found.length).toBe(4)
    for (const handle of found)
      expect(handle.attributes('title')).toBe('Drag to reorder')
  })

  it('renders an explicit dragHandleLabel instead of the default', () => {
    const wrapper = mountList({ dragHandleLabel: 'Sleep vlačenjem' })
    expect(handles(wrapper)[0]?.attributes('title')).toBe('Sleep vlačenjem')
  })

  it('keeps the handle out of the accessibility tree', () => {
    const wrapper = mountList()
    expect(handles(wrapper)[0]?.attributes('aria-hidden')).toBe('true')
  })

  /**
   * The reason the handle is not given an accessible name, asserted rather than
   * asserted-in-a-comment: under `selectable` each row is `role="option"`, a
   * name-from-content role, so a named handle would prepend the same string to
   * all four row names.
   */
  it('does not fold the label into the accessible name of a selectable row', () => {
    const wrapper = mountList({ selectable: true })
    const row = wrapper.findAll('li[role="option"]')[0]
    expect(row?.text()).not.toContain('Drag to reorder')
  })

  it('renders no handle at all when dragHandle is off', () => {
    const wrapper = mountList({ dragHandle: false })
    expect(handles(wrapper)).toHaveLength(0)
  })
})
