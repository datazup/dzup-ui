/**
 * Tests for the intent-text contrast gate.
 *
 * The scanner runs against fixture directories for deterministic assertions,
 * plus one integration pass over the real component tree (which must be clean).
 */

import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

import { findIntentTextViolations } from './intent-text-contrast.js'

/** Write a one-file fixture component tree and return its directory. */
function fixture(filename: string, contents: string): string {
  const dir = mkdtempSync(resolve(tmpdir(), 'dz-intent-'))
  writeFileSync(resolve(dir, filename), contents, 'utf-8')
  return dir
}

describe('findIntentTextViolations', () => {
  it('flags intent text on the same intent\'s muted fill', () => {
    const dir = fixture(
      'DzThing.variants.ts',
      `class: 'bg-[var(--dz-success-muted)] text-[var(--dz-success)]',`,
    )
    const violations = findIntentTextViolations(dir)
    expect(violations).toHaveLength(1)
    expect(violations[0]?.intent).toBe('success')
    expect(violations[0]?.line).toBe(1)
  })

  it('flags the pair in either order', () => {
    const dir = fixture(
      'DzThing.variants.ts',
      `class: 'text-[var(--dz-danger)] hover:bg-[var(--dz-danger-muted)]',`,
    )
    expect(findIntentTextViolations(dir)).toHaveLength(1)
  })

  it('flags a state-prefixed pair', () => {
    const dir = fixture(
      'DzThing.variants.ts',
      `'data-[state=checked]:bg-[var(--dz-primary-muted)] data-[state=checked]:text-[var(--dz-primary)]',`,
    )
    expect(findIntentTextViolations(dir)).toHaveLength(1)
  })

  it('accepts the readable token on the muted fill', () => {
    const dir = fixture(
      'DzThing.variants.ts',
      `class: 'bg-[var(--dz-success-muted)] text-[var(--dz-success-muted-foreground)]',`,
    )
    expect(findIntentTextViolations(dir)).toEqual([])
  })

  it('accepts intent as a fill or a border', () => {
    const dir = fixture(
      'DzThing.variants.ts',
      [
        `class: 'bg-[var(--dz-primary)] text-[var(--dz-primary-foreground)]',`,
        `class: 'border-[var(--dz-danger)] text-[var(--dz-danger-muted-foreground)]',`,
      ].join('\n'),
    )
    expect(findIntentTextViolations(dir)).toEqual([])
  })

  it('does not cross intents — `primary` text on a `success` fill is a different bug', () => {
    const dir = fixture(
      'DzThing.variants.ts',
      `class: 'bg-[var(--dz-success-muted)] text-[var(--dz-primary)]',`,
    )
    expect(findIntentTextViolations(dir)).toEqual([])
  })

  it('does not match across a quote boundary (two unrelated class strings)', () => {
    const dir = fixture(
      'DzThing.variants.ts',
      `{ a: 'bg-[var(--dz-info-muted)]', b: 'text-[var(--dz-info)]' },`,
    )
    expect(findIntentTextViolations(dir)).toEqual([])
  })

  it('scans .vue files too, not just .variants.ts', () => {
    const dir = fixture(
      'DzThing.vue',
      `active ? 'bg-[var(--dz-primary-muted)] text-[var(--dz-primary)]' : '',`,
    )
    expect(findIntentTextViolations(dir)).toHaveLength(1)
  })
})

describe('intent-text contrast (integration)', () => {
  it('the real component tree renders no sub-AA intent text', () => {
    const violations = findIntentTextViolations()
    if (violations.length > 0) {
      throw new Error(
        violations.map(v => `${v.file}:${v.line} — ${v.intent}: ${v.snippet}`).join('\n'),
      )
    }
    expect(violations).toEqual([])
  })
})
