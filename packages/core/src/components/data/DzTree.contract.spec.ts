import { mount } from '@vue/test-utils'
/**
 * DzTree — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzTree from './DzTree.vue'

const items = [
  { key: '1', label: 'Root', children: [{ key: '1-1', label: 'Child' }] },
]

describe('dzTree — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzTree, { props: { items } })
    expect(wrapper.exists()).toBe(true)
  })

  it('has contain: layout style on root element', () => {
    const wrapper = mount(DzTree, { props: { items } })
    expect(wrapper.classes()).toContain('[contain:layout_style]')
  })

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzTree, { props: { items, size } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('forwards aria-label', () => {
    const wrapper = mount(DzTree, {
      props: { items, ariaLabel: 'File tree' },
    })
    expect(wrapper.html()).toContain('File tree')
  })

  it('displays node labels', () => {
    const wrapper = mount(DzTree, { props: { items } })
    expect(wrapper.text()).toContain('Root')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzTree, {
      props: { items },
      attrs: { class: 'custom-class' },
    })
    expect(wrapper.html()).toContain('custom-class')
  })

  // DZUP-UI-R8-01-20261006-R1: the declared `DzTreeEmits` and `DzTreeSlots` surfaces.
  it('emits update:expandedKeys with nodeExpand, then nodeCollapse, as a branch toggles', async () => {
    const wrapper = mount(DzTree, { props: { items } })
    await wrapper.find('[data-dz-tree-row]').trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:expandedKeys')?.at(-1)).toEqual([['1']])
    expect(wrapper.emitted('nodeExpand')).toEqual([[items[0]]])
    await wrapper.find('[data-dz-tree-row]').trigger('keydown', { key: 'ArrowLeft' })
    expect(wrapper.emitted('update:expandedKeys')?.at(-1)).toEqual([[]])
    expect(wrapper.emitted('nodeCollapse')).toEqual([[items[0]]])
  })

  it('emits update:selectedKeys and nodeClick when a selectable node is chosen', async () => {
    const wrapper = mount(DzTree, { props: { items, selectable: true } })
    await wrapper.find('[data-dz-tree-row]').trigger('click')
    expect(wrapper.emitted('update:selectedKeys')?.at(-1)).toEqual([['1']])
    expect(wrapper.emitted('nodeClick')?.at(-1)).toEqual([items[0]])
  })

  it('renders each node through the #item slot with its state', () => {
    const wrapper = mount(DzTree, {
      props: { items, selectedKeys: ['1'], selectable: true },
      slots: {
        item: `<template #item="{ node, level, expanded, selected }">
          <span class="custom-node">{{ node.label }}:{{ level }}:{{ expanded }}:{{ selected }}</span>
        </template>`,
      },
    })
    expect(wrapper.find('.custom-node').text()).toBe('Root:0:false:true')
  })

  it('renders the #empty slot when there are no items', () => {
    const wrapper = mount(DzTree, {
      props: { items: [] },
      slots: { empty: '<span class="custom-empty">Nothing here</span>' },
    })
    expect(wrapper.find('.custom-empty').text()).toBe('Nothing here')
    expect(wrapper.text()).not.toContain('No items')
  })
})
