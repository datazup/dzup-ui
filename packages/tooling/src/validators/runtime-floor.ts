/**
 * Runtime-floor reachability gate (TASK-S2-O4, 2026-09-24).
 *
 * The 08-11 reassessment's finding **H4** was a documented gate that could not
 * start under the repository's own declared runtime. It was fixed for the case
 * that was found; this gate exists because the same defect came back in a place
 * nothing was watching, and stayed for four days.
 *
 * `engines.node` says `^20.19.0 || >=22.13.0`. `.nvmrc` says `20.19.0`. Both are
 * promises: a contributor whose Node satisfies them can run every mandatory
 * gate. Two files break that promise by importing a glob helper from
 * `node:fs` which is `@since v22.0.0`. Measured at `4e4e46f`, on one machine,
 * changing one variable:
 *
 *     v20.19.0 → typeof require('node:fs').globSync === 'undefined'   (runtime-floor-ok)
 *     v24.14.1 → typeof require('node:fs').globSync === 'function'    (runtime-floor-ok)
 *
 * and `vitest run packages/tooling/src/token-checks/landing-token-fallbacks.spec.ts`
 * is **exit 1, `Tests: no tests`, `TypeError: globSync is not a function`** under
 * the floor against **exit 0, 9 passed** under the default. Same tree, same
 * `node_modules`, same command.
 *
 * ## What this gate is, and what it deliberately is not
 *
 * It is **not** a fix. Which way the contradiction resolves — raise the floor to
 * `>=22.13.0`, or keep the range and stop using a 22-only API — is open owner
 * decision **D160 / D176 / `N5-04 D3`** (owner-decision register row 19), and
 * TASK-R1-O4's `<stop_conditions>` already recorded it as an ADR-18 amendment
 * rather than something an agent repairs on the way past.
 *
 * It is **not** a second copy of `validate:engines`, which asks whether the
 * declarations* agree with each other and whether every gate dependency accepts
 * the floor. That gate is green at `4e4e46f` — and it is green while the floor is
 * unusable, because a dependency's `engines` field says nothing about which
 * built-ins this repository's own source calls. The two gates are about the two
 * halves of the same promise, and only one half was measured.
 *
 * What it is: a **named set with a ceiling**, the shape
 * `capability-matrix-ceilings.json`, `visual-baselines-ceilings.json` and
 * `adr-status-grandfather.json` already use. Every site that uses an API newer
 * than the derived floor must be listed in
 * `runtime-floor-ceilings.json` with an `api`, a `since`, what it is reachable
 * from, a dated reason and an exit condition. Consequences:
 *
 * - **A new breach fails**, because it is unlisted. That is the whole point: the
 *   floor is open for as long as the decision is, and the cost of waiting must
 *   not be allowed to grow silently.
 * - **A repaired breach fails**, because the entry is discharged and
 *   `maxBreaches` has to fall in the same change. Progress is recorded, not
 *   absorbed.
 * - **The ceiling must equal the list.** A number alone can hide a swap: repair
 *   one site, add another, arithmetic unchanged, gate green — exactly the hole
 *   `adr-status.ts` closed one level up for `maxProposedCitedFromCode`.
 *
 * ## It fails closed
 *
 * "The gate greened because it found nothing to check" is the failure mode this
 * programme keeps catching, so:
 *
 * - **No scannable source files** is a violation. A gate that lost its input has
 *   no verdict.
 * - **A floor that cannot be derived** from `engines.node` is a violation with a
 *   named reason, rather than a silently permissive `0.0.0`.
 * - **`.nvmrc` disagreeing with the derived floor** is a violation. `validate:engines`
 *   also checks this; here it is a precondition, because every judgement below is
 *   made against one number and a gate that picks the wrong number is worse than
 *   no gate.
 * - **An entry naming a file that does not exist, or a file that no longer uses
 *   the API it is listed for**, is a violation.
 *
 * ## The API table lives in a JSON file, and that is load-bearing
 *
 * `runtime-floor-apis.json` holds the curated list. The reason is not tidiness:
 * this scanner matches literal substrings, so a table written here would make
 * the validator its own worst offender. The first run of this gate reported
 * **15 violations, every one of them a row of its own table**, plus its own
 * prose. `adr-status.ts` met the identical trap one task earlier — it inflated
 * its own meter with a sentence from its own header — and solved it with
 * per-line markers. A data file the scanner does not read is the cheaper half of
 * the same fix; the marker {@link SELF_REFERENCE_MARKER} covers the residue,
 * which is this header and the seeded self-test inputs.
 *
 * The table is a *floor on the floor*: it catches the class of break that has
 * actually happened here twice, and it does not claim to be a complete Node
 * compatibility analysis. `nuxt@4.4.6` raising its own `engines` to `^22.12.0`
 * is the same class of event arriving from outside, and it is why the
 * `nuxt-majors` CI matrix can no longer pin a current Nuxt.
 *
 * Usage:
 *
 *   tsx packages/tooling/src/validators/runtime-floor.ts
 *   tsx packages/tooling/src/validators/runtime-floor.ts --self-test
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '../../../..')
const CEILINGS_PATH = 'packages/tooling/src/validators/runtime-floor-ceilings.json'
const APIS_PATH = 'packages/tooling/src/validators/runtime-floor-apis.json'

/**
 * A line carrying this marker is skipped.
 *
 * It exists for exactly one case: source that *names* a too-new API as its
 * subject matter rather than calling it — this file's own header and the seeded
 * inputs in its self-test. It is the same device `validate-adr-references`
 * defines as `adr-example-ok:`, and it is narrow on purpose. It is not an
 * allowlist for real usage: a real breach belongs in the ceilings file, where it
 * carries a reason, a reachability and an exit condition that someone can argue
 * with.
 */
