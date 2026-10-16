/**
 * Data-family empty states come from the message catalog (UI-DZUP-UI-UX-M-03).
 *
 * Each component used to render its own English literal ("No data available",
 * "No items", "No records found."), which no host could translate except one
 * instance at a time. Setting the catalog entry once now changes every instance;
 * with no override the English text is byte-identical to the old literal.
 */
import type { DzMessages } from '@dzup-ui/contracts'
import type { Component } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import { provideDzMessages } from '../../composables/provider/useDzMessages.ts'
import DzTransfer from '../forms/DzTransfer.vue'
import DzDataGrid from './DzDataGrid.vue'
import DzDataView from './DzDataView.vue'
import DzOrderList from './DzOrderList.vue'
import DzTable from './DzTable.vue'
import DzTableBody from './DzTableBody.vue'
import DzTree from './DzTree.vue'

interface Case {
  readonly group: string
  readonly english: string
  /** How many empty states one mount renders. */
  readonly count: number
  readonly render: () => ReturnType<typeof h>
}

const cases: readonly Case[] = [
  { group: 'DzDataGrid', english: 'No data available', count: 1, render: () => h(DzDataGrid as Component, { data: [], columns: [{ field: 'name', header: 'Name' }] }) },
  { group: 'DzTree', english: 'No items', count: 1, render: () => h(DzTree as Component, { items: [] }) },
  { group: 'DzOrderList', english: 'No items', count: 1, render: () => h(DzOrderList as Component, { value: [], dataKey: 'id' }) },
  { group: 'DzTransfer', english: 'No items', count: 2, render: () => h(DzTransfer as Component, { source: [] }) },
  { group: 'DzDataView', english: 'No items', count: 1, render: () => h(DzDataView as Component, { items: [] }) },
  { group: 'DzTableBody', english: 'No records found.', count: 1, render: () => h(DzTable, null, { default: () => h(DzTableBody, null, {}) }) },
]

function mountWith(messages: DzMessages, render: () => ReturnType<typeof h>) {
  const Host = defineComponent({
    setup() {
      provideDzMessages(ref(messages))
      return render
    },
  })
  return mount(Host)
}

function occurrences(text: string, needle: string): number {
  return text.split(needle).length - 1
}

describe('data-family empty states — message catalog', () => {
  it.each(cases)('$group renders the English default when the host overrides nothing', ({ english, count, render }) => {
    const wrapper = mountWith({}, render)
    expect(occurrences(wrapper.text(), english)).toBeGreaterThanOrEqual(count)
    wrapper.unmount()
  })

  it.each(cases)('$group renders the host catalog entry in every empty state', ({ group, english, count, render }) => {
    const translated = `Leer (${group})`
    const wrapper = mountWith({ [group]: { empty: translated } } as DzMessages, render)
    expect(occurrences(wrapper.text(), translated)).toBe(count)
    expect(wrapper.text()).not.toContain(english)
    wrapper.unmount()
  })

  it('a DzDataView emptyTitle prop still wins over the catalog', () => {
    const wrapper = mountWith(
      { DzDataView: { empty: 'Leer' } } as DzMessages,
      () => h(DzDataView as Component, { items: [], emptyTitle: 'Nothing here' }),
    )
    expect(wrapper.text()).toContain('Nothing here')
    expect(wrapper.text()).not.toContain('Leer')
    wrapper.unmount()
  })
})
