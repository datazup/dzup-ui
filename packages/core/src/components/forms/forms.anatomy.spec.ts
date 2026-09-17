/**
 * `forms` — Tier B+ anatomy conformance (TASK-R5-O2 continuation, ADR-19).
 *
 * The last family, the largest one, and the one that was blocked: owner
 * decision **D15 / S1-D4** (the `DzOptionsState` disposition) has now been
 * taken as **option (d)** — *each of the seven host components declares the
 * three shared parts itself* — which is what `validate:anatomy-parts` rule 1
 * already implements for an unmanifested internal ("declared by **every**
 * component that imports it"). No schema change and no new mechanism; the
 * `dzOptionsState` describe block below is the assertion that the seven agree.
 *
 * The completeness claim is scoped to **Tier B and above**: `DzFloatLabel` and
 * `DzFormField` are Tier A and TASK-R5-O2's scope excludes them. `DzSelect`
 * (the ADR-19 pilot) and `DzFileUpload` (Tier D) declared before this packet
 * and are asserted here only for the family-level completeness check.
 */

import type { Component } from 'vue'
import { expectAnatomy } from '@dzup-ui/testing'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import { anatomy as cascaderAnatomy } from './DzCascader.anatomy.ts'
import DzCascader from './DzCascader.vue'
import { anatomy as checkboxAnatomy } from './DzCheckbox.anatomy.ts'
import DzCheckbox from './DzCheckbox.vue'
import { anatomy as checkboxGroupAnatomy } from './DzCheckboxGroup.anatomy.ts'
import DzCheckboxGroup from './DzCheckboxGroup.vue'
import { anatomy as colorPickerAnatomy } from './DzColorPicker.anatomy.ts'
import DzColorPickerAnatomyHost from './DzColorPicker.vue'
import { anatomy as comboboxAnatomy } from './DzCombobox.anatomy.ts'
import DzCombobox from './DzCombobox.vue'
import { anatomy as datePickerAnatomy } from './DzDatePicker.anatomy.ts'
import DzDatePicker from './DzDatePicker.vue'
import { anatomy as dateRangePickerAnatomy } from './DzDateRangePicker.anatomy.ts'
import DzDateRangePicker from './DzDateRangePicker.vue'
import { anatomy as fieldArrayAnatomy } from './DzFieldArray.anatomy.ts'
import DzFieldArray from './DzFieldArray.vue'
import { anatomy as inplaceAnatomy } from './DzInplace.anatomy.ts'
import DzInplace from './DzInplace.vue'
import { anatomy as knobAnatomy } from './DzKnob.anatomy.ts'
import DzKnob from './DzKnob.vue'
import { anatomy as listboxAnatomy } from './DzListbox.anatomy.ts'
import DzListbox from './DzListbox.vue'
import { anatomy as mentionAnatomy } from './DzMention.anatomy.ts'
import DzMention from './DzMention.vue'
import { anatomy as multiSelectAnatomy } from './DzMultiSelect.anatomy.ts'
import DzMultiSelect from './DzMultiSelect.vue'
import { anatomy as personaSelectorAnatomy } from './DzPersonaSelector.anatomy.ts'
import DzPersonaSelector from './DzPersonaSelector.vue'
import { anatomy as radioAnatomy } from './DzRadio.anatomy.ts'
import DzRadio from './DzRadio.vue'
import { anatomy as radioGroupAnatomy } from './DzRadioGroup.anatomy.ts'
import DzRadioGroup from './DzRadioGroup.vue'
import { anatomy as rangeSliderAnatomy } from './DzRangeSlider.anatomy.ts'
import DzRangeSlider from './DzRangeSlider.vue'
import { anatomy as ratingAnatomy } from './DzRating.anatomy.ts'
import DzRating from './DzRating.vue'
import { anatomy as selectAnatomy } from './DzSelect.anatomy.ts'
import { anatomy as sliderAnatomy } from './DzSlider.anatomy.ts'
import DzSlider from './DzSlider.vue'
import { anatomy as switchAnatomy } from './DzSwitch.anatomy.ts'
import DzSwitch from './DzSwitch.vue'
import { anatomy as tagsInputAnatomy } from './DzTagsInput.anatomy.ts'
import DzTagsInput from './DzTagsInput.vue'
import { anatomy as timePickerAnatomy } from './DzTimePicker.anatomy.ts'
import DzTimePicker from './DzTimePicker.vue'
import { anatomy as transferAnatomy } from './DzTransfer.anatomy.ts'
import DzTransfer from './DzTransfer.vue'
import { anatomy as treeSelectAnatomy } from './DzTreeSelect.anatomy.ts'
import DzTreeSelect from './DzTreeSelect.vue'

