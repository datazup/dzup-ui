/**
 * Security-corpus format gate (TASK-R3-O4).
 *
 * `@dzup-ui/testing/security-corpus` publishes one fixture format three ways —
 * TypeScript types, the checker `checkCorpusFile()`, and JSON Schema files
 * shipped beside the data for editors and other repositories. Three copies of a
 * contract drift unless something reads all three together, and before this
 * gate the only reader was a spec over the data: the schema a second repository
 * would validate against did not exist, so "shared format" meant "read the
 * TypeScript".
 *
 * What it enforces, in order:
 *
 * 1. **Vocabulary agreement.** Every enum in both JSON Schemas equals the
 *    exported constant it mirrors (categories, sinks, outcomes, peer states,
 *    diagnostic stages); the id and namespace patterns are the exported
 *    regexes, character for character; the per-category blocks cover exactly
 *    the categories; the major the schema accepts is the module's.
 * 2. **No stray data.** Every JSON file in the corpus directory is a category
 *    file the enum names, the peer-compatibility file, or one of the two
 *    schemas — so a misnamed fixture file cannot be silently skipped.
 * 3. **Every data file validates twice.** Once against
 *    its JSON Schema with the repository's draft-07 evaluator
 *    (`token-checks/json-schema-draft07.ts` — no new dependency, and it refuses
 *    any keyword it does not implement) and once with the checker. The schema
 *    must never reject what the checker accepts; the reverse is expected for
 *    the rules JSON Schema cannot state (unique ids, an id naming its peer),
 *    and the spec pins which rules those are. OSS data
 *    must also carry the current `schemaVersion` exactly: a version bump is a
 *    migration, not an annotation.
 * 4. **The peer fixtures are executable.** Each record is bound to its
 *    dependent's real `package.json` when the dependent is a workspace package
 *    (range and optional flag), its `state` is re-derived from the declared
 *    range, and every `validate`-stage diagnostic is produced by the same check
 *    `yarn validate:peers` runs and must contain every `mustContain` string.
 *
 * Usage:
 *   tsx packages/tooling/src/validators/security-corpus.ts [--dir <corpus dir>]
 *
 * `--dir` exists for seeded-failure proofs against a copy; the gate itself
 * always reads the package's own directory.
 *
 * Exit code 1 on any violation.
 */

import type { PeerCompatibilityFixture } from '../../../testing/src/security-corpus.ts'
import type { PeerPackageJson } from './peer-ranges.ts'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import {
  checkCorpusFile,
  checkPeerCompatibilityFile,
  corpusFileName,
  EXTENSION_NAMESPACE_PATTERN,
  NEUTRALIZATION_OUTCOMES,
  PEER_COMPATIBILITY_FILE_NAME,
  PEER_DIAGNOSTIC_STAGES,
  PEER_FIXTURE_ID_PATTERN,
  PEER_STATES,
  RATIONALE_MIN_LENGTH_WHEN_UNPROVEN,
  SECURITY_CATEGORIES,
  SECURITY_CORPUS_DIR,
  SECURITY_CORPUS_SCHEMA_VERSION,
  SECURITY_FIXTURE_ID_PATTERN,
  SECURITY_SINKS,
  UNPROVEN_OUTCOMES,
} from '../../../testing/src/security-corpus.ts'
import { Draft07Validator } from '../token-checks/json-schema-draft07.ts'
import { checkPeerDeps, formatPeerCheck, satisfiesRange } from './peer-ranges.ts'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../')

export const CORPUS_SCHEMA_NAME = 'security-corpus.schema.json'
export const PEER_SCHEMA_NAME = 'peer-compatibility.schema.json'

export interface SecurityCorpusReport {
  readonly violations: readonly string[]
  readonly corpusFiles: number
  readonly fixtures: number
  readonly outcomes: Readonly<Record<string, number>>
  readonly peerFixtures: number
  readonly executedDiagnostics: number
}

type Json = unknown
type JsonObject = Record<string, Json>

function isObject(value: Json): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Walk a plain property path; `undefined` when any step is missing. */
function at(node: Json, ...path: string[]): Json {
  let current = node
  for (const key of path) {
    if (!isObject(current))
      return undefined
    current = current[key]
  }
  return current
}

