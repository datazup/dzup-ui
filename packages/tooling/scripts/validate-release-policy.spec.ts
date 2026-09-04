import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  changelogCoveredPackages,
  changelogHeadingWouldPass,
  checkReleasePolicy,
  collectChangesets,
  collectWorkspacePackages,
  isZeroVersion,
  parseChangeset,
} from './validate-release-policy.ts'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../')

describe('parseChangeset', () => {
  it('reads the package/level pairs a changeset declares', () => {
    const record = parseChangeset('x.md', '---\n"@dzup-ui/core": minor\n"@dzup-ui/nuxt": patch\n---\n\nbody')
    expect(record.releases).toEqual([
      { name: '@dzup-ui/core', level: 'minor' },
      { name: '@dzup-ui/nuxt', level: 'patch' },
    ])
    expect(record.malformed).toBeUndefined()
  })

  it('accepts unquoted and single-quoted names, which changesets also accepts', () => {
    expect(parseChangeset('x.md', '---\n\'@dzup-ui/core\': patch\n---\n').releases)
      .toEqual([{ name: '@dzup-ui/core', level: 'patch' }])
  })

  it('reports a changeset with no frontmatter rather than reading it as empty', () => {
    // An empty release list and a missing block must not look the same: one is a
    // lost edit, the other is a malformed file.
    expect(parseChangeset('x.md', 'just prose').malformed).toBe('no `---` frontmatter block')
  })

  it('reports an empty frontmatter block as naming no package', () => {
    const record = parseChangeset('x.md', '---\n\n---\n\nbody')
    expect(record.malformed).toBeUndefined()
    expect(record.releases).toEqual([])
  })
})

describe('isZeroVersion', () => {
  it('is the whole reason the policy shifts a level', () => {
    expect(isZeroVersion('0.2.0')).toBe(true)
    expect(isZeroVersion('0.1.0-alpha.0')).toBe(true)
    expect(isZeroVersion('1.0.0')).toBe(false)
    expect(isZeroVersion('10.0.0')).toBe(false)
  })
})

describe('changelogHeadingWouldPass', () => {
  it('rejects the heading `changeset version` actually writes', () => {
    // This is the finding, not a hypothetical: packages/mcp/CHANGELOG.md is in
    // this shape today and passes CI only because validate:changelog does not
    // list the package.
    expect(changelogHeadingWouldPass('# @dzup-ui/mcp\n\n## 0.2.0\n')).toBe(false)
  })

  it('accepts the hand-dated heading the other seven packages carry', () => {
    expect(changelogHeadingWouldPass('# @dzup-ui/core\n\n## 0.2.0 (2026-08-10)\n')).toBe(true)
  })

  it('has no opinion about a changelog with no version heading at all', () => {
    expect(changelogHeadingWouldPass('# @dzup-ui/new\n\nNothing released yet.\n')).toBeUndefined()
  })
})

describe('changelogCoveredPackages', () => {
  it('reads the hand-typed list out of validate-changelog.ts as data', () => {
    const source = readFileSync(resolve(ROOT, 'packages/tooling/scripts/validate-changelog.ts'), 'utf8')
    const covered = changelogCoveredPackages(source)
    expect(covered).toContain('@dzup-ui/core')
    // The omission the exemption ledger records.
    expect(covered).not.toContain('@dzup-ui/mcp')
  })
})

describe('collectWorkspacePackages', () => {
  const packages = collectWorkspacePackages()

  it('finds packages under both workspace globs, not just packages/', () => {
    const names = packages.map(p => p.name)
    expect(names).toContain('@dzup-ui/core')
    // apps/docs is the package the changesets config had never heard of.
    expect(names).toContain('@dzup-ui/docs')
  })

  it('records the private flag, which is what keeps an app out of a release plan', () => {
    expect(packages.find(p => p.name === '@dzup-ui/landing')?.private).toBe(true)
    expect(packages.find(p => p.name === '@dzup-ui/core')?.private).toBe(false)
  })
})

describe('the committed release machinery', () => {
  it('has no policy violations', () => {
    // checkReleasePolicy only — `changeset status` is spawned by the CLI entry
    // point and is not run from a unit test.
    const violations = checkReleasePolicy()
    expect(violations.map(v => `[${v.rule}] ${v.message}`)).toEqual([])
  })

  it('carries pending changesets, every one of which names a real package', () => {
    const changesets = collectChangesets()
    expect(changesets.length).toBeGreaterThan(0)
    const known = new Set(collectWorkspacePackages().map(p => p.name))
    for (const cs of changesets) {
      for (const release of cs.releases)
        expect(known, `${cs.file} names ${release.name}`).toContain(release.name)
    }
  })

  it('declares no `major`, which before 1.0 would be the 1.0 release', () => {
    for (const cs of collectChangesets()) {
      for (const release of cs.releases)
        expect(release.level, cs.file).not.toBe('major')
    }
  })
})
