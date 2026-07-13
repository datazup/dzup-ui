/**
 * Tests for the OKLCH → sRGB → WCAG contrast helpers.
 */

import { describe, expect, it } from 'vitest'

import {
  contrastRatio,
  oklchToLinearRgb,
  parseOklch,
  relativeLuminance,
} from './oklch-contrast.js'

describe('parseOklch', () => {
  it('parses `oklch(L C H)`', () => {
    expect(parseOklch('oklch(0.55 0.22 260)')).toEqual({ l: 0.55, c: 0.22, h: 260 })
  })

  it('parses a percentage lightness', () => {
    expect(parseOklch('oklch(55% 0.22 260)')?.l).toBeCloseTo(0.55, 5)
  })

  it('ignores a trailing alpha component', () => {
    expect(parseOklch('oklch(0 0 0 / 0.6)')).toEqual({ l: 0, c: 0, h: 0 })
  })

  it('returns null for non-oklch input', () => {
    expect(parseOklch('#ffffff')).toBeNull()
    expect(parseOklch('rgb(0 0 0)')).toBeNull()
  })
})

describe('oklchToLinearRgb', () => {
  it('maps white to ~1 on every channel', () => {
    const { r, g, b } = oklchToLinearRgb({ l: 1, c: 0, h: 0 })
    expect(r).toBeCloseTo(1, 2)
    expect(g).toBeCloseTo(1, 2)
    expect(b).toBeCloseTo(1, 2)
  })

  it('maps black to 0 on every channel', () => {
    const { r, g, b } = oklchToLinearRgb({ l: 0, c: 0, h: 0 })
    expect(r).toBeCloseTo(0, 5)
    expect(g).toBeCloseTo(0, 5)
    expect(b).toBeCloseTo(0, 5)
  })

  it('clamps out-of-gamut channels into 0–1', () => {
    const { r, g, b } = oklchToLinearRgb({ l: 0.7, c: 0.37, h: 25 })
    for (const ch of [r, g, b]) {
      expect(ch).toBeGreaterThanOrEqual(0)
      expect(ch).toBeLessThanOrEqual(1)
    }
  })
})

describe('relativeLuminance', () => {
  it('is ~1 for white and ~0 for black', () => {
    expect(relativeLuminance('oklch(1 0 0)')).toBeCloseTo(1, 2)
    expect(relativeLuminance('oklch(0 0 0)')).toBeCloseTo(0, 5)
  })

  it('returns null for unparseable input', () => {
    expect(relativeLuminance('nope')).toBeNull()
  })
})

describe('contrastRatio', () => {
  it('is 21 for black on white', () => {
    expect(contrastRatio('oklch(1 0 0)', 'oklch(0 0 0)')).toBeCloseTo(21, 1)
  })

  it('is 1 for identical colors', () => {
    expect(contrastRatio('oklch(0.55 0.22 260)', 'oklch(0.55 0.22 260)')).toBeCloseTo(1, 5)
  })

  it('is symmetric', () => {
    const a = contrastRatio('oklch(0.93 0.002 260)', 'oklch(0.23 0.005 260)')
    const b = contrastRatio('oklch(0.23 0.005 260)', 'oklch(0.93 0.002 260)')
    expect(a).toBeCloseTo(b as number, 10)
  })

  it('returns null when either color is unparseable', () => {
    expect(contrastRatio('oklch(1 0 0)', 'garbage')).toBeNull()
  })
})