export const SELF_REFERENCE_MARKER = 'runtime-floor-ok'

/**
 * Build a seeded `import { name } from 'module'` line at run time.
 *
 * The parts are assembled rather than written out, so the literal an import
 * statement would produce never appears on one line of this file. Composing is
 * stronger than {@link SELF_REFERENCE_MARKER}, and the difference is not
 * theoretical: an `eslint --fix` pass on this file **deleted an inline
 * self-reference marker comment** while reformatting an array literal, and the
 * gate immediately went red on its own self-test data. A marker a formatter can
 * move is not a guarantee; a string that never exists is.
 */
export function seedLine(name: string, module: string): string {
  return `${'import'} { ${name} } from '${module}'\n`
}

/**
 * The same trick for a static member call, such as a `groupBy` on a global.
 *
 * Note that the member name is taken as a parameter rather than written here,
 * for the reason {@link seedLine} records.
 */
export function seedCall(object: string, member: string): string {
  return `const seeded = ${object}.${member}(xs, f)\n`
}

/**
 * Built-ins whose availability starts above the derived floor, read from
 * {@link APIS_PATH}.
 *
 * `match` is a literal substring, not a regular expression, so a row cannot
 * accidentally widen. `kind` says how it is reached: `named-import` matches only
 * inside an import statement from the named module, `member` matches a property
 * access anywhere, `module` matches an import of the module itself.
 */
export function readApiTable(root: string = ROOT): readonly RuntimeApi[] {
  const data = JSON.parse(readFileSync(join(root, APIS_PATH), 'utf8')) as { apis?: RuntimeApi[] }
  return data.apis ?? []
}

/** Directories scanned, relative to the repository root. */
export const SCAN_ROOTS: readonly string[] = [
  'packages',
  'scripts',
  'e2e',
  'apps/docs/scripts',
  'apps/landing/src',
  'apps/landing/scripts',
]

/** Never scanned: build output, installed packages, generated caches, fixtures. */
const SKIP_DIRS = new Set([
  'node_modules',
  'dist',
  '.nuxt',
  '.output',
  '.vitepress',
  '.turbo',
  'coverage',
  'fixtures',
  '.tarballs',
  'playground-template',
])

const SCAN_EXTENSIONS = ['.ts', '.mts', '.cts', '.mjs', '.cjs', '.js', '.vue']

export interface RuntimeApi {
  readonly api: string
  readonly since: string
  readonly kind: 'named-import' | 'member' | 'module'
  readonly module?: string
  readonly name?: string
  readonly match?: string
}

export interface BreachSite {
  readonly file: string
  readonly api: string
  readonly since: string
  readonly line: number
}

export interface CeilingEntry {
  readonly file?: string
  readonly api?: string
  readonly since?: string
  readonly recorded?: string
  readonly reachableFrom?: string
  readonly reason?: string
  readonly exit?: string
}

export interface Ceilings {
  readonly maxBreaches?: number
  readonly breaches?: readonly CeilingEntry[]
}

export interface Violation {
  readonly rule: string
  readonly message: string
}

