import type { TreeNode } from './DzTreeSelect.types.ts'
import { mount } from '@vue/test-utils'
/**
 * DzTreeSelect — Unit / behavior tests.
 *
 * Panel content (the DzTree) renders in a Reka portal on document.body, so
 * interaction tests open the panel via `defaultOpen` and query the document.
 */
import { afterEach, describe, expect, it } from 'vitest'
import { h } from 'vue'
import DzFormField from './DzFormField.vue'
import DzTreeSelect from './DzTreeSelect.vue'

const nodes: TreeNode[] = [
  {
    key: 'fruit',
    label: 'Fruit',
    children: [
      { key: 'apple', label: 'Apple' },
      { key: 'banana', label: 'Banana' },
    ],
  },
  { key: 'cherry', label: 'Cherry' },
  { key: 'veg', label: 'Vegetable', disabled: true },
]

async function flush(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 50))
}

/** Click the clickable row of a tree node identified by its label text. */
function clickRow(label: string): boolean {
  const items = Array.from(document.querySelectorAll('[role="treeitem"]'))
  for (const li of items) {
    const row = li.querySelector(':scope > div')
    if (row && row.textContent?.trim() === label) {
      row.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      return true
    }
  }
  return false
}

/** Click the expand/collapse chevron of a parent node identified by its label. */
function clickChevron(label: string): boolean {
  const items = Array.from(document.querySelectorAll('[role="treeitem"]'))
  for (const li of items) {
    const row = li.querySelector(':scope > div')
    if (row && row.textContent?.trim() === label) {
      const toggle = row.querySelector(':scope > [data-dz-tree-toggle]')
      if (toggle) {
        toggle.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        return true
      }
    }
  }
  return false
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('dzTreeSelect — Trigger', () => {
  it('shows the placeholder when nothing is selected', () => {
    const wrapper = mount(DzTreeSelect, {
      props: { nodes, placeholder: 'Pick a category' },
    })
    expect(wrapper.text()).toContain('Pick a category')
  })

  it('emits focus and blur from the trigger', async () => {
    const wrapper = mount(DzTreeSelect, { props: { nodes } })
    const trigger = wrapper.find('[role="combobox"]')
    await trigger.trigger('focus')
    await trigger.trigger('blur')
    expect(wrapper.emitted('focus')).toHaveLength(1)
    expect(wrapper.emitted('blur')).toHaveLength(1)
  })

  it('opens on ArrowDown keydown', async () => {
    const wrapper = mount(DzTreeSelect, { props: { nodes } })
    const trigger = wrapper.find('[role="combobox"]')
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    expect(trigger.attributes('aria-expanded')).toBe('true')
    expect(wrapper.emitted('open')).toBeTruthy()
  })

  it('does not open when disabled', async () => {
    const wrapper = mount(DzTreeSelect, { props: { nodes, disabled: true } })
    const trigger = wrapper.find('[role="combobox"]')
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    expect(trigger.attributes('aria-expanded')).toBe('false')
  })

  it('integrates with DzFormField context', () => {
    const wrapper = mount(DzFormField, {
      props: { required: true, error: 'Required' },
      slots: { default: () => h(DzTreeSelect, { nodes }) },
    })
    expect(wrapper.findComponent(DzTreeSelect).exists()).toBe(true)
  })

  it('renders an inline error linked via aria-describedby', () => {
    const wrapper = mount(DzTreeSelect, {
      props: { nodes, error: 'Selection required' },
    })
    const errorEl = wrapper.find('[role="alert"]')
    expect(errorEl.exists()).toBe(true)
    const errorId = errorEl.attributes('id')!
    expect(wrapper.find(`[aria-describedby~="${errorId}"]`).exists()).toBe(true)
  })
})

describe('dzTreeSelect — Panel', () => {
  it('renders the tree (role="tree") when open', async () => {
    const wrapper = mount(DzTreeSelect, {
      props: { nodes, defaultOpen: true },
      attachTo: document.body,
    })
    await flush()
    expect(document.querySelector('[role="tree"]')).not.toBeNull()
    wrapper.unmount()
  })

  it('does not render the tree when closed', () => {
    mount(DzTreeSelect, { props: { nodes } })
    expect(document.querySelector('[role="tree"]')).toBeNull()
  })
})

describe('dzTreeSelect — Single selection', () => {
  it('selects a node, emits change, and closes', async () => {
    const wrapper = mount(DzTreeSelect, {
      props: { nodes, defaultOpen: true },
      attachTo: document.body,
    })
    await flush()

    expect(clickRow('Cherry')).toBe(true)
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('change')?.at(-1)).toEqual(['cherry'])
    expect(wrapper.emitted('close')).toBeTruthy()
    expect(wrapper.find('[role="combobox"]').attributes('aria-expanded')).toBe('false')
    expect(wrapper.text()).toContain('Cherry')
    wrapper.unmount()
  })

  it('does not select a disabled node', async () => {
    const wrapper = mount(DzTreeSelect, {
      props: { nodes, defaultOpen: true },
      attachTo: document.body,
    })
    await flush()

    clickRow('Vegetable')
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('change')).toBeFalsy()
    wrapper.unmount()
  })
})

