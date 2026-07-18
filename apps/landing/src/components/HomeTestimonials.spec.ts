/**
 * HomeTestimonials (TASK-DS-12) — the honesty gate.
 *
 * The section exists, is built from core components, and renders *nothing* while
 * `TESTIMONIALS` is empty. The first test is the one that matters: it fails the
 * day somebody seeds the config with a plausible-sounding quote nobody said.
 */
import { cleanup, render } from '@testing-library/vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { TESTIMONIALS } from '../config.ts'
import HomeTestimonials from './HomeTestimonials.vue'

afterEach(() => {
  cleanup()
  vi.resetModules()
})

describe('homeTestimonials', () => {
  it('ships no testimonials, because dzup-ui has no public users yet', () => {
    // Not a style preference: a fabricated quote is the exact failure mode the
    // design review named. Deleting this test to add example quotes is the bug.
    expect(TESTIMONIALS).toEqual([])
  })

  it('renders nothing at all while the list is empty', () => {
    const { container } = render(HomeTestimonials)
    expect(container.textContent?.trim()).toBe('')
    expect(container.querySelector('section')).toBeNull()
  })

  it('renders a labelled, attributed quote card once real entries exist', async () => {
    vi.doMock('../config.ts', async importOriginal => ({
      ...(await importOriginal<typeof import('../config.ts')>()),
      TESTIMONIALS: [
        { quote: 'It shipped.', name: 'Real Person', title: 'Staff Engineer, Acme', href: 'https://example.com/p' },
      ],
    }))
    const { default: Seeded } = await import('./HomeTestimonials.vue')
    const { getByRole, getByText } = render(Seeded)

    expect(getByRole('heading', { name: 'What teams say' })).toBeTruthy()
    expect(getByText(/It shipped\./)).toBeTruthy()
    expect(getByText('Real Person')).toBeTruthy()
    // The source link makes the claim checkable rather than merely asserted.
    expect(getByRole('link', { name: /Source/ }).getAttribute('href')).toBe('https://example.com/p')
  })
})
