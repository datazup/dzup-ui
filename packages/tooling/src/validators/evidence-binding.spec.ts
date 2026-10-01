/**
 * Unit cover for the evidence-binding gate (TASK-S0-O1).
 *
 * The rules are asserted against a **real throwaway git repository** built in a
 * temp directory, not against this checkout: the whole point of the gate is an
 * ordering relation between commits, and a fixture that fakes git would assert
 * the fake. The repository is three commits long, which is enough to express
 * every case — stamped-and-current, stamped-before-an-input-moved, stamped on a
 * branch this history does not contain, and a chain out of order.
 *
 * The case that matters most is the **last** one in `checkEvidenceBinding`:
 * an artifact stamped at `HEAD~1` while `HEAD` touched only *outputs* must pass.
 * That is the exact state the owner's regeneration commit produces, and it is
 * the state a `sourceCommit === HEAD` check calls red. If that test ever fails,
 * this gate has regressed into the unsatisfiable one it replaced.
 */

import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import {
  checkEvidenceBinding,
  isAncestorOrSame,
  normaliseInput,
  readConfig,
  readStamp,
  toPathspec,
} from './evidence-binding.ts'

describe('normaliseInput', () => {
  it('drops the `#fragment` that narrows a claim to one key', () => {
    expect(normaliseInput('packages/core/package.json#exports')).toBe('packages/core/package.json')
  })

  it('drops the trailing `(report)` annotation', () => {
    expect(normaliseInput('packages/tooling/src/validators/story-dod.ts (report)'))
      .toBe('packages/tooling/src/validators/story-dod.ts')
  })

  it('leaves an ordinary glob exactly as the artifact wrote it', () => {
    expect(normaliseInput('packages/core/src/**/*.vue')).toBe('packages/core/src/**/*.vue')
  })
})

describe('toPathspec', () => {
  it('asks git for glob matching, so this repository grows no second matcher', () => {
    expect(toPathspec('packages/core/src/**/*.vue')).toBe(':(glob)packages/core/src/**/*.vue')
  })
})

describe('readConfig', () => {
  it('reads the committed config and governs the four named artifacts', () => {
    const config = readConfig()
    expect(config.artifacts.map(a => a.path)).toEqual([
      'packages/core/manifests/component-ownership.manifest.json',
      'packages/core/docs/quality-matrix.json',
      'packages/core/docs/capability-matrix.json',
      'packages/core/docs/component-meta.json',
    ])
    expect(config.generatedOutputs).toContain('packages/core/docs/quality-matrix.json')
  })
})

describe('readStamp', () => {
  it('returns undefined rather than throwing for a path that is not there', () => {
    expect(readStamp('packages/core/docs/does-not-exist.json')).toBeUndefined()
  })
})