function sameList(actual: Json, expected: readonly string[]): boolean {
  return Array.isArray(actual)
    && actual.length === expected.length
    && actual.every((item, index) => item === expected[index])
}

function readJson(file: string): { value?: Json, error?: string } {
  try {
    return { value: JSON.parse(readFileSync(file, 'utf8')) as Json }
  }
  catch (error) {
    return { error: error instanceof Error ? error.message : String(error) }
  }
}

/**
 * Rule 1 — the schemas say what the module says.
 *
 * Compares against the exported constants rather than re-listing values here,
 * so this file never becomes a fourth copy of the vocabulary.
 */
export function checkVocabularyAgreement(corpusSchema: Json, peerSchema: Json): string[] {
  const problems: string[] = []
  const expect = (ok: boolean, message: string): void => {
    if (!ok)
      problems.push(message)
  }
  const major = SECURITY_CORPUS_SCHEMA_VERSION.split('.')[0]

  expect(at(corpusSchema, '$schema') === 'http://json-schema.org/draft-07/schema#', `${CORPUS_SCHEMA_NAME}: must declare draft-07, the dialect the evaluator implements`)
  expect(at(peerSchema, '$schema') === 'http://json-schema.org/draft-07/schema#', `${PEER_SCHEMA_NAME}: must declare draft-07, the dialect the evaluator implements`)

  expect(sameList(at(corpusSchema, 'definitions', 'category', 'enum'), SECURITY_CATEGORIES), `${CORPUS_SCHEMA_NAME}: definitions.category.enum != SECURITY_CATEGORIES (${SECURITY_CATEGORIES.join(', ')})`)
  expect(sameList(at(corpusSchema, 'definitions', 'sink', 'enum'), SECURITY_SINKS), `${CORPUS_SCHEMA_NAME}: definitions.sink.enum != SECURITY_SINKS (${SECURITY_SINKS.join(', ')})`)
  expect(sameList(Object.keys((at(corpusSchema, 'definitions', 'fixture', 'properties', 'outcomes', 'properties') ?? {}) as JsonObject), SECURITY_SINKS), `${CORPUS_SCHEMA_NAME}: the outcomes map's properties != SECURITY_SINKS`)
  expect(sameList(at(corpusSchema, 'definitions', 'outcome', 'enum'), NEUTRALIZATION_OUTCOMES), `${CORPUS_SCHEMA_NAME}: definitions.outcome.enum != NEUTRALIZATION_OUTCOMES (${NEUTRALIZATION_OUTCOMES.join(', ')})`)
  expect(sameList(at(corpusSchema, 'definitions', 'fixture', 'if', 'properties', 'outcomes', 'not', 'additionalProperties', 'not', 'enum'), UNPROVEN_OUTCOMES), `${CORPUS_SCHEMA_NAME}: the rationale rule's outcomes != UNPROVEN_OUTCOMES`)
  expect(at(corpusSchema, 'definitions', 'fixture', 'then', 'properties', 'rationale', 'pattern') === `[\\s\\S]{${RATIONALE_MIN_LENGTH_WHEN_UNPROVEN + 1}}`, `${CORPUS_SCHEMA_NAME}: the rationale rule's length != RATIONALE_MIN_LENGTH_WHEN_UNPROVEN + 1`)
  expect(at(corpusSchema, 'definitions', 'fixture', 'properties', 'id', 'pattern') === SECURITY_FIXTURE_ID_PATTERN.source, `${CORPUS_SCHEMA_NAME}: fixture id pattern != SECURITY_FIXTURE_ID_PATTERN`)
  expect(at(corpusSchema, 'properties', 'schemaVersion', 'pattern') === `^${major}\\.\\d+\\.\\d+$`, `${CORPUS_SCHEMA_NAME}: schemaVersion must accept exactly major ${major}`)

  const blocks = at(corpusSchema, 'allOf')
  const covered = Array.isArray(blocks) ? blocks.map(block => at(block, 'if', 'properties', 'category', 'const')) : []
  expect(sameList(covered, SECURITY_CATEGORIES), `${CORPUS_SCHEMA_NAME}: the per-category allOf blocks must cover exactly SECURITY_CATEGORIES, in order`)
  if (Array.isArray(blocks)) {
    for (const block of blocks) {
      const category = at(block, 'if', 'properties', 'category', 'const')
      const items = at(block, 'then', 'properties', 'fixtures', 'items', 'properties')
      expect(at(items, 'category', 'const') === category && at(items, 'id', 'pattern') === `^${String(category)}\\.`, `${CORPUS_SCHEMA_NAME}: the ${String(category)} block must pin fixture category and id prefix to "${String(category)}"`)
    }
  }

  for (const [name, schema] of [[CORPUS_SCHEMA_NAME, corpusSchema], [PEER_SCHEMA_NAME, peerSchema]] as const) {
    const namespaces = Object.keys((at(schema, 'definitions', 'extensions', 'patternProperties') ?? {}) as JsonObject)
    expect(sameList(namespaces, [EXTENSION_NAMESPACE_PATTERN.source]), `${name}: the extensions namespace pattern != EXTENSION_NAMESPACE_PATTERN`)
  }

  expect(sameList(at(peerSchema, 'definitions', 'fixture', 'properties', 'state', 'enum'), PEER_STATES), `${PEER_SCHEMA_NAME}: state enum != PEER_STATES`)
  expect(sameList(at(peerSchema, 'definitions', 'diagnostic', 'properties', 'stage', 'enum'), PEER_DIAGNOSTIC_STAGES), `${PEER_SCHEMA_NAME}: stage enum != PEER_DIAGNOSTIC_STAGES`)
  expect(at(peerSchema, 'definitions', 'fixture', 'properties', 'id', 'pattern') === PEER_FIXTURE_ID_PATTERN.source, `${PEER_SCHEMA_NAME}: id pattern != PEER_FIXTURE_ID_PATTERN`)
  expect(at(peerSchema, 'properties', 'schemaVersion', 'pattern') === `^${major}\\.\\d+\\.\\d+$`, `${PEER_SCHEMA_NAME}: schemaVersion must accept exactly major ${major}`)

  return problems
}

