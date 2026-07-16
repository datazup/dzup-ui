/**
 * Drift guard for the two Lighthouse CI configs (TASK-FREE-13).
 *
 * The landing site is measured twice — `lighthouserc.json` (desktop preset) and
 * `lighthouserc.mobile.json` (Lighthouse's default mobile emulation). Lighthouse CI
 * takes one form factor per run, so two files are unavoidable; two hand-maintained
 * copies of the same URL list and the same assertions are not. The only intended
 * difference between them is `collect.settings`.
 *
 * Without this test the likely failure is silent and one-directional: someone adds a
 * route to the desktop file, mobile keeps probing four URLs, and the run that would
 * have caught the regression (mobile is the throttled, unforgiving one) never sees
 * the page. A green check would then mean less than it appears to — which is the
 * failure mode this repo keeps finding.
 */

import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

/**
 * The two configs sit at the app root; this spec lives under `src/` because that is
 * the only place the root vitest `include` looks for app specs — a guard that never
 * runs is worse than no guard.
 */
const APP_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

interface LighthouseRc {
  ci: {
    collect: {
      url: string[]
      numberOfRuns: number
      startServerCommand: string
      settings?: Record<string, unknown>
    }
    assert: { assertions: Record<string, unknown> }
    upload: Record<string, unknown>
  }
}

function readRc(file: string): LighthouseRc {
  return JSON.parse(readFileSync(resolve(APP_ROOT, file), 'utf8')) as LighthouseRc
}

const desktop = readRc('lighthouserc.json')
const mobile = readRc('lighthouserc.mobile.json')

describe('lighthouse configs', () => {
  it('probe the identical URL list', () => {
    expect(mobile.ci.collect.url).toEqual(desktop.ci.collect.url)
  })

  it('assert identical thresholds everywhere except the recorded LCP exception', () => {
    const { 'largest-contentful-paint': _desktopLcp, ...desktopRest } = desktop.ci.assert.assertions
    const { 'largest-contentful-paint': _mobileLcp, ...mobileRest } = mobile.ci.assert.assertions
    expect(mobileRest).toEqual(desktopRest)
  })

  it('hard-gates CLS on both — the lazy-route footer jump was 0.44/0.82 before it was fixed', () => {
    for (const rc of [desktop, mobile]) {
      expect(rc.ci.assert.assertions['cumulative-layout-shift']).toEqual([
        'error',
        { maxNumericValue: 0.1 },
      ])
    }
  })

  /**
   * The one sanctioned difference. Desktop measures 0.66-1.19s and hard-fails over
   * 2.5s; mobile measures 3.08-4.34s and cannot hold that bar today, so it warns
   * (see the `//lcp` note in lighthouserc.mobile.json). Pinned in both directions:
   * relaxing desktop to `warn` would drop the only enforced LCP gate the site has,
   * and the day mobile LCP is fixed this test is what says to promote it.
   */
  it('gates LCP as error on desktop and warn on mobile — the recorded mobile gap', () => {
    expect(desktop.ci.assert.assertions['largest-contentful-paint']).toEqual([
      'error',
      { maxNumericValue: 2500 },
    ])
    expect(mobile.ci.assert.assertions['largest-contentful-paint']).toEqual([
      'warn',
      { maxNumericValue: 2500 },
    ])
  })

  it('differ only in form factor', () => {
    expect(desktop.ci.collect.settings).toEqual({ preset: 'desktop' })
    // Mobile is Lighthouse's default: no preset is how you ask for a throttled
    // phone. An explicit `preset: 'desktop'` creeping in here would silently make
    // the "mobile" run a second desktop run.
    expect(mobile.ci.collect.settings?.preset).toBeUndefined()
  })

  it('probe at least five routes, including a block detail page', () => {
    const paths = desktop.ci.collect.url.map(u => new URL(u).pathname)
    expect(paths.length).toBeGreaterThanOrEqual(5)
    expect(paths).toEqual(expect.arrayContaining(['/', '/blocks', '/templates', '/compare']))
    expect(paths.some(p => /^\/blocks\/[^/]+$/.test(p)), 'a block detail route').toBe(true)
  })

  it('gates accessibility at error level — this is an accessibility library', () => {
    expect(desktop.ci.assert.assertions['categories:accessibility']).toEqual([
      'error',
      { minScore: 0.9 },
    ])
  })
})
