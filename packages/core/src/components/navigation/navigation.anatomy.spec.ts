/**
 * `navigation` — Tier B+ anatomy conformance (TASK-R5-O2 continuation, ADR-19).
 *
 * All twelve public components in this family are Tier B or above, so the
 * completeness claim here is the whole family rather than a slice of it.
 *
 * Three composition shapes appear together for the first time, and the family
 * is a good place to see them side by side:
 *
 * - **parent-covers** — `DzBreadcrumb`, `DzMenu`, `DzSidebar` and `DzTabs` are
 *   families whose sub-components the ownership manifest records as
 *   `compound-part`s. They emit vocabulary names, never `root`, and the parent
 *   declares all of them.
 * - **boundary-stops** — `DzStepperItem` is a `public-component`, so it declares
 *   its own anatomy, emits `data-part="root"`, and `DzStepper` stops there.
 *   `DzColorModeToggle` relies on the same rule for the controls it delegates
 *   to.
 * - **wrapper-covers-union** — `DzBackTop` renders a `DzFab` as its own root, so
 *   `DzFab`'s `root` and `icon` are inside this component's anatomy and are
 *   declared there rather than hidden.
 *
 * One check was **blocked, not skipped**, and is now **unblocked**:
 * `DzColorModeToggle`'s `switch` variant renders `DzSwitch`, which was waiting on
 * owner decision D15 (S1-D4). Until `DzSwitch` declared an anatomy it was not a
 * boundary, so its `checked` / `unchecked` values sat inside this component's
 * subtree with nothing to stop them. The owner took D15 as option (d) and the
 * `forms` slice landed `DzSwitch.anatomy.ts`, so the variant now runs the full
 * conformance check below rather than asserting only its root.
 */

import type { Component } from 'vue'
import { expectAnatomy } from '@dzup-ui/testing'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import { anatomy as anchorAnatomy } from './DzAnchor.anatomy.ts'
import DzAnchor from './DzAnchor.vue'
import { anatomy as backTopAnatomy } from './DzBackTop.anatomy.ts'
import DzBackTop from './DzBackTop.vue'
import { anatomy as breadcrumbAnatomy } from './DzBreadcrumb.anatomy.ts'
import DzBreadcrumb from './DzBreadcrumb.vue'
import DzBreadcrumbItem from './DzBreadcrumbItem.vue'
import DzBreadcrumbSeparator from './DzBreadcrumbSeparator.vue'
import { anatomy as colorModeToggleAnatomy } from './DzColorModeToggle.anatomy.ts'
import DzColorModeToggle from './DzColorModeToggle.vue'
import { anatomy as megaMenuAnatomy } from './DzMegaMenu.anatomy.ts'
import DzMegaMenu from './DzMegaMenu.vue'
import { anatomy as menuAnatomy } from './DzMenu.anatomy.ts'
import DzMenu from './DzMenu.vue'
import DzMenuItem from './DzMenuItem.vue'
import DzMenuSeparator from './DzMenuSeparator.vue'
import { anatomy as paginationAnatomy } from './DzPagination.anatomy.ts'
import DzPagination from './DzPagination.vue'
import { anatomy as segmentedAnatomy } from './DzSegmented.anatomy.ts'
import DzSegmented from './DzSegmented.vue'
import { anatomy as sidebarAnatomy } from './DzSidebar.anatomy.ts'
import DzSidebar from './DzSidebar.vue'
import DzSidebarFooter from './DzSidebarFooter.vue'
import DzSidebarHeader from './DzSidebarHeader.vue'
import DzSidebarItem from './DzSidebarItem.vue'
import DzSidebarSection from './DzSidebarSection.vue'
import { anatomy as stepperAnatomy } from './DzStepper.anatomy.ts'
import DzStepper from './DzStepper.vue'
import { anatomy as stepperItemAnatomy } from './DzStepperItem.anatomy.ts'
import DzStepperItem from './DzStepperItem.vue'
import DzTabContent from './DzTabContent.vue'
import DzTabList from './DzTabList.vue'
import { anatomy as tabsAnatomy } from './DzTabs.anatomy.ts'
import DzTabs from './DzTabs.vue'
import DzTabTrigger from './DzTabTrigger.vue'

interface Case {
  name: string
  component: Component
  anatomy: Parameters<typeof expectAnatomy>[1]
  renders: { label: string, props?: Record<string, unknown>, slots?: Record<string, string> }[]
}

const ANCHOR_ITEMS = [
  { href: '#install', label: 'Install' },
  { href: '#usage', label: 'Usage', children: [{ href: '#usage-vue', label: 'Vue' }] },
]

const MEGA_ITEMS = [
  { label: 'Docs', href: '/docs' },
  {
    label: 'Products',
    items: [
      { label: 'Analytics', items: [{ label: 'Dashboards', href: '/d', description: 'Live' }] },
    ],
  },
]

