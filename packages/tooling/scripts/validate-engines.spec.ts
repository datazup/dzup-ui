import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { checkEngines, collectCiNodeVersions, lowestAdmitted, parseVersion } from './validate-engines.ts'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../')

describe('parseVersion', () => {
  it('reads a version out of a range', () => {
    expect(parseVersion('>=20.19.0')).toEqual({ major: 20, minor: 19, patch: 0 })
    expect(parseVersion('^22.13.0')).toEqual({ major: 22, minor: 13, patch: 0 })
    expect(parseVersion('\'20.19.0\'')).toEqual({ major: 20, minor: 19, patch: 0 })
  })

  it('returns undefined for a range with no concrete version', () => {
    expect(parseVersion('20')).toBeUndefined()
    expect(parseVersion('*')).toBeUndefined()
  })
})

describe('lowestAdmitted', () => {
  it('takes the lowest branch of an || range', () => {
    expect(lowestAdmitted('^20.19.0 || >=22.13.0')).toEqual({ major: 20, minor: 19, patch: 0 })
    expect(lowestAdmitted('^20.19.0 || ^22.13.0 || >=24.0.0')).toEqual({ major: 20, minor: 19, patch: 0 })
  })

  it('does not assume the branches are written in order', () => {
    expect(lowestAdmitted('>=22.13.0 || ^20.19.0')).toEqual({ major: 20, minor: 19, patch: 0 })
  })

  it('returns undefined when no branch names a version', () => {
    expect(lowestAdmitted('*')).toBeUndefined()
  })
})

describe('collectCiNodeVersions', () => {
  const versions = collectCiNodeVersions()

  it('finds the pinned versions in the workflows', () => {
    expect(versions.length).toBeGreaterThan(0)
  })

  it('skips matrix interpolations, which name no version themselves', () => {
    for (const entry of versions)
      expect(entry.value).not.toContain('${{')
  })
})

describe('the repository', () => {
  it('declares a floor its own gate dependencies can satisfy', () => {
    const violations = checkEngines()
    const report = violations.map(v => `[${v.rule}] ${v.message}`).join('\n')
    expect(violations, report).toEqual([])
  })

  it('pins .nvmrc to the floor rather than to a newer version', () => {
    // Developing above the floor is how a floor break reaches a contributor
    // before it reaches CI. `.nvmrc` naming the minimum is the cheap fix.
    const floor = lowestAdmitted(
      (JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf8')) as {
        engines: { node: string }
      }).engines.node,
    )
    expect(existsSync(resolve(ROOT, '.nvmrc'))).toBe(true)
    expect(parseVersion(readFileSync(resolve(ROOT, '.nvmrc'), 'utf8'))).toEqual(floor)
  })

  it('runs every TypeScript script through tsx', () => {
    // Native `.ts` execution varies across the supported range, which is the
    // class of problem ADR-18 exists to close.
    const scripts = (JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf8')) as {
      scripts: Record<string, string>
    }).scripts

    for (const [name, command] of Object.entries(scripts)) {
      if (name.startsWith('//') || !/\.ts\b/.test(command))
        continue
      const runsThroughAKnownRunner = /\b(?:tsx|vitest|vue-tsc|tsc|playwright)\b/.test(command)
      expect(runsThroughAKnownRunner, `${name}: ${command}`).toBe(true)
    }
  })

  it('has the min-runtime preflight job wired to .nvmrc', () => {
    const workflow = readFileSync(resolve(ROOT, '.github/workflows/ci.yml'), 'utf8')
    expect(workflow).toContain('validate-min-runtime:')
    // One number, in one place: a hard-coded version here would be the fourth
    // copy of the floor and the first to drift.
    expect(workflow).toContain('node-version-file: .nvmrc')
  })
})
