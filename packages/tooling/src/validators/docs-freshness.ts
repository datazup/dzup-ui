/**
 * `yarn validate:docs-freshness` — is the built docs site the site this tree
 * would produce? (TASK-S2-O3, the `<freshness>` clause of the S2-O3 prompt.)
 *
 * ## The hole this closes
 *
 * At `4e4e46f` the repository had three gates over `apps/docs` and not one of
 * them could tell a **stale build** from a fresh one:
 *
 * | Gate | What it compares | Blind to |
 * |---|---|---|
 * | `validate:docs-pages` | the committed `.md` pages vs a fresh render of `component-meta.json` | **`.vitepress/dist` entirely** — it never opens it |
 * | `validate:docs-size` | `dist`'s byte total vs `docs-size-ceilings.json` | *which* build produced those bytes; a six-week-old dist measures the same as a new one |
 * | `validate:playground-parity` | the copied playground assets vs the producer | the pages and the rendered HTML |
 *
 * So the deployable artifact — the only thing a deploy uploads — was the one
 * input under no binding at all. A deploy pipeline that ran `validate:docs-size`
 * over a `dist/` left behind by an earlier packet would pass a ceiling, pass the
 * page gate (which reads `.md`, not HTML) and publish a site describing a tree
 * that no longer exists. That is the same S1-F10 shape `docs-size` itself was
 * rewritten for on 2026-09-22 (finding S6), one level further out.
 *
 * ## The three clauses
 *
 *   1. `dist` — `apps/docs/.vitepress/dist/index.html` exists. Absent is a
 *      **skip** off CI (the dist is gitignored, ADR-12, and a fresh clone has
 *      nothing to measure) and an **error** whenever `--require-dist` is passed
 *      or `CI` is set. Identical policy to `validate:docs-size`, deliberately:
 *      two gates over one artifact should not disagree about what an absence
 *      means.
 *   2. `stale` — no declared input may be **newer** than the build. The build
 *      stamp is `dist/index.html`'s mtime, because VitePress rewrites the home
 *      page on every build; taking `max(mtime)` over all 510 files instead would
 *      let one touched file certify the other 509. Off CI a stale build is a
 *      **report** (an ordinary local edit makes the dist stale within seconds
 *      and a validator that fails on that gets switched off within a week); with
 *      `--require-dist` or `CI` it is an **error**, because on the machine that
 *      uploads bytes "the artifact predates its inputs" is a finding, not an
 *      inconvenience.
 *   3. `stamp` — every generated artifact the site *renders* must name the
 *      **same** `sourceCommit`. This is the enforceable half of the evidence
 *      binding: a site whose component pages come from one commit and whose
 *      evidence pages come from another publishes a contradiction, and that is
 *      decidable from the files alone. The run also **prints** each stamp
 *      against `git rev-parse HEAD`, but does **not** fail on a difference —
 *      that comparison is register row #40's known-defective shape (an artifact
 *      is stamped with the HEAD it was generated at, so the stamps go stale the
 *      instant the owner commits, through no fault of anyone's). Reported,
 *      never enforced.
 *
 * ## What it deliberately does not do
 *
 * It does not re-render a page, re-extract metadata or rebuild the site — three
 * other gates already do exactly that and a fourth extractor is the thing this
 * repository refuses (constraint B9). It asks only the question none of them
 * asks: *is the artifact on disk younger than everything it was made from.*
 *
 * Usage:
 *   tsx packages/tooling/src/validators/docs-freshness.ts
 *   tsx packages/tooling/src/validators/docs-freshness.ts --require-dist
 *
 * Exit code 1 if a hard clause fails.
 *
 * @module @dzup-ui/tooling/validators/docs-freshness
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { ROOT } from '../ownership/generate-ownership-manifest.ts'

// ── Locations ───────────────────────────────────────────────────────────────

/** The built site. Gitignored; a build output (ADR-12). */
export const DOCS_DIST = resolve(ROOT, 'apps/docs/.vitepress/dist')

/**
 * The build stamp. VitePress rewrites the home page on every build, so this one
 * file's mtime is the build time. `max(mtime)` over the whole tree is NOT the
 * build time — it is the last time anything under `dist/` was touched, which a
 * single stray write would then certify the other 509 files with.
 */
export const BUILD_STAMP_FILE = join(DOCS_DIST, 'index.html')

/**
 * Directories whose every `.md` file is a generated page, and the generated
 * navigation. Any one of them newer than the build means the build does not
 * contain it.
 */
export const INPUT_DIRS = [
  'apps/docs/components',
  'apps/docs/evidence',
] as const

