/**
 * `feedback` — Tier B+ anatomy conformance (TASK-R5-O2, ADR-19).
 *
 * Same structure as the `cards`, `inputs`, `buttons` and `typography` family
 * specs, with one deliberate difference: the completeness claim is scoped to
 * **Tier B and above**, not to the whole family. TASK-R5-O2's scope boundary is
 * "no Tier A work unless it unblocks a Tier B parent", and 15 of this family's
 * 18 public components are Tier A. Writing a whole-family list here would make
 * the spec assert a claim the packet did not earn.
 *
 * `TIER_B_PLUS` is hard-coded on purpose, the same reason the other family
 * specs hard-code theirs: a list derived from the directory would grow to
 * include the next undeclared component and the claim would go quietly false.
 */

import type { Component } from 'vue'
import { expectAnatomy } from '@dzup-ui/testing'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { anatomy as blockUiAnatomy } from './DzBlockUI.anatomy.ts'
import DzBlockUI from './DzBlockUI.vue'
import { anatomy as notificationAnatomy } from './DzNotification.anatomy.ts'
import DzNotification from './DzNotification.vue'

interface Case {
  name: string
  component: Component
  anatomy: Parameters<typeof expectAnatomy>[1]
  renders: { label: string, props?: Record<string, unknown>, slots?: Record<string, string> }[]
}

const CASES: Case[] = [
  {
    name: 'DzBlockUI',
    component: DzBlockUI,
    anatomy: blockUiAnatomy,
    renders: [
      { label: 'unblocked', slots: { default: 'Content' } },
      // `fullScreen` is deliberately NOT exercised here: it teleports the
      // overlay to <body>, which puts the node outside the wrapper's subtree
      // and outside what `expectAnatomy` can see. The scoped branch renders the
      // same overlay in place.
      { label: 'blocked, scoped', props: { blocked: true, message: 'Loading' }, slots: { default: 'Content' } },
    ],
  },
  {
    name: 'DzNotification',
    component: DzNotification,
    anatomy: notificationAnatomy,
    renders: [
      { label: 'title only', props: { title: 'Saved' } },
      {
        label: 'closable, with a description and actions',
        props: { title: 'Saved', description: 'Your changes are live.', closable: true, tone: 'success' },
        slots: { actions: '<button>Undo</button>' },
      },
    ],
  },
]

describe('feedback — declared anatomy matches rendered DOM (ADR-19)', () => {
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

describe('feedback — the Tier B+ slice is complete', () => {
  /**
   * The three Tier B components in `packages/core/src/components/feedback/`.
   *
   * `DzToast` is declared and emits its parts, but it is not mounted here: it
   * requires reka-ui's `ToastProvider` + `ToastViewport` context, which
   * `DzToaster` supplies, so its conformance is asserted in the toaster's own
   * specs rather than by mounting it bare.
   */
  const TIER_B_PLUS = ['DzBlockUI', 'DzNotification', 'DzToast']

  it('every Tier B+ component in the family has a declaration', async () => {
    for (const name of TIER_B_PLUS) {
      const module = await import(`./${name}.anatomy.ts`) as { anatomy: { parts: readonly string[] } }
      expect(module.anatomy.parts, name).toContain('root')
    }
  })

  it('covers every Tier B+ component that can be mounted bare', () => {
    expect(CASES.map(c => c.name).sort()).toEqual(
      TIER_B_PLUS.filter(n => n !== 'DzToast').sort(),
    )
  })
})
