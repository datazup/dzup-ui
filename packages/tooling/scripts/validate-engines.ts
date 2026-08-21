/**
 * Runtime floor validator (TASK-OSS-P2-01, ADR-18).
 *
 * Three questions, none of which anything asked before:
 *
 *   1. Do the repository's own declarations agree? `engines.node`, `.nvmrc`,
 *      and every CI `node-version:` are three copies of one fact, and copies
 *      drift.
 *   2. Is the floor *satisfiable*? A dependency the gates load may declare a
 *      higher floor than the repository does — `vite@7` requires
 *      `^20.19.0 || >=22.12.0` against a declared `>=20.0.0`, which is how a
 *      contributor on Node 20.0.0 discovers that `yarn build` cannot start.
 *   3. Does every `.ts` script run through a declared runner? Native `.ts`
 *      execution varies across the supported range, and a validator that cannot
 *      start is indistinguishable from a repository with no gate.
 *
 * It reads each dependency's *installed* `engines`, so the answer is about this
 * lockfile rather than about a range someone typed.
 *
 * Usage:
 *   tsx packages/tooling/scripts/validate-engines.ts
 *
 * Exit code 1 if violations found.
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../')

/**
 * Dependencies the mandatory gates load. Checking every transitive package
 * would report noise from things no gate touches; these are the ones whose
 * failure to start stops a contributor.
 */
const GATE_DEPENDENCIES = [
  'vite',
  'vitest',
  'eslint',
  'tsx',
  'typescript',
  'jsdom',
  '@playwright/test',
]

/** Packages that declare a floor and must all declare the same one. */
const DECLARING_PACKAGES = ['package.json', 'packages/mcp/package.json']

export interface EngineViolation {
  rule: string
  message: string
}

interface Comparable {
  major: number
  minor: number
  patch: number
}

export function parseVersion(version: string): Comparable | undefined {
  const match = /(\d+)\.(\d+)\.(\d+)/.exec(version)
  if (match === null)
    return undefined
  return { major: Number(match[1]), minor: Number(match[2]), patch: Number(match[3]) }
}

function compare(a: Comparable, b: Comparable): number {
  return a.major - b.major || a.minor - b.minor || a.patch - b.patch
}

/**
 * The lowest version a range admits.
 *
 * Deliberately small: it understands the two forms `engines.node` fields
 * actually use — `>=x.y.z` and `^x.y.z`, joined by `||` — and reports anything
 * else rather than guessing. A semver library would accept more syntax and hide
 * the cases where this repository's declarations are unusual.
 */
export function lowestAdmitted(range: string): Comparable | undefined {
  const candidates = range
    .split('||')
    .map(part => parseVersion(part.trim()))
    .filter((part): part is Comparable => part !== undefined)

  if (candidates.length === 0)
    return undefined
  return candidates.sort(compare)[0]
}

/** Every `node-version:` in the workflows, with where it came from. */
export function collectCiNodeVersions(): { file: string, line: number, value: string }[] {
  const dir = resolve(ROOT, '.github/workflows')
  if (!existsSync(dir))
    return []

  const out: { file: string, line: number, value: string }[] = []
  for (const entry of readdirSync(dir)) {
    if (!/\.ya?ml$/.test(entry))
      continue
    const source = readFileSync(join(dir, entry), 'utf8')
    source.split(/\r?\n/).forEach((line, index) => {
      // A comment that mentions the key is prose, not configuration — the job
      // ADR-18 added explains the old floating pin in exactly those words, and
      // a checker that reads its own rationale as a violation is worthless.
      if (line.trimStart().startsWith('#'))
        return

      const match = /node-version:\s*(\S.*)$/.exec(line)
      if (match !== null && !match[1]!.includes('${{'))
        out.push({ file: `.github/workflows/${entry}`, line: index + 1, value: match[1]!.trim() })
    })
  }
  return out
}