describe('dzTreeSelect — Pointer-driven expansion', () => {
  it('expands a collapsed parent when its chevron is clicked, keeping the panel open', async () => {
    const wrapper = mount(DzTreeSelect, {
      props: { nodes, defaultOpen: true },
      attachTo: document.body,
    })
    await flush()

    // Collapsed parent: children are not in the DOM yet.
    expect(document.querySelector('[role="tree"]')?.textContent).not.toContain('Apple')

    expect(clickChevron('Fruit')).toBe(true)
    await wrapper.vm.$nextTick()

    // Children revealed, no selection committed, panel still open.
    const tree = document.querySelector('[role="tree"]')
    expect(tree?.textContent).toContain('Apple')
    expect(tree?.textContent).toContain('Banana')
    expect(wrapper.emitted('change')).toBeFalsy()
    expect(wrapper.emitted('select')).toBeFalsy()
    expect(wrapper.emitted('close')).toBeFalsy()
    expect(wrapper.find('[role="combobox"]').attributes('aria-expanded')).toBe('true')

    // aria-expanded flipped to true on the treeitem.
    const fruitItem = Array.from(document.querySelectorAll('[role="treeitem"]'))
      .find(li => li.querySelector(':scope > div')?.textContent?.trim() === 'Fruit')
    expect(fruitItem?.getAttribute('aria-expanded')).toBe('true')
    expect(wrapper.emitted('update:expandedKeys')?.at(-1)).toEqual([['fruit']])

    wrapper.unmount()
  })

  it('reaches the same expanded end state via pointer (chevron) and keyboard (ArrowRight)', async () => {
    // Pointer path.
    const pointer = mount(DzTreeSelect, {
      props: { nodes, defaultOpen: true },
      attachTo: document.body,
    })
    await flush()
    clickChevron('Fruit')
    await pointer.vm.$nextTick()
    const pointerKeys = pointer.emitted('update:expandedKeys')?.at(-1)
    pointer.unmount()
    document.body.innerHTML = ''

    // Keyboard path.
    const keyboard = mount(DzTreeSelect, {
      props: { nodes, defaultOpen: true },
      attachTo: document.body,
    })
    await flush()
    const fruitRow = Array.from(document.querySelectorAll('[role="treeitem"]'))
      .find(li => li.querySelector(':scope > div')?.textContent?.trim() === 'Fruit')
      ?.querySelector(':scope > div')
    fruitRow?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    await keyboard.vm.$nextTick()
    const keyboardKeys = keyboard.emitted('update:expandedKeys')?.at(-1)

    expect(pointerKeys).toEqual([['fruit']])
    expect(keyboardKeys).toEqual(pointerKeys)
    expect(document.querySelector('[role="tree"]')?.textContent).toContain('Apple')
    keyboard.unmount()
  })
})