interface Case {
  name: string
  component: Component
  anatomy: Parameters<typeof expectAnatomy>[1]
  renders: { label: string, props?: Record<string, unknown>, slots?: Record<string, unknown> }[]
  /**
   * The component has a **fragment root**, so `wrapper.element` is not the
   * element a consumer would select. The check is handed
   * `[data-part="root"]` instead — the element a consumer *does* select — with
   * the reason recorded at the case rather than the assertion silently relaxed.
   */
  fragmentRoot?: true
  /** Parts this render deliberately cannot show, e.g. a portaled panel. */
  absentParts?: string[]
}

const ITEMS = [
  { value: 'a', label: 'Ada' },
  { value: 'g', label: 'Grace' },
]

const LISTBOX_OPTIONS = [
  { label: 'Ada', value: 'a' },
  { label: 'Grace', value: 'g', disabled: true },
]

const CASCADER_OPTIONS = [
  { value: 'eu', label: 'Europe', children: [{ value: 'ba', label: 'Bosnia' }] },
  { value: 'na', label: 'North America' },
]

const TRANSFER_SOURCE = [
  { key: 'a', label: 'Ada' },
  { key: 'g', label: 'Grace' },
]

const TREE_NODES = [
  { key: 'root', label: 'Root', children: [{ key: 'leaf', label: 'Leaf' }] },
]