/** Individual files the site is rendered from. */
export const INPUT_FILES = [
  'apps/docs/.vitepress/generated/nav.json',
  'apps/docs/.vitepress/config.ts',
  'packages/core/docs/component-meta.json',
  'packages/core/docs/capability-matrix.json',
  'packages/core/docs/quality-matrix.json',
  'packages/core/docs/wcag-deviations.json',
  'apps/docs/public/playground/dzup-core.mjs',
  'apps/docs/public/playground/tokens.css',
  'apps/docs/public/playground/core.css',
] as const

/**
 * Artifacts that carry a `sourceCommit` and are rendered into the site. They
 * must all name the same commit; see clause 3.
 */
export const STAMPED_ARTIFACTS = [
  'packages/core/docs/component-meta.json',
  'packages/core/docs/capability-matrix.json',
  'packages/core/docs/quality-matrix.json',
  'packages/core/manifests/component-ownership.manifest.json',
] as const

// ── Types ───────────────────────────────────────────────────────────────────

export interface FreshnessViolation {
  rule: 'dist' | 'stale' | 'stamp'
  level: 'error' | 'report'
  message: string
}

export interface StaleInput {
  rel: string
  mtimeMs: number
}

export interface FreshnessResult {
  /** Absent when the dist was not built. */
  buildStampMs?: number
  /** Inputs newer than the build stamp, newest first. */
  stale: StaleInput[]
  /** How many inputs were compared. */
  inputsChecked: number
  /** `sourceCommit` per stamped artifact (`undefined` = file or field absent). */
  stamps: Record<string, string | undefined>
  violations: FreshnessViolation[]
}

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * `--require-dist` or `CI` makes an absent or stale dist an error.
 * Same shape and same reasoning as `validate:docs-size`'s own predicate:
 * off CI an absence is an honest skip, on CI it is a finding.
 * `--allow-missing-dist` opts a pre-build CI job back out.
 */
export function shouldRequireDist(
  argv: readonly string[] = process.argv,
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  if (argv.includes('--allow-missing-dist'))
    return false
  return argv.includes('--require-dist') || Boolean(env.CI)
}

/** Every `.md` file directly under `dir`, as repo-relative paths. */
export function listMarkdown(dir: string, root: string = ROOT): string[] {
  const abs = resolve(root, dir)
  if (!existsSync(abs))
    return []
  // A missing directory is not an error here — clause 2 is about relative age, and
  // a page directory that does not exist is validate:docs-pages' question, not this
  // one.
  return readdirSync(abs)
    .filter(name => name.endsWith('.md'))
    .map(name => relative(root, join(abs, name)).replaceAll('\\', '/'))
}

/** Reads `sourceCommit` from a generated artifact, or `undefined`. */
export function readStamp(rel: string, root: string = ROOT): string | undefined {
  const abs = resolve(root, rel)
  if (!existsSync(abs))
    return undefined
  try {
    const parsed = JSON.parse(readFileSync(abs, 'utf8')) as Record<string, unknown>
    const direct = parsed.sourceCommit
    if (typeof direct === 'string')
      return direct
    const meta = parsed.meta as Record<string, unknown> | undefined
    if (meta !== undefined && typeof meta.sourceCommit === 'string')
      return meta.sourceCommit
    return undefined
  }
  catch {
    return undefined
  }
}

// ── The check ───────────────────────────────────────────────────────────────

