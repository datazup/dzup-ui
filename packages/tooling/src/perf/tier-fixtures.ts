/**
 * A mountable fixture per Tier C/D component (TASK-R2-O7).
 *
 * The leak, long-task and memory lanes all need the same thing: every Tier C
 * component, mounted with data realistic enough that the parts which allocate
 * actually allocate. `perf-bench.spec.ts` hand-writes seven such mounts inline,
 * which is right for seven and wrong for twenty-two — three lanes would restate
 * the same twenty-two prop objects and drift apart by the second edit.
 *
 * So the fixtures live here once and the lanes import them. Each entry is
 * deliberately *small but non-trivial*: a tree with children rather than one
 * node, a transfer with both lists populated, a mega-menu with a panel. A
 * fixture that renders an empty shell would make every lane report zero and
 * prove nothing — the empty control is three elements, as the existing
 * `DzFileUpload` benchmark comment already says.
 *
 * **The completeness gate is a spec, not a comment.** `tier-fixtures.spec.ts`
 * reads the Tier C and D rows out of `quality-matrix.json` and fails when one
 * has no fixture here. A component promoted to Tier C therefore acquires a leak
 * obligation on the day it is promoted, instead of on the day somebody
 * remembers — which is the tier rule doc 06 states and the capability matrix
 * already enforces for every other Tier C cell.
 *
 * @module @dzup-ui/tooling/perf/tier-fixtures
 */

import type { RiskTier } from '@dzup-ui/contracts'
import type { Component } from 'vue'
import { h } from 'vue'

/** How a lane mounts one component. */
export interface TierFixture {
  readonly component: string
  readonly tier: RiskTier
  /** The family barrel this component is published from. */
  readonly family: 'data' | 'forms' | 'navigation' | 'overlays'
  /** Resolve the component itself. Dynamic so a lane pays only for what it runs. */
  readonly load: () => Promise<Component>
  /** Fresh props per mount — shared mutable data across 50 cycles is its own bug. */
  readonly props: () => Record<string, unknown>
  /** Slots, where the component renders nothing useful without them. */
  readonly slots?: () => Record<string, unknown>
  /**
   * Whether the fixture opens an overlay.
   *
   * The leak lane reports `portal-nodes` and these are the components that can
   * legitimately put one in `document.body`; recorded so a reader can tell an
   * expected portal from an escaped one without reading the props.
   */
  readonly portals?: boolean
}

// ---------------------------------------------------------------------------
// Shared data generators
// ---------------------------------------------------------------------------

function options(count: number): Array<{ label: string, value: string }> {
  return Array.from({ length: count }, (_, i) => ({
    label: `Option ${i + 1}`,
    value: `option-${i + 1}`,
  }))
}

function keyedItems(count: number): Array<{ key: string, label: string }> {
  return Array.from({ length: count }, (_, i) => ({
    key: `item-${i + 1}`,
    label: `Item ${i + 1}`,
  }))
}

function treeNodes(roots: number, children: number): Array<{
  key: string
  label: string
  children: Array<{ key: string, label: string }>
}> {
  return Array.from({ length: roots }, (_, i) => ({
    key: `node-${i + 1}`,
    label: `Node ${i + 1}`,
    children: Array.from({ length: children }, (_, j) => ({
      key: `node-${i + 1}-${j + 1}`,
      label: `Child ${i + 1}.${j + 1}`,
    })),
  }))
}

function rows(count: number): Array<Record<string, string | number>> {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    role: i % 2 === 0 ? 'Admin' : 'Editor',
  }))
}

const GRID_COLUMNS = [
  { field: 'id', header: 'ID', sortable: true, width: 80 },
  { field: 'name', header: 'Name', sortable: true },
  { field: 'email', header: 'Email', sortable: true },
  { field: 'role', header: 'Role', sortable: true },
]

// ---------------------------------------------------------------------------
// The fixtures
// ---------------------------------------------------------------------------

/**
 * Twenty-one Tier C components plus the catalogue's one Tier D component,
 * alphabetical, matching `quality-matrix.json`.
 */