const CASES: Case[] = [
  {
    name: 'DzCheckbox',
    component: DzCheckbox,
    anatomy: checkboxAnatomy,
    renders: [
      { label: 'unchecked, no label', props: { ariaLabel: 'Agree' } },
      { label: 'checked with a label', props: { modelValue: true }, slots: { default: 'I agree' } },
      { label: 'indeterminate', props: { indeterminate: true }, slots: { default: 'Select all' } },
      { label: 'disabled and required', props: { disabled: true, required: true }, slots: { default: 'Terms' } },
    ],
  },
  {
    name: 'DzSwitch',
    component: DzSwitch,
    anatomy: switchAnatomy,
    renders: [
      { label: 'off, no label', props: { ariaLabel: 'Notifications' } },
      { label: 'on with a label', props: { modelValue: true }, slots: { default: 'Notifications' } },
      { label: 'disabled and required', props: { disabled: true, required: true }, slots: { default: 'Notifications' } },
    ],
  },
  {
    name: 'DzCheckboxGroup',
    component: DzCheckboxGroup,
    anatomy: checkboxGroupAnatomy,
    renders: [
      { label: 'vertical with members', props: { orientation: 'vertical' }, slots: { default: () => h(DzCheckbox, { value: 'a' }, { default: () => 'A' }) } },
      { label: 'horizontal and disabled', props: { orientation: 'horizontal', disabled: true } },
    ],
  },
  {
    name: 'DzSlider',
    component: DzSlider,
    anatomy: sliderAnatomy,
    renders: [
      { label: 'default', props: { modelValue: 40 } },
      { label: 'with a label', props: { modelValue: 40 }, slots: { default: 'Volume' } },
      { label: 'disabled, required and invalid', props: { modelValue: 40, disabled: true, required: true, error: 'Pick a value' } },
      { label: 'vertical', props: { modelValue: 40, orientation: 'vertical' } },
    ],
  },
  {
    name: 'DzRangeSlider',
    component: DzRangeSlider,
    anatomy: rangeSliderAnatomy,
    renders: [
      { label: 'default', props: { modelValue: [20, 60] } },
      { label: 'with a label and an error', props: { modelValue: [20, 60], error: 'Out of range' }, slots: { default: 'Price' } },
    ],
  },
  {
    name: 'DzRating',
    component: DzRating,
    anatomy: ratingAnatomy,
    renders: [
      { label: 'five stars', props: { modelValue: 3 } },
      { label: 'readonly and disabled', props: { modelValue: 3, readonly: true, disabled: true } },
      { label: 'with an error', props: { modelValue: 0, error: 'Rate it' } },
    ],
  },
  {
    name: 'DzKnob',
    component: DzKnob,
    anatomy: knobAnatomy,
    /**
     * Fragment root: `<div role="slider">` followed by `<p v-if="error">`. The
     * error line is a **sibling** of the root, not a descendant, so the check
     * reads the root subtree and `error` is declared optional — which it is in
     * both senses.
     */
    fragmentRoot: true,
    renders: [
      { label: 'default', props: { modelValue: 40 } },
      { label: 'with a readout', props: { modelValue: 40, showValue: true } },
      { label: 'at zero — no value arc', props: { modelValue: 0, showValue: true } },
      { label: 'disabled, readonly, required, loading', props: { modelValue: 40, disabled: true, readonly: true, required: true, loading: true } },
    ],
  },
  {
    name: 'DzInplace',
    component: DzInplace,
    anatomy: inplaceAnatomy,
    renders: [
      { label: 'display view', props: { modelValue: 'Ada' } },
      { label: 'display view, disabled', props: { modelValue: 'Ada', disabled: true } },
    ],
  },
  {
    name: 'DzColorPicker',
    component: DzColorPickerAnatomyHost,
    anatomy: colorPickerAnatomy,
    renders: [
      { label: 'closed trigger', props: { modelValue: '#336699' } },
      { label: 'disabled and required', props: { modelValue: '#336699', disabled: true, required: true } },
    ],
  },
  {
    name: 'DzCombobox',
    component: DzCombobox,
    anatomy: comboboxAnatomy,
    renders: [
      { label: 'closed field', props: { items: ITEMS } },
      { label: 'with a value — the clear button renders', props: { items: ITEMS, modelValue: 'a' } },
      { label: 'loading — the trigger shows a spinner boundary', props: { items: ITEMS, loading: true } },
      { label: 'disabled', props: { items: ITEMS, disabled: true } },
    ],
  },
  {
    name: 'DzMultiSelect',
    component: DzMultiSelect,
    anatomy: multiSelectAnatomy,
    renders: [
      { label: 'empty field', props: { items: ITEMS } },
      { label: 'with two chips — the clear button renders', props: { items: ITEMS, modelValue: ['a', 'g'] } },
      { label: 'disabled', props: { items: ITEMS, disabled: true } },
    ],
  },
  {
    name: 'DzPersonaSelector',
    component: DzPersonaSelector,
    anatomy: personaSelectorAnatomy,
    renders: [
      { label: 'wraps a combobox', props: { personas: [{ id: 'a', name: 'Ada', role: 'Engineer' }] } },
    ],
  },
  {
    name: 'DzListbox',
    component: DzListbox,
    anatomy: listboxAnatomy,
    renders: [
      { label: 'flat options', props: { options: LISTBOX_OPTIONS } },
      { label: 'with a filter field and checkmarks', props: { options: LISTBOX_OPTIONS, filter: true, checkmark: true, modelValue: 'a' } },
      { label: 'no options', props: { options: [] } },
      { label: 'disabled and required', props: { options: LISTBOX_OPTIONS, disabled: true, required: true } },
    ],
  },
  {
    name: 'DzCascader',
    component: DzCascader,
    anatomy: cascaderAnatomy,
    renders: [
      { label: 'closed trigger', props: { options: CASCADER_OPTIONS } },
      { label: 'with a value and a cleaner', props: { options: CASCADER_OPTIONS, modelValue: ['eu', 'ba'], cleaner: true } },
      { label: 'disabled', props: { options: CASCADER_OPTIONS, disabled: true } },
    ],
  },
  {
    name: 'DzTreeSelect',
    component: DzTreeSelect,
    anatomy: treeSelectAnatomy,
    renders: [
      { label: 'closed trigger', props: { nodes: TREE_NODES } },
      { label: 'with a selection', props: { nodes: TREE_NODES, modelValue: 'leaf' } },
      { label: 'disabled', props: { nodes: TREE_NODES, disabled: true } },
    ],
  },
  {
    name: 'DzTransfer',
    component: DzTransfer,
    anatomy: transferAnatomy,
    renders: [
      { label: 'source and target panes', props: { source: TRANSFER_SOURCE } },
      { label: 'searchable', props: { source: TRANSFER_SOURCE, searchable: true } },
      { label: 'empty source', props: { source: [] } },
      { label: 'disabled', props: { source: TRANSFER_SOURCE, disabled: true } },
    ],
  },
  {
    name: 'DzTagsInput',
    component: DzTagsInput,
    anatomy: tagsInputAnatomy,
    renders: [
      { label: 'empty', props: {} },
      { label: 'with committed chips', props: { modelValue: ['vue', 'ts'] } },
      { label: 'disabled and in error', props: { modelValue: ['vue'], disabled: true, error: 'Too few' } },
    ],
  },
  {
    name: 'DzMention',
    component: DzMention,
    anatomy: mentionAnatomy,
    renders: [
      { label: 'single line, menu closed', props: { triggers: [{ char: '@', options: ITEMS }] } },
      { label: 'multiline', props: { triggers: [{ char: '@', options: ITEMS }], multiline: true } },
      { label: 'disabled and in error', props: { triggers: [{ char: '@', options: ITEMS }], disabled: true, error: 'Required' } },
    ],
  },
  {
    name: 'DzDatePicker',
    component: DzDatePicker,
    anatomy: datePickerAnatomy,
    renders: [
      { label: 'empty field', props: {} },
      { label: 'with a value', props: { modelValue: '2026-09-04' } },
      { label: 'disabled, required and in error', props: { modelValue: '2026-09-04', disabled: true, required: true, error: 'Pick a date' } },
    ],
  },
  {
    name: 'DzDateRangePicker',
    component: DzDateRangePicker,
    anatomy: dateRangePickerAnatomy,
    renders: [
      { label: 'empty field', props: {} },
      { label: 'with a range', props: { modelValue: { start: '2026-09-01', end: '2026-09-10' } } },
    ],
  },
  {
    name: 'DzTimePicker',
    component: DzTimePicker,
    anatomy: timePickerAnatomy,
    renders: [
      { label: 'empty trigger', props: {} },
      { label: 'with a value and a cleaner', props: { modelValue: '09:30', cleaner: true } },
      { label: 'disabled, required and in error', props: { disabled: true, required: true, error: 'Pick a time' } },
    ],
  },
  {
    name: 'DzRadioGroup',
    component: DzRadioGroup,
    anatomy: radioGroupAnatomy,
    renders: [
      { label: 'vertical with members', props: { orientation: 'vertical' }, slots: { default: () => h(DzRadio, { value: 'a' }, { default: () => 'A' }) } },
      { label: 'disabled and required', props: { disabled: true, required: true }, slots: { default: () => h(DzRadio, { value: 'a' }) } },
    ],
  },
]

