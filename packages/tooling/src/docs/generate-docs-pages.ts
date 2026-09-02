/**
 * `yarn generate:docs-pages` — emit the docs site's generated pages
 * (TASK-N2-D1).
 *
 * ## The freshness gate is the point of this script
 *
 * Before a single page is written, the committed metadata artifact is compared
 * against a **fresh extraction of the sources**, using
 * `checkFreshness()` from `../validators/component-meta.ts` — the same clause
 * `yarn validate:component-meta` runs, lifted into a function rather than
 * re-implemented, because a second freshness implementation is constraint
 * **B9**'s failure mode wearing a different hat.
 *
 * `apps/docs`'s `build` script is `yarn generate && vitepress build`, so a
 * stale artifact turns **the site build** red, not merely a validator. That is
 * the task's stated whole point: a docs site publishing API facts the source no
 * longer has is worse than no docs site, because a reader cannot tell.
 *
 * Pass `--skip-freshness` for a fast local loop. It prints a loud banner and is
 * never used by `apps/docs build`; `validate:docs-pages` refuses it.
 *
 * ## What it writes
 *
 *   apps/docs/components/<Name>.md         one page per PUBLIC component
 *   apps/docs/components/index.md          the family-grouped roster
 *   apps/docs/evidence/*.md                the evidence layer (TASK-N2-D2)
 *   apps/docs/.vitepress/generated/nav.json  sidebar data + artifact fingerprints
 *
 * ## The evidence gates (TASK-N2-D2)
 *
 * Three clauses run before anything is written, and all three refuse to write
 * rather than reporting afterwards — a published page that overstates what was
 * measured has already done the damage.
 *
 * - {@link atManualTripwire} refuses an `at-manual` summary cell that claims
 *   more than the append-only AT records support. TASK-N1-O4 §6.2 measured that
 *   the capability matrix resolves a component whose every AT pairing FAILED to
 *   `pass`, because `CellState` has no `fail` value. That is an owner-level
 *   schema decision; publishing it on 144 public pages is not.
 * - {@link crossCheckCapabilityJoin} refuses a `component-meta.json` capability
 *   summary that disagrees with the capability matrix it was joined from.
 * - {@link crossCheckWcagDeviations} refuses a SC 2.5.7 audit that does not
 *   cover exactly the components the generated `drags` trait names.
 *
 * Compound parts do not get pages: all 64 attach to a public component and are
 * rendered inside their parent's page, because a sub-part is not usable on its
 * own and a page implying otherwise would be a claim.
 *
 * `--check` re-renders and compares bytes without writing, so
 * `yarn validate:docs-pages` fails when a committed page disagrees with a fresh
 * render — the same "committed output vs regenerated output" shape
 * `validate:readme-facts`, `validate:llms` and `validate:component-meta` use.
 *
 * @module @dzup-ui/tooling/docs/generate-docs-pages
 */

import type { ComponentMetaArtifact } from '../meta/component-meta.ts'
import type { EvidenceSources } from './evidence.ts'
import { Buffer } from 'node:buffer'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { COMPONENT_META_PATH, readComponentMeta, rel } from '../llms/generate-llms.ts'
import { buildComponentMeta } from '../meta/generate-component-meta.ts'
import { ROOT } from '../ownership/generate-ownership-manifest.ts'
import { checkFreshness } from '../validators/component-meta.ts'
import {
  buildNav,
  COMPONENTS_DIR,
  publicComponents,
  renderComponentPage,
  renderComponentsIndex,
  USAGE_DIR,
} from './docs-pages.ts'
import {
  EVIDENCE_DIR,
  renderAccessibilityPage,
  renderAtMatrixPage,
  renderBrowserSupportPage,
  renderCapabilityMatrixPage,
  renderEvidenceIndex,
  renderStylingPosturePage,
} from './evidence-pages.ts'
import { atManualTripwire, crossCheckCapabilityJoin, crossCheckWcagDeviations } from './evidence.ts'
import { buildPlaygroundSeeds, componentsWithSeed, refusalsOf } from './playground-seeds.ts'
import { readEvidenceSources } from './read-evidence.ts'