export const TIER_FIXTURES: readonly TierFixture[] = [
  {
    component: 'DzCalendar',
    tier: 'C',
    family: 'data',
    load: async () => (await import('@dzup-ui/core/data')).DzCalendar as Component,
    props: () => ({ value: '2026-09-18', locale: 'en-US' }),
  },
  {
    component: 'DzCascader',
    tier: 'C',
    family: 'forms',
    load: async () => (await import('@dzup-ui/core/forms')).DzCascader as Component,
    props: () => ({
      options: Array.from({ length: 6 }, (_, i) => ({
        label: `Region ${i + 1}`,
        value: `region-${i + 1}`,
        children: Array.from({ length: 4 }, (_, j) => ({
          label: `City ${i + 1}.${j + 1}`,
          value: `city-${i + 1}-${j + 1}`,
        })),
      })),
      placeholder: 'Pick a city',
    }),
    portals: true,
  },
  {
    component: 'DzColorPicker',
    tier: 'C',
    family: 'forms',
    load: async () => (await import('@dzup-ui/core/forms')).DzColorPicker as Component,
    // The two lines below are the one place in this file where a raw colour
    // value is the *subject* rather than a style choice: `modelValue` and
    // `presets` are what DzColorPicker parses, and `var(--dz-primary)` is not a
    // colour a picker can seed a hue wheel from — it is a string the component
    // would reject, which would mount an empty shell and make this fixture
    // measure nothing. `color-lint.ts` names exactly this case ("a picker, its
    // fixtures") and offers two markers for it; `token-check-disable-line` is
    // the narrower one, so the other twenty-one fixtures below stay armed —
    // `token-check-allow-raw-values` is file-scoped and would silently license
    // a hex literal in a future DzTree fixture that has no claim to one.
    props: () => ({
      modelValue: '#3366ff', // token-check-disable-line — picker input value, not styling (ADR-04 §exemptions)
      showInput: true,
      presets: ['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff'], // token-check-disable-line — picker swatch values, not styling
    }),
    portals: true,
  },
  {
    component: 'DzCombobox',
    tier: 'C',
    family: 'forms',
    load: async () => (await import('@dzup-ui/core/forms')).DzCombobox as Component,
    props: () => ({ items: options(30), placeholder: 'Search' }),
    portals: true,
  },
  {
    component: 'DzCommandPalette',
    tier: 'C',
    family: 'overlays',
    load: async () => (await import('@dzup-ui/core/overlays')).DzCommandPalette as Component,
    // `open: true` on purpose: a closed palette renders a teleport with nothing
    // in it, and the list is the part that allocates.
    props: () => ({
      open: true,
      items: Array.from({ length: 25 }, (_, i) => ({
        id: `command-${i + 1}`,
        label: `Command ${i + 1}`,
      })),
    }),
    portals: true,
  },
  {
    component: 'DzDataGrid',
    tier: 'C',
    family: 'data',
    load: async () => (await import('@dzup-ui/core/data')).DzDataGrid as Component,
    props: () => ({ data: rows(50), columns: GRID_COLUMNS, sortable: true, size: 'md' }),
  },
  {
    component: 'DzDataView',
    tier: 'C',
    family: 'data',
    load: async () => (await import('@dzup-ui/core/data')).DzDataView as Component,
    props: () => ({ items: rows(24), dataKey: 'id', rows: 12, paginator: true }),
    slots: () => ({
      item: (scope: { item?: { name?: string } }) => h('div', scope?.item?.name ?? ''),
    }),
  },
  {
    component: 'DzDatePicker',
    tier: 'C',
    family: 'forms',
    load: async () => (await import('@dzup-ui/core/forms')).DzDatePicker as Component,
    props: () => ({ modelValue: '2026-09-18', locale: 'en-US' }),
    portals: true,
  },
  {
    component: 'DzDateRangePicker',
    tier: 'C',
    family: 'forms',
    load: async () => (await import('@dzup-ui/core/forms')).DzDateRangePicker as Component,
    props: () => ({ modelValue: { start: '2026-09-01', end: '2026-09-18' }, locale: 'en-US' }),
    portals: true,
  },
  {
    component: 'DzFileUpload',
    tier: 'D',
    family: 'forms',
    load: async () => (await import('@dzup-ui/core/forms')).DzFileUpload as Component,
    props: () => ({
      modelValue: Array.from(
        { length: 20 },
        (_, i) => new File([new Uint8Array(16)], `document-${i}.pdf`, { type: 'application/pdf' }),
      ),
      multiple: true,
      accept: '.pdf',
    }),
  },
  {
    component: 'DzMegaMenu',
    tier: 'C',
    family: 'navigation',
    load: async () => (await import('@dzup-ui/core/navigation')).DzMegaMenu as Component,
    props: () => ({
      items: Array.from({ length: 4 }, (_, i) => ({
        label: `Section ${i + 1}`,
        key: `section-${i + 1}`,
        items: [{
          label: `Group ${i + 1}`,
          items: Array.from({ length: 5 }, (_, j) => ({
            label: `Link ${i + 1}.${j + 1}`,
            href: `#link-${i + 1}-${j + 1}`,
          })),
        }],
      })),
    }),
    portals: true,
  },
  {
    component: 'DzMention',
    tier: 'C',
    family: 'forms',
    load: async () => (await import('@dzup-ui/core/forms')).DzMention as Component,
    props: () => ({
      triggers: [{
        char: '@',
        options: Array.from({ length: 20 }, (_, i) => ({
          value: `user-${i + 1}`,
          label: `User ${i + 1}`,
        })),
      }],
      modelValue: 'Hello ',
    }),
    portals: true,
  },
  {
    component: 'DzMultiSelect',
    tier: 'C',
    family: 'forms',
    load: async () => (await import('@dzup-ui/core/forms')).DzMultiSelect as Component,
    props: () => ({ items: options(30), modelValue: ['option-1', 'option-2'] }),
    portals: true,
  },
  {
    component: 'DzOrderList',
    tier: 'C',
    family: 'data',
    load: async () => (await import('@dzup-ui/core/data')).DzOrderList as Component,
    props: () => ({ value: keyedItems(15), dataKey: 'key', selectable: true }),
    slots: () => ({
      item: (scope: { item?: { label?: string } }) => h('span', scope?.item?.label ?? ''),
    }),
  },
  {
    component: 'DzPersonaSelector',
    tier: 'C',
    family: 'forms',
    load: async () => (await import('@dzup-ui/core/forms')).DzPersonaSelector as Component,
    props: () => ({
      personas: Array.from({ length: 12 }, (_, i) => ({
        id: `persona-${i + 1}`,
        name: `Persona ${i + 1}`,
        role: i % 2 === 0 ? 'Analyst' : 'Engineer',
      })),
    }),
    portals: true,
  },
  {
    component: 'DzSidebar',
    tier: 'C',
    family: 'navigation',
    load: async () => (await import('@dzup-ui/core/navigation')).DzSidebar as Component,
    // No `storageKey`: persistence would write to `localStorage` on every one of
    // fifty cycles, and the lane would be measuring the storage shim.
    props: () => ({ width: '16rem', collapsedWidth: '4rem' }),
    slots: () => ({
      default: () => Array.from({ length: 10 }, (_, i) => h('a', { href: `#nav-${i}` }, `Nav ${i + 1}`)),
    }),
  },
  {
    component: 'DzTable',
    tier: 'C',
    family: 'data',
    load: async () => (await import('@dzup-ui/core/data')).DzTable as Component,
    props: () => ({}),
    slots: () => ({ default: () => h('tbody', rows(30).map(row => h('tr', [h('td', String(row.name))]))) }),
  },
  {
    component: 'DzTimePicker',
    tier: 'C',
    family: 'forms',
    load: async () => (await import('@dzup-ui/core/forms')).DzTimePicker as Component,
    props: () => ({ modelValue: '14:30', seconds: true }),
    portals: true,
  },
  {
    component: 'DzTour',
    tier: 'C',
    family: 'overlays',
    load: async () => (await import('@dzup-ui/core/overlays')).DzTour as Component,
    // `scrollIntoView: false`: jsdom's stub is a no-op, so leaving it on would
    // measure a call that does nothing while reading as coverage.
    props: () => ({
      open: true,
      current: 0,
      scrollIntoView: false,
      steps: Array.from({ length: 5 }, (_, i) => ({
        target: 'body',
        title: `Step ${i + 1}`,
        description: `Description for step ${i + 1}`,
      })),
    }),
    portals: true,
  },
  {
    component: 'DzTransfer',
    tier: 'C',
    family: 'forms',
    load: async () => (await import('@dzup-ui/core/forms')).DzTransfer as Component,
    props: () => ({
      source: keyedItems(20),
      modelValue: ['item-1', 'item-2', 'item-3'],
      searchable: true,
    }),
  },
  {
    component: 'DzTree',
    tier: 'C',
    family: 'data',
    load: async () => (await import('@dzup-ui/core/data')).DzTree as Component,
    props: () => ({
      items: treeNodes(6, 4),
      expandedKeys: ['node-1', 'node-2'],
      selectable: true,
      checkable: true,
    }),
  },
  {
    component: 'DzTreeSelect',
    tier: 'C',
    family: 'forms',
    load: async () => (await import('@dzup-ui/core/forms')).DzTreeSelect as Component,
    props: () => ({ nodes: treeNodes(6, 4), placeholder: 'Pick a node' }),
    portals: true,
  },
]