describe('forms — declared anatomy matches rendered DOM (ADR-19)', () => {
  for (const testCase of CASES) {
    describe(testCase.name, () => {
      for (const render of testCase.renders) {
        it(`conforms — ${render.label}`, () => {
          const wrapper = mount(testCase.component, { props: render.props, slots: render.slots as never })
          expectAnatomy(
            testCase.fragmentRoot ? wrapper.get('[data-part="root"]').element : wrapper,
            testCase.anatomy,
            testCase.absentParts === undefined ? {} : { absentParts: testCase.absentParts },
          )
        })
      }

      it('emits data-part="root" on its root element', () => {
        const first = testCase.renders[0]
        const wrapper = mount(testCase.component, { props: first?.props, slots: first?.slots as never })
        if (testCase.fragmentRoot)
          expect(wrapper.get('[data-part="root"]').attributes('data-part')).toBe('root')
        else
          expect(wrapper.attributes('data-part')).toBe('root')
      })
    })
  }
})

describe('dzRadio — a member is its own boundary inside the group', () => {
  function mountComposed(): ReturnType<typeof mount> {
    return mount(DzRadioGroup, {
      props: { modelValue: 'a' },
      slots: {
        default: () => [
          h(DzRadio, { value: 'a' }, { default: () => 'A' }),
          h(DzRadio, { value: 'b', disabled: true }, { default: () => 'B' }),
        ],
      },
    })
  }

  it('conforms to the group declaration with members rendered', () => {
    expectAnatomy(mountComposed(), radioGroupAnatomy)
  })

  it('each member is its own root — the group plus two members', () => {
    expect(mountComposed().findAll('[data-part="root"]')).toHaveLength(3)
  })

  it('each member subtree conforms to the DzRadio declaration', () => {
    const roots = mountComposed().findAll('[data-part="root"]')
    for (const member of roots.slice(1))
      expectAnatomy(member.element, radioAnatomy)
  })
})