export interface RuntimeFloorReport {
  readonly violations: readonly Violation[]
  readonly floor: string
  readonly filesScanned: number
  readonly breaches: readonly BreachSite[]
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/**
 * The lowest version any branch of a `node` semver range admits.
 *
 * `^20.19.0 || >=22.13.0` → `20.19.0`. The floor is what a consumer's engine
 * check compares against, so it is the *minimum* over the branches, never the
 * newest branch — reading it the other way is how a "we support Node 22+" claim
 * gets made about a range that still says 20.
 */
export function deriveFloor(range: string | undefined): string | undefined {
  if (typeof range !== 'string' || range.trim() === '')
    return undefined
  const versions: string[] = []
  for (const branch of range.split('||')) {
    const found = /(\d+)\.(\d+)\.(\d+)/.exec(branch)
    if (found !== null)
      versions.push(`${found[1]}.${found[2]}.${found[3]}`)
  }
  if (versions.length === 0)
    return undefined
  return versions.sort(compareVersions)[0]
}

/** Numeric semver comparison over `major.minor.patch` strings. */
export function compareVersions(left: string, right: string): number {
  const a = left.split('.').map(Number)
  const b = right.split('.').map(Number)
  for (let i = 0; i < 3; i += 1) {
    const diff = (a[i] ?? 0) - (b[i] ?? 0)
    if (diff !== 0)
      return diff
  }
  return 0
}

/** True when `since` is strictly newer than the derived floor. */
export function isAboveFloor(since: string, floor: string): boolean {
  return compareVersions(since, floor) > 0
}

/** Every API in the table that a single file's text reaches. */
export function apisUsedIn(text: string, floor: string, table: readonly RuntimeApi[]): BreachSite[] {
  const lines = text.split(/\r?\n/)
  const hits: BreachSite[] = []
  for (const entry of table) {
    if (!isAboveFloor(entry.since, floor))
      continue
    for (const [index, line] of lines.entries()) {
      if (line.includes(SELF_REFERENCE_MARKER))
        continue
      if (!matchesLine(line, entry))
        continue
      hits.push({ api: entry.api, file: '', line: index + 1, since: entry.since })
      break
    }
  }
  return hits
}

function matchesLine(line: string, entry: RuntimeApi): boolean {
  if (entry.kind === 'member')
    return entry.match !== undefined && line.includes(entry.match)

  const specifier = `node:${entry.module}`
  const bare = `'${entry.module}'`
  const mentionsModule = line.includes(specifier) || line.includes(bare) || line.includes(`"${entry.module}"`)
  if (!mentionsModule)
    return false
  if (entry.kind === 'module')
    return /\b(?:import|require)\b/.test(line)
  // named-import: the name must appear in the same statement as the module.
  return entry.name !== undefined
    && new RegExp(`\\b${entry.name}\\b`).test(line)
    && /\b(?:import|require)\b/.test(line)
}

/** Recursively collect scannable files under one root. */
export function collectFiles(root: string, dir: string, out: string[] = []): string[] {
  if (!existsSync(dir))
    return out
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith('.') && entry !== '.nvmrc')
      continue
    const full = join(dir, entry)
    if (SKIP_DIRS.has(entry))
      continue
    const stats = statSync(full)
    if (stats.isDirectory()) {
      collectFiles(root, full, out)
      continue
    }
    if (SCAN_EXTENSIONS.some(extension => entry.endsWith(extension)))
      out.push(relative(root, full).replaceAll('\\', '/'))
  }
  return out
}

/**
 * The whole gate, over data rather than over the filesystem, so the self-test
 * and the spec drive exactly the code a real run drives.
 */