/** The docs app's root — VitePress `srcDir`. */
export const DOCS_ROOT = join(ROOT, 'apps/docs')
/** Where the generated component pages go. */
export const DOCS_COMPONENTS_DIR = join(DOCS_ROOT, COMPONENTS_DIR)
/** Where hand-written per-component prose lives. */
export const DOCS_USAGE_DIR = join(DOCS_ROOT, USAGE_DIR)
/** Where the generated evidence pages go (TASK-N2-D2). */
export const DOCS_EVIDENCE_DIR = join(DOCS_ROOT, EVIDENCE_DIR)
/** Sidebar data + artifact fingerprint, read by `.vitepress/config.ts`. */
export const DOCS_NAV_PATH = join(DOCS_ROOT, '.vitepress/generated/nav.json')
/**
 * Playground seeds (TASK-N2-D3). Lives under `public/` because it is fetched by
 * the browser on demand, by the page that needs it and by no other — which is
 * what "the site's non-playground pages must not pay the REPL bundle cost"
 * means in bytes.
 */
export const DOCS_PLAYGROUND_SEEDS_PATH = join(DOCS_ROOT, 'public/playground/seeds.json')

/** One generated file: absolute path and its exact bytes. */
export interface GeneratedFile {
  path: string
  content: string
}

/** SHA-256 of a string, hex — the artifact fingerprint the site config asserts. */
export function sha256(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex')
}

/**
 * Hand-written prose for a component, or `undefined`.
 *
 * This is the ONLY hand-written content that reaches a component page, it is
 * merged verbatim under its own heading, and it lives in a separate file so
 * "how much of this page is unverifiable prose" has a file-sized answer — the
 * same split `llms-content.ts` makes for the agent documents.
 */
export function readUsageProse(name: string, dir: string = DOCS_USAGE_DIR): string | undefined {
  const path = join(dir, `${name}.md`)
  return existsSync(path) ? readFileSync(path, 'utf8') : undefined
}

/** Every file the generator owns, in deterministic order. */
export function buildDocsPages(
  artifact: ComponentMetaArtifact,
  artifactSha256: string,
  usage: (name: string) => string | undefined = readUsageProse,
  evidence?: EvidenceSources,
): GeneratedFile[] {
  const files: GeneratedFile[] = []
  // TASK-N2-D3. Built FIRST, because the set of components that actually have a
  // seed is what each page's Playground section is allowed to claim.
  const seeds = buildPlaygroundSeeds(artifact)
  const playgroundSeeded = componentsWithSeed(seeds)
  // The MEASURED reason for each absence, decided once in playground-seeds.ts.
  const playgroundRefusals = refusalsOf(seeds)
  for (const record of publicComponents(artifact)) {
    files.push({
      path: join(DOCS_COMPONENTS_DIR, `${record.name}.md`),
      content: renderComponentPage({
        record,
        artifact,
        usageProse: usage(record.name),
        evidence,
        playgroundSeeded,
        playgroundRefusals,
      }),
    })
  }
  files.push({
    path: join(DOCS_COMPONENTS_DIR, 'index.md'),
    content: renderComponentsIndex(artifact),
  })
  files.push({
    path: DOCS_PLAYGROUND_SEEDS_PATH,
    content: `${JSON.stringify(seeds, null, 2)}\n`,
  })
  if (evidence !== undefined) {
    files.push(
      { path: join(DOCS_EVIDENCE_DIR, 'index.md'), content: renderEvidenceIndex(evidence) },
      { path: join(DOCS_EVIDENCE_DIR, 'capability-matrix.md'), content: renderCapabilityMatrixPage(evidence) },
      { path: join(DOCS_EVIDENCE_DIR, 'at-matrix.md'), content: renderAtMatrixPage(evidence) },
      { path: join(DOCS_EVIDENCE_DIR, 'accessibility.md'), content: renderAccessibilityPage(evidence) },
      { path: join(DOCS_EVIDENCE_DIR, 'browser-support.md'), content: renderBrowserSupportPage(evidence) },
      { path: join(DOCS_EVIDENCE_DIR, 'styling-posture.md'), content: renderStylingPosturePage(evidence, artifact) },
    )
  }
  files.push({
    path: DOCS_NAV_PATH,
    content: `${JSON.stringify(buildNav(artifact, artifactSha256, evidence), null, 2)}\n`,
  })
  return files
}