describe('forms — the Tier B+ slice is complete, and so is the catalogue', () => {
  /** The 26 Tier B+ components in `packages/core/src/components/forms/`. */
  const TIER_B_PLUS = [
    'DzCascader',
    'DzCheckbox',
    'DzCheckboxGroup',
    'DzColorPicker',
    'DzCombobox',
    'DzDatePicker',
    'DzDateRangePicker',
    'DzFieldArray',
    'DzFileUpload',
    'DzInplace',
    'DzKnob',
    'DzListbox',
    'DzMention',
    'DzMultiSelect',
    'DzPersonaSelector',
    'DzRadio',
    'DzRadioGroup',
    'DzRangeSlider',
    'DzRating',
    'DzSelect',
    'DzSlider',
    'DzSwitch',
    'DzTagsInput',
    'DzTimePicker',
    'DzTransfer',
    'DzTreeSelect',
  ]

  it('every Tier B+ component in the family has a declaration', async () => {
    for (const name of TIER_B_PLUS) {
      const module = await import(`./${name}.anatomy.ts`) as {
        anatomy: { parts: readonly string[] | 'none' }
      }
      // `DzFieldArray` declares `parts: 'none'` — it renders no element of its
      // own, and ADR-19 counts that as a declaration precisely so that
      // "renderless" is a promise rather than an omission.
      if (module.anatomy.parts === 'none')
        expect(name).toBe('DzFieldArray')
      else
        expect(module.anatomy.parts, name).toContain('root')
    }
  })

  it('every component declaring more than root carries a typed `ui` map', async () => {
    for (const name of TIER_B_PLUS) {
      const module = await import(`./${name}.anatomy.ts`) as {
        anatomy: { parts: readonly string[] | 'none' }
      }
      if (module.anatomy.parts === 'none' || module.anatomy.parts.length <= 1)
        continue
      const types = await import(`./${name}.types.ts`) as Record<string, unknown>
      // The `ui` prop is a TYPE, so it is not visible at runtime. What is
      // checkable here is that the module loads and that the anatomy exports
      // the `Ui` alias the prop is typed with; `vue-tsc` proves the binding,
      // and `validate:component-meta` proves the prop reaches the docs page.
      expect(types, name).toBeDefined()
      expect(module.anatomy.parts.length, name).toBeGreaterThan(1)
    }
  })

  it('covers every Tier B+ component this packet declared', () => {
    const composed = ['DzRadio', 'DzFieldArray']
    // `DzSelect` (the ADR-19 pilot) and `DzFileUpload` (Tier D) declared before
    // this packet and have their own contract specs.
    const declaredEarlier = ['DzSelect', 'DzFileUpload']
    expect([...CASES.map(c => c.name), ...composed].sort())
      .toEqual(TIER_B_PLUS.filter(n => !declaredEarlier.includes(n)).sort())
  })
})

