import type { TreeNode } from './DzTree.types.ts'
import { mount } from '@vue/test-utils'
/**
 * DzTree (compound) — Unit / behavior / contract tests.
 */
import { describe, expect, it } from 'vitest'
import DzTree from './DzTree.vue'

const sampleItems: TreeNode[] = [
  {
    key: 'root-1',
    label: 'Root 1',
    children: [
      { key: 'child-1a', label: 'Child 1A' },
      {
        key: 'child-1b',
        label: 'Child 1B',
        children: [
          { key: 'grandchild-1b1', label: 'Grandchild 1B1' },
        ],
      },
    ],
  },
  { key: 'root-2', label: 'Root 2' },
]

function mountTree(treeProps = {}) {
  return mount(DzTree, {
    props: {
      items: sampleItems,
      ...treeProps,
    },
  })
}

describe('dzTree', () => {
  it('renders successfully', () => {
    const wrapper = mountTree()
    expect(wrapper.exists()).toBe(true)
  })

  it('renders tree role', () => {
    const wrapper = mountTree()
    expect(wrapper.find('[role="tree"]').exists()).toBe(true)
  })

  it('has contain: layout style', () => {
    const wrapper = mountTree()
    expect(wrapper.find('[role="tree"]').attributes('style')).toContain('contain: layout style')
  })

  it('renders root-level items', () => {
    const wrapper = mountTree()
    expect(wrapper.text()).toContain('Root 1')
    expect(wrapper.text()).toContain('Root 2')
  })

  it('renders treeitem roles', () => {
    const wrapper = mountTree()
    const treeitems = wrapper.findAll('[role="treeitem"]')
    expect(treeitems.length).toBe(2)
  })

  it('does not show children by default (collapsed)', () => {
    const wrapper = mountTree()
    expect(wrapper.text()).not.toContain('Child 1A')
  })

  it('shows children when expanded', () => {
    const wrapper = mountTree({ expandedKeys: ['root-1'] })
    expect(wrapper.text()).toContain('Child 1A')
    expect(wrapper.text()).toContain('Child 1B')
  })

  it('forwards aria-label', () => {
    const wrapper = mountTree({ ariaLabel: 'File tree' })
    expect(wrapper.find('[role="tree"]').attributes('aria-label')).toBe('File tree')
  })

  it('sets data-disabled when disabled', () => {
    const wrapper = mountTree({ disabled: true })
    expect(wrapper.find('[role="tree"]').attributes('data-disabled')).toBe('')
  })

  it('sets data-loading when loading', () => {
    const wrapper = mountTree({ loading: true })
    expect(wrapper.find('[role="tree"]').attributes('data-loading')).toBe('')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzTree, {
      props: { items: sampleItems },
      attrs: { class: 'my-tree' },
    })
    expect(wrapper.find('[role="tree"]').classes()).toContain('my-tree')
  })

  it('renders empty state when no items', () => {
    const wrapper = mount(DzTree, {
      props: { items: [] },
    })
    expect(wrapper.text()).toContain('No items')
  })

  it('emits update:expandedKeys on toggle', async () => {
    const wrapper = mountTree()
    // Click on root-1 to expand it
    const firstItem = wrapper.find('[role="treeitem"] div')
    await firstItem.trigger('click')
    expect(wrapper.emitted('update:expandedKeys')).toBeTruthy()
  })

  it('supports selectable mode', async () => {
    const wrapper = mountTree({ selectable: true })
    const firstItem = wrapper.find('[role="treeitem"] div')
    await firstItem.trigger('click')
    expect(wrapper.emitted('update:selectedKeys')).toBeTruthy()
  })
})
