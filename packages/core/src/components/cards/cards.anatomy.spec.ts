/**
 * `cards` — family-level anatomy conformance (TASK-R5-O2, ADR-19).
 *
 * Same structure as the `inputs`, `buttons` and `typography` family specs; see
 * `../inputs/inputs.anatomy.spec.ts` for why the completeness claim lives at
 * family level rather than in eight contract specs.
 *
 * The card family is the first slice where the **parent-covers composition
 * rule** (N2-S1 finding S1-F3) is exercised deliberately rather than
 * discovered: `DzCardHeader`, `DzCardBody` and `DzCardFooter` are
 * `compound-part`s of `DzCard` in the ownership manifest, they emit `header`,
 * `body` and `footer` — never `root` — and `DzCard.anatomy.ts` declares all
 * three. A composed card therefore conforms to one declaration.
 */

import type { Component } from 'vue'
import { expectAnatomy } from '@dzup-ui/testing'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import { anatomy as cardAnatomy } from './DzCard.anatomy.ts'
import DzCard from './DzCard.vue'
import DzCardBody from './DzCardBody.vue'
import DzCardFooter from './DzCardFooter.vue'
import DzCardHeader from './DzCardHeader.vue'
import { anatomy as imageCardAnatomy } from './DzImageCard.anatomy.ts'
import DzImageCard from './DzImageCard.vue'
import { anatomy as statCardAnatomy } from './DzStatCard.anatomy.ts'
import DzStatCard from './DzStatCard.vue'

interface Case {
  name: string
  component: Component
  anatomy: Parameters<typeof expectAnatomy>[1]
  renders: { label: string, props?: Record<string, unknown>, slots?: Record<string, string> }[]
}

const CASES: Case[] = [
  {
    name: 'DzCard',
    component: DzCard,
    anatomy: cardAnatomy,
    renders: [
      { label: 'content only', slots: { default: 'Body' } },
      { label: 'clickable', props: { clickable: true }, slots: { default: 'Body' } },
      { label: 'outlined, no padding', props: { variant: 'outlined', padding: 'none' }, slots: { default: 'Body' } },
    ],
  },
  {
    name: 'DzImageCard',
    component: DzImageCard,
    anatomy: imageCardAnatomy,
    renders: [
      { label: 'image only', props: { src: '/a.png', alt: 'A' } },
      {
        label: 'every optional region filled',
        props: { src: '/a.png', alt: 'A', variant: 'outlined' },
        slots: { overlay: 'Over', header: 'Head', default: 'Body', footer: 'Foot' },
      },
    ],
  },
  {
    name: 'DzStatCard',
    component: DzStatCard,
    anatomy: statCardAnatomy,
    renders: [
      { label: 'title and value', props: { title: 'Revenue', value: '$12,450' } },
      {
        label: 'with a trend and a description',
        props: {
          title: 'Revenue',
          value: '$12,450',
          trend: 'up',
          trendValue: '+12.5%',
          description: 'vs. last month',
        },
      },
    ],
  },
]

describe('cards — declared anatomy matches rendered DOM (ADR-19)', () => {
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

describe('dzCard — its compound parts emit what it declares', () => {
  function mountComposed(): ReturnType<typeof mount> {
    return mount(DzCard, {
      slots: {
        header: () => h(DzCardHeader, null, {
          default: () => 'Title',
          actions: () => h('button', 'Edit'),
        }),
        default: () => h(DzCardBody, null, { default: () => 'Body' }),
        footer: () => h(DzCardFooter, null, { default: () => 'Foot' }),
      },
    })
  }

  it('renders header, body, footer and action inside the declared root', () => {
    const wrapper = mountComposed()
    for (const part of ['header', 'body', 'footer', 'action'])
      expect(wrapper.find(`[data-part="${part}"]`).exists(), part).toBe(true)
  })

  it('conforms to DzCard\'s anatomy with every compound part present', () => {
    expectAnatomy(mountComposed(), cardAnatomy)
  })

  it('no compound part claims `root` — the parent owns that name', () => {
    const wrapper = mountComposed()
    expect(wrapper.findAll('[data-part="root"]')).toHaveLength(1)
  })
})

describe('cards — the family slice is complete', () => {
  /** The three public components in `packages/core/src/components/cards/`. */
  const PUBLIC_COMPONENTS = ['DzCard', 'DzImageCard', 'DzStatCard']

  it('covers every public component in the family', () => {
    expect(CASES.map(c => c.name).sort()).toEqual([...PUBLIC_COMPONENTS].sort())
  })

  it('every declaration names a root part', () => {
    for (const testCase of CASES)
      expect(testCase.anatomy.parts, testCase.name).toContain('root')
  })
})
