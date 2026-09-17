/**
 * `data` — Tier B+ anatomy conformance (TASK-R5-O2 continuation, ADR-19).
 *
 * The family the tabular vocabulary was grown for. TASK-R5-O1 folded `body`,
 * `row` and `cell` into `ANATOMY_PART_VOCABULARY` on the evidence of `DzTable`
 * alone; this slice is the test of that decision, and `DzDataGrid` and
 * `DzCalendar` both reach for the same three words without stretching them.
 *
 * The completeness claim is scoped to **Tier B and above**: 7 of the family's
 * 19 public components are Tier A and TASK-R5-O2's scope excludes them.
 * `DzTable` (Tier C) and `DzCodeBlock` (Tier A) declared before this packet and
 * are asserted here only for the family-level completeness check.
 *
 * One check was **blocked, not skipped**, and is now **unblocked**; the other
 * stays scoped out for a different reason:
 *
 * - `DzDataGrid` with `selectable="multiple"` was skipped because that branch
 *   renders a `DzCheckbox`, which had no declaration and was therefore not an
 *   anatomy boundary, so its states landed inside the grid's subtree. The owner
 *   took D15 (S1-D4) as option (d) and the `forms` slice landed
 *   `DzCheckbox.anatomy.ts`, so that branch is exercised below.
 * - `DzDataView` is exercised with items present, because the empty and loading
 *   branches render `DzEmpty` and `DzSkeleton`, which are Tier A in `feedback`
 *   and outside this packet's scope.
 *
 * Both are the `boundary-stops` rule working as designed: the check is honest
 * about what it cannot see rather than declaring another component's surface.
 */

import type { Component } from 'vue'
import { expectAnatomy } from '@dzup-ui/testing'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import { anatomy as accordionAnatomy } from './DzAccordion.anatomy.ts'
import DzAccordion from './DzAccordion.vue'
import DzAccordionContent from './DzAccordionContent.vue'
import DzAccordionItem from './DzAccordionItem.vue'
import DzAccordionTrigger from './DzAccordionTrigger.vue'
import { anatomy as calendarAnatomy } from './DzCalendar.anatomy.ts'
import DzCalendar from './DzCalendar.vue'
import { anatomy as chipAnatomy } from './DzChip.anatomy.ts'
import DzChip from './DzChip.vue'
import { anatomy as dataGridAnatomy } from './DzDataGrid.anatomy.ts'
import DzDataGrid from './DzDataGrid.vue'
import { anatomy as dataViewAnatomy } from './DzDataView.anatomy.ts'
import DzDataView from './DzDataView.vue'
import { anatomy as infiniteScrollAnatomy } from './DzInfiniteScroll.anatomy.ts'
import DzInfiniteScroll from './DzInfiniteScroll.vue'
import { anatomy as listItemAnatomy } from './DzListItem.anatomy.ts'
import DzListItem from './DzListItem.vue'
import { anatomy as orderListAnatomy } from './DzOrderList.anatomy.ts'
import DzOrderList from './DzOrderList.vue'
import { anatomy as tagAnatomy } from './DzTag.anatomy.ts'
import DzTag from './DzTag.vue'
import { anatomy as treeAnatomy } from './DzTree.anatomy.ts'
import DzTree from './DzTree.vue'
import { anatomy as treeItemAnatomy } from './DzTreeItem.anatomy.ts'

interface Case {
  name: string
  component: Component
  anatomy: Parameters<typeof expectAnatomy>[1]
  renders: { label: string, props?: Record<string, unknown>, slots?: Record<string, string> }[]
}

const GRID_COLUMNS = [
  { field: 'name', header: 'Name', sortable: true },
  { field: 'role', header: 'Role' },
]

const GRID_ROWS = [
  { name: 'Ada', role: 'Engineer' },
  { name: 'Grace', role: 'Admiral' },
]

const TREE_ITEMS = [
  {
    key: 'root',
    label: 'Root',
    children: [
      { key: 'leaf-a', label: 'Leaf A' },
      { key: 'leaf-b', label: 'Leaf B', disabled: true },
    ],
  },
]