/** Real `peerDependencies` declarations of every workspace package, by name. */
function workspaceManifests(): Map<string, PeerPackageJson> {
  const manifests = new Map<string, PeerPackageJson>()
  const packagesDir = resolve(ROOT, 'packages')
  for (const entry of readdirSync(packagesDir, { withFileTypes: true })) {
    const file = join(packagesDir, entry.name, 'package.json')
    if (!entry.isDirectory() || !existsSync(file))
      continue
    const manifest = JSON.parse(readFileSync(file, 'utf8')) as PeerPackageJson
    manifests.set(manifest.name, manifest)
  }
  return manifests
}

const SEVERITY_OF_STATUS = { FAIL: 'error', WARN: 'warning', PASS: null } as const

/**
 * Rule 4 — run one peer fixture.
 *
 * The workspace map passed to the check is empty on purpose: the fixture
 * states what is installed, and a peer that happens to be a workspace package
 * here must still be judged on the fixture's version, not on this checkout's.
 */
export function executePeerFixture(
  fixture: PeerCompatibilityFixture,
  manifests: ReadonlyMap<string, PeerPackageJson>,
): { problems: string[], executed: number } {
  const problems: string[] = []
  const label = `peer fixture ${fixture.id}`

  const real = manifests.get(fixture.dependent)
  if (real !== undefined) {
    const declared = real.peerDependencies?.[fixture.peer]
    if (declared === undefined)
      problems.push(`${label}: ${fixture.dependent} declares no peer "${fixture.peer}" — the record describes a declaration that does not exist`)
    else if (declared !== fixture.declaredRange)
      problems.push(`${label}: declaredRange "${fixture.declaredRange}" but ${fixture.dependent} declares "${declared}"`)
    const optional = real.peerDependenciesMeta?.[fixture.peer]?.optional === true
    if (declared !== undefined && optional !== fixture.optional)
      problems.push(`${label}: optional is ${String(fixture.optional)} but ${fixture.dependent} declares it ${optional ? 'optional' : 'required'}`)
  }

  if (fixture.installedVersion !== null) {
    const inRange = satisfiesRange(fixture.installedVersion, fixture.declaredRange)
    if (fixture.state === 'installed' && !inRange)
      problems.push(`${label}: state "installed" but ${fixture.installedVersion} does not satisfy ${fixture.declaredRange}`)
    if (fixture.state === 'incompatible' && inRange)
      problems.push(`${label}: state "incompatible" but ${fixture.installedVersion} satisfies ${fixture.declaredRange}`)
  }

  const pkg: PeerPackageJson = {
    name: fixture.dependent,
    version: '0.0.0',
    peerDependencies: { [fixture.peer]: fixture.declaredRange },
    peerDependenciesMeta: fixture.optional ? { [fixture.peer]: { optional: true } } : {},
  }
  const [check] = checkPeerDeps(pkg, new Map(), dep => (dep === fixture.peer ? fixture.installedVersion : null))
  if (check === undefined) {
    problems.push(`${label}: the peer check produced no result`)
    return { problems, executed: 0 }
  }
  const line = formatPeerCheck(check)
  const severity = SEVERITY_OF_STATUS[check.status]

  let executed = 0
  for (const diagnostic of fixture.diagnostics) {
    if (diagnostic.stage !== 'validate')
      continue
    executed += 1
    if (severity === null)
      problems.push(`${label}: expects a validate-stage ${diagnostic.severity}, but validate:peers passes it: "${line}"`)
    else if (severity !== diagnostic.severity)
      problems.push(`${label}: expects a validate-stage ${diagnostic.severity}, validate:peers reports a ${severity}: "${line}"`)
    for (const text of diagnostic.mustContain) {
      if (!line.includes(text))
        problems.push(`${label}: the validate:peers diagnostic does not contain "${text}": "${line}"`)
    }
  }

  return { problems, executed }
}

