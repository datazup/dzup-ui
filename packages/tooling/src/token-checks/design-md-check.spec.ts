/**
 * Tests for the DESIGN.md compliance gate.
 *
 * The pure checks are exercised with fixtures; `runDesignMdCheck` runs against
 * the real committed DESIGN.md (which the test suite keeps fresh) as an
 * integration guard.
 */

import { describe, expect, it } from 'vitest'

import {
  buildContrastPairs,
  checkContrast,
  checkFreshness,
  checkTokenReferences,
  runDesignMdCheck,
} from './design-md-check.js'

describe('checkFreshness', () => {
  it('passes when committed matches the fresh build', () => {
    expect(checkFreshness('same', 'same')).toEqual([])
  })

  it('flags a stale file', () => {
    const issues = checkFreshness('old', 'new')
    expect(issues).toHaveLength(1)
    expect(issues[0]?.check).toBe('freshness')
    expect(issues[0]?.message).toMatch(/stale/)
  })

  it('flags a missing file', () => {
    const issues = checkFreshness(null, 'new')
    expect(issues[0]?.message).toMatch(/missing/)
  })
})

describe('checkTokenReferences', () => {
  const known = new Set(['--dz-primary', '--dz-button-radius', '--dz-button-height'])

  it('accepts a known concrete reference', () => {
    const { issues } = checkTokenReferences('use `--dz-primary` here', known)
    expect(issues).toEqual([])
  })

  it('flags an unknown concrete reference', () => {
    const { issues } = checkTokenReferences('use `--dz-nonsense`', known)
    expect(issues).toHaveLength(1)
    expect(issues[0]?.message).toMatch(/--dz-nonsense/)
  })

  it('accepts a prefix that matches at least one token', () => {
    const { issues } = checkTokenReferences('family `--dz-button-*`', known)
    expect(issues).toEqual([])
  })

  it('flags a prefix that matches nothing', () => {
    const { issues } = checkTokenReferences('family `--dz-ghost-*`', known)
    expect(issues).toHaveLength(1)
    expect(issues[0]?.message).toMatch(/prefix/)
  })

  it('accepts the whole-system `--dz-*` wildcard', () => {
    // `--dz-*` has no alnum after the dash, so it is not captured as a concrete
    // ref; this asserts it never produces a false positive.
    const { issues } = checkTokenReferences('style via `var(--dz-*)`', known)
    expect(issues).toEqual([])
  })

  it('deduplicates repeated references', () => {
    const { refsChecked } = checkTokenReferences('`--dz-primary` `--dz-primary`', known)
    expect(refsChecked).toBe(1)
  })
})

describe('checkContrast', () => {
  const BODY_TEXT = 'WCAG 2.2 AA, 1.4.3 body text'

  it('flags a pair below its minimum', () => {
    // foreground on itself → ratio 1.0, well under AA
    const { issues, pairsChecked } = checkContrast([
      { fg: '--dz-foreground', bg: '--dz-foreground', theme: 'light', min: 4.5, criterion: BODY_TEXT, label: 'self' },
    ])
    expect(pairsChecked).toBe(1)
    expect(issues).toHaveLength(1)
    expect(issues[0]?.check).toBe('contrast')
  })

  it('passes a compliant pair', () => {
    const { issues } = checkContrast([
      { fg: '--dz-foreground', bg: '--dz-background', theme: 'light', min: 4.5, criterion: BODY_TEXT, label: 'body' },
    ])
    expect(issues).toEqual([])
  })

  it('skips roles that are undefined for the theme', () => {
    const { pairsChecked, issues } = checkContrast([
      {
        fg: '--dz-does-not-exist',
        bg: '--dz-background',
        theme: 'light',
        min: 4.5,
        criterion: 'WCAG 2.2 AA, 1.4.3 body text',
        label: 'x',
      },
    ])
    expect(pairsChecked).toBe(0)
    expect(issues).toEqual([])
  })

  it('names both tokens, the theme, both ratios and the criterion when a pair fails', () => {
    // A deliberately-failing fixture: `--dz-warning` is a fill/accent color, so
    // using it as body TEXT on the page fails AA (warning-400 on --dz-background
    // ≈ 2.3:1 in light). This is the misuse rule 1b in CLAUDE.md warns about.
    const { issues } = checkContrast([
      {
        fg: '--dz-warning',
        bg: '--dz-background',
        theme: 'light',
        min: 4.5,
        criterion: 'WCAG 2.2 AA, 1.4.3 body text',
        label: 'warning intent color as body text on the page',
      },
    ])
    expect(issues).toHaveLength(1)
    const message = issues[0]?.message ?? ''
    expect(message).toContain('contrast(light)')
    expect(message).toContain('--dz-warning')
    expect(message).toContain('--dz-background')
    expect(message).toMatch(/= \d\.\d\d:1/) // the measured ratio
    expect(message).toContain('requires 4.5:1')
    expect(message).toContain('1.4.3 body text')
  })
})

