/**
 * Unit cover for the deprecation-record validator (TASK-S2-O2).
 *
 * Every failure mode is asserted by **seeding it** into a throwaway package
 * tree in a temp directory, never against this checkout: a test that asserted
 * the live registry would go red the next time somebody legitimately deprecated
 * something, and a test nobody can keep green gets deleted.
 *
 * The one assertion made against the real repository is the one that has to be:
 * `isAnnotationLine` is fed the actual prose lines at `4e4e46f` that mention
 * the tag without carrying it. The first draft of the scanner counted four of
 * them as annotations — all four in the validator's own source — and would have
 * written four permanent phantom entries into the ledger.
 */

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import {
  checkDeprecations,
  compareVersions,
  isAnnotationLine,
  readRegistry,
  runDeprecationCheck,
  scanAnnotations,
  sourceFiles,
} from './deprecations.ts'

// --- Fixture plumbing -------------------------------------------------------

const made: string[] = []

afterEach(() => {
  for (const dir of made.splice(0))
    rmSync(dir, { recursive: true, force: true })
})

function fixtureRoot(files: Record<string, string>): string {
  const root = mkdtempSync(join(tmpdir(), 'dzup-deprecations-'))
  made.push(root)
  for (const [rel, body] of Object.entries(files)) {
    const full = join(root, rel)
    mkdirSync(dirname(full), { recursive: true })
    writeFileSync(full, body, 'utf8')
  }
  return root
}

const RULES = { annotationWindow: 15, scanGlobs: [] as string[] }

function record(over: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    symbol: 'DzOld',
    package: '@fixture/core',
    kind: 'component',
    annotation: { file: 'packages/core/src/DzOld.ts' },
    replacement: 'DzNew',
    firstDeprecated: '0.1.0',
    earliestRemoval: '0.3.0',
    codemod: null,
    migration: 'rename it',
    runtimeWarning: { status: 'present' },
    rollback: 'keep the old import',
    owner: 'core',
    docs: 'README.md',
    ...over,
  }
}

const ANNOTATED = '/**\n * @deprecated Use DzNew instead.\n */\nexport const DzOld = 1\n'

// --- isAnnotationLine -------------------------------------------------------

describe('isAnnotationLine', () => {
  it('accepts the two JSDoc spellings the repository actually uses', () => {
    expect(isAnnotationLine(' * @deprecated Use DzButton from @dzup-ui/core instead.')).toBe(true)
    expect(isAnnotationLine('  /** @deprecated Use `--dz-sidebar-foreground` instead. */')).toBe(true)
  })

  it('rejects prose that mentions the tag mid-sentence', () => {
    // packages/tokens/src/dtcg.ts:701 and :705 at 4e4e46f, verbatim in shape.
    expect(isAnnotationLine(' * Deprecated ABI names, lifted from the `@deprecated` JSDoc in')).toBe(false)
    expect(isAnnotationLine(' * It *can* fall behind a newly deprecated token — lifting `@deprecated` into')).toBe(false)
  })

  it('rejects a doc comment whose first token is a code span naming the tag', () => {
    // packages/tooling/src/meta/component-meta.ts:95 at 4e4e46f.
    expect(isAnnotationLine('  /** `@deprecated` text when the member carries the tag. */')).toBe(false)
  })

  it('rejects the scanner\'s own source — a regex and a template literal', () => {
    // The four false positives the first draft produced, in their real shapes.
    expect(isAnnotationLine('  return /@deprecated\\b/.test(line)')).toBe(false)
    // This IS the fixture: a verbatim copy of a real source line from
    // deprecations.ts that the first draft misread as an annotation.
    // Interpolating it would destroy the thing under test.
    // eslint-disable-next-line no-template-curly-in-string -- verbatim fixture, see above
    expect(isAnnotationLine('    detail: `no \\`@deprecated\\` annotation in ${file}`,')).toBe(false)
  })
})

// --- compareVersions --------------------------------------------------------

