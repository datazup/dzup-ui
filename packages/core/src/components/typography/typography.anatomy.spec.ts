/**
 * `typography` — family-level anatomy conformance (TASK-N2-S1, ADR-19).
 *
 * The whole family is Tier A and most of it is one node, which makes it the
 * cheapest slice in the catalogue and the one where the *completeness* claim
 * does the most work: eight components, eight declarations, no exceptions, so
 * "typography is fully restyleable" is a statement a reader can check rather
 * than a summary of a majority.
 *
 * Same structure as the `inputs` and `buttons` family specs. See
 * `inputs.anatomy.spec.ts` for why this lives at family level.
 */

import type { Component } from 'vue'
import { expectAnatomy } from '@dzup-ui/testing'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { anatomy as blockquoteAnatomy } from './DzBlockquote.anatomy.ts'
import DzBlockquote from './DzBlockquote.vue'
import { anatomy as captionAnatomy } from './DzCaption.anatomy.ts'
import DzCaption from './DzCaption.vue'
import { anatomy as codeAnatomy } from './DzCode.anatomy.ts'
import DzCode from './DzCode.vue'
import { anatomy as headingAnatomy } from './DzHeading.anatomy.ts'
import DzHeading from './DzHeading.vue'
import { anatomy as kbdAnatomy } from './DzKbd.anatomy.ts'
import DzKbd from './DzKbd.vue'
import { anatomy as relativeTimeAnatomy } from './DzRelativeTime.anatomy.ts'
import DzRelativeTime from './DzRelativeTime.vue'
import { anatomy as textAnatomy } from './DzText.anatomy.ts'
import DzText from './DzText.vue'
import { anatomy as visuallyHiddenAnatomy } from './DzVisuallyHidden.anatomy.ts'
import DzVisuallyHidden from './DzVisuallyHidden.vue'

interface Case {
  name: string
  component: Component
  anatomy: Parameters<typeof expectAnatomy>[1]
  renders: { label: string, props?: Record<string, unknown>, slots?: Record<string, string> }[]
}

const CASES: Case[] = [
  {
    name: 'DzBlockquote',
    component: DzBlockquote,
    anatomy: blockquoteAnatomy,
    renders: [
      { label: 'quote only', slots: { default: 'To be or not to be' } },
      {
        label: 'with an attribution footer',
        slots: { default: 'To be or not to be', footer: 'Hamlet' },
      },
    ],
  },
  {
    name: 'DzCaption',
    component: DzCaption,
    anatomy: captionAnatomy,
    renders: [
      { label: 'default', slots: { default: 'Figure 1' } },
      { label: 'toned', props: { tone: 'muted' }, slots: { default: 'Figure 1' } },
    ],
  },
  {
    name: 'DzCode',
    component: DzCode,
    anatomy: codeAnatomy,
    renders: [
      { label: 'inline', slots: { default: 'npm i' } },
      // The block variant renders a <pre><code> instead of a bare <code>: the
      // element type changes, the part name does not.
      { label: 'block', props: { variant: 'block' }, slots: { default: 'npm i' } },
    ],
  },
  {
    name: 'DzHeading',
    component: DzHeading,
    anatomy: headingAnatomy,
    renders: [
      { label: 'default', slots: { default: 'Title' } },
      { label: 'as an h4', props: { tag: 'h4' }, slots: { default: 'Title' } },
    ],
  },
  {
    name: 'DzKbd',
    component: DzKbd,
    anatomy: kbdAnatomy,
    renders: [
      { label: 'a single key from the slot', slots: { default: 'K' } },
      { label: 'a key sequence with separators', props: { keys: ['mod', 'k'] } },
    ],
  },
  {
    name: 'DzRelativeTime',
    component: DzRelativeTime,
    anatomy: relativeTimeAnatomy,
    renders: [
      // `tooltip` defaults to true, which wraps the <time> in a DzTooltip and
      // makes the mounted wrapper's root the tooltip rather than this
      // component's own node. The tooltip branch is checked separately below.
      { label: 'relative', props: { value: new Date('2026-01-01T00:00:00Z'), tooltip: false } },
      {
        label: 'absolute',
        props: { value: new Date('2026-01-01T00:00:00Z'), mode: 'absolute', tooltip: false },
      },
    ],
  },
  {
    name: 'DzText',
    component: DzText,
    anatomy: textAnatomy,
    renders: [
      { label: 'default', slots: { default: 'Body copy' } },
      { label: 'as a span', props: { as: 'span' }, slots: { default: 'Body copy' } },
    ],
  },
  {
    name: 'DzVisuallyHidden',
    component: DzVisuallyHidden,
    anatomy: visuallyHiddenAnatomy,
    renders: [{ label: 'default', slots: { default: 'Skip to content' } }],
  },
]

describe('typography — declared anatomy matches rendered DOM (ADR-19)', () => {
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
 * The tooltip branch, and the one composition case a boundary rule cannot fix.
 *
 * `DzTooltipTrigger` merges its attributes **onto its child**, so the `<time>`
 * that is `DzRelativeTime`'s own declared `root` also carries the tooltip's
 * `data-state="closed"`. There is no nested element to stop at: the leak lands
 * on the same node. `expectAnatomy` therefore reports a state this component
 * does not own, and the two ways out are both wrong — declaring `open`/`closed`
 * in `DzRelativeTime.anatomy.ts` would document another component's lifecycle
 * as this one's, and silencing the state check would remove the rule that
 * caught it.
 *
 * So this branch asserts the claim that is actually true — the part survives
 * composition — and the state leak is filed as a finding for the ADR-19
 * acceptance packet (TASK-N2-S1 handoff, `data-scope` evaluation: an
 * `asChild`-merged attribute is precisely the case a scope marker would
 * disambiguate).
 */
describe('dzRelativeTime — the tooltip branch keeps its part', () => {
  it('still emits data-part="root" on the <time> inside the tooltip', () => {
    const wrapper = mount(DzRelativeTime, {
      props: { value: new Date('2026-01-01T00:00:00Z'), tooltip: true },
    })
    const time = wrapper.find('time[data-part="root"]')

    expect(time.exists()).toBe(true)
    // Documented leak, asserted so a change to it is visible rather than silent.
    expect(time.attributes('data-state')).toBe('closed')
  })
})

describe('typography — the family slice is complete', () => {
  /** The eight public components in `packages/core/src/components/typography/`. */
  const PUBLIC_COMPONENTS = [
    'DzBlockquote',
    'DzCaption',
    'DzCode',
    'DzHeading',
    'DzKbd',
    'DzRelativeTime',
    'DzText',
    'DzVisuallyHidden',
  ]

  it('covers every public component in the family', () => {
    expect(CASES.map(c => c.name).sort()).toEqual([...PUBLIC_COMPONENTS].sort())
  })

  it('every declaration names a root part', () => {
    for (const testCase of CASES)
      expect(testCase.anatomy.parts, testCase.name).toContain('root')
  })
})