describe('dzTreeSelect — ARIA combobox-with-tree semantics', () => {
  it('renders exactly one tabindex="0" treeitem in the open panel', async () => {
    const wrapper = mount(DzTreeSelect, {
      props: { nodes, defaultOpen: true },
      attachTo: document.body,
    })
    await flush()

    const rows = Array.from(
      document.querySelectorAll('[role="tree"] [data-dz-tree-row]'),
    )
    const tabbable = rows.filter(r => r.getAttribute('tabindex') === '0')
    expect(tabbable).toHaveLength(1)
    expect(rows.filter(r => r.getAttribute('tabindex') === '-1').length).toBeGreaterThan(0)
    wrapper.unmount()
  })

  it('exposes aria-level on every treeitem', async () => {
    const wrapper = mount(DzTreeSelect, {
      props: { nodes, expandedKeys: ['fruit'], defaultOpen: true },
      attachTo: document.body,
    })
    await flush()

    const items = Array.from(document.querySelectorAll('[role="treeitem"]'))
    expect(items.length).toBeGreaterThan(0)
    expect(items.every(li => !!li.getAttribute('aria-level'))).toBe(true)

    const levelOf = (label: string) =>
      items
        .find(li => li.querySelector(':scope > [data-dz-tree-row]')?.textContent?.trim() === label)
        ?.getAttribute('aria-level')
    expect(levelOf('Fruit')).toBe('1')
    expect(levelOf('Apple')).toBe('2')
    wrapper.unmount()
  })

  it('points aria-activedescendant at a real treeitem when opened', async () => {
    const wrapper = mount(DzTreeSelect, {
      props: { nodes, defaultOpen: true },
      attachTo: document.body,
    })
    await flush()

    const combobox = wrapper.find('[role="combobox"]')
    const active = combobox.attributes('aria-activedescendant')
    expect(active).toBeTruthy()
    const activeEl = document.getElementById(active!)
    expect(activeEl?.getAttribute('role')).toBe('treeitem')
    wrapper.unmount()
  })

  it('moves aria-activedescendant down/up from the focused trigger', async () => {
    const wrapper = mount(DzTreeSelect, {
      props: { nodes, defaultOpen: true },
      attachTo: document.body,
    })
    await flush()

    const combobox = wrapper.find('[role="combobox"]')
    const first = combobox.attributes('aria-activedescendant')

    await combobox.trigger('keydown', { key: 'ArrowDown' })
    const second = combobox.attributes('aria-activedescendant')
    expect(second).toBeTruthy()
    expect(second).not.toBe(first)
    // The newly active node carries the panel's single tabindex="0".
    const activeRow = document.getElementById(second!)?.querySelector(':scope > [data-dz-tree-row]')
    expect(activeRow?.getAttribute('tabindex')).toBe('0')

    await combobox.trigger('keydown', { key: 'ArrowUp' })
    expect(combobox.attributes('aria-activedescendant')).toBe(first)
    wrapper.unmount()
  })

  it('arrowDown on a closed trigger opens the panel and seeds an active node', async () => {
    const wrapper = mount(DzTreeSelect, {
      props: { nodes },
      attachTo: document.body,
    })
    const combobox = wrapper.find('[role="combobox"]')
    await combobox.trigger('keydown', { key: 'ArrowDown' })
    await flush()

    expect(combobox.attributes('aria-expanded')).toBe('true')
    expect(combobox.attributes('aria-activedescendant')).toBeTruthy()
    wrapper.unmount()
  })

  it('arrowRight expands the active branch and ArrowLeft collapses it (from the trigger)', async () => {
    const wrapper = mount(DzTreeSelect, {
      props: { nodes, defaultOpen: true },
      attachTo: document.body,
    })
    await flush()

    const combobox = wrapper.find('[role="combobox"]')
    // Active node starts on the first row, "Fruit" (a collapsed parent).
    expect(document.querySelector('[role="tree"]')?.textContent).not.toContain('Apple')

    await combobox.trigger('keydown', { key: 'ArrowRight' })
    expect(document.querySelector('[role="tree"]')?.textContent).toContain('Apple')
    expect(wrapper.emitted('update:expandedKeys')?.at(-1)).toEqual([['fruit']])

    await combobox.trigger('keydown', { key: 'ArrowLeft' })
    expect(document.querySelector('[role="tree"]')?.textContent).not.toContain('Apple')
    expect(wrapper.emitted('change')).toBeFalsy()
    wrapper.unmount()
  })

  it('enter on the active node commits the selection (single mode)', async () => {
    const wrapper = mount(DzTreeSelect, {
      props: { nodes, defaultOpen: true },
      attachTo: document.body,
    })
    await flush()

    const combobox = wrapper.find('[role="combobox"]')
    // Move to "Cherry" (a leaf) and commit.
    await combobox.trigger('keydown', { key: 'ArrowDown' }) // Fruit → Cherry
    await combobox.trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('change')?.at(-1)).toEqual(['cherry'])
    expect(combobox.attributes('aria-expanded')).toBe('false')
    wrapper.unmount()
  })
})

