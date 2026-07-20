/**
 * Footer link rendering (TASK-FREE3-07).
 *
 * The footer's link model carries one flag, `external`, which means "not a
 * router route". It was being read as "open in a new tab", so the Contact entry
 * — a `mailto:` — rendered with `target="_blank"`. In several browsers that
 * opens a blank tab, hands the address to the mail client, and abandons the
 * empty tab: the user returns from their mail app to a stray about:blank.
 *
 * These tests pin the three-way split the footer actually has — internal routes,
 * external documents, and handoff schemes — so the mailto cannot quietly rejoin
 * the `_blank` branch.
 */

import { cleanup, render } from '@testing-library/vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createRouter, createWebHistory } from 'vue-router'
import Footer from './Footer.vue'

const Blank = { template: '<div />' }

async function mountFooter() {
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/', component: Blank },
      { path: '/pro', component: Blank },
      { path: '/blocks', component: Blank },
      { path: '/compare', component: Blank },
      { path: '/changelog', component: Blank },
    ],
  })
  await router.push('/')
  await router.isReady()
  return render(Footer, { global: { plugins: [router] } })
}

afterEach(() => {
  cleanup()
  document.body.innerHTML = ''
})

/** Every anchor in the footer's link columns (excludes the badge images). */
function columnLinks(): HTMLAnchorElement[] {
  return [...document.querySelectorAll<HTMLAnchorElement>('.footer-cols a')]
}

describe('footer links — mailto', () => {
  it('renders the contact mailto with no target, so it opens no blank tab', async () => {
    await mountFooter()

    const mailto = columnLinks().find(a => a.getAttribute('href')?.startsWith('mailto:'))
    expect(mailto, 'the footer no longer has a mailto link to check').toBeTruthy()

    expect(
      mailto!.getAttribute('target'),
      'target="_blank" on a mailto leaves an orphan blank tab — a mail handoff has no '
      + 'document to put in a tab',
    ).toBeNull()
  })

  it('carries no rel on the mailto — rel hygiene is for opened documents', async () => {
    await mountFooter()

    const mailto = columnLinks().find(a => a.getAttribute('href')?.startsWith('mailto:'))
    expect(mailto!.getAttribute('rel')).toBeNull()
  })
})

describe('footer links — external documents', () => {
  it('keeps target and rel hygiene on every http(s) link', async () => {
    await mountFooter()

    const external = columnLinks().filter(a => /^https?:/i.test(a.getAttribute('href') ?? ''))
    expect(external.length, 'expected the footer to still carry external doc links').toBeGreaterThan(0)

    for (const link of external) {
      expect(link.getAttribute('target'), `${link.getAttribute('href')} lost target="_blank"`).toBe('_blank')
      const rel = link.getAttribute('rel') ?? ''
      expect(rel, `${link.getAttribute('href')} lost noopener`).toContain('noopener')
      expect(rel, `${link.getAttribute('href')} lost noreferrer`).toContain('noreferrer')
    }
  })
})

describe('footer links — internal routes', () => {
  /**
   * Matched against the real route paths, NOT a `startsWith('/')` heuristic:
   * `/storybook/?path=…` is root-relative but is a SEPARATELY BUILT app, not a
   * router route, so it is correctly `external` and correctly `_blank`. A prefix
   * test would call that a bug.
   */
  const ROUTE_PATHS = new Set(['/', '/pro', '/blocks', '/compare', '/changelog'])

  it('renders in-app destinations as router links, not new tabs', async () => {
    await mountFooter()

    const internal = columnLinks().filter(a => ROUTE_PATHS.has(a.getAttribute('href') ?? ''))
    expect(internal.length, 'expected the footer to still link to in-app routes').toBeGreaterThan(0)

    for (const link of internal)
      expect(link.getAttribute('target'), `${link.getAttribute('href')} should navigate in place`).toBeNull()
  })
})

describe('footer brand badges', () => {
  /**
   * The badge URLs bake a brand colour into a query string, where no `var()` can
   * reach — so they are checked against the brand hex directly (TASK-FREE3-08).
   * `#0766ee` is `--dz-colors-primary-500`; the badges shipped `6366f1`, a
   * generic indigo, rendering the wrong brand on every page load rather than
   * only on a degraded one.
   */
  it('uses the brand blue, not a generic indigo', async () => {
    await mountFooter()

    const badges = [...document.querySelectorAll<HTMLImageElement>('.footer-badges img')]
    expect(badges.length).toBeGreaterThan(0)

    for (const badge of badges) {
      const src = badge.getAttribute('src') ?? ''
      expect(src, `${badge.alt}: badge still uses an off-brand indigo`).not.toMatch(/6366f1|4f46e5|a855f7/i)
    }
  })
})
