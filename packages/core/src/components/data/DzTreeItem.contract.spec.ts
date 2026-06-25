import { mount } from '@vue/test-utils'
/**
 * DzTreeItem — Contract Spec v1 conformance tests.
 *
 * DzTreeItem injects context from DzTree. We test it via DzTree which provides
 * full context, plus a few standalone checks that fall back to no-context defaults.
 */
import { describe, expect, it } from 'vitest'
import type { TreeNode } from './DzTree.types.ts'
import DzTree from './DzTree.vue'
import DzTreeItem from './DzTreeItem.vue'

const leaf: TreeNode = { key: 'a', label: 'Alpha' }
const branch: TreeNode = {
  key: 'b',
  label: 'Beta',
  children: [{ key: 'b-1', label: 'Beta Child' }],
}

describe('dzTreeItem — Contract Spec v1', () => {
  it('renders inside DzTree without errors', () => {
    const wrapper = mount(DzTree, { props: { items: [leaf] } })
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toContain('Alpha')
  })

  it('renders with role="treeitem"', () => {
    const wrapper = mount(DzTreeItem, {
      props: { node: leaf, level: 0 },
    })
    expect(wrapper.attributes('role')).toBe('treeitem')
  })

  it('sets aria-level from level prop (1-based)', () => {
    const wrapper = mount(DzTreeItem, {
      props: { node: leaf, level: 2 },
    })
    expect(wrapper.attributes('aria-level')).toBe('3')
  })

  it('sets aria-disabled on disabled node', () => {
    const disabled = { key: 'x', label: 'Locked', disabled: true }
    const wrapper = mount(DzTreeItem, {
      props: { node: disabled, level: 0 },
    })
    expect(wrapper.attributes('aria-disabled')).toBe('true')
    expect(wrapper.attributes('data-disabled')).toBe('')
  })

  it('renders node label via default slot fallback', () => {
    const wrapper = mount(DzTreeItem, {
      props: { node: leaf, level: 0 },
    })
    expect(wrapper.text()).toContain('Alpha')
  })

  it('shows expand indicator for branch nodes', () => {
    const wrapper = mount(DzTreeItem, {
      props: { node: branch, level: 0 },
    })
    // Branch nodes render an SVG chevron (data-dz-tree-toggle).
    expect(wrapper.find('[data-dz-tree-toggle]').exists()).toBe(true)
  })

  it('does not show expand indicator for leaf nodes', () => {
    const wrapper = mount(DzTreeItem, {
      props: { node: leaf, level: 0 },
    })
    expect(wrapper.find('[data-dz-tree-toggle]').exists()).toBe(false)
  })

  it('branch node aria-expanded is false by default (collapsed)', () => {
    const wrapper = mount(DzTreeItem, {
      props: { node: branch, level: 0 },
    })
    expect(wrapper.attributes('aria-expanded')).toBe('false')
  })

  it('leaf node has no aria-expanded', () => {
    const wrapper = mount(DzTreeItem, {
      props: { node: leaf, level: 0 },
    })
    expect(wrapper.attributes('aria-expanded')).toBeUndefined()
  })

  it('merges consumer class on the row div via cn()', () => {
    const wrapper = mount(DzTreeItem, {
      props: { node: leaf, level: 0 },
      attrs: { class: 'custom-class' },
    })
    expect(wrapper.html()).toContain('custom-class')
  })
})