describe('dzTreeSelect — Multiple selection', () => {
  it('accumulates selections and stays open', async () => {
    const wrapper = mount(DzTreeSelect, {
      props: { nodes, selectionMode: 'multiple', expandedKeys: ['fruit'], defaultOpen: true },
      attachTo: document.body,
    })
    await flush()

    clickRow('Apple')
    await wrapper.vm.$nextTick()
    clickRow('Banana')
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('change')?.at(-1)).toEqual([['apple', 'banana']])
    expect(wrapper.find('[role="combobox"]').attributes('aria-expanded')).toBe('true')
    wrapper.unmount()
  })

  it('renders removable chips and removes on chip click', async () => {
    const wrapper = mount(DzTreeSelect, {
      props: { nodes, selectionMode: 'multiple', value: ['cherry'] },
    })
    const removeBtn = wrapper.find('[aria-label="Remove Cherry"]')
    expect(removeBtn.exists()).toBe(true)

    await removeBtn.trigger('click')
    expect(wrapper.emitted('change')?.at(-1)).toEqual([[]])
  })
})

describe('dzTreeSelect — Checkbox selection', () => {
  it('propagates selection from parent to all descendants', async () => {
    const wrapper = mount(DzTreeSelect, {
      props: { nodes, selectionMode: 'checkbox', expandedKeys: ['fruit'], defaultOpen: true },
      attachTo: document.body,
    })
    await flush()

    clickRow('Fruit')
    await wrapper.vm.$nextTick()

    const last = wrapper.emitted('change')?.at(-1)?.[0] as string[]
    expect(last).toEqual(expect.arrayContaining(['fruit', 'apple', 'banana']))
    wrapper.unmount()
  })

  it('marks parent indeterminate when only some children are checked', async () => {
    const wrapper = mount(DzTreeSelect, {
      props: { nodes, selectionMode: 'checkbox', value: ['apple'], expandedKeys: ['fruit'], defaultOpen: true },
      attachTo: document.body,
    })
    await flush()

    const indeterminate = document.querySelector('[data-state="indeterminate"]')
    expect(indeterminate).not.toBeNull()
    wrapper.unmount()
  })
})

describe('dzTreeSelect — Filter', () => {
  it('prunes the tree to matching nodes as the user types', async () => {
    const wrapper = mount(DzTreeSelect, {
      props: { nodes, filter: true, defaultOpen: true },
      attachTo: document.body,
    })
    await flush()

    const search = document.querySelector('[data-dz-tree-search]') as HTMLInputElement
    expect(search).not.toBeNull()
    search.value = 'app'
    search.dispatchEvent(new Event('input', { bubbles: true }))
    await wrapper.vm.$nextTick()
    await flush()

    const text = document.querySelector('[role="tree"]')?.textContent ?? ''
    expect(text).toContain('Apple')
    expect(text).not.toContain('Cherry')
    wrapper.unmount()
  })

  it('shows no-results text when nothing matches', async () => {
    const wrapper = mount(DzTreeSelect, {
      props: { nodes, filter: true, noResultsText: 'Nothing found', defaultOpen: true },
      attachTo: document.body,
    })
    await flush()

    const search = document.querySelector('[data-dz-tree-search]') as HTMLInputElement
    search.value = 'zzzzz'
    search.dispatchEvent(new Event('input', { bubbles: true }))
    await wrapper.vm.$nextTick()
    await flush()

    expect(document.querySelector('[data-dz-tree-empty]')?.textContent).toContain('Nothing found')
    wrapper.unmount()
  })
})
