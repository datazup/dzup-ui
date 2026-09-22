/**
 * Unit tests for the vendor sublayer registry gate (TASK-R5-O1, ADR-19 §2/§3).
 *
 * The registry ships EMPTY, so a run against the real stylesheets proves only
 * that nothing is wrong today. These tests are what prove the gate would fire —
 * an empty ledger with an unexercised validator behind it is a document, not a
 * contract, and this file is the difference.
 */

import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { checkVendorSublayers, vendorSelectorsIn } from './vendor-sublayers.ts'

/** Write `css` into a throwaway root and check it against `entries`. */
function check(css: string, entries: NonNullable<Parameters<typeof checkVendorSublayers>[0]>['entries']) {
  const root = mkdtempSync(join(tmpdir(), 'dzup-vendor-'))
  writeFileSync(join(root, 'sheet.css'), css, 'utf8')
  return checkVendorSublayers({ entries }, ['sheet.css'], root)
}

describe('vendorSelectorsIn', () => {
  it('finds a selector that reaches into a vendor DOM', () => {
    expect(vendorSelectorsIn('[data-reka-collapsible-content] { display: block }'))
      .toEqual([{ vendor: 'reka', selector: '[data-reka-collapsible-content]' }])
  })

  it('does NOT match a vendor custom property the library merely reads', () => {
    // base.css does exactly this today. Matching it would put the first entry
    // in an empty registry there for the wrong reason.
    expect(vendorSelectorsIn('.dz-accordion-content { height: var(--reka-accordion-content-height) }'))
      .toEqual([])
  })

  it('does not read a selector quoted inside a comment as a rule', () => {
    expect(vendorSelectorsIn('/* never write [data-reka-x] here */ .dz-x { color: red }'))
      .toEqual([])
  })
})

describe('checkVendorSublayers', () => {
  it('passes on library CSS with no vendor selector and an empty registry', () => {
    expect(check('.dz-panel { color: var(--dz-foreground) }', []).violations).toEqual([])
  })

  it('fails an unregistered vendor selector — the rule an empty registry exists for', () => {
    const report = check('@layer dz-components { [data-reka-content-state=open] { opacity: 1 } }', [])
    expect(report.violations).toHaveLength(1)
    expect(report.violations[0]?.rule).toBe('unregistered-selector')
    expect(report.violations[0]?.message).toContain('[data-reka-content-state=open]')
  })

  it('passes the same selector once it is registered with all four fields', () => {
    const report = check('[data-reka-content-state=open] { opacity: 1 }', [{
      selector: '[data-reka-content-state=open]',
      owner: 'core/overlays',
      reason: 'Reka drives the open transition and exposes no class of its own.',
      exit: '2026-12-01',
      layer: 'dz-components',
    }])
    expect(report.violations).toEqual([])
  })

  it('fails an entry missing an owner or an exit condition', () => {
    const report = check('[data-reka-x] { opacity: 1 }', [
      { selector: '[data-reka-x]', owner: '', reason: 'because', exit: '2026-12-01' },
    ])
    expect(report.violations.map(v => v.rule)).toEqual(['incomplete-entry'])
    expect(report.violations[0]?.message).toContain('owner')
  })

  it('fails an exit condition nobody can evaluate', () => {
    const report = check('[data-reka-x] { opacity: 1 }', [
      { selector: '[data-reka-x]', owner: 'core', reason: 'because', exit: 'later' },
    ])
    expect(report.violations.map(v => v.rule)).toContain('incomplete-entry')
  })

  it('fails a layer name outside the six ADR-19 slots', () => {
    const report = check('[data-reka-x] { opacity: 1 }', [
      { selector: '[data-reka-x]', owner: 'core', reason: 'because', exit: '2026-12-01', layer: 'dz-vendor' },
    ])
    expect(report.violations.map(v => v.rule)).toContain('incomplete-entry')
  })

  it('fails an entry whose rule has already been deleted', () => {
    const report = check('.dz-panel { color: red }', [
      { selector: '[data-reka-gone]', owner: 'core', reason: 'was needed once', exit: '2026-12-01' },
    ])
    expect(report.violations.map(v => v.rule)).toEqual(['stale-entry'])
  })

  it('accepts a named event as an exit condition', () => {
    const report = check('[data-reka-x] { opacity: 1 }', [
      { selector: '[data-reka-x]', owner: 'core', reason: 'because', exit: 'reka-ui 3.0 upgrade' },
    ])
    expect(report.violations).toEqual([])
  })
})