/** Run the whole gate over `dir` (the package's own corpus directory by default). */
export function checkSecurityCorpus(dir: string = SECURITY_CORPUS_DIR): SecurityCorpusReport {
  const violations: string[] = []
  const outcomes: Record<string, number> = {}
  let fixtures = 0
  let corpusFiles = 0
  let peerFixtures = 0
  let executedDiagnostics = 0
  const report = (): SecurityCorpusReport => ({ violations, corpusFiles, fixtures, outcomes, peerFixtures, executedDiagnostics })

  const corpusSchema = readJson(join(dir, CORPUS_SCHEMA_NAME))
  const peerSchema = readJson(join(dir, PEER_SCHEMA_NAME))
  if (corpusSchema.value === undefined)
    violations.push(`${CORPUS_SCHEMA_NAME}: missing or unreadable — the gate cannot pass without the published schema (${corpusSchema.error ?? 'unknown'})`)
  if (peerSchema.value === undefined)
    violations.push(`${PEER_SCHEMA_NAME}: missing or unreadable — the gate cannot pass without the published schema (${peerSchema.error ?? 'unknown'})`)
  if (corpusSchema.value === undefined || peerSchema.value === undefined)
    return report()

  violations.push(...checkVocabularyAgreement(corpusSchema.value, peerSchema.value))

  // Rule 2 — no stray data.
  const expectedCorpus = SECURITY_CATEGORIES.map(corpusFileName)
  const known = new Set([...expectedCorpus, PEER_COMPATIBILITY_FILE_NAME, CORPUS_SCHEMA_NAME, PEER_SCHEMA_NAME])
  const onDisk = readdirSync(dir).filter(name => name.endsWith('.json')).sort()
  for (const name of onDisk) {
    if (!known.has(name))
      violations.push(`${name}: not a category file, the peer-compatibility file or a schema — a fixture file under another name is never loaded`)
  }
  for (const name of [...expectedCorpus, PEER_COMPATIBILITY_FILE_NAME]) {
    if (!onDisk.includes(name))
      violations.push(`${name}: missing`)
  }

  // Rule 3 — both validators, agreeing.
  const corpusValidator = new Draft07Validator(corpusSchema.value)
  for (const name of expectedCorpus.filter(file => onDisk.includes(file))) {
    corpusFiles += 1
    const parsed = readJson(join(dir, name))
    if (parsed.value === undefined) {
      violations.push(`${name}: not JSON (${parsed.error ?? 'unknown'})`)
      continue
    }
    const schemaErrors = corpusValidator.validate(parsed.value)
    const checkerErrors = checkCorpusFile(parsed.value, name)
    for (const error of schemaErrors)
      violations.push(`${name}${error.instancePath}: [json-schema] ${error.message}`)
    for (const problem of checkerErrors)
      violations.push(`${problem.path}: [checker] ${problem.message}`)
    if (schemaErrors.length > 0 && checkerErrors.length === 0)
      violations.push(`${name}: the JSON Schema rejects what checkCorpusFile() accepts — the published schema is stricter than the authority; fix the schema or the checker, never only the data`)
    if (at(parsed.value, 'schemaVersion') !== SECURITY_CORPUS_SCHEMA_VERSION)
      violations.push(`${name}: schemaVersion ${String(at(parsed.value, 'schemaVersion'))} != ${SECURITY_CORPUS_SCHEMA_VERSION} — migrate the data with the version`)

    const list = at(parsed.value, 'fixtures')
    if (Array.isArray(list)) {
      fixtures += list.length
      for (const fixture of list) {
        for (const outcome of Object.values((at(fixture, 'outcomes') ?? {}) as JsonObject))
          outcomes[String(outcome)] = (outcomes[String(outcome)] ?? 0) + 1
      }
    }
  }

  // Rules 3 and 4 for the peer fixtures.
  if (onDisk.includes(PEER_COMPATIBILITY_FILE_NAME)) {
    const parsed = readJson(join(dir, PEER_COMPATIBILITY_FILE_NAME))
    if (parsed.value === undefined) {
      violations.push(`${PEER_COMPATIBILITY_FILE_NAME}: not JSON (${parsed.error ?? 'unknown'})`)
      return report()
    }
    const schemaErrors = new Draft07Validator(peerSchema.value).validate(parsed.value)
    const checkerErrors = checkPeerCompatibilityFile(parsed.value, PEER_COMPATIBILITY_FILE_NAME)
    for (const error of schemaErrors)
      violations.push(`${PEER_COMPATIBILITY_FILE_NAME}${error.instancePath}: [json-schema] ${error.message}`)
    for (const problem of checkerErrors)
      violations.push(`${problem.path}: [checker] ${problem.message}`)
    if (schemaErrors.length > 0 && checkerErrors.length === 0)
      violations.push(`${PEER_COMPATIBILITY_FILE_NAME}: the JSON Schema rejects what checkPeerCompatibilityFile() accepts — the published schema is stricter than the authority`)
    if (at(parsed.value, 'schemaVersion') !== SECURITY_CORPUS_SCHEMA_VERSION)
      violations.push(`${PEER_COMPATIBILITY_FILE_NAME}: schemaVersion ${String(at(parsed.value, 'schemaVersion'))} != ${SECURITY_CORPUS_SCHEMA_VERSION}`)

    // Execute only records that are well-formed; a malformed one is already reported.
    if (checkerErrors.length === 0) {
      const manifests = workspaceManifests()
      for (const fixture of (parsed.value as { fixtures: PeerCompatibilityFixture[] }).fixtures) {
        peerFixtures += 1
        const result = executePeerFixture(fixture, manifests)
        violations.push(...result.problems)
        executedDiagnostics += result.executed
      }
    }
  }

  return report()
}

