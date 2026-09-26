/**
 * Unit cover for `release:publish` (DZUP-UI-PUBLISH-PATH-20260925-R1).
 *
 * The two defects this tool replaces were both about WHAT gets uploaded and
 * HOW: `changeset publish` would have shipped `workspace:*` ranges and two
 * withheld packages. The pins below are the properties that stop either from
 * coming back: the command is always `yarn npm publish` (the protocol-rewriting
 * packer), the inventory is the policy list and nothing else, and the order
 * puts every dependency on the registry before its dependant.
 */

import type { PublishCandidate } from './publish.ts'
import { describe, expect, it } from 'vitest'
import { publishedPackages } from './pack.ts'
import { assertPublishable, parseArgs, publishCommand, publishOrder } from './publish.ts'

const pkg = (name: string, manifest: PublishCandidate['manifest'] = {}): PublishCandidate => ({ name, manifest })

describe('publishOrder', () => {
  it('puts every dependency before its dependant, keeping policy order for ties', () => {
    const order = publishOrder([
      pkg('@dzup-ui/contracts'),
      pkg('@dzup-ui/core', { dependencies: { '@dzup-ui/contracts': 'workspace:*', '@dzup-ui/tokens': 'workspace:*', 'clsx': '^2' } }),
      pkg('@dzup-ui/mcp'),
      pkg('@dzup-ui/nuxt', { peerDependencies: { '@dzup-ui/core': 'workspace:*' } }),
      pkg('@dzup-ui/testing'),
      pkg('@dzup-ui/tokens'),
    ])
    expect(order).toEqual(['@dzup-ui/contracts', '@dzup-ui/mcp', '@dzup-ui/testing', '@dzup-ui/tokens', '@dzup-ui/core', '@dzup-ui/nuxt'])
  })

  it('ignores dependencies outside the candidate set, including withheld siblings', () => {
    const order = publishOrder([pkg('a', { dependencies: { '@dzup-ui/compat': 'workspace:*' } }), pkg('b')])
    expect(order).toEqual(['a', 'b'])
  })

  it('refuses a cycle rather than picking an order', () => {
    expect(() => publishOrder([
      pkg('a', { dependencies: { b: '1' } }),
      pkg('b', { optionalDependencies: { a: '1' } }),
    ])).toThrow(/dependency cycle among a, b/)
  })
})

describe('assertPublishable', () => {
  it('refuses a published package marked private', () => {
    expect(() => assertPublishable([pkg('a'), pkg('b', { private: true })])).toThrow(/b as published, but package.json says private: true/)
  })
})

describe('publishCommand', () => {
  it('always goes through yarn npm publish, public and re-run safe', () => {
    expect(publishCommand('@dzup-ui/core', { dryRun: false, provenance: false, tag: null }))
      .toEqual(['workspace', '@dzup-ui/core', 'npm', 'publish', '--access', 'public', '--tolerate-republish'])
  })

  it('passes tag and provenance through, and drops provenance on a dry run', () => {
    expect(publishCommand('x', { dryRun: false, provenance: true, tag: 'alpha' }).slice(-3)).toEqual(['--tag', 'alpha', '--provenance'])
    expect(publishCommand('x', { dryRun: true, provenance: true, tag: null })).not.toContain('--provenance')
  })
})

describe('parseArgs', () => {
  it('reads the three options and refuses anything else', () => {
    expect(parseArgs(['--dry-run', '--tag', 'rc', '--provenance'])).toEqual({ dryRun: true, provenance: true, tag: 'rc' })
    expect(() => parseArgs(['--tag'])).toThrow(/--tag/)
    expect(() => parseArgs(['--access', 'restricted'])).toThrow(/--access/)
  })
})

describe('the live inventory', () => {
  it('is the policy published list — the withheld packages are never candidates', () => {
    const names = publishedPackages().map(p => p.name)
    expect(names).not.toContain('@dzup-ui/compat')
    // N5-01-D2 (2026-09-26): codemods is released, compat stays withheld.
    expect(names).toContain('@dzup-ui/codemods')
    expect(names).toContain('@dzup-ui/core')
  })
})