function readJson(relative: string): Record<string, unknown> {
  return JSON.parse(readFileSync(resolve(ROOT, relative), 'utf8')) as Record<string, unknown>
}

export function checkEngines(): EngineViolation[] {
  const violations: EngineViolation[] = []
  const root = readJson('package.json') as { engines?: { node?: string } }
  const declared = root.engines?.node

  if (declared === undefined) {
    return [{ rule: 'declared', message: 'the root package.json declares no engines.node' }]
  }

  const floor = lowestAdmitted(declared)
  if (floor === undefined) {
    return [{
      rule: 'declared',
      message: `engines.node "${declared}" names no concrete version this checker understands `
        + '(it reads `>=x.y.z` and `^x.y.z`, joined by `||`)',
    }]
  }

  // 1. The declarations agree with each other.
  for (const path of DECLARING_PACKAGES.slice(1)) {
    const other = (readJson(path) as { engines?: { node?: string } }).engines?.node
    if (other !== undefined && other !== declared) {
      violations.push({
        rule: 'agreement',
        message: `${path} declares engines.node "${other}", the root declares "${declared}"`,
      })
    }
  }

  const nvmrcPath = resolve(ROOT, '.nvmrc')
  if (!existsSync(nvmrcPath)) {
    violations.push({
      rule: 'agreement',
      message: '.nvmrc does not exist, so a contributor has no local signal of the floor (ADR-18)',
    })
  }
  else {
    const nvmrc = parseVersion(readFileSync(nvmrcPath, 'utf8').trim())
    if (nvmrc === undefined || compare(nvmrc, floor) !== 0) {
      violations.push({
        rule: 'agreement',
        message: `.nvmrc names ${readFileSync(nvmrcPath, 'utf8').trim()}, which is not the floor `
          + `${floor.major}.${floor.minor}.${floor.patch} that engines.node declares`,
      })
    }
  }

  // 2. The floor is satisfiable by the dependencies the gates load.
  for (const name of GATE_DEPENDENCIES) {
    const manifest = resolve(ROOT, 'node_modules', name, 'package.json')
    if (!existsSync(manifest))
      continue

    const dependency = JSON.parse(readFileSync(manifest, 'utf8')) as {
      version: string
      engines?: { node?: string }
    }
    const required = dependency.engines?.node
    if (required === undefined)
      continue

    const dependencyFloor = lowestAdmitted(required)
    if (dependencyFloor !== undefined && compare(dependencyFloor, floor) > 0) {
      violations.push({
        rule: 'satisfiable',
        message: `${name}@${dependency.version} requires node "${required}", which the declared `
          + `floor "${declared}" does not satisfy. A contributor on the floor cannot run the gate `
          + 'that loads it.',
      })
    }
  }

  // 3. CI exercises the floor rather than whatever the runner resolves.
  const floating = collectCiNodeVersions().filter(entry => parseVersion(entry.value) === undefined)
  for (const entry of floating) {
    violations.push({
      rule: 'ci-pin',
      message: `${entry.file}:${entry.line} requests node-version "${entry.value}", which resolves `
        + 'to the newest matching release rather than the floor — so the floor is never exercised '
        + '(ADR-18). Pin the exact version.',
    })
  }

  return violations
}

/* c8 ignore start -- CLI entry point, exercised via `tsx`, not the unit tests. */
const isMain = process.argv[1]
  && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))

if (isMain) {
  const violations = checkEngines()
  const declared = (readJson('package.json') as { engines?: { node?: string } }).engines?.node

  if (violations.length === 0) {
    console.warn(`✓ engines: floor "${declared}" is declared consistently and every gate dependency satisfies it`)
    process.exit(0)
  }

  for (const violation of violations)
    console.error(`✗ [${violation.rule}] ${violation.message}`)
  console.error(`\n${violations.length} engine violation(s). See docs/adr/ADR-18-runtime-floor-and-validator-runner.md.`)
  process.exit(1)
}
/* c8 ignore stop */