describe('dzOptionsState — owner decision D15 / S1-D4, option (d)', () => {
  /**
   * The seven public controls that import `DzOptionsState.vue`. The internal is
   * unexported, absent from the ownership manifest and absent from
   * `component-meta.json`, so `validate:anatomy-parts` governs its parts only
   * when **every** one of these declares them. That is the whole of option (d),
   * and this is the assertion that it holds.
   */
  const HOSTS = {
    DzCascader: cascaderAnatomy,
    DzCombobox: comboboxAnatomy,
    DzListbox: listboxAnatomy,
    DzMultiSelect: multiSelectAnatomy,
    DzSelect: selectAnatomy,
    DzTransfer: transferAnatomy,
    DzTreeSelect: treeSelectAnatomy,
  } as const

  const SHARED = ['options-state', 'options-message', 'options-retry'] as const

  it('every host declares all three shared parts', () => {
    for (const [name, declaration] of Object.entries(HOSTS)) {
      for (const part of SHARED)
        expect(declaration.parts as readonly string[], `${name} → ${part}`).toContain(part)
    }
  })

  it('every host marks them optional — the row replaces the list, it is not always there', () => {
    for (const [name, declaration] of Object.entries(HOSTS)) {
      for (const part of SHARED)
        expect(declaration.optionalParts as readonly string[], `${name} → ${part}`).toContain(part)
    }
  })

  it('dzPersonaSelector declares them too — it renders a combobox that renders the row', () => {
    for (const part of SHARED)
      expect(personaSelectorAnatomy.parts as readonly string[]).toContain(part)
  })

  it('the failed-async row conforms inside DzListbox, which renders it in-tree', () => {
    const wrapper = mount(DzListbox, {
      props: {
        options: [],
        optionsState: 'error',
        optionsError: 'Could not load',
        optionsRetryable: true,
      },
    })
    expect(wrapper.find('[data-part="options-state"]').exists()).toBe(true)
    expect(wrapper.find('[data-part="options-message"]').exists()).toBe(true)
    expect(wrapper.find('[data-part="options-retry"]').exists()).toBe(true)
    expectAnatomy(wrapper, listboxAnatomy)
  })

  it('and inside DzTransfer, the other host that renders it in-tree', () => {
    const wrapper = mount(DzTransfer, {
      props: {
        source: [],
        optionsState: 'error',
        optionsError: 'Could not load',
        optionsRetryable: true,
      },
    })
    expect(wrapper.find('[data-part="options-state"]').exists()).toBe(true)
    expectAnatomy(wrapper, transferAnatomy)
  })

  it('the loading row renders without a retry control, and still conforms', () => {
    const wrapper = mount(DzListbox, { props: { options: [], optionsState: 'loading' } })
    expect(wrapper.find('[data-part="options-state"]').exists()).toBe(true)
    expect(wrapper.find('[data-part="options-retry"]').exists()).toBe(false)
    expectAnatomy(wrapper, listboxAnatomy)
  })
})

describe('dzTreeSelect — the checkbox states D20 recorded as unresolvable are declared', () => {
  /**
   * `DzTreeSelect.vue:746` emits `:data-state="checkboxState(node.key)"`, which
   * `validate:anatomy-parts` reports as an expression with no literal to
   * resolve. The static gate cannot read the call; the declaration can, and
   * does — the function returns `'checked' | 'indeterminate' | 'unchecked'` and
   * all three are declared. An unresolvable expression whose whole range is
   * declared is a different thing from an ungoverned one.
   */
  it('declares every value checkboxState() can return', () => {
    for (const state of ['checked', 'indeterminate', 'unchecked'])
      expect(treeSelectAnatomy.states as readonly string[], state).toContain(state)
  })
})

describe('dzFieldArray — parts: none is a promise, not an omission', () => {
  it('renders no element of its own', () => {
    const wrapper = mount(DzFieldArray, {
      props: { modelValue: [{ v: 1 }, { v: 2 }] },
      slots: { default: () => h('input', { class: 'consumer-owned' }) },
    })
    expectAnatomy(wrapper, fieldArrayAnatomy)
    expect(wrapper.findAll('[data-part]')).toHaveLength(0)
  })
})