describe('buildContrastPairs', () => {
  const pairs = buildContrastPairs()

  it('asserts every advertised pair in both light and dark', () => {
    const light = pairs.filter(p => p.theme === 'light')
    const dark = pairs.filter(p => p.theme === 'dark')
    expect(light.length).toBe(dark.length)
    expect(light.length).toBeGreaterThan(40)
  })

  it('covers every intent family uniformly (a new intent extends the gate)', () => {
    for (const intent of ['primary', 'secondary', 'success', 'warning', 'danger', 'info']) {
      const mutedPair = pairs.find(
        p => p.fg === `--dz-${intent}-muted-foreground` && p.bg === `--dz-${intent}-muted` && p.theme === 'light',
      )
      expect(mutedPair, `${intent} muted pair is gated`).toBeDefined()
    }
  })

  it('covers the bespoke pairs DESIGN.md advertises', () => {
    const has = (fg: string, bg: string): boolean =>
      pairs.some(p => p.fg === fg && p.bg === bg && p.theme === 'light')

    expect(has('--dz-link', '--dz-background')).toBe(true)
    expect(has('--dz-link', '--dz-surface')).toBe(true)
    expect(has('--dz-foreground', '--dz-card')).toBe(true)
    expect(has('--dz-foreground', '--dz-popover')).toBe(true)
    expect(has('--dz-foreground', '--dz-surface')).toBe(true)
    expect(has('--dz-muted-foreground', '--dz-muted')).toBe(true)
  })

  it('gates warning-foreground on the base intent color and both solid fills', () => {
    const warningFills = pairs
      .filter(p => p.fg === '--dz-warning-foreground' && p.theme === 'light')
      .map(p => p.bg)
    // Since TASK-DS-10 normalized `--dz-warning` to shade 400 (5.87:1 under
    // near-black text), the advertised `bg-[var(--dz-warning)]
    // text-[var(--dz-warning-foreground)]` solid fill passes AA and is gated —
    // alongside the `-solid` / `-solid-hover` fills components render.
    expect(warningFills).toContain('--dz-warning')
    expect(warningFills).toContain('--dz-warning-solid')
    expect(warningFills).toContain('--dz-warning-solid-hover')
  })

  it('maps the focus ring to the non-text criterion, not body text', () => {
    const ring = pairs.find(p => p.fg === '--dz-ring' && p.bg === '--dz-background' && p.theme === 'light')
    expect(ring?.min).toBe(3)
    expect(ring?.criterion).toContain('1.4.11')
  })

  it('resolves every gated pair — a typo\'d token name cannot silently skip', () => {
    // checkContrast() skips pairs whose tokens are undefined for the theme. That
    // is correct for genuinely theme-absent roles, but it would also swallow a
    // misspelled token. Assert the whole list resolves.
    const { pairsChecked } = checkContrast(pairs)
    expect(pairsChecked).toBe(pairs.length)
  })

  it('passes cleanly against the real token maps', () => {
    const { issues } = checkContrast(pairs)
    if (issues.length > 0) {
      throw new Error(issues.map(i => i.message).join('\n'))
    }
    expect(issues).toEqual([])
  })
})

describe('runDesignMdCheck (integration)', () => {
  it('passes against the committed DESIGN.md', () => {
    const result = runDesignMdCheck()
    if (!result.ok) {
      // Surface the specific failures if this ever regresses.
      throw new Error(result.issues.map(i => `[${i.check}] ${i.message}`).join('\n'))
    }
    expect(result.ok).toBe(true)
    expect(result.stats.refsChecked).toBeGreaterThan(0)
    expect(result.stats.pairsChecked).toBeGreaterThan(0)
  })
})
