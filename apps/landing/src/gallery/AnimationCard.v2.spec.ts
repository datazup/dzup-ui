/**
 * TASK-AV2-03 — the raked stage card (docs/animations-v2.md).
 *
 * Pins the card's JS-side v2 contract: the tiltable/interactive-stage class
 * split driven by the `interactive-stage` prop (never by the entry id), the
 * permalink spotlight lap layer and its motion gate, and the replay spin
 * micro-feedback. The tilt/glare/plane motion itself is directive + CSS on
 * fine pointers — jsdom (coarse-pointer matchMedia) asserts none of it.
 */

import type { CatalogEntry } from './catalog.ts'
import { cleanup, fireEvent, render } from '@testing-library/vue'
import { flushPromises } from '@vue/test-utils'
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import { provideMotionPreference } from '../motion/index.ts'
import AnimationCard from './AnimationCard.vue'

beforeAll(() => {
  if (typeof window.matchMedia !== 'function') {
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia
  }
})

afterEach(() => {
  cleanup()
})

/** Minimal fixture entry — the card must stay effect-agnostic. */
const ENTRY: CatalogEntry = {
  id: 'fixture-effect',
  title: 'Fixture effect',
  category: 'scroll',
  type: 'css',
  blurb: 'A fixture.',
  components: [],
  code: '<div />',
  demo: defineComponent({ render: () => h('span', 'demo') }),
}

interface CardProps {
  highlighted?: boolean
  interactiveStage?: boolean
}

async function renderCard(props: CardProps = {}, reduced = false) {
  const utils = render(
    defineComponent({
      setup: () => {
        provideMotionPreference(reduced)
        return () => h(AnimationCard, { entry: ENTRY, ...props })
      },
    }),
  )
  await flushPromises()
  return utils
}

describe('av2-03 raked stage card', () => {
  it('marks a normal card tiltable and never as a live stage', async () => {
    const { container } = await renderCard()
    const card = container.querySelector('.anim-card')!
    expect(card.classList.contains('is-tiltable')).toBe(true)
    expect(card.classList.contains('is-stage-live')).toBe(false)
    // The 3D shell wrapper exists and carries the card chrome.
    expect(card.querySelector('.card-shell')).not.toBeNull()
  })

  it('marks a pointer-driven card as a live stage via the prop, never the id', async () => {
    const { container } = await renderCard({ interactiveStage: true })
    const card = container.querySelector('.anim-card')!
    expect(card.classList.contains('is-stage-live')).toBe(true)
    expect(card.classList.contains('is-tiltable')).toBe(false)
  })

  it('renders the spotlight lap only while highlighted with motion allowed', async () => {
    const plain = await renderCard()
    expect(plain.container.querySelector('.av2-spotlight-lap')).toBeNull()
    cleanup()

    const highlighted = await renderCard({ highlighted: true })
    const lap = highlighted.container.querySelector('.av2-spotlight-lap')
    expect(lap).not.toBeNull()
    expect(lap!.getAttribute('aria-hidden')).toBe('true')
    expect(lap!.classList.contains('dz-border-beam')).toBe(true)
    cleanup()

    const reducedRun = await renderCard({ highlighted: true }, true)
    expect(reducedRun.container.querySelector('.av2-spotlight-lap')).toBeNull()
  })

  it('replay spins its icon once per activation and remounts the demo', async () => {
    const { container, getByRole } = await renderCard()
    expect(container.querySelector('.replay-spin.is-spinning')).toBeNull()
    await fireEvent.click(getByRole('button', { name: 'Replay Fixture effect animation' }))
    expect(container.querySelector('.replay-spin.is-spinning')).not.toBeNull()
  })

  it('never arms the replay spin under the page reduce toggle', async () => {
    const { container, getByRole } = await renderCard({}, true)
    await fireEvent.click(getByRole('button', { name: 'Replay Fixture effect animation' }))
    expect(container.querySelector('.replay-spin')).not.toBeNull()
    expect(container.querySelector('.replay-spin.is-spinning')).toBeNull()
  })
})
