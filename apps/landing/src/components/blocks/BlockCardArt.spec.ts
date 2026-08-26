/**
 * TASK-BV2-05 — BlockCardArt, the live postcard on a BlockCard.
 *
 * The art renders the block's own component, so the hard part of the contract
 * is what it must NOT be: interactive, visible to AT, or a second copy of the
 * block's document identity. The page mounts the same block live in its
 * preview; if the art kept its `id`/`for`/`aria-*`/`name` attributes,
 * `getElementById` and label resolution for the REAL preview could resolve
 * into the hidden art. These specs pin:
 *
 *   1. the aria-hidden container + inert, pointer-inert frame;
 *   2. identity attributes stripped from the mounted subtree;
 *   3. re-stripping when content appears later (the async-component path);
 *   4. the accent-gradient fallback always present under the stage.
 *
 * jsdom has no IntersectionObserver, so `useLazyMount` renders eagerly here —
 * which is exactly the degraded-environment branch the component documents.
 */

import type { BlockDef } from '../../blocks/registry.ts'
import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent } from 'vue'
import BlockCardArt from './BlockCardArt.vue'

/** A block whose component carries every identity attribute we must strip. */
const IdentityBlock = defineComponent({
  template: `
    <section id="fake-hero" aria-labelledby="fake-hero-title">
      <h2 id="fake-hero-title">Hero</h2>
      <label for="fake-email">Email</label>
      <input id="fake-email" name="email" type="email" />
      <button aria-controls="fake-menu" type="button">Open</button>
    </section>
  `,
})

function fakeBlock(): BlockDef {
  return {
    id: 'fake-block',
    title: 'Fake block',
    description: '',
    category: 'marketing',
    tags: [],
    components: [],
    component: IdentityBlock,
    path: './marketing/FakeBlock.vue',
  } as unknown as BlockDef
}

async function mountArt() {
  const wrapper = mount(BlockCardArt, { props: { block: fakeBlock() } })
  await flushPromises()
  // The MutationObserver strips on a microtask checkpoint after DOM insertion.
  await new Promise(resolve => setTimeout(resolve, 0))
  return wrapper
}

describe('blockCardArt', () => {
  it('renders an aria-hidden container with an inert, live stage and a designed fallback', async () => {
    const wrapper = await mountArt()
    const container = wrapper.find('.block-card-art')
    expect(container.attributes('aria-hidden')).toBe('true')
    expect(wrapper.find('.block-card-art-fallback').exists()).toBe(true)
    const frame = wrapper.find('.block-card-art-frame')
    expect(frame.exists()).toBe(true)
    expect(frame.attributes()).toHaveProperty('inert')
    // The live block actually rendered inside the stage.
    expect(wrapper.find('.block-card-art-stage section').exists()).toBe(true)
  })

  it('strips every document-identity attribute from the art subtree', async () => {
    const wrapper = await mountArt()
    const frame = wrapper.find('.block-card-art-frame').element
    for (const attr of ['id', 'for', 'name', 'aria-labelledby', 'aria-controls']) {
      expect(
        frame.querySelectorAll(`[${attr}]`).length,
        `no [${attr}] may survive inside the art`,
      ).toBe(0)
    }
    // The content itself is intact — only identity went away.
    expect(frame.querySelector('input')).not.toBeNull()
    expect(frame.querySelector('label')?.textContent).toBe('Email')
  })

  it('re-strips identity from content that appears after mount (async component path)', async () => {
    const wrapper = await mountArt()
    const stage = wrapper.find('.block-card-art-stage').element
    const late = document.createElement('div')
    late.id = 'late-arrival'
    late.innerHTML = '<label for="late-input">Late</label><input id="late-input" name="late" />'
    stage.appendChild(late)
    // MutationObserver delivery is async; give it a macrotask.
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(stage.querySelectorAll('[id], [for], [name]').length).toBe(0)
  })
})
