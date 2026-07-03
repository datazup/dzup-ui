/**
 * AnnouncementBanner — the dismissible bar above the nav. Guards the two things
 * that make it useful without becoming a nuisance:
 *   1. it renders the configured message with an accessible landmark + labelled
 *      dismiss control, and
 *   2. dismissing it persists (keyed by the announcement id) so it stays gone on
 *      the next visit — while a NEW id would re-show it.
 */
import { render, fireEvent, cleanup } from '@testing-library/vue'
import { afterEach, describe, expect, it } from 'vitest'
import AnnouncementBanner from './AnnouncementBanner.vue'
import { ANNOUNCEMENT } from '../config.ts'

/** RouterLink stub so the CTA renders without installing a router. */
const RouterLink = { template: '<a><slot /></a>' }

function mount() {
  return render(AnnouncementBanner, { global: { stubs: { RouterLink } } })
}

describe('AnnouncementBanner', () => {
  afterEach(() => {
    cleanup()
    localStorage.clear()
  })

  it('renders the configured announcement in a labelled region', () => {
    // The suite assumes an announcement is configured; skip cleanly if not.
    if (!ANNOUNCEMENT) return
    const { getByRole } = mount()
    const region = getByRole('region', { name: /announcement/i })
    expect(region.textContent).toContain(ANNOUNCEMENT.message)
    // A real, labelled dismiss button (keyboard + AT operable).
    getByRole('button', { name: /dismiss announcement/i })
  })

  it('persists dismissal keyed by the announcement id', async () => {
    if (!ANNOUNCEMENT) return
    const first = mount()
    await fireEvent.click(first.getByRole('button', { name: /dismiss announcement/i }))
    // Gone now …
    expect(first.queryByRole('region', { name: /announcement/i })).toBeNull()
    // … and persisted under the id-scoped key.
    expect(localStorage.getItem(`dz-announcement-dismissed:${ANNOUNCEMENT.id}`)).toBe('1')

    // A fresh mount stays hidden (reads the persisted dismissal).
    cleanup()
    const second = mount()
    expect(second.queryByRole('region', { name: /announcement/i })).toBeNull()
  })

  it('re-shows when the announcement id changes (old key no longer matches)', () => {
    if (!ANNOUNCEMENT) return
    // A dismissal from a PREVIOUS announcement must not silence a new one.
    localStorage.setItem('dz-announcement-dismissed:some-old-id', '1')
    const { getByRole } = mount()
    getByRole('region', { name: /announcement/i })
  })
})