export function checkDocsFreshness(options: {
  root?: string
  requireDist?: boolean
} = {}): FreshnessResult {
  const root = options.root ?? ROOT
  const requireDist = options.requireDist ?? false
  const violations: FreshnessViolation[] = []

  const stamps: Record<string, string | undefined> = {}
  for (const rel of STAMPED_ARTIFACTS)
    stamps[rel] = readStamp(rel, root)

  // Clause 3 — the stamps must agree with each other. Decidable, and the half of
  // the evidence binding that is NOT register row #40's impossible comparison.
  const present = Object.entries(stamps).filter(([, v]) => v !== undefined) as [string, string][]
  const distinct = [...new Set(present.map(([, v]) => v))]
  if (distinct.length > 1) {
    violations.push({
      rule: 'stamp',
      level: 'error',
      message: `the site renders artifacts stamped at ${distinct.length} different commits `
        + `(${present.map(([k, v]) => `${k.split('/').pop()} ${v.slice(0, 7)}`).join(' · ')}). `
        + 'A published site whose component pages and evidence pages come from two '
        + 'commits states a contradiction. Regenerate in the sanctioned order '
        + '(ownership → quality → capability → component-meta → llms → docs-pages) — '
        + 'component-meta is owed by a capability change AND by any story edit, and '
        + 'docs-pages by every component-meta change, because nav.json\'s artifactSha256 '
        + 'is the sha256 of component-meta.json. Then yarn csp:inline-style-inventory, '
        + 'which no link of that order refreshes and validate:all never checks.',
    })
  }
  const missingStamp = Object.entries(stamps).filter(([, v]) => v === undefined).map(([k]) => k)
  if (missingStamp.length > 0) {
    violations.push({
      rule: 'stamp',
      level: 'error',
      message: `${missingStamp.length} rendered artifact(s) carry no sourceCommit and so bind to `
        + `nothing: ${missingStamp.join(', ')}. An unbound artifact is not evidence.`,
    })
  }

  // Clause 1 — is there a build to talk about at all?
  const buildStampPath = resolve(root, 'apps/docs/.vitepress/dist/index.html')
  if (!existsSync(buildStampPath)) {
    violations.push({
      rule: 'dist',
      level: requireDist ? 'error' : 'report',
      message: `apps/docs/.vitepress/dist/index.html is absent — the site has not been built, `
        + `so its freshness is UNMEASURED and UNENFORCED. Build it with \`yarn docs:build\`. ${
          requireDist
            ? 'Under --require-dist or CI this is an error: the machine that uploads bytes may '
            + 'not treat "never built" as "fine".'
            : 'Pass --require-dist to make the absence an error.'}`,
    })
    return { stale: [], inputsChecked: 0, stamps, violations }
  }

  const buildStampMs = statSync(buildStampPath).mtimeMs

  // Clause 2 — nothing the site is made from may be newer than the site.
  const inputs: string[] = [
    ...INPUT_DIRS.flatMap(d => listMarkdown(d, root)),
    ...INPUT_FILES,
  ]
  const stale: StaleInput[] = []
  let inputsChecked = 0
  for (const rel of inputs) {
    const abs = resolve(root, rel)
    if (!existsSync(abs))
      continue
    inputsChecked += 1
    const mtimeMs = statSync(abs).mtimeMs
    if (mtimeMs > buildStampMs)
      stale.push({ rel, mtimeMs })
  }
  stale.sort((a, b) => b.mtimeMs - a.mtimeMs)

  if (stale.length > 0) {
    const newest = stale.slice(0, 5).map(s => `${s.rel} (+${Math.round((s.mtimeMs - buildStampMs) / 1000)}s)`)
    violations.push({
      rule: 'stale',
      level: requireDist ? 'error' : 'report',
      message: `${stale.length} of ${inputsChecked} input(s) are NEWER than the built site — `
        + `the dist does not contain them. Newest first: ${newest.join(' · ')}`
        + `${stale.length > 5 ? ` … and ${stale.length - 5} more` : ''}. `
        + `Rebuild with \`yarn docs:build\`.${
          requireDist
            ? ''
            : ' Off CI this is a report: an ordinary local edit makes the dist stale within '
              + 'seconds. Pass --require-dist (the deploy lane does) to make it an error.'}`,
    })
  }

  return { buildStampMs, stale, inputsChecked, stamps, violations }
}

// ── CLI ─────────────────────────────────────────────────────────────────────

/* c8 ignore start */
const isMain = process.argv[1] !== undefined
  && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))

if (isMain) {
  const requireDist = shouldRequireDist(process.argv)
  const result = checkDocsFreshness({ requireDist })

  console.warn('Docs-site freshness — TASK-S2-O3\n')

  if (result.buildStampMs === undefined) {
    console.warn('  dist       NOT BUILT — nothing measured')
  }
  else {
    console.warn(`  built      ${new Date(result.buildStampMs).toISOString()} `
      + '(apps/docs/.vitepress/dist/index.html)')
    console.warn(`  inputs     ${result.inputsChecked} compared · `
      + `${result.stale.length} newer than the build`)
  }

  // The stamps are always printed, including against HEAD, because a number that
  // is not bound to a commit is not evidence — and because the HEAD comparison is
  // reported rather than enforced (register row #40).
  console.warn('')
  for (const [rel, commit] of Object.entries(result.stamps))
    console.warn(`  stamp      ${(commit ?? 'NONE').slice(0, 7).padEnd(8)} ${rel}`)

  const errors = result.violations.filter(v => v.level === 'error')
  for (const v of result.violations.filter(x => x.level === 'report'))
    console.warn(`\n  ! [${v.rule}] ${v.message}`)

  if (errors.length === 0) {
    if (result.buildStampMs === undefined || result.stale.length > 0) {
      console.warn('\n⚠ docs-freshness: the stamps agree, but the BUILD is unmeasured or stale — '
        + 'this run proves nothing about the deployable artifact. '
        + 'Run with --require-dist (the deploy lane does) to make that an error.')
      process.exit(0)
    }
    console.warn('\n✓ docs-freshness: the built site is younger than every input, '
      + 'and every rendered artifact names the same commit.')
    process.exit(0)
  }
  console.error('')
  for (const e of errors)
    console.error(`✗ [${e.rule}] ${e.message}`)
  console.error(`\n${errors.length} docs-freshness violation(s).`)
  process.exit(1)
}
/* c8 ignore stop */