/** Fixture lookup by component name. */
export function fixtureFor(component: string): TierFixture | undefined {
  return TIER_FIXTURES.find(fixture => fixture.component === component)
}

/**
 * Mount-point options for a lane that counts what is left in the document.
 *
 * **`attachTo: document.body` cannot be used by the leak lane**, and the first
 * run of that lane is the evidence: `@vue/test-utils` creates a parent `<div>`
 * for the `attachTo` target and `unmount()` does not remove it, so every one of
 * the twenty-two components — and the *deliberately clean* control component —
 * reported one extra body child and one extra document node per cycle. The lane
 * would have opened by filing twenty-two leak defects against the test harness.
 *
 * A container this code owns, removed after the unmount, makes
 * `document.body.childNodes` mean what the lane says it means: a node still
 * there afterwards escaped the component, not the runner.
 *
 * A real element rather than `undefined` because the components under test are
 * the ones with focus traps, portals and `document.activeElement` logic, and a
 * detached mount changes their behaviour.
 */
export async function withOwnedContainer<T>(
  use: (container: HTMLElement) => T | Promise<T>,
): Promise<T> {
  const container = document.createElement('div')
  container.setAttribute('data-perf-lane-host', '')
  document.body.append(container)
  try {
    // `await`, not `return use(...)`: a `finally` that fires on the *returned
    // promise* rather than on its settlement would remove the container while
    // the component is still mounting, and every count after it would be taken
    // against a detached tree.
    return await use(container)
  }
  finally {
    container.remove()
  }
}
