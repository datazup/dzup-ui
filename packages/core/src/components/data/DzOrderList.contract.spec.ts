import { mount } from '@vue/test-utils'
/**
 * DzOrderList — Contract Spec v1 conformance tests.
 *
 * Verifies the public API (props, v-model, data attributes, ARIA, CSS
 * containment, class merging) conforms to the canonical data-family contract.
 */
import { describe, expect, it } from 'vitest'
import DzOrderList from './DzOrderList.vue'

interface Row { id: number, label: string }

const items: Row[] = [
  { id: 1, label: 'Alpha' },
  { id: 2, label: 'Bravo' },
  { id: 3, label: 'Charlie' },
]

function mountList(props: Record<string, unknown> = {}, options: Record<string, unknown> = {}) {
  return mount(DzOrderList, {
    props: { value: [...items], dataKey: 'id', ...props },
    slots: { item: `<template #item="{ item }"><span class="cell">{{ item.label }}</span></template>` },
    ...options,
  })
}

describe('dzOrderList — Contract Spec v1', () => {
  it('renders without errors', () => {
    expect(mountList().exists()).toBe(true)
  })

  it('has contain: layout style on root element', () => {
    expect(mountList().attributes('style')).toContain('contain: layout style')
  })

  it('exposes the dz-order-list root class for token scoping', () => {
    expect(mountList().classes()).toContain('dz-order-list')
  })

  it('reflects size via data-size for all canonical sizes', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes)
      expect(mountList({ size }).attributes('data-size')).toBe(size)
  })

  it('accepts all variant values', () => {
    const variants = ['plain', 'bordered', 'divided'] as const
    for (const variant of variants)
      expect(mountList({ variant }).exists()).toBe(true)
  })

  it('renders one row per item via the #item slot', () => {
    const wrapper = mountList()
    expect(wrapper.findAll('.cell')).toHaveLength(items.length)
    expect(wrapper.text()).toContain('Alpha')
  })

  it('renders the default empty state when value is empty', () => {
    const wrapper = mountList({ value: [] })
    expect(wrapper.text()).toContain('No items')
  })

  it('renders as role="list" by default and role="listbox" when selectable', () => {
    expect(mountList().find('ul').attributes('role')).toBe('list')
    const selectable = mountList({ selectable: true })
    expect(selectable.find('ul').attributes('role')).toBe('listbox')
    expect(selectable.find('ul').attributes('aria-multiselectable')).toBe('true')
  })

  it('forwards aria-label to the list', () => {
    const wrapper = mountList({ ariaLabel: 'Task order' })
    expect(wrapper.find('ul').attributes('aria-label')).toBe('Task order')
  })

  it('sets data-disabled when disabled', () => {
    expect(mountList({ disabled: true }).attributes('data-disabled')).toBe('')
  })

  it('provides a polite live region for announcements', () => {
    const region = mountList().find('[role="status"]')
    expect(region.exists()).toBe(true)
    expect(region.attributes('aria-live')).toBe('polite')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mountList({}, { attrs: { class: 'custom-class' } })
    expect(wrapper.html()).toContain('custom-class')
  })

  it('gives each row a roving tabindex (one 0, rest -1)', () => {
    const rows = mountList().findAll('[role="listitem"]')
    expect(rows[0]!.attributes('tabindex')).toBe('0')
    expect(rows[1]!.attributes('tabindex')).toBe('-1')
  })
})