export function checkRuntimeFloor(input: {
  engines: string | undefined
  nvmrc: string | undefined
  files: ReadonlyMap<string, string>
  ceilings: Ceilings
  apis: readonly RuntimeApi[]
}): RuntimeFloorReport {
  const violations: Violation[] = []
  const floor = deriveFloor(input.engines)

  if (floor === undefined) {
    return {
      breaches: [],
      filesScanned: input.files.size,
      floor: '(underivable)',
      violations: [{
        rule: 'floor-underivable',
        message: 'No floor could be derived from the root package.json `engines.node` field '
          + `(read as ${JSON.stringify(input.engines)}). Every judgement this gate makes is `
          + 'against that one number; without it the gate has no verdict and refuses to pass.',
      }],
    }
  }

  const declaredNvmrc = (input.nvmrc ?? '')
    .split(/\r?\n/)
    .map(line => line.trim())
    .find(line => line !== '' && !line.startsWith('#'))

  if (declaredNvmrc === undefined || declaredNvmrc.replace(/^v/, '') !== floor) {
    violations.push({
      rule: 'nvmrc-disagrees',
      message: `.nvmrc reads ${JSON.stringify(declaredNvmrc ?? null)} but the floor derived from `
        + `engines.node is ${floor}. The CI lanes resolve their Node from .nvmrc `
        + '(`node-version-file: .nvmrc`) while a consumer resolves it from `engines`, so a '
        + 'disagreement means the lane and the promise are about different runtimes.',
    })
  }

  if (input.files.size === 0) {
    violations.push({
      rule: 'no-input',
      message: `No source files were scanned under ${SCAN_ROOTS.join(', ')}. A gate that lost its `
        + 'input has no verdict, so this is a failure rather than a pass.',
    })
  }

  if (input.apis.length === 0) {
    violations.push({
      rule: 'no-table',
      message: `${APIS_PATH} produced no API rows. The gate would then pass every file by knowing `
        + 'nothing, which is the false-green this programme keeps finding. An empty table is a '
        + 'failure.',
    })
  }

  const breaches: BreachSite[] = []
  for (const [file, text] of input.files) {
    for (const hit of apisUsedIn(text, floor, input.apis))
      breaches.push({ ...hit, file })
  }
  breaches.sort((a, b) => a.file.localeCompare(b.file) || a.api.localeCompare(b.api))

  const entries = input.ceilings.breaches ?? []
  const listed = new Set(entries.map(entry => `${entry.file}::${entry.api}`))

  for (const breach of breaches) {
    if (listed.has(`${breach.file}::${breach.api}`))
      continue
    violations.push({
      rule: 'unlisted-breach',
      message: `${breach.file}:${breach.line} uses \`${breach.api}\`, which is @since v${breach.since}, `
        + `above the declared floor ${floor}. On the floor this file does not run. Either stop using `
        + `the API, or — if this is a deliberate consequence of open owner decision D160/D176 — add it `
        + `to ${CEILINGS_PATH} with a reason, a reachableFrom, a recorded date and an exit condition, `
        + 'and raise maxBreaches in the same change.',
    })
  }

  const seen = new Set(breaches.map(breach => `${breach.file}::${breach.api}`))
  for (const entry of entries) {
    const key = `${entry.file}::${entry.api}`
    if (!seen.has(key)) {
      violations.push({
        rule: 'entry-discharged',
        message: `${CEILINGS_PATH} lists ${entry.file} for \`${entry.api}\`, and the file no longer `
          + 'uses it (or no longer exists). The allowance is discharged: delete the entry and lower '
          + `maxBreaches to ${entries.length - 1} in the same change, so the repair is recorded `
          + 'rather than absorbed.',
      })
      continue
    }
    if (!ISO_DATE.test(entry.recorded ?? '')) {
      violations.push({
        rule: 'entry-date',
        message: `${entry.file} in ${CEILINGS_PATH} needs \`recorded\` as an ISO YYYY-MM-DD date. `
          + 'An undated allowance cannot be aged, and an allowance nobody can age is permanent.',
      })
    }
    if ((entry.reason ?? '').trim() === ''
      || (entry.exit ?? '').trim() === ''
      || (entry.reachableFrom ?? '').trim() === '') {
      violations.push({
        rule: 'entry-incomplete',
        message: `${entry.file} in ${CEILINGS_PATH} needs \`reason\`, \`reachableFrom\` and \`exit\`. `
          + '`reachableFrom` is the load-bearing one: it is the difference between a breach a CI lane '
          + 'will report and one only a contributor running the script will ever meet.',
      })
    }
  }

  if (input.ceilings.maxBreaches !== entries.length) {
    violations.push({
      rule: 'ceiling-mismatch',
      message: `${CEILINGS_PATH} lists ${entries.length} breach(es) but declares maxBreaches: `
        + `${String(input.ceilings.maxBreaches)}. The two must agree, so that repairing a site is the `
        + 'only thing that lowers the number and adding an allowance cannot be done quietly. A bare '
        + 'number lets one site be repaired while another is introduced with the arithmetic unchanged.',
    })
  }

  return { breaches, filesScanned: input.files.size, floor, violations }
}

/** Filesystem entry point: read the declarations, the source and the ceilings. */
export function validateRuntimeFloor(root: string = ROOT): RuntimeFloorReport {
  const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as {
    engines?: { node?: string }
  }
  const nvmrcPath = join(root, '.nvmrc')
  const files = new Map<string, string>()
  for (const scanRoot of SCAN_ROOTS) {
    for (const file of collectFiles(root, join(root, scanRoot)))
      files.set(file, readFileSync(join(root, file), 'utf8'))
  }
  return checkRuntimeFloor({
    apis: readApiTable(root),
    ceilings: JSON.parse(readFileSync(join(root, CEILINGS_PATH), 'utf8')) as Ceilings,
    engines: manifest.engines?.node,
    files,
    nvmrc: existsSync(nvmrcPath) ? readFileSync(nvmrcPath, 'utf8') : undefined,
  })
}