const CASES: Case[] = [
  {
    name: 'DzAnchor',
    component: DzAnchor,
    anatomy: anchorAnatomy,
    renders: [
      { label: 'flat list', props: { items: [ANCHOR_ITEMS[0]] } },
      { label: 'nested list', props: { items: ANCHOR_ITEMS } },
      { label: 'affixed', props: { items: ANCHOR_ITEMS, affix: true } },
    ],
  },
  {
    name: 'DzBackTop',
    component: DzBackTop,
    anatomy: backTopAnatomy,
    renders: [
      { label: 'default glyph', props: {} },
      { label: 'custom glyph', slots: { default: '<svg />' } },
    ],
  },
  {
    name: 'DzPagination',
    component: DzPagination,
    anatomy: paginationAnatomy,
    renders: [
      { label: 'single page', props: { total: 5, pageSize: 10 } },
      { label: 'many pages with edges', props: { total: 500, pageSize: 10, showEdges: true } },
      { label: 'disabled', props: { total: 100, pageSize: 10, disabled: true } },
    ],
  },
  {
    name: 'DzSegmented',
    component: DzSegmented,
    anatomy: segmentedAnatomy,
    renders: [
      {
        label: 'three items',
        props: {
          modelValue: 'a',
          items: [
            { value: 'a', label: 'A' },
            { value: 'b', label: 'B' },
            { value: 'c', label: 'C', disabled: true },
          ],
        },
      },
      { label: 'disabled group', props: { items: [{ value: 'a', label: 'A' }], disabled: true } },
    ],
  },
  {
    name: 'DzStepperItem',
    component: DzStepperItem,
    anatomy: stepperItemAnatomy,
    renders: [
      { label: 'bare', props: {} },
      { label: 'title and description', props: { title: 'Details', description: 'Who you are' } },
    ],
  },
  {
    name: 'DzMegaMenu',
    component: DzMegaMenu,
    anatomy: megaMenuAnatomy,
    renders: [
      { label: 'links only', props: { items: [MEGA_ITEMS[0]] } },
      { label: 'with a panel', props: { items: MEGA_ITEMS } },
    ],
  },
]