const CASES: Case[] = [
  {
    name: 'DzChip',
    component: DzChip,
    anatomy: chipAnatomy,
    renders: [
      { label: 'label only', slots: { default: 'Active' } },
      { label: 'closable', props: { closable: true, ariaLabel: 'Active' }, slots: { default: 'Active' } },
      { label: 'disabled and closable', props: { closable: true, disabled: true, ariaLabel: 'X' } },
    ],
  },
  {
    name: 'DzTag',
    component: DzTag,
    anatomy: tagAnatomy,
    renders: [
      { label: 'label only', slots: { default: 'Draft' } },
      { label: 'closable', props: { closable: true, ariaLabel: 'Draft' }, slots: { default: 'Draft' } },
    ],
  },
  {
    name: 'DzListItem',
    component: DzListItem,
    anatomy: listItemAnatomy,
    renders: [
      { label: 'plain', slots: { default: 'One' } },
      { label: 'active with prefix and suffix', props: { active: true }, slots: { default: 'One', prefix: '<i>a</i>', suffix: '<i>b</i>' } },
      { label: 'disabled', props: { disabled: true }, slots: { default: 'One' } },
    ],
  },
  {
    name: 'DzInfiniteScroll',
    component: DzInfiniteScroll,
    anatomy: infiniteScrollAnatomy,
    renders: [
      { label: 'idle with more to load', props: { hasMore: true }, slots: { default: '<p>Rows</p>' } },
      { label: 'loading', props: { hasMore: true, loading: true }, slots: { default: '<p>Rows</p>' } },
      { label: 'end of list', props: { hasMore: false }, slots: { default: '<p>Rows</p>' } },
      { label: 'error', props: { hasMore: true, error: true }, slots: { default: '<p>Rows</p>' } },
    ],
  },
  {
    name: 'DzOrderList',
    component: DzOrderList,
    anatomy: orderListAnatomy,
    renders: [
      { label: 'items with controls and handles', props: { modelValue: ['a', 'b', 'c'] } },
      { label: 'no controls, no handle', props: { modelValue: ['a'], showControls: false, dragHandle: false } },
      { label: 'empty', props: { modelValue: [] } },
    ],
  },
  {
    name: 'DzCalendar',
    component: DzCalendar,
    anatomy: calendarAnatomy,
    renders: [
      { label: 'month view', props: { modelValue: '2026-09-04' } },
      { label: 'week view', props: { modelValue: '2026-09-04', view: 'week' } },
      { label: 'disabled', props: { modelValue: '2026-09-04', disabled: true } },
    ],
  },
  {
    name: 'DzTree',
    component: DzTree,
    anatomy: treeAnatomy,
    renders: [
      { label: 'with nodes', props: { items: TREE_ITEMS } },
      { label: 'empty', props: { items: [] } },
      { label: 'loading', props: { items: TREE_ITEMS, loading: true } },
    ],
  },
  {
    name: 'DzDataGrid',
    component: DzDataGrid,
    anatomy: dataGridAnatomy,
    renders: [
      { label: 'rows and a sortable column', props: { data: GRID_ROWS, columns: GRID_COLUMNS, sortable: true } },
      // Unblocked by the `forms` slice: DzCheckbox declares an anatomy and is
      // therefore a boundary, so the selection column no longer leaks its
      // states into this grid's subtree (D15 / D20).
      { label: 'multiple selection — the checkbox column is its own boundary', props: { data: GRID_ROWS, columns: GRID_COLUMNS, selectable: 'multiple' } },
      { label: 'empty', props: { data: [], columns: GRID_COLUMNS } },
      { label: 'paginated', props: { data: GRID_ROWS, columns: GRID_COLUMNS, pagination: true } },
    ],
  },
  {
    name: 'DzDataView',
    component: DzDataView,
    anatomy: dataViewAnatomy,
    renders: [
      {
        label: 'list layout with a sort control',
        props: {
          items: [{ id: 1 }, { id: 2 }],
          layout: 'list',
          sortOptions: [{ field: 'id', label: 'Id' }],
        },
      },
      {
        label: 'list layout with a paginator',
        props: { items: [{ id: 1 }, { id: 2 }], layout: 'list', paginator: true, rows: 1 },
      },
    ],
  },
]

