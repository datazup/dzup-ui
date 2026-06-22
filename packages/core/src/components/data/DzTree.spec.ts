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

describe('dzTree — APG roving tabindex & structural semantics', () => {
  /** Row text (label only — chevron/checkbox carry no text). */
  function rowText(row: { text: () => string }): string {
    return row.text().trim()
  }

  it('exposes exactly one tabindex="0" treeitem row (roving tabindex)', () => {
    const wrapper = mountTree({ expandedKeys: ['root-1'] })
    const tabbable = wrapper
      .findAll('[data-dz-tree-row]')
      .filter(r => r.attributes('tabindex') === '0')
    expect(tabbable).toHaveLength(1)
    // The remaining rows are removed from the tab sequence.
    const others = wrapper
      .findAll('[data-dz-tree-row]')
      .filter(r => r.attributes('tabindex') === '-1')
    expect(others.length).toBeGreaterThan(0)
  })

  it('sets aria-level (1-based depth) on every treeitem', () => {
    const wrapper = mountTree({ expandedKeys: ['root-1', 'child-1b'] })
    const items = wrapper.findAll('[role="treeitem"]')
    // Every treeitem exposes a level.
    expect(items.every(i => !!i.attributes('aria-level'))).toBe(true)

    const levelOf = (label: string) =>
      items
        .find(i => rowText(i.find('[data-dz-tree-row]')) === label)
        ?.attributes('aria-level')
    expect(levelOf('Root 1')).toBe('1')
    expect(levelOf('Child 1A')).toBe('2')
    expect(levelOf('Grandchild 1B1')).toBe('3')
  })

  it('sets aria-setsize/aria-posinset per sibling group', () => {
    const wrapper = mountTree({ expandedKeys: ['root-1'] })
    const items = wrapper.findAll('[role="treeitem"]')
    const find = (label: string) =>
      items.find(i => rowText(i.find('[data-dz-tree-row]')) === label)

    const root1 = find('Root 1')!
    const root2 = find('Root 2')!
    expect(root1.attributes('aria-setsize')).toBe('2')
    expect(root1.attributes('aria-posinset')).toBe('1')
    expect(root2.attributes('aria-posinset')).toBe('2')

    // Children of Root 1 form their own group of two.
    const childA = find('Child 1A')!
    expect(childA.attributes('aria-setsize')).toBe('2')
    expect(childA.attributes('aria-posinset')).toBe('1')
  })

  it('moves the roving tabindex to the next visible node on ArrowDown', async () => {
    const wrapper = mountTree({ expandedKeys: ['root-1'] })
    const rows = wrapper.findAll('[data-dz-tree-row]')
    // Root 1 is the initial tab stop.
    expect(rows[0]!.attributes('tabindex')).toBe('0')

    await rows[0]!.trigger('keydown', { key: 'ArrowDown' })

    const tabbable = wrapper
      .findAll('[data-dz-tree-row]')
      .find(r => r.attributes('tabindex') === '0')!
    expect(rowText(tabbable)).toBe('Child 1A')
    // Still exactly one tab stop after moving.
    expect(
      wrapper.findAll('[data-dz-tree-row]').filter(r => r.attributes('tabindex') === '0'),
    ).toHaveLength(1)
  })

  it('moves the roving tabindex back up on ArrowUp', async () => {
    const wrapper = mountTree({ expandedKeys: ['root-1'] })
    const rows = wrapper.findAll('[data-dz-tree-row]')
    await rows[0]!.trigger('keydown', { key: 'ArrowDown' }) // → Child 1A
    await rows[1]!.trigger('keydown', { key: 'ArrowUp' }) // → Root 1

    const tabbable = wrapper
      .findAll('[data-dz-tree-row]')
      .find(r => r.attributes('tabindex') === '0')!
    expect(rowText(tabbable)).toBe('Root 1')
  })

  it('emits update:activeKey as navigation moves', async () => {
    const wrapper = mountTree({ expandedKeys: ['root-1'] })
    const rows = wrapper.findAll('[data-dz-tree-row]')
    await rows[0]!.trigger('keydown', { key: 'ArrowDown' })
    expect(wrapper.emitted('update:activeKey')?.at(-1)).toEqual(['child-1a'])
  })

  it('jumps to the last visible node on End and first on Home', async () => {
    const wrapper = mountTree({ expandedKeys: ['root-1'] })
    const rows = wrapper.findAll('[data-dz-tree-row]')
    // Visible order: Root 1, Child 1A, Child 1B, Root 2.
    await rows[0]!.trigger('keydown', { key: 'End' })
    expect(wrapper.emitted('update:activeKey')?.at(-1)).toEqual(['root-2'])
    // Home is keyed off the row receiving it, so press it on the now-active row.
    await rows[3]!.trigger('keydown', { key: 'Home' })
    expect(wrapper.emitted('update:activeKey')?.at(-1)).toEqual(['root-1'])
  })

  it('expands a collapsed branch on ArrowRight', async () => {
    const wrapper = mountTree()
    const row = wrapper.find('[data-dz-tree-row]') // Root 1, collapsed
    await row.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:expandedKeys')?.at(-1)).toEqual([['root-1']])
    expect(wrapper.text()).toContain('Child 1A')
  })

  it('moves to the first child on ArrowRight when already expanded', async () => {
    const wrapper = mountTree({ expandedKeys: ['root-1'] })
    const rows = wrapper.findAll('[data-dz-tree-row]')
    await rows[0]!.trigger('keydown', { key: 'ArrowRight' })

    const tabbable = wrapper
      .findAll('[data-dz-tree-row]')
      .find(r => r.attributes('tabindex') === '0')!
    expect(rowText(tabbable)).toBe('Child 1A')
    expect(wrapper.emitted('update:activeKey')?.at(-1)).toEqual(['child-1a'])
  })

  it('collapses an expanded branch on ArrowLeft', async () => {
    const wrapper = mountTree({ expandedKeys: ['root-1'] })
    const rows = wrapper.findAll('[data-dz-tree-row]')
    await rows[0]!.trigger('keydown', { key: 'ArrowLeft' }) // Root 1 → collapse
    expect(wrapper.emitted('update:expandedKeys')?.at(-1)).toEqual([[]])
  })

  it('moves to the parent on ArrowLeft from a collapsed/leaf child', async () => {
    const wrapper = mountTree({ expandedKeys: ['root-1'] })
    const rows = wrapper.findAll('[data-dz-tree-row]')
    // rows: [Root 1, Child 1A, Child 1B]; Child 1A is a leaf.
    await rows[1]!.trigger('keydown', { key: 'ArrowLeft' })
    expect(wrapper.emitted('update:activeKey')?.at(-1)).toEqual(['root-1'])

    const tabbable = wrapper
      .findAll('[data-dz-tree-row]')
      .find(r => r.attributes('tabindex') === '0')!
    expect(rowText(tabbable)).toBe('Root 1')
  })

  it('activates selection with Enter/Space on the active node', async () => {
    const wrapper = mountTree({ selectable: true })
    const row = wrapper.find('[data-dz-tree-row]')
    await row.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('update:selectedKeys')?.at(-1)).toEqual([['root-1']])
  })

  it('gives each checkbox an accessible name (aria-toggle-field-name)', () => {
    const wrapper = mountTree({ checkable: true })
    const checkboxes = wrapper.findAll('[role="checkbox"]')
    expect(checkboxes.length).toBeGreaterThan(0)
    expect(checkboxes.every(c => !!c.attributes('aria-label'))).toBe(true)
    expect(checkboxes[0]!.attributes('aria-label')).toBe('Root 1')
  })

  it('keeps the empty-state placeholder out of the tree role contract', () => {
    const wrapper = mount(DzTree, { props: { items: [] } })
    // No bare listitem owned by role="tree"; the placeholder is presentational.
    expect(wrapper.findAll('[role="treeitem"]')).toHaveLength(0)
    const placeholder = wrapper.find('[role="tree"] > li')
    expect(placeholder.attributes('role')).toBe('none')
  })
})
