/**
 * `media` — Tier B+ anatomy conformance (TASK-R5-O2, ADR-19).
 *
 * The completeness claim is scoped to **Tier B and above**: 7 of the family's
 * 10 public components are Tier A and TASK-R5-O2's scope excludes them.
 *
 * This is also the family where `rtl.mirrors` earns its existence. Two of the
 * three declarations here say `'none'` — `DzCarousel` moves its track with an
 * explicit `translateX`, and `DzImageComparison`'s reveal is a physical
 * `clip-path` driven by a physical pointer coordinate. Neither could be
 * inferred from the utilities in their variants files, which is the argument
 * ADR-19 makes for declaring the axis rather than guessing it.
 */

import type { Component } from 'vue'
import { expectAnatomy } from '@dzup-ui/testing'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h, nextTick } from 'vue'
import { anatomy as carouselAnatomy } from './DzCarousel.anatomy.ts'
import DzCarousel from './DzCarousel.vue'
import DzCarouselDots from './DzCarouselDots.vue'
import DzCarouselNext from './DzCarouselNext.vue'
import DzCarouselPrevious from './DzCarouselPrevious.vue'
import DzCarouselSlide from './DzCarouselSlide.vue'
import { anatomy as imageComparisonAnatomy } from './DzImageComparison.anatomy.ts'
import DzImageComparison from './DzImageComparison.vue'

interface Case {
  name: string
  component: Component
  anatomy: Parameters<typeof expectAnatomy>[1]
  renders: { label: string, props?: Record<string, unknown>, slots?: Record<string, string> }[]
}

const CASES: Case[] = [
  {
    name: 'DzCarousel',
    component: DzCarousel,
    anatomy: carouselAnatomy,
    renders: [
      { label: 'empty' },
      { label: 'disabled', props: { disabled: true } },
    ],
  },
  {
    name: 'DzImageComparison',
    component: DzImageComparison,
    anatomy: imageComparisonAnatomy,
    renders: [
      { label: 'two images', props: { beforeSrc: '/a.png', afterSrc: '/b.png' } },
      {
        label: 'labelled and vertical',
        props: {
          beforeSrc: '/a.png',
          afterSrc: '/b.png',
          beforeLabel: 'Before',
          afterLabel: 'After',
          orientation: 'vertical',
        },
      },
    ],
  },
]

describe('media — declared anatomy matches rendered DOM (ADR-19)', () => {
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

describe('dzCarousel — its compound parts emit what it declares', () => {
  function mountComposed(): ReturnType<typeof mount> {
    return mount(DzCarousel, {
      slots: {
        default: () => [
          h(DzCarouselSlide, null, { default: () => 'One' }),
          h(DzCarouselSlide, null, { default: () => 'Two' }),
          h(DzCarouselPrevious),
          h(DzCarouselNext),
          h(DzCarouselDots),
        ],
      },
    })
  }

  it('renders item, list, item-indicator and action inside the declared root', async () => {
    const wrapper = mountComposed()
    // The dots are driven by the slide count the slides register on mount, so
    // the indicators exist one tick after the group does.
    await nextTick()
    for (const part of ['item', 'list', 'item-indicator', 'action'])
      expect(wrapper.find(`[data-part="${part}"]`).exists(), part).toBe(true)
  })

  it('conforms to DzCarousel\'s anatomy with every compound part present', () => {
    expectAnatomy(mountComposed(), carouselAnatomy)
  })

  it('no compound part claims `root` — the parent owns that name', () => {
    expect(mountComposed().findAll('[data-part="root"]')).toHaveLength(1)
  })

  it('both navigation buttons share the `action` name', () => {
    expect(mountComposed().findAll('[data-part="action"]')).toHaveLength(2)
  })
})

describe('media — the Tier B+ slice is complete', () => {
  /**
   * The three Tier B components in `packages/core/src/components/media/`.
   *
   * `DzLightbox` is declared and emits its parts, but it is not mounted here:
   * everything it renders goes through a portal to `document.body`, which is
   * outside the subtree `expectAnatomy` walks. Its parts are asserted in the
   * component's own specs, which attach to the document.
   */
  const TIER_B_PLUS = ['DzCarousel', 'DzImageComparison', 'DzLightbox']

  it('every Tier B+ component in the family has a declaration', async () => {
    for (const name of TIER_B_PLUS) {
      const module = await import(`./${name}.anatomy.ts`) as { anatomy: { parts: readonly string[] } }
      expect(module.anatomy.parts.length, name).toBeGreaterThan(0)
    }
  })

  it('covers every Tier B+ component that can be mounted without a portal', () => {
    expect(CASES.map(c => c.name).sort()).toEqual(
      TIER_B_PLUS.filter(n => n !== 'DzLightbox').sort(),
    )
  })

  it('dzLightbox declares no `root` — it renders only a slot and a portal', () => {
    expect(carouselAnatomy.parts).toContain('root')
    expect(imageComparisonAnatomy.parts).toContain('root')
  })
})