describe('data — declared anatomy matches rendered DOM (ADR-19)', () => {
  for (const testCase of CASES) {
    describe(testCase.name, () => {
      for (const render of testCase.renders) {
        it(`conforms — ${render.label}`, () => {
          expectAnatomy(
            mount(testCase.component, { props: render.props, slots: render.slots }),
            testCase.anatomy,
          )
        })
      }

      it('emits data-part="root" on its root element', () => {
        const first = testCase.renders[0]
        const wrapper = mount(testCase.component, { props: first?.props, slots: first?.slots })
        expect(wrapper.attributes('data-part')).toBe('root')
      })
    })
  }
})

describe('dzAccordion — its compound parts emit what it declares', () => {
  function mountComposed(): ReturnType<typeof mount> {
    return mount(DzAccordion, {
      props: { type: 'single', modelValue: 'one' },
      slots: {
        default: () => [
          h(DzAccordionItem, { value: 'one' }, {
            default: () => [
              h(DzAccordionTrigger, null, { default: () => 'One' }),
              h(DzAccordionContent, null, { default: () => 'First' }),
            ],
          }),
          h(DzAccordionItem, { value: 'two', disabled: true }, {
            default: () => [
              h(DzAccordionTrigger, null, { default: () => 'Two' }),
              h(DzAccordionContent, null, { default: () => 'Second' }),
            ],
          }),
        ],
      },
    })
  }

  it('renders item, trigger, indicator and content inside the declared root', () => {
    const wrapper = mountComposed()
    for (const part of ['item', 'trigger', 'indicator', 'content'])
      expect(wrapper.find(`[data-part="${part}"]`).exists(), part).toBe(true)
  })

  it('conforms to the parent declaration with every compound part present', () => {
    expectAnatomy(mountComposed(), accordionAnatomy)
  })

  it('no compound part claims `root` — the parent owns that name', () => {
    expect(mountComposed().findAll('[data-part="root"]')).toHaveLength(1)
  })
})

describe('dzTree — DzTreeItem is a boundary, and it recurses', () => {
  function mountComposed(): ReturnType<typeof mount> {
    return mount(DzTree, { props: { items: TREE_ITEMS, expandedKeys: ['root'], checkable: true } })
  }

  it('conforms to the container declaration with nodes rendered', () => {
    expectAnatomy(mountComposed(), treeAnatomy)
  })

  it('every node is its own root — the container plus three nodes', () => {
    expect(mountComposed().findAll('[data-part="root"]')).toHaveLength(4)
  })

  it('each node subtree conforms to the DzTreeItem declaration, recursion included', () => {
    const roots = mountComposed().findAll('[data-part="root"]')
    for (const node of roots.slice(1))
      expectAnatomy(node.element, treeItemAnatomy)
  })
})

describe('data — the Tier B+ slice is complete', () => {
  /** The twelve Tier B+ components in `packages/core/src/components/data/`. */
  const TIER_B_PLUS = [
    'DzAccordion',
    'DzCalendar',
    'DzChip',
    'DzDataGrid',
    'DzDataView',
    'DzInfiniteScroll',
    'DzListItem',
    'DzOrderList',
    'DzTable',
    'DzTag',
    'DzTree',
    'DzTreeItem',
  ]

  it('every Tier B+ component in the family has a declaration naming a root', async () => {
    for (const name of TIER_B_PLUS) {
      const module = await import(`./${name}.anatomy.ts`) as { anatomy: { parts: readonly string[] } }
      expect(module.anatomy.parts, name).toContain('root')
    }
  })

  it('covers every Tier B+ component that this packet declared', () => {
    const composed = ['DzAccordion', 'DzTreeItem']
    // `DzTable` declared before this packet and has its own contract spec.
    expect([...CASES.map(c => c.name), ...composed].sort())
      .toEqual(TIER_B_PLUS.filter(n => n !== 'DzTable').sort())
  })
})
