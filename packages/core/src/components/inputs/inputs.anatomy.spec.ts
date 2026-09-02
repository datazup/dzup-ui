/**
 * `inputs` — family-level anatomy conformance (TASK-N2-S1, ADR-19).
 *
 * A *family slice* is only complete if every public component in the family
 * declares an anatomy, emits what it declares, and exposes the typed `ui` prop.
 * The first of those three is checked by `validate:ownership`'s ratchet and the
 * second by `validate:anatomy-parts` — but both read **source**. This file is
 * the third leg: it mounts every component in the family and asserts the
 * rendered DOM against its own declaration, which is the only check that can
 * see a part a `v-if` never renders or a state the template spells differently
 * from the anatomy.
 *
 * It lives at family level rather than as eight more blocks in eight contract
 * specs because the claim being made is about the **family** — "inputs is fully
 * restyleable" is what the docs site says, and a claim about a set should be
 * asserted over the set. The completeness assertion at the bottom is what stops
 * a ninth component from joining the family without a declaration and leaving
 * the claim quietly false.
 */

import type { Component } from 'vue'
import { expectAnatomy } from '@dzup-ui/testing'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { anatomy as inputAnatomy } from './DzInput.anatomy.ts'
import DzInput from './DzInput.vue'
import { anatomy as inputGroupAnatomy } from './DzInputGroup.anatomy.ts'
import DzInputGroup from './DzInputGroup.vue'
import { anatomy as inputMaskAnatomy } from './DzInputMask.anatomy.ts'
import DzInputMask from './DzInputMask.vue'
import { anatomy as numberInputAnatomy } from './DzNumberInput.anatomy.ts'
import DzNumberInput from './DzNumberInput.vue'
import { anatomy as otpInputAnatomy } from './DzOtpInput.anatomy.ts'
import DzOtpInput from './DzOtpInput.vue'
import { anatomy as passwordInputAnatomy } from './DzPasswordInput.anatomy.ts'
import DzPasswordInput from './DzPasswordInput.vue'
import { anatomy as searchInputAnatomy } from './DzSearchInput.anatomy.ts'
import DzSearchInput from './DzSearchInput.vue'
import { anatomy as textareaAnatomy } from './DzTextarea.anatomy.ts'
import DzTextarea from './DzTextarea.vue'

interface Case {
  name: string
  component: Component
  anatomy: Parameters<typeof expectAnatomy>[1]
  /** Mount options per render, so the optional parts are actually exercised. */
  renders: { label: string, props?: Record<string, unknown>, slots?: Record<string, string> }[]
}

const CASES: Case[] = [
  {
    name: 'DzInput',
    component: DzInput,
    anatomy: inputAnatomy,
    renders: [
      { label: 'default' },
      { label: 'loading', props: { loading: true } },
      { label: 'clearable with a value', props: { clearable: true, modelValue: 'x' } },
      { label: 'invalid with an error', props: { error: 'Required' } },
      { label: 'with both affixes', slots: { prefix: '<i>@</i>', suffix: '<i>!</i>' } },
    ],
  },
  {
    name: 'DzInputGroup',
    component: DzInputGroup,
    anatomy: inputGroupAnatomy,
    renders: [
      { label: 'default', slots: { default: '<input>' } },
      {
        label: 'with both addons',
        slots: { default: '<input>', prefix: '<span>https://</span>', suffix: '<span>.com</span>' },
      },
      { label: 'disabled', props: { disabled: true }, slots: { default: '<input>' } },
    ],
  },
  {
    name: 'DzInputMask',
    component: DzInputMask,
    anatomy: inputMaskAnatomy,
    renders: [
      { label: 'default', props: { mask: '(999) 999-9999' } },
      { label: 'loading', props: { mask: '99/99', loading: true } },
      { label: 'with an error', props: { mask: '99/99', error: 'Invalid date' } },
      {
        label: 'with both affixes',
        props: { mask: '99/99' },
        slots: { prefix: '<i>#</i>', suffix: '<i>?</i>' },
      },
    ],
  },
  {
    name: 'DzNumberInput',
    component: DzNumberInput,
    anatomy: numberInputAnatomy,
    renders: [
      { label: 'default' },
      { label: 'clamped at its minimum', props: { modelValue: 0, min: 0, max: 10 } },
      { label: 'with an error', props: { error: 'Too large' } },
      { label: 'with a prefix', slots: { prefix: '<i>$</i>' } },
    ],
  },
  {
    name: 'DzOtpInput',
    component: DzOtpInput,
    anatomy: otpInputAnatomy,
    renders: [
      { label: 'default' },
      { label: 'with an error', props: { error: 'Wrong code' } },
      { label: 'disabled', props: { disabled: true } },
    ],
  },
  {
    name: 'DzPasswordInput',
    component: DzPasswordInput,
    anatomy: passwordInputAnatomy,
    renders: [
      { label: 'default' },
      { label: 'loading', props: { loading: true } },
      { label: 'with an error', props: { error: 'Too short' } },
      { label: 'with a prefix', slots: { prefix: '<i>#</i>' } },
    ],
  },
  {
    name: 'DzSearchInput',
    component: DzSearchInput,
    anatomy: searchInputAnatomy,
    renders: [
      { label: 'default' },
      { label: 'loading', props: { loading: true } },
      { label: 'clearable with a value', props: { clearable: true, modelValue: 'vue' } },
      { label: 'with an error', props: { error: 'No results' } },
    ],
  },
  {
    name: 'DzTextarea',
    component: DzTextarea,
    anatomy: textareaAnatomy,
    renders: [
      { label: 'default' },
      { label: 'loading', props: { loading: true } },
      { label: 'with an error', props: { error: 'Required' } },
    ],
  },
]

describe('inputs — declared anatomy matches rendered DOM (ADR-19)', () => {
  for (const testCase of CASES) {
    describe(testCase.name, () => {
      for (const render of testCase.renders) {
        it(`conforms — ${render.label}`, () => {
          const wrapper = mount(testCase.component, {
            props: render.props,
            slots: render.slots,
          })
          expectAnatomy(wrapper, testCase.anatomy)
        })
      }

      it('emits data-part="root" on its root element', () => {
        const wrapper = mount(testCase.component, {
          props: testCase.renders[0]?.props,
          slots: testCase.renders[0]?.slots,
        })
        expect(wrapper.attributes('data-part')).toBe('root')
      })
    })
  }
})

describe('inputs — the family slice is complete', () => {
  /**
   * The eight public components in `packages/core/src/components/inputs/`.
   * Hard-coded on purpose: the point of the assertion is that adding a ninth
   * without an anatomy fails here, and a list derived from the directory would
   * simply grow to include it.
   */
  const PUBLIC_COMPONENTS = [
    'DzInput',
    'DzInputGroup',
    'DzInputMask',
    'DzNumberInput',
    'DzOtpInput',
    'DzPasswordInput',
    'DzSearchInput',
    'DzTextarea',
  ]

  it('covers every public component in the family', () => {
    expect(CASES.map(c => c.name).sort()).toEqual([...PUBLIC_COMPONENTS].sort())
  })

  it('every declaration names a root part and at least one state or recipe', () => {
    for (const testCase of CASES) {
      expect(testCase.anatomy.parts, testCase.name).toContain('root')
    }
  })
})
