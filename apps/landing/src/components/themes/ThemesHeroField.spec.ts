/**
 * ThemesHeroField — the /themes hero paint-chip depth field
 * (docs/themes-v2.md TASK-THV2-02).
 *
 * Structural guards only: the field is pure decoration and must stay invisible
 * to the accessibility tree, and its chips must read LIVE token vars (never a
 * literal) so they repaint as the visitor mixes.
 */

import { cleanup, render } from '@testing-library/vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import ThemesHeroField from './ThemesHeroField.vue'

beforeEach(() => {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }))
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

async function mountField() {
  const utils = render(ThemesHeroField)
  // Post-paint gate: the field renders nothing until mounted flips `ready`.
  await nextTick()
  await nextTick()
  return utils
}

describe('themesHeroField (THV2-02)', () => {
  it('renders an aria-hidden, inert parallax host', async () => {
    const { container } = await mountField()
    const host = container.querySelector('.thv2-hero-field')
    expect(host).not.toBeNull()
    expect(host?.getAttribute('aria-hidden')).toBe('true')
    expect(host?.hasAttribute('inert')).toBe(true)
  })

  it('floats five paint chips on parallax layers', async () => {
    const { container } = await mountField()
    const chips = container.querySelectorAll('.thv2-chip')
    expect(chips).toHaveLength(5)
    for (const chip of chips)
      expect(chip.classList.contains('dz-parallax-layer')).toBe(true)
  })

  it('paints the mini-ramp from live primary ramp vars, never literals', async () => {
    const { container } = await mountField()
    const steps = container.querySelectorAll<HTMLElement>('.thv2-ramp-step')
    expect(steps).toHaveLength(5)
    for (const step of steps)
      expect(step.style.background).toMatch(/var\(--dz-colors-primary-\d+\)/)
  })

  it('contains no focusable or announced content', async () => {
    const { container } = await mountField()
    expect(container.querySelectorAll('a, button, input, [tabindex]')).toHaveLength(0)
    expect(container.textContent?.trim()).toBe('Aa')
  })
})