describe('navigation — declared anatomy matches rendered DOM (ADR-19)', () => {
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

describe('dzBreadcrumb — its compound parts emit what it declares', () => {
  function mountComposed(): ReturnType<typeof mount> {
    return mount(DzBreadcrumb, {
      slots: {
        default: () => [
          h(DzBreadcrumbItem, { href: '/' }, { default: () => 'Home' }),
          h(DzBreadcrumbSeparator),
          h(DzBreadcrumbItem, { current: true }, { default: () => 'Now' }),
        ],
      },
    })
  }

  it('renders list, item, item-label and separator inside the declared root', () => {
    const wrapper = mountComposed()
    for (const part of ['list', 'item', 'item-label', 'separator'])
      expect(wrapper.find(`[data-part="${part}"]`).exists(), part).toBe(true)
  })

  it('conforms to the parent declaration with every compound part present', () => {
    expectAnatomy(mountComposed(), breadcrumbAnatomy)
  })

  it('no compound part claims `root` — the parent owns that name', () => {
    expect(mountComposed().findAll('[data-part="root"]')).toHaveLength(1)
  })
})

describe('dzMenu — its compound parts emit what it declares', () => {
  function mountComposed(): ReturnType<typeof mount> {
    return mount(DzMenu, {
      slots: {
        default: () => [
          h(DzMenuItem, { href: '/', active: true }, { default: () => 'Home' }),
          h(DzMenuSeparator),
          h(DzMenuItem, { disabled: true }, { default: () => 'Soon' }),
        ],
      },
    })
  }

  it('renders item, item-label and separator inside the declared root', () => {
    const wrapper = mountComposed()
    for (const part of ['item', 'item-label', 'separator'])
      expect(wrapper.find(`[data-part="${part}"]`).exists(), part).toBe(true)
  })

  it('conforms to the parent declaration with every compound part present', () => {
    expectAnatomy(mountComposed(), menuAnatomy)
  })

  it('no compound part claims `root` — the parent owns that name', () => {
    expect(mountComposed().findAll('[data-part="root"]')).toHaveLength(1)
  })
})

describe('dzSidebar — its compound parts emit what it declares', () => {
  function mountComposed(): ReturnType<typeof mount> {
    return mount(DzSidebar, {
      slots: {
        default: () => [
          h(DzSidebarHeader, null, { default: () => 'Brand' }),
          h(DzSidebarSection, { title: 'Main' }, {
            default: () => h(DzSidebarItem, { href: '/', active: true }, {
              icon: () => h('span', 'I'),
              default: () => 'Home',
              badge: () => h('span', '3'),
            }),
          }),
          h(DzSidebarFooter, null, { default: () => 'v1' }),
        ],
      },
    })
  }

  it('renders every compound part inside the declared root', () => {
    const wrapper = mountComposed()
    const parts = ['body', 'header', 'footer', 'group', 'group-label', 'item', 'icon', 'item-label', 'suffix']
    for (const part of parts)
      expect(wrapper.find(`[data-part="${part}"]`).exists(), part).toBe(true)
  })

  /**
   * The wrapper's root node is the `Teleport` that carries the mobile scrim,
   * not the `<nav>` — DzSidebar has a fragment root. The check is handed the
   * declared root element itself, which is what a consumer would select.
   */
  it('conforms to the parent declaration with every compound part present', () => {
    expectAnatomy(mountComposed().get('[data-part="root"]').element, sidebarAnatomy)
  })

  it('no compound part claims `root` — the parent owns that name', () => {
    expect(mountComposed().findAll('[data-part="root"]')).toHaveLength(1)
  })
})

describe('dzTabs — its compound parts emit what it declares', () => {
  function mountComposed(): ReturnType<typeof mount> {
    return mount(DzTabs, {
      props: { modelValue: 'one' },
      slots: {
        default: () => [
          h(DzTabList, null, {
            default: () => [
              h(DzTabTrigger, { value: 'one', closable: true }, { default: () => 'One' }),
              h(DzTabTrigger, { value: 'two', disabled: true }, { default: () => 'Two' }),
            ],
          }),
          h(DzTabContent, { value: 'one' }, { default: () => 'First' }),
        ],
      },
    })
  }

  it('renders list, trigger, content and close inside the declared root', () => {
    const wrapper = mountComposed()
    for (const part of ['list', 'trigger', 'content', 'close'])
      expect(wrapper.find(`[data-part="${part}"]`).exists(), part).toBe(true)
  })

  it('conforms to the parent declaration with every compound part present', () => {
    expectAnatomy(mountComposed(), tabsAnatomy)
  })

  it('no compound part claims `root` — the parent owns that name', () => {
    expect(mountComposed().findAll('[data-part="root"]')).toHaveLength(1)
  })
})

describe('dzStepper — DzStepperItem is a boundary, not a compound part', () => {
  function mountComposed(): ReturnType<typeof mount> {
    return mount(DzStepper, {
      props: { modelValue: 1 },
      slots: {
        default: () => [
          h(DzStepperItem, { title: 'One' }),
          h(DzStepperItem, { title: 'Two', description: 'Second' }),
        ],
      },
    })
  }

  it('conforms to the single-part declaration on the container', () => {
    expectAnatomy(mountComposed(), stepperAnatomy)
  })

  it('each step is its own root — three in the composed tree', () => {
    expect(mountComposed().findAll('[data-part="root"]')).toHaveLength(3)
  })

  it('the step subtree conforms to the DzStepperItem declaration', () => {
    const step = mountComposed().findAll('[data-part="root"]')[1]
    expectAnatomy(step!.element, stepperItemAnatomy)
  })
})

describe('dzColorModeToggle — one part, three delegates', () => {
  it.each(['icon', 'segmented'] as const)('conforms — %s variant', (variant) => {
    expectAnatomy(mount(DzColorModeToggle, { props: { variant } }), colorModeToggleAnatomy)
  })

  it('the switch variant conforms — DzSwitch is now a boundary (D15 taken, forms landed)', () => {
    const wrapper = mount(DzColorModeToggle, { props: { variant: 'switch' } })
    expect(wrapper.attributes('data-part')).toBe('root')
    // Previously asserted only the root: DzSwitch had no declaration, so it was
    // not an anatomy boundary and its `checked`/`unchecked` leaked into this
    // subtree. It declares one now, `expectAnatomy` stops at its
    // `data-part="root"`, and this component is no longer asked to author a
    // state it does not own.
    expectAnatomy(wrapper, colorModeToggleAnatomy)
  })
})

describe('navigation — the family slice is complete', () => {
  /** Every public component in `packages/core/src/components/navigation/` — all Tier B+. */
  const TIER_B_PLUS = [
    'DzAnchor',
    'DzBackTop',
    'DzBreadcrumb',
    'DzColorModeToggle',
    'DzMegaMenu',
    'DzMenu',
    'DzPagination',
    'DzSegmented',
    'DzSidebar',
    'DzStepper',
    'DzStepperItem',
    'DzTabs',
  ]

  it('every Tier B+ component in the family has a declaration naming a root', async () => {
    for (const name of TIER_B_PLUS) {
      const module = await import(`./${name}.anatomy.ts`) as { anatomy: { parts: readonly string[] } }
      expect(module.anatomy.parts, name).toContain('root')
    }
  })

  it('covers every Tier B+ component, bare or composed', () => {
    const composed = ['DzBreadcrumb', 'DzColorModeToggle', 'DzMenu', 'DzSidebar', 'DzStepper', 'DzTabs']
    expect([...CASES.map(c => c.name), ...composed].sort()).toEqual([...TIER_B_PLUS].sort())
  })
})
