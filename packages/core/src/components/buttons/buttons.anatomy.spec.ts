/**
 * `buttons` — family-level anatomy conformance (TASK-N2-S1, ADR-19).
 *
 * Same shape and the same reason as `inputs.anatomy.spec.ts`: source-level gates
 * cannot see a part behind a `v-if`, so the declarations are asserted against
 * rendered DOM, and the family-completeness block is what keeps the docs site's
 * "this family is fully restyleable" claim true when a tenth component arrives.
 *
 * The compound parts get their own block. `DzSplitButtonAction` and
 * `DzSplitButtonMenu` emit `action` and `trigger`, which are declared by
 * `DzSplitButton` — the composing component — so they are only conformant when
 * checked *inside* it, which is exactly how a consumer meets them.
 */

import type { Component } from 'vue'
import { expectAnatomy } from '@dzup-ui/testing'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import { anatomy as buttonAnatomy } from './DzButton.anatomy.ts'
import DzButton from './DzButton.vue'
import { anatomy as buttonGroupAnatomy } from './DzButtonGroup.anatomy.ts'
import DzButtonGroup from './DzButtonGroup.vue'
import { anatomy as copyButtonAnatomy } from './DzCopyButton.anatomy.ts'
import DzCopyButton from './DzCopyButton.vue'
import { anatomy as fabAnatomy } from './DzFab.anatomy.ts'
import DzFab from './DzFab.vue'
import { anatomy as iconButtonAnatomy } from './DzIconButton.anatomy.ts'
import DzIconButton from './DzIconButton.vue'
import { anatomy as speedDialAnatomy } from './DzSpeedDial.anatomy.ts'
import DzSpeedDial from './DzSpeedDial.vue'
import { anatomy as splitButtonAnatomy } from './DzSplitButton.anatomy.ts'
import DzSplitButton from './DzSplitButton.vue'
import DzSplitButtonAction from './DzSplitButtonAction.vue'
import DzSplitButtonMenu from './DzSplitButtonMenu.vue'
import { anatomy as toggleButtonAnatomy } from './DzToggleButton.anatomy.ts'
import DzToggleButton from './DzToggleButton.vue'

/** A minimal stand-in for a consumer's icon component. */
const StubIcon = defineComponent({
  name: 'StubIcon',
  setup: () => () => h('svg', { viewBox: '0 0 24 24' }),
})

interface Case {
  name: string
  component: Component
  anatomy: Parameters<typeof expectAnatomy>[1]
  renders: { label: string, props?: Record<string, unknown>, slots?: Record<string, string> }[]
}

const CASES: Case[] = [
  {
    name: 'DzButton',
    component: DzButton,
    anatomy: buttonAnatomy,
    renders: [
      { label: 'default', slots: { default: 'Save' } },
      { label: 'loading', props: { loading: true }, slots: { default: 'Save' } },
      { label: 'disabled', props: { disabled: true }, slots: { default: 'Save' } },
    ],
  },
  {
    name: 'DzButtonGroup',
    component: DzButtonGroup,
    anatomy: buttonGroupAnatomy,
    renders: [
      { label: 'default', slots: { default: '<button>A</button>' } },
      { label: 'disabled', props: { disabled: true }, slots: { default: '<button>A</button>' } },
      {
        label: 'vertical',
        props: { orientation: 'vertical' },
        slots: { default: '<button>A</button>' },
      },
    ],
  },
  {
    name: 'DzCopyButton',
    component: DzCopyButton,
    anatomy: copyButtonAnatomy,
    renders: [
      { label: 'default', props: { value: 'npm i' } },
      { label: 'disabled', props: { value: 'npm i', disabled: true } },
      { label: 'with a label', props: { value: 'npm i', label: 'Copy' } },
    ],
  },
  {
    name: 'DzFab',
    component: DzFab,
    anatomy: fabAnatomy,
    renders: [
      { label: 'default', props: { ariaLabel: 'Add', icon: StubIcon } },
      { label: 'loading', props: { ariaLabel: 'Add', loading: true } },
      { label: 'disabled', props: { ariaLabel: 'Add', icon: StubIcon, disabled: true } },
      { label: 'fixed to a corner', props: { ariaLabel: 'Add', icon: StubIcon, position: 'bottom-right' } },
    ],
  },
  {
    name: 'DzIconButton',
    component: DzIconButton,
    anatomy: iconButtonAnatomy,
    renders: [
      { label: 'default', props: { icon: StubIcon, ariaLabel: 'Close' } },
      { label: 'loading', props: { icon: StubIcon, ariaLabel: 'Close', loading: true } },
      { label: 'disabled', props: { icon: StubIcon, ariaLabel: 'Close', disabled: true } },
    ],
  },
  {
    name: 'DzSpeedDial',
    component: DzSpeedDial,
    anatomy: speedDialAnatomy,
    renders: [
      { label: 'no actions', props: { ariaLabel: 'Actions', items: [] } },
      {
        label: 'three actions',
        props: {
          ariaLabel: 'Actions',
          items: [
            { key: 'a', label: 'Edit', icon: StubIcon },
            { key: 'b', label: 'Share', icon: StubIcon },
            { key: 'c', label: 'Delete', icon: StubIcon },
          ],
        },
      },
    ],
  },
  {
    name: 'DzSplitButton',
    component: DzSplitButton,
    anatomy: splitButtonAnatomy,
    renders: [
      { label: 'empty shell' },
      { label: 'disabled', props: { disabled: true } },
    ],
  },
  {
    name: 'DzToggleButton',
    component: DzToggleButton,
    anatomy: toggleButtonAnatomy,
    renders: [
      { label: 'default', slots: { default: 'Bold' } },
      { label: 'pressed', props: { modelValue: true }, slots: { default: 'Bold' } },
      { label: 'disabled', props: { disabled: true }, slots: { default: 'Bold' } },
    ],
  },
]

describe('buttons — declared anatomy matches rendered DOM (ADR-19)', () => {
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

describe('dzSplitButton — its compound parts emit what it declares', () => {
  function mountComposed(): ReturnType<typeof mount> {
    return mount(DzSplitButton, {
      slots: {
        default: () => [
          h(DzSplitButtonAction, null, { default: () => 'Save' }),
          h(DzSplitButtonMenu, { ariaLabel: 'More' }),
        ],
      },
    })
  }

  it('renders `action` and `trigger` inside the declared root', () => {
    const wrapper = mountComposed()
    expect(wrapper.find('[data-part="action"]').exists()).toBe(true)
    expect(wrapper.find('[data-part="trigger"]').exists()).toBe(true)
  })

  it('conforms to DzSplitButton\'s anatomy with both parts present', () => {
    expectAnatomy(mountComposed(), splitButtonAnatomy)
  })
})

describe('buttons — the family slice is complete', () => {
  /** The eight public components in `packages/core/src/components/buttons/`. */
  const PUBLIC_COMPONENTS = [
    'DzButton',
    'DzButtonGroup',
    'DzCopyButton',
    'DzFab',
    'DzIconButton',
    'DzSpeedDial',
    'DzSplitButton',
    'DzToggleButton',
  ]

  it('covers every public component in the family', () => {
    expect(CASES.map(c => c.name).sort()).toEqual([...PUBLIC_COMPONENTS].sort())
  })

  it('every declaration names a root part', () => {
    for (const testCase of CASES)
      expect(testCase.anatomy.parts, testCase.name).toContain('root')
  })
})
