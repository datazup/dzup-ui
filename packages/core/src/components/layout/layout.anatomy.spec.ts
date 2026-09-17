/**
 * `layout` — Tier B+ anatomy conformance (TASK-R5-O2, ADR-19).
 *
 * The family ADR-19's opening argument names: `core.css` already selects on
 * `.dz-panel[data-size=lg]` and `.dz-toolbar[data-variant=elevated]`, so those
 * recipe attributes were public and undeclared from before the ADR was written.
 *
 * The completeness claim is scoped to **Tier B and above** — 12 of the family's
 * 18 public components are Tier A and TASK-R5-O2's scope excludes them.
 */

import type { Component } from 'vue'
import { expectAnatomy } from '@dzup-ui/testing'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import { anatomy as collapseAnatomy } from './DzCollapse.anatomy.ts'
import DzCollapse from './DzCollapse.vue'
import { anatomy as panelAnatomy } from './DzPanel.anatomy.ts'
import DzPanel from './DzPanel.vue'
import { anatomy as resizableAnatomy } from './DzResizable.anatomy.ts'
import DzResizable from './DzResizable.vue'
import DzResizableHandle from './DzResizableHandle.vue'
import DzResizablePanel from './DzResizablePanel.vue'
import { anatomy as scrollAreaAnatomy } from './DzScrollArea.anatomy.ts'
import DzScrollArea from './DzScrollArea.vue'
import { anatomy as splitterAnatomy } from './DzSplitter.anatomy.ts'
import DzSplitter from './DzSplitter.vue'
import DzSplitterHandle from './DzSplitterHandle.vue'
import DzSplitterPanel from './DzSplitterPanel.vue'
import { anatomy as toolbarAnatomy } from './DzToolbar.anatomy.ts'
import DzToolbar from './DzToolbar.vue'

interface Case {
  name: string
  component: Component
  anatomy: Parameters<typeof expectAnatomy>[1]
  renders: { label: string, props?: Record<string, unknown>, slots?: Record<string, string> }[]
}

const CASES: Case[] = [
  {
    name: 'DzCollapse',
    component: DzCollapse,
    anatomy: collapseAnatomy,
    renders: [
      { label: 'closed', slots: { default: 'Hidden' } },
      { label: 'open', props: { modelValue: true }, slots: { default: 'Shown' } },
    ],
  },
  {
    name: 'DzPanel',
    component: DzPanel,
    anatomy: panelAnatomy,
    renders: [
      { label: 'static', props: { header: 'Settings' }, slots: { default: 'Body' } },
      {
        label: 'collapsible, with actions',
        props: { header: 'Settings', collapsible: true },
        slots: { default: 'Body', actions: '<button>Reset</button>' },
      },
    ],
  },
  {
    name: 'DzScrollArea',
    component: DzScrollArea,
    anatomy: scrollAreaAnatomy,
    renders: [
      { label: 'vertical', slots: { default: 'Content' } },
      { label: 'both axes', props: { orientation: 'both' }, slots: { default: 'Content' } },
    ],
  },
  {
    name: 'DzToolbar',
    component: DzToolbar,
    anatomy: toolbarAnatomy,
    renders: [
      { label: 'start only', slots: { default: '<button>A</button>' } },
      {
        label: 'all three regions',
        props: { variant: 'elevated', size: 'lg' },
        slots: { start: '<button>A</button>', center: '<span>C</span>', end: '<button>E</button>' },
      },
    ],
  },
]

describe('layout — declared anatomy matches rendered DOM (ADR-19)', () => {
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

/**
 * The two splitter aliases, composed. Their panels and handles are
 * `compound-part`s of the group, they emit `panel` / `separator` / `indicator`
 * and never `root`, so a composed splitter conforms to the group's single
 * declaration — the parent-covers rule this packet writes down (N2-S1 S1-F3).
 */
describe.each([
  ['DzSplitter', DzSplitter, DzSplitterPanel, DzSplitterHandle, splitterAnatomy] as const,
  ['DzResizable', DzResizable, DzResizablePanel, DzResizableHandle, resizableAnatomy] as const,
])('%s — its compound parts emit what it declares', (name, Group, Panel, Handle, anatomy) => {
  function mountComposed(): ReturnType<typeof mount> {
    return mount(Group, {
      props: { ariaLabel: name },
      slots: {
        default: () => [
          h(Panel, { defaultSize: 50 }, { default: () => 'A' }),
          h(Handle, { withHandle: true }),
          h(Panel, { defaultSize: 50 }, { default: () => 'B' }),
        ],
      },
    })
  }

  it('renders panel, separator and indicator inside the declared root', () => {
    const wrapper = mountComposed()
    for (const part of ['panel', 'separator', 'indicator'])
      expect(wrapper.find(`[data-part="${part}"]`).exists(), part).toBe(true)
  })

  it('conforms to the group\'s anatomy with every compound part present', () => {
    expectAnatomy(mountComposed(), anatomy)
  })

  it('no compound part claims `root` — the parent owns that name', () => {
    expect(mountComposed().findAll('[data-part="root"]')).toHaveLength(1)
  })
})

describe('layout — the Tier B+ slice is complete', () => {
  /** The six Tier B components in `packages/core/src/components/layout/`. */
  const TIER_B_PLUS = [
    'DzCollapse',
    'DzPanel',
    'DzResizable',
    'DzScrollArea',
    'DzSplitter',
    'DzToolbar',
  ]

  it('every Tier B+ component in the family has a declaration', async () => {
    for (const name of TIER_B_PLUS) {
      const module = await import(`./${name}.anatomy.ts`) as { anatomy: { parts: readonly string[] } }
      expect(module.anatomy.parts, name).toContain('root')
    }
  })

  it('covers every Tier B+ component that is mounted bare here', () => {
    expect([...CASES.map(c => c.name), 'DzSplitter', 'DzResizable'].sort())
      .toEqual([...TIER_B_PLUS].sort())
  })
})