/* c8 ignore start -- CLI entry point, exercised via `tsx`, not the unit tests. */
const isMain = process.argv[1]
  && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))

if (isMain) {
  if (process.argv.includes('--self-test')) {
    const base = {
      apis: readApiTable(),
      ceilings: { breaches: [], maxBreaches: 0 } as Ceilings,
      engines: '^20.19.0 || >=22.13.0',
      files: new Map([['a.ts', 'const x = 1\n']]),
      nvmrc: '20.19.0\n',
    }
    // Every seeded input below names a too-new API as DATA. Each such line carries
    // the self-reference marker, because this file is itself inside the scan set.
    const seeded: { name: string, rule: string, input: Parameters<typeof checkRuntimeFloor>[0] }[] = [
      {
        input: { ...base, files: new Map([['a.ts', seedLine('globSync', 'node:fs')]]) },
        name: 'a new node-fs glob specifier',
        rule: 'unlisted-breach',
      },
      {
        input: { ...base, files: new Map([['a.ts', seedCall('Object', 'groupBy')]]) },
        name: 'a too-new static member call',
        rule: 'unlisted-breach',
      },
      {
        input: { ...base, files: new Map([['a.ts', seedLine('DatabaseSync', 'node:sqlite')]]) },
        name: 'a node-sqlite specifier',
        rule: 'unlisted-breach',
      },
      {
        input: {
          ...base,
          ceilings: {
            breaches: [{
              api: 'fs.globSync', /* runtime-floor-ok */
              exit: 'x',
              file: 'a.ts',
              reachableFrom: 'x',
              reason: 'x',
              recorded: '2026-09-24',
            }],
            maxBreaches: 1,
          },
        },
        name: 'an allowance whose file no longer uses the API',
        rule: 'entry-discharged',
      },
      {
        input: { ...base, ceilings: { breaches: [], maxBreaches: 1 } },
        name: 'a ceiling that does not equal the list',
        rule: 'ceiling-mismatch',
      },
      { input: { ...base, nvmrc: '22.13.0\n' }, name: '.nvmrc above the derived floor', rule: 'nvmrc-disagrees' },
      { input: { ...base, engines: undefined }, name: 'a missing engines.node', rule: 'floor-underivable' },
      { input: { ...base, files: new Map() }, name: 'an empty scan', rule: 'no-input' },
      { input: { ...base, apis: [] }, name: 'an empty API table', rule: 'no-table' },
    ]
    let failed = 0
    for (const testCase of seeded) {
      const report = checkRuntimeFloor(testCase.input)
      const fired = report.violations.some(violation => violation.rule === testCase.rule)
      console.warn(`${fired ? '✓' : '✗'} ${testCase.name} → expected [${testCase.rule}]`)
      if (!fired)
        failed += 1
    }
    const clean = checkRuntimeFloor(base)
    console.warn(`${clean.violations.length === 0 ? '✓' : '✗'} a clean input produces no violation`)
    if (clean.violations.length !== 0)
      failed += 1
    console.warn(`\nself-test: ${seeded.length + 1 - failed}/${seeded.length + 1} clause(s) fired`)
    process.exit(failed === 0 ? 0 : 1)
  }

  const report = validateRuntimeFloor()

  if (report.violations.length === 0) {
    console.warn(
      `✓ runtime-floor: declared floor ${report.floor} · ${report.filesScanned} source file(s) scanned · `
      + `${report.breaches.length} API(s) above the floor, all listed in ${CEILINGS_PATH}`,
    )
    for (const breach of report.breaches) {
      console.warn(
        `  ${breach.file}:${breach.line} uses \`${breach.api}\` (@since v${breach.since}) `
        + '— allowed while owner decision D160/D176 is open',
      )
    }
    process.exit(0)
  }

  for (const violation of report.violations)
    console.error(`✗ [${violation.rule}] ${violation.message}`)
  console.error(
    `\n${report.violations.length} runtime-floor violation(s). `
    + 'Run with --self-test to see the gate fire on seeded defects. '
    + 'Context: docs/program-2026-09-22-architecture/reports/TASK-S2-O4-lane-evidence.md.',
  )
  process.exit(1)
}
/* c8 ignore stop */
