/**
 * TASK-BV2-02 — the /blocks hero depth field.
 *
 * The field is decoration with a hard contract: aria-hidden, inert (no
 * focusable/readable content), postcards tinted ONLY by real registry category
 * accents, and a reduced-motion branch that disables the parallax while keeping
 * the composition. The float/parallax math is CSS (asserted by the tokens.css
 * central reduce block, covered by the motion module's own specs) — these specs
 * pin the DOM contract.
 */

import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import { CATEGORIES } from '../../blocks/registry.ts'
import DzParallax from '../../motion/components/DzParallax.vue'
import { provideMotionPreference } from '../../motion/index.ts'
import BlocksHeroField from './BlocksHeroField.vue'

const EXPECTED_CARDS = Math.min(6, CATEGORIES.length)

async function mountField(reduced = false) {
  // provideMotionPreference must run in a parent setup — the module-level OS
  // matchMedia read is a singleton, so specs drive reduced motion through the
  // provide override, never by stubbing matchMedia after the fact.
  const wrapper = mount(
    defineComponent({
      setup() {
        provideMotionPreference(reduced)
        return () => h(BlocksHeroField)
      },
    }),
  )
  await flushPromises()
  return wrapper
}

describe('blocksHeroField', () => {
  it('renders an aria-hidden, pointer-inert stage of registry-tinted postcards', async () => {
    const wrapper = await mountField()
    const host = wrapper.find('.bv2-hero-field')
    expect(host.exists()).toBe(true)
    // DzParallax's host carries the decoration contract.
    expect(host.attributes('aria-hidden')).toBe('true')

    const cards = wrapper.findAll('.bv2-postcard')
    expect(cards).toHaveLength(EXPECTED_CARDS)
    cards.forEach((card, i) => {
      // Inert decoration: parallax layer class, no text, no interactive content.
      expect(card.classes()).toContain('dz-parallax-layer')
      expect(card.text()).toBe('')
      // The hue is the i-th category's accent — derived, never invented.
      expect(card.attributes('style')).toContain(
        `--pc-accent: var(--dz-colors-${CATEGORIES[i]!.accent}-500)`,
      )
    })
  })

  it('keeps the composition under reduced motion but disables the parallax', async () => {
    const wrapper = await mountField(true)
    expect(wrapper.findAll('.bv2-postcard')).toHaveLength(EXPECTED_CARDS)
    expect(wrapper.findComponent(DzParallax).props('disabled')).toBe(true)
  })

  it('answers OS motion with parallax enabled by default', async () => {
    const wrapper = await mountField(false)
    expect(wrapper.findComponent(DzParallax).props('disabled')).toBe(false)
  })
})
