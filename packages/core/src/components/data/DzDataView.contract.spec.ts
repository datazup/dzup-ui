import { mount } from '@vue/test-utils'
/**
 * DzDataView — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzDataView from './DzDataView.vue'

const items = [{ id: 1, name: 'A' }, { id: 2, name: 'B' }, { id: 3, name: 'C' }]

function mountView(props: Record<string, unknown> = {}, options: Record<string, unknown> = {}) {
  return mount(DzDataView, {
    props: { items, ...props },
    slots: { item: `<template #item="{ item }"><span class="cell">{{ item.name }}</span></template>` },
    ...options,
  })
}

describe('dzDataView — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mountView()
    expect(wrapper.exists()).toBe(true)
  })

  it('has contain: layout style on root element', () => {
    const wrapper = mountView()
    expect(wrapper.attributes('style')).toContain('contain: layout style')
  })

  it('exposes the dz-data-view root class for token scoping', () => {
    const wrapper = mountView()
    expect(wrapper.classes()).toContain('dz-data-view')
  })

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mountView({ size })
      expect(wrapper.attributes('data-size')).toBe(size)
    }
  })

  it('reflects the active layout via data-layout', () => {
    expect(mountView({ layout: 'list' }).attributes('data-layout')).toBe('list')
    expect(mountView({ layout: 'grid' }).attributes('data-layout')).toBe('grid')
  })

  it('renders a real list (role="list" with listitems)', () => {
    const wrapper = mountView({ layout: 'list' })
    expect(wrapper.find('[role="list"]').exists()).toBe(true)
    expect(wrapper.findAll('[role="listitem"]')).toHaveLength(items.length)
  })

  it('renders the grid layout as a list of listitems', () => {
    const wrapper = mountView({ layout: 'grid' })
    expect(wrapper.find('[role="list"]').exists()).toBe(true)
    expect(wrapper.findAll('[role="listitem"]')).toHaveLength(items.length)
  })

  it('exposes a polite live region', () => {
    const wrapper = mountView()
    expect(wrapper.find('[aria-live="polite"]').exists()).toBe(true)
  })

  it('renders the layout toggle as a labelled segmented control', () => {
    const wrapper = mountView({ layoutToggle: true })
    expect(wrapper.find('[aria-label="View layout"]').exists()).toBe(true)
  })

  it('forwards aria-label to the root', () => {
    const wrapper = mountView({ ariaLabel: 'Product catalog' })
    expect(wrapper.attributes('aria-label')).toBe('Product catalog')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mountView({}, { attrs: { class: 'custom-class' } })
    expect(wrapper.classes()).toContain('custom-class')
  })
})