describe('checkEvidenceBinding against a real repository', () => {
  let root: string
  let first: string
  let second: string
  let third: string

  const artifact = 'artifacts/matrix.json'
  const upstream = 'artifacts/manifest.json'

  function git(...args: string[]): string {
    return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim()
  }

  function write(path: string, body: string): void {
    const full = join(root, path)
    mkdirSync(dirname(full), { recursive: true })
    writeFileSync(full, body)
  }

  function stamp(path: string, sourceCommit: string, generatedFrom: string[]): void {
    write(path, `${JSON.stringify({ sourceCommit, generatedFrom }, null, 2)}\n`)
  }

  function commit(message: string): string {
    git('add', '-A')
    git('-c', 'user.email=t@t', '-c', 'user.name=t', 'commit', '-q', '-m', message)
    return git('rev-parse', 'HEAD')
  }

  const config = {
    artifacts: [
      { path: upstream, generator: 'yarn generate:manifest', order: 1 },
      { path: artifact, generator: 'yarn generate:matrix', order: 2 },
    ],
    generatedOutputs: [upstream, artifact, 'site/**'],
  }

  beforeAll(() => {
    root = mkdtempSync(join(tmpdir(), 'dzup-binding-'))
    git('init', '-q', '-b', 'main')

    write('src/DzButton.vue', '<template><button /></template>\n')
    stamp(upstream, '0'.repeat(40), ['src/**/*.vue'])
    stamp(artifact, '0'.repeat(40), [upstream, 'src/**/*.vue'])
    first = commit('first')

    // The regeneration commit: it re-stamps BOTH artifacts at `first` and
    // touches a declared output. It changes no input.
    stamp(upstream, first, ['src/**/*.vue'])
    stamp(artifact, first, [upstream, 'src/**/*.vue'])
    write('site/page.md', 'generated\n')
    second = commit('regenerate evidence')

    // A source change with no regeneration behind it.
    write('src/DzButton.vue', '<template><button type="button" /></template>\n')
    third = commit('feat: a component moves')
  })

  afterAll(() => {
    rmSync(root, { recursive: true, force: true })
  })

  it('passes when the artifact is stamped at HEAD~1 and HEAD touched only outputs', () => {
    // This is the owner's regeneration commit, and the state the replaced
    // `sourceCommit === HEAD` check called red.
    const report = checkEvidenceBinding(config, second, root)
    expect(report.violations).toEqual([])
    expect(report.checked).toBe(2)
  })

  it('fails with `input-moved` once a declared input changes without a regeneration', () => {
    const report = checkEvidenceBinding(config, third, root)
    expect(report.violations).toHaveLength(2)
    expect(report.violations.every(v => v.rule === 'input-moved')).toBe(true)
    expect(report.violations[0]?.evidence.join(' ')).toContain('src/DzButton.vue')
    expect(report.violations[0]?.remedy).toContain('yarn generate:')
  })

  it('names the artifact and the remedy, so the message is actionable without the source', () => {
    const report = checkEvidenceBinding(config, third, root)
    expect(report.violations.map(v => v.artifact).sort()).toEqual([artifact, upstream].sort())
  })

  it('fails with `not-on-history` for a stamp this checkout does not contain', () => {
    stamp(artifact, 'f'.repeat(40), [upstream, 'src/**/*.vue'])
    const report = checkEvidenceBinding(config, third, root)
    const offending = report.violations.filter(v => v.artifact === artifact)
    expect(offending).toHaveLength(1)
    expect(offending[0]?.rule).toBe('not-on-history')
    stamp(artifact, second, [upstream, 'src/**/*.vue'])
  })

  it('fails with `chain-out-of-order` when a matrix claims a manifest newer than itself', () => {
    stamp(upstream, third, ['src/**/*.vue'])
    stamp(artifact, first, [upstream, 'src/**/*.vue'])
    const report = checkEvidenceBinding(config, third, root)
    expect(report.violations.some(v => v.rule === 'chain-out-of-order')).toBe(true)
  })

  it('reports an uncommitted input edit as an advisory, never as a failure', () => {
    stamp(upstream, third, ['src/**/*.vue'])
    stamp(artifact, third, [upstream, 'src/**/*.vue'])
    write('src/DzButton.vue', '<template><button data-dirty /></template>\n')
    const report = checkEvidenceBinding(config, third, root)
    expect(report.violations).toEqual([])
    expect(report.advisories.length).toBeGreaterThan(0)
    expect(report.advisories[0]?.paths.join(' ')).toContain('src/DzButton.vue')
  })

  it('treats a missing artifact as `unreadable` rather than silently passing', () => {
    const report = checkEvidenceBinding(
      { artifacts: [{ path: 'artifacts/absent.json', generator: 'yarn generate:absent', order: 1 }], generatedOutputs: [] },
      third,
      root,
    )
    expect(report.violations).toHaveLength(1)
    expect(report.violations[0]?.rule).toBe('unreadable')
  })

  it('isAncestorOrSame answers the ordering question git is asked elsewhere', () => {
    expect(isAncestorOrSame(first, third, root)).toBe(true)
    expect(isAncestorOrSame(third, first, root)).toBe(false)
    expect(isAncestorOrSame(third, third, root)).toBe(true)
  })
})