/* c8 ignore start -- CLI entry point, exercised via `tsx`, not the unit tests. */
const isMain = process.argv[1]
  && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))

if (isMain) {
  const flag = process.argv.indexOf('--dir')
  const dir = flag === -1 ? SECURITY_CORPUS_DIR : resolve(process.argv[flag + 1] ?? SECURITY_CORPUS_DIR)
  const result = checkSecurityCorpus(dir)
  const where = relative(ROOT, dir).split('\\').join('/') || dir
  if (result.violations.length === 0) {
    const counts = NEUTRALIZATION_OUTCOMES.map(outcome => `${outcome} ${result.outcomes[outcome] ?? 0}`).join(' · ')
    console.warn(
      `✓ security-corpus: schema ${SECURITY_CORPUS_SCHEMA_VERSION} — ${result.corpusFiles} category file(s), `
      + `${result.fixtures} fixture(s) valid against JSON Schema and checker (${counts}); `
      + `${result.peerFixtures} peer fixture(s), ${result.executedDiagnostics} validate-stage diagnostic(s) executed against validate:peers\n`
      + `  read: ${where}`,
    )
    process.exit(0)
  }
  console.error(`✗ security-corpus FAILED — ${result.violations.length} violation(s) in ${where}`)
  for (const violation of result.violations.slice(0, 60))
    console.error(`    ${violation}`)
  if (result.violations.length > 60)
    console.error(`    … and ${result.violations.length - 60} more`)
  process.exit(1)
}
/* c8 ignore stop */
