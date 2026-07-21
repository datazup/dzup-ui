/**
 * changelog.spec.ts — the honesty + validity gate for the on-site release feed
 * (FREE2-10). Two halves, both needed:
 *
 *   1. **The Atom feed is valid.** `public/feed.xml` is READ BACK OFF DISK and
 *      validated against the Atom 1.0 spec (well-formed XML, the required
 *      feed-/entry-level elements, absolute URLs on SITE_ORIGIN, RFC-3339 dates).
 *      A feed nothing validates is just a slower way to ship broken XML.
 *
 *   2. **The feed and page agree with the parsed data.** The feed's entries and
 *      `<updated>` are matched against the generated `releases.ts` module (itself
 *      drift-guarded against CHANGELOG.md in CI), and the page renders that data.
 *      Nothing here is hand-typed (claims.spec.ts discipline).
 *
 * If this fails after a changelog edit: run
 * `yarn workspace @dzup-ui/landing build:releases` and commit the regenerated
 * `src/generated/releases.ts` + `public/feed.xml`.
 */

import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mount } from '@vue/test-utils'
import { beforeAll, describe, expect, it } from 'vitest'
import { SITE_ORIGIN } from './config.ts'
import { FEED_UPDATED, RELEASES, TOTAL_RELEASES } from './generated/releases.ts'
import ChangelogPage from './pages/ChangelogPage.vue'

const HERE = dirname(fileURLToPath(import.meta.url))
const LANDING_ROOT = resolve(HERE, '..')

const FEED_PATH = resolve(LANDING_ROOT, 'public/feed.xml')
const INDEX_HTML = resolve(LANDING_ROOT, 'index.html')

/** Entries capped in the feed by build-releases.ts (`FEED_LIMIT`). */
const FEED_LIMIT = 20
const RFC3339 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:Z|[+-]\d{2}:\d{2})$/

describe('generated release data', () => {
  it('carries the full history and a sane total', () => {
    expect(RELEASES.length).toBeGreaterThan(0)
    // The module emits every parsed release, so TOTAL_RELEASES is its length.
    expect(TOTAL_RELEASES).toBe(RELEASES.length)
  })

  it('is date-ordered newest-first with non-empty releases', () => {
    for (const release of RELEASES) {
      expect(release.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(release.entryCount).toBeGreaterThan(0)
      const counted = release.sections.reduce((n, s) => n + s.entries.length, 0)
      expect(counted).toBe(release.entryCount)
    }
    const dates = RELEASES.map(r => r.date)
    expect([...dates].sort((a, b) => (a < b ? 1 : -1))).toEqual(dates)
  })
})

describe('atom feed (public/feed.xml)', () => {
  let doc: Document
  let xml: string

  beforeAll(() => {
    xml = readFileSync(FEED_PATH, 'utf8')
    doc = new DOMParser().parseFromString(xml, 'application/xml')
  })

  it('is well-formed XML with an Atom feed root', () => {
    expect(doc.getElementsByTagName('parsererror').length).toBe(0)
    expect(doc.documentElement.nodeName).toBe('feed')
    expect(doc.documentElement.getAttribute('xmlns')).toBe('http://www.w3.org/2005/Atom')
  })

  it('has the required feed-level elements', () => {
    for (const tag of ['id', 'title', 'updated']) {
      const el = doc.documentElement.getElementsByTagName(tag)[0]
      expect(el, `<${tag}> present`).toBeTruthy()
      expect(el!.textContent?.trim().length).toBeGreaterThan(0)
    }
    const feedUpdated = doc.documentElement.getElementsByTagName('updated')[0]!.textContent!.trim()
    expect(feedUpdated).toMatch(RFC3339)
    expect(feedUpdated).toBe(FEED_UPDATED)
  })

  it('advertises self + alternate links, both absolute on SITE_ORIGIN', () => {
    const links = [...doc.documentElement.children].filter(el => el.tagName === 'link')
    const rels = new Set(links.map(l => l.getAttribute('rel')))
    expect(rels.has('self')).toBe(true)
    expect(rels.has('alternate')).toBe(true)
    for (const link of links) {
      const href = link.getAttribute('href') ?? ''
      expect(href.startsWith(`${SITE_ORIGIN}/`), `${href} is absolute`).toBe(true)
    }
    const self = links.find(l => l.getAttribute('rel') === 'self')!
    expect(self.getAttribute('href')).toBe(`${SITE_ORIGIN}/feed.xml`)
    expect(self.getAttribute('type')).toBe('application/atom+xml')
  })

  it('has one valid entry per recent release, matching the generated data', () => {
    const entries = [...doc.getElementsByTagName('entry')]
    expect(entries.length).toBe(Math.min(RELEASES.length, FEED_LIMIT))

    entries.forEach((entry, i) => {
      const release = RELEASES[i]!
      for (const tag of ['id', 'title', 'updated', 'content']) {
        const el = [...entry.children].find(c => c.tagName === tag)
        expect(el, `entry ${i} <${tag}>`).toBeTruthy()
      }
      const id = [...entry.children].find(c => c.tagName === 'id')!.textContent!.trim()
      const updated = [...entry.children].find(c => c.tagName === 'updated')!.textContent!.trim()
      // Every date/URL derives from the parsed release — nothing hand-typed.
      expect(id).toBe(`${SITE_ORIGIN}/changelog#${release.date}`)
      expect(updated).toBe(`${release.date}T00:00:00Z`)
      expect(updated).toMatch(RFC3339)
    })
  })

  it('escapes entry content so the payload is valid XML character data', () => {
    // The double-escape (HTML then XML) means a raw '<' from a bullet is never
    // emitted unescaped inside <content>. If it leaked, parsing would have failed
    // above — assert the content is escaped-HTML, not element children.
    const firstContent = [...doc.getElementsByTagName('content')][0]!
    expect(firstContent.children.length).toBe(0)
    expect(firstContent.textContent).toContain('<') // decoded &lt; → '<'
  })
})

describe('feed autodiscovery', () => {
  it('is advertised in index.html', () => {
    const html = readFileSync(INDEX_HTML, 'utf8')
    expect(html).toMatch(/rel=["']alternate["']/)
    expect(html).toMatch(/type=["']application\/atom\+xml["']/)
    expect(html).toContain('/feed.xml')
  })
})

describe('changelogPage', () => {
  it('renders the build-derived releases with exactly one h1', () => {
    const wrapper = mount(ChangelogPage)
    const h1s = wrapper.findAll('h1')
    expect(h1s.length).toBe(1)
    expect(h1s[0]!.text()).toContain('Changelog')
    // The newest release date is rendered on a card.
    expect(wrapper.text()).toContain(RELEASES[0]!.date)
  })

  it('filters the timeline by section type', async () => {
    const wrapper = mount(ChangelogPage)
    // Every release is visible under "All".
    const allDates = wrapper.findAll('[role="button"][aria-pressed]')
    expect(allDates.length).toBeGreaterThan(1) // All + ≥1 section chip

    // Pick a section that exists and activate its chip.
    const section = RELEASES[0]!.sections[0]!.name
    const chip = wrapper.findAll('.cl-filter').find(c => c.text() === section)
    expect(chip, `filter chip for ${section}`).toBeTruthy()
    await chip!.trigger('click')

    // Only releases containing that section remain; each shows the section title.
    const expected = RELEASES.filter(r => r.sections.some(s => s.name === section)).length
    expect(wrapper.findAll('.cl-release').length).toBe(expected)
  })
})
