import type { RetiredNamesConfig } from './validate-package-names.ts'
import { describe, expect, it } from 'vitest'
import {
  checkPackageNames,
  checkSource,
  isAllowlisted,
  matchesGlob,
  readConfig,
} from './validate-package-names.ts'

const config: RetiredNamesConfig = {
  retired: [{ name: '@dzup-ui/pro', replacement: '@dzup-ui-pro/pro' }],
  allowlist: ['CHANGELOG.md', '**/CHANGELOG.md', '.changeset/**', 'docs/**/ADR-*'],
  escapeMarker: 'retired-name-ok',
}

describe('matchesGlob', () => {
  it('matches a literal path', () => {
    expect(matchesGlob('CHANGELOG.md', 'CHANGELOG.md')).toBe(true)
    expect(matchesGlob('docs/CHANGELOG.md', 'CHANGELOG.md')).toBe(false)
  })

  it('lets `**/` span zero or more segments', () => {
    expect(matchesGlob('CHANGELOG.md', '**/CHANGELOG.md')).toBe(true)
    expect(matchesGlob('packages/nuxt/CHANGELOG.md', '**/CHANGELOG.md')).toBe(true)
    expect(matchesGlob('packages/nuxt/README.md', '**/CHANGELOG.md')).toBe(false)
  })

  it('lets a trailing `**` match the rest of the path', () => {
    expect(matchesGlob('.changeset/tidy-pandas-sing.md', '.changeset/**')).toBe(true)
    expect(matchesGlob('.changeset/nested/x.md', '.changeset/**')).toBe(true)
    expect(matchesGlob('.changesetX/x.md', '.changeset/**')).toBe(false)
  })

  it('keeps a single `*` inside one segment', () => {
    expect(matchesGlob('docs/adr/ADR-04-tokens.md', 'docs/**/ADR-*')).toBe(true)
    expect(matchesGlob('docs/adr/nested/ADR-04.md', 'docs/**/ADR-*')).toBe(true)
    expect(matchesGlob('docs/adr/ADR-04/deep.md', 'docs/**/ADR-*')).toBe(false)
  })

  it('does not treat a dot as a wildcard — an over-matching allowlist is the worst failure here', () => {
    expect(matchesGlob('CHANGELOGxmd', 'CHANGELOG.md')).toBe(false)
    expect(matchesGlob('packages/core/src/resolver.ts', 'CHANGELOG.md')).toBe(false)
    expect(matchesGlob('packages/core/src/resolver.ts', '**/dist/**')).toBe(false)
  })
})

describe('isAllowlisted', () => {
  it('allows history and nothing else', () => {
    expect(isAllowlisted('packages/nuxt/CHANGELOG.md', config.allowlist)).toBe(true)
    expect(isAllowlisted('.changeset/x.md', config.allowlist)).toBe(true)
    expect(isAllowlisted('packages/core/src/resolver.ts', config.allowlist)).toBe(false)
  })
})

describe('checkSource', () => {
  it('reports a retired name', () => {
    const violations = checkSource('a.ts', `from '@dzup-ui/pro'`, config)
    expect(violations).toHaveLength(1)
    expect(violations[0]).toMatchObject({ line: 1, name: '@dzup-ui/pro', replacement: '@dzup-ui-pro/pro' })
  })

  it('does not report the replacement name', () => {
    expect(checkSource('a.ts', `from '@dzup-ui-pro/pro'`, config)).toEqual([])
  })

  it('does not report a longer package name that merely starts the same way', () => {
    // `@dzup-ui/pro-components` is a different legacy package, and the codemod
    // has to keep naming it in order to rewrite it.
    expect(checkSource('a.ts', `'@dzup-ui/pro-components'`, config)).toEqual([])
  })

  it('reports the retired name when a line holds both forms', () => {
    const violations = checkSource('a.ts', `['@dzup-ui/pro-components', '@dzup-ui/pro']`, config)
    expect(violations).toHaveLength(1)
  })

  it('honours an escape marker on the same line', () => {
    const source = `expect(from).not.toBe('@dzup-ui/pro') // retired-name-ok: asserts it is never emitted`
    expect(checkSource('a.spec.ts', source, config)).toEqual([])
  })

  it('honours an escape marker on the line above, which is what makes Markdown workable', () => {
    const source = [
      '<!-- retired-name-ok: migration note -->',
      'Until 2026-08-20 the module named `@dzup-ui/pro`.',
    ].join('\n')
    expect(checkSource('a.md', source, config)).toEqual([])
  })

  it('does not let one escaped line excuse the next one', () => {
    const source = [
      '// retired-name-ok: explains the rename',
      `const a = '@dzup-ui/pro'`,
      `const b = '@dzup-ui/pro'`,
    ].join('\n')
    const violations = checkSource('a.ts', source, config)
    expect(violations.map(violation => violation.line)).toEqual([3])
  })

  it('reports the line number and the offending text so the fix is obvious', () => {
    const source = ['const x = 1', '', `import '@dzup-ui/pro'`].join('\n')
    expect(checkSource('a.ts', source, config)[0]).toMatchObject({
      line: 3,
      text: `import '@dzup-ui/pro'`,
    })
  })
})

describe('the checked-in configuration', () => {
  it('retires the package name the Nuxt module and resolver used to emit', () => {
    const retired = readConfig().retired
    expect(retired.map(entry => entry.name)).toContain('@dzup-ui/pro')
    expect(retired.find(entry => entry.name === '@dzup-ui/pro')?.replacement).toBe('@dzup-ui-pro/pro')
  })

  it('says why each name was retired, so the allowlist is reviewable', () => {
    for (const retired of readConfig().retired)
      expect(retired.reason, retired.name).toBeTruthy()
  })
})

describe('the repository', () => {
  it('names no retired package outside history', () => {
    const violations = checkPackageNames()
    const report = violations.map(v => `${v.file}:${v.line} ${v.text}`).join('\n')
    expect(violations, report).toEqual([])
  })
})