/**
 * Generated `.md` files currently on disk that a fresh run would not produce.
 *
 * Both generated directories are swept: a rename must not be able to leave a
 * component page behind claiming a component still ships, and an evidence page
 * behind claiming a measurement that is no longer taken is the same defect with
 * a worse subject.
 */
export function orphanPages(
  expected: Set<string>,
  dirs: readonly string[] = [DOCS_COMPONENTS_DIR, DOCS_EVIDENCE_DIR],
): string[] {
  return dirs
    .filter(dir => existsSync(dir))
    .flatMap(dir => readdirSync(dir)
      .filter(f => f.endsWith('.md'))
      .map(f => join(dir, f)))
    .filter(p => !expected.has(p))
    .sort()
}

/* c8 ignore start -- CLI entry point, exercised via `tsx`, not the unit tests. */
const isMain = process.argv[1] !== undefined
  && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))

if (isMain) {
  const check = process.argv.includes('--check')
  const skipFreshness = process.argv.includes('--skip-freshness')

  if (skipFreshness && check) {
    console.error('✗ --skip-freshness is not allowed with --check: the freshness clause IS the gate.')
    process.exit(1)
  }

  // ── The freshness gate ────────────────────────────────────────────────────
  if (skipFreshness) {
    console.warn(
      '  ! --skip-freshness: the metadata artifact was NOT compared against a fresh extraction.\n'
      + '    These pages may describe source that no longer exists. Never use this for a real build.',
    )
  }
  else {
    const { artifact: fresh } = buildComponentMeta()
    const stale = checkFreshness(fresh)
    if (stale.length > 0) {
      for (const v of stale)
        console.error(`✗ [${v.rule}] ${v.message}`)
      console.error(
        '\nThe docs site was NOT generated. A site rendered from a stale artifact publishes API\n'
        + 'facts the source no longer has, and a reader cannot tell. Regenerate the artifact first.',
      )
      process.exit(1)
    }
  }

  const artifactBytes = readFileSync(COMPONENT_META_PATH, 'utf8')
  const artifact = readComponentMeta()

  // ── The evidence gates ────────────────────────────────────────────────────
  // Three clauses, and all three refuse to WRITE rather than reporting after
  // the fact. A docs site that has already published a wrong evidence state has
  // done the damage; the point of a gate here is that the page never exists.
  const evidence = readEvidenceSources()
  const evidenceProblems = [
    ...atManualTripwire(evidence),
    ...crossCheckCapabilityJoin(artifact, evidence),
    ...crossCheckWcagDeviations(evidence),
  ]
  if (evidenceProblems.length > 0) {
    for (const p of evidenceProblems)
      console.error(`✗ [evidence] ${p}`)
    console.error(
      `\n${evidenceProblems.length} evidence violation(s). NOTHING was generated.\n`
      + 'An evidence page that overstates what was measured is worse than no evidence page, because a\n'
      + 'reader cannot tell. Fix the artifact that disagrees, then re-run.',
    )
    process.exit(1)
  }

  const files = buildDocsPages(artifact, sha256(artifactBytes), readUsageProse, evidence)
  const expected = new Set(files.map(f => f.path))

  if (check) {
    const problems: string[] = []
    for (const file of files) {
      if (!existsSync(file.path)) {
        problems.push(`${rel(file.path)} is missing. Run \`yarn generate:docs-pages\`.`)
        continue
      }
      if (readFileSync(file.path, 'utf8') !== file.content)
        problems.push(`${rel(file.path)} is STALE — it disagrees with a fresh render. Run \`yarn generate:docs-pages\`.`)
    }
    for (const orphan of orphanPages(expected))
      problems.push(`${rel(orphan)} is an ORPHAN — a fresh run produces no such page. Delete it or regenerate.`)

    for (const p of problems)
      console.error(`  ✗ ${p}`)
    if (problems.length > 0) {
      console.error(`\n${problems.length} docs-page violation(s).`)
      process.exit(1)
    }
    const atCells = evidence.atMatrix.entries.reduce((n, e) => n + e.rows.length, 0)
    const atExecuted = evidence.atMatrix.entries
      .reduce((n, e) => n + e.rows.filter(r => r.result !== 'unrun').length, 0)
    const cells = evidence.capability.rows.flatMap(r => r.cells)
    console.warn(
      `  ✓ docs pages fresh — ${artifact.totals.publicComponents} component pages + index `
      + `+ ${files.filter(f => f.path.startsWith(DOCS_EVIDENCE_DIR)).length} evidence pages `
      + `+ nav + playground seeds, `
      + `rendered from ${rel(COMPONENT_META_PATH)}\n`
      + `    evidence: ${cells.length} capability cells `
      + `(${cells.filter(c => c.state === 'unrun').length} unrun, `
      + `${cells.filter(c => c.state === 'stale').length} stale) · `
      + `AT cells executed ${atExecuted}/${atCells}`,
    )
    process.exit(0)
  }

  mkdirSync(DOCS_COMPONENTS_DIR, { recursive: true })
  mkdirSync(DOCS_EVIDENCE_DIR, { recursive: true })
  mkdirSync(join(DOCS_ROOT, '.vitepress/generated'), { recursive: true })
  mkdirSync(join(DOCS_ROOT, 'public/playground'), { recursive: true })

  // Remove pages for components that no longer exist BEFORE writing, so a
  // renamed component cannot leave a page behind claiming it still ships.
  for (const orphan of orphanPages(expected)) {
    rmSync(orphan)
    console.warn(`  - removed orphan ${rel(orphan)}`)
  }

  let bytes = 0
  for (const file of files) {
    writeFileSync(file.path, file.content, 'utf8')
    bytes += Buffer.byteLength(file.content)
  }

  const t = artifact.totals
  const cells = evidence.capability.rows.flatMap(r => r.cells)
  const atCells = evidence.atMatrix.entries.reduce((n, e) => n + e.rows.length, 0)
  const atExecuted = evidence.atMatrix.entries
    .reduce((n, e) => n + e.rows.filter(r => r.result !== 'unrun').length, 0)
  console.warn(
    `▸ docs pages: ${t.publicComponents} public components `
    + `(+ ${t.compoundParts} compound parts nested in their parents' pages) `
    + `from ${artifact.extractor}\n`
    + `  → ${rel(DOCS_COMPONENTS_DIR)}/*.md — ${files.length} files, ${bytes} B\n`
    + `  → ${rel(DOCS_EVIDENCE_DIR)}/*.md — the evidence layer\n`
    + `  → ${rel(DOCS_NAV_PATH)} — sidebar data, artifact sha256 ${sha256(artifactBytes).slice(0, 12)}…\n`
    + `  evidence: ${cells.length} capability cells over ${evidence.capability.rows.length} components `
    + `— ${cells.filter(c => c.state === 'unrun').length} unrun, `
    + `${cells.filter(c => c.state === 'stale').length} stale, `
    + `${cells.filter(c => c.state === 'excepted').length} excepted\n`
    + `  AT cells executed: ${atExecuted}/${atCells}`
    + `${atExecuted === 0 ? '  ← published as unrun, per pair, on every page' : ''}\n`
    + `  optional lane records: `
    + `${['engines', 'knownFailures', 'securityDeviations']
      .map(k => `${k}=${evidence[k as 'engines'] === undefined ? 'ABSENT' : 'present'}`)
      .join(' · ')}`,
  )
}
/* c8 ignore stop */