describe('compareVersions', () => {
  it('orders the 0.x line', () => {
    expect(compareVersions('0.2.0', '0.3.0')).toBeLessThan(0)
    expect(compareVersions('0.3.0', '0.2.0')).toBeGreaterThan(0)
    expect(compareVersions('0.2.0', '0.2.0')).toBe(0)
  })

  it('puts a prerelease BEFORE the release it precedes', () => {
    // Every unpublished package here is on an `-alpha.0` tail; if this
    // inverted, `removal-overdue` would fire on packages that never had a
    // removal window at all.
    expect(compareVersions('0.1.0-alpha.0', '0.1.0')).toBeLessThan(0)
    expect(compareVersions('0.1.0', '0.1.0-alpha.0')).toBeGreaterThan(0)
    expect(compareVersions('0.1.0-alpha.0', '0.1.0-alpha.1')).toBeLessThan(0)
  })
})

// --- The four failure modes, each seeded ------------------------------------

describe('checkDeprecations — seeded failures', () => {
  it('is clear when an annotation and its record agree', () => {
    const root = fixtureRoot({ 'packages/core/src/DzOld.ts': ANNOTATED })
    const report = checkDeprecations(
      { $schemaVersion: '1.0.0', $rules: RULES, records: [record()] } as never,
      scanAnnotations(root, ['packages/core/src/DzOld.ts']),
      { '@fixture/core': '0.2.0' },
      root,
    )
    expect(report.violations).toEqual([])
    expect(report.withRecord).toBe(1)
    expect(report.withoutRecord).toBe(0)
  })

  it('1 — fires `annotated-without-record` on a tag no record claims', () => {
    const root = fixtureRoot({ 'packages/core/src/DzOld.ts': ANNOTATED })
    const report = checkDeprecations(
      { $schemaVersion: '1.0.0', $rules: RULES, records: [] } as never,
      scanAnnotations(root, ['packages/core/src/DzOld.ts']),
      { '@fixture/core': '0.2.0' },
      root,
    )
    expect(report.withoutRecord).toBe(1)
    expect(report.violations.map(v => v.rule)).toContain('annotated-without-record')
  })

  it('2 — fires `record-without-annotation` when the tag is gone', () => {
    const root = fixtureRoot({ 'packages/core/src/DzOld.ts': 'export const DzOld = 1\n' })
    const report = checkDeprecations(
      { $schemaVersion: '1.0.0', $rules: RULES, records: [record()] } as never,
      scanAnnotations(root, ['packages/core/src/DzOld.ts']),
      { '@fixture/core': '0.2.0' },
      root,
    )
    expect(report.violations.map(v => v.rule)).toContain('record-without-annotation')
  })

  it('3 — fires `removal-overdue` once the window has closed', () => {
    const root = fixtureRoot({ 'packages/core/src/DzOld.ts': ANNOTATED })
    const report = checkDeprecations(
      { $schemaVersion: '1.0.0', $rules: RULES, records: [record({ earliestRemoval: '0.2.0' })] } as never,
      scanAnnotations(root, ['packages/core/src/DzOld.ts']),
      { '@fixture/core': '0.2.0' },
      root,
    )
    const overdue = report.violations.find(v => v.rule === 'removal-overdue')
    expect(overdue?.detail).toContain('0.2.0')
  })

  it('3b — does NOT fire while the window is still open', () => {
    const root = fixtureRoot({ 'packages/core/src/DzOld.ts': ANNOTATED })
    const report = checkDeprecations(
      { $schemaVersion: '1.0.0', $rules: RULES, records: [record({ earliestRemoval: '0.3.0' })] } as never,
      scanAnnotations(root, ['packages/core/src/DzOld.ts']),
      { '@fixture/core': '0.2.0' },
      root,
    )
    expect(report.violations.map(v => v.rule)).not.toContain('removal-overdue')
  })

  it('4 — fires `missing-codemod` on an id with no transform behind it', () => {
    const root = fixtureRoot({ 'packages/core/src/DzOld.ts': ANNOTATED })
    const report = checkDeprecations(
      { $schemaVersion: '1.0.0', $rules: RULES, records: [record({ codemod: 'no-such-transform', migration: undefined })] } as never,
      scanAnnotations(root, ['packages/core/src/DzOld.ts']),
      { '@fixture/core': '0.2.0' },
      root,
    )
    expect(report.violations.map(v => v.rule)).toContain('missing-codemod')
  })

  it('requires written instructions when there is no codemod', () => {
    const root = fixtureRoot({ 'packages/core/src/DzOld.ts': ANNOTATED })
    const report = checkDeprecations(
      { $schemaVersion: '1.0.0', $rules: RULES, records: [record({ codemod: null, migration: undefined })] } as never,
      scanAnnotations(root, ['packages/core/src/DzOld.ts']),
      { '@fixture/core': '0.2.0' },
      root,
    )
    expect(report.violations.some(v => v.rule === 'schema' && v.detail.includes('migration'))).toBe(true)
  })

  it('requires a reason when the runtime warning is absent — doc 06 says "when practical"', () => {
    const root = fixtureRoot({ 'packages/core/src/DzOld.ts': ANNOTATED })
    const report = checkDeprecations(
      { $schemaVersion: '1.0.0', $rules: RULES, records: [record({ runtimeWarning: { status: 'absent' } })] } as never,
      scanAnnotations(root, ['packages/core/src/DzOld.ts']),
      { '@fixture/core': '0.2.0' },
      root,
    )
    expect(report.violations.some(v => v.rule === 'schema' && v.detail.includes('runtimeWarning'))).toBe(true)
  })

  it('demands an `anchor` when one file carries two tags, and resolves them apart when it has one', () => {
    const twoTags = [
      'export const tokens = {',
      '  /** @deprecated Use `--a-new` instead. */',
      '  \'--a-old\': \'var(--a-new)\',',
      '  /** @deprecated Use `--b-new` instead. */',
      '  \'--b-old\': \'var(--b-new)\',',
      '}',
      '',
    ].join('\n')
    const root = fixtureRoot({ 'packages/core/src/tokens.ts': twoTags })
    const annotations = scanAnnotations(root, ['packages/core/src/tokens.ts'])
    expect(annotations).toHaveLength(2)

    const ambiguous = checkDeprecations(
      { $schemaVersion: '1.0.0', $rules: RULES, records: [record({ symbol: '--a-old', annotation: { file: 'packages/core/src/tokens.ts' } })] } as never,
      annotations,
      { '@fixture/core': '0.2.0' },
      root,
    )
    expect(ambiguous.violations.map(v => v.rule)).toContain('ambiguous-annotation')

    const anchored = checkDeprecations(
      {
        $schemaVersion: '1.0.0',
        $rules: RULES,
        records: [
          record({ symbol: '--a-old', annotation: { file: 'packages/core/src/tokens.ts', anchor: '\'--a-old\':' } }),
          record({ symbol: '--b-old', annotation: { file: 'packages/core/src/tokens.ts', anchor: '\'--b-old\':' } }),
        ],
      } as never,
      annotations,
      { '@fixture/core': '0.2.0' },
      root,
    )
    expect(anchored.violations).toEqual([])
    expect(anchored.withRecord).toBe(2)
  })
})

// --- The live repository ----------------------------------------------------

describe('the repository at HEAD', () => {
  it('scans real source and finds no unrecorded annotation', () => {
    const report = runDeprecationCheck()
    expect(report.withoutRecord).toBe(0)
    expect(report.annotations).toBe(report.withRecord)
  })

  it('has one record per annotation and no orphan records', () => {
    const registry = readRegistry()
    const report = runDeprecationCheck()
    expect(report.records).toBe(registry.records.length)
    expect(report.violations).toEqual([])
  })

  it('walks real package sources without reaching build output or fixtures', () => {
    const files = sourceFiles()
    expect(files.length).toBeGreaterThan(100)
    expect(files.some(f => f.includes('/dist/'))).toBe(false)
    expect(files.some(f => f.includes('node_modules'))).toBe(false)
    expect(files.some(f => f.includes('__fixtures__'))).toBe(false)
  })
})
