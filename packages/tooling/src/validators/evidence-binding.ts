/**
 * Evidence-binding validator (TASK-S0-O1).
 *
 * Fails when a generated artifact's `sourceCommit` no longer describes the tree
 * it was generated from — that is, when something the artifact declares itself
 * `generatedFrom` changed **after** the artifact was stamped.
 *
 * ## Why this is not `sourceCommit === HEAD`
 *
 * Four programmes have now written a `sourceCommit === HEAD` check, and all
 * four were unsatisfiable. The reason is structural and is stated in
 * `../quality/git.ts`'s own `headCommit()` doc comment: an artifact is written
 * into the working tree at `HEAD = X`, and the commit that lands it is `X+1`.
 * A committed artifact therefore **always** stamps its own parent. An agent
 * that cannot commit can satisfy the equality only in a dirty worktree, and the
 * owner's commit breaks it again in the same act that lands the fix — which is
 * exactly what happened at `4e4e46f`, a commit literally titled *"regenerate
 * evidence at `589be13`"* that left every artifact one commit behind.
 *
 * So the equality is red precisely when the artifact is most correct, and green
 * only in a state nobody can commit. A gate like that gets ignored, and an
 * ignored gate is worse than no gate.
 *
 * **The question that actually matters is ordering, not equality:** is every
 * input's last change at or before the commit the artifact was stamped at? That
 * is satisfiable from a clean committed tree, it stays true across any number
 * of later commits that do not touch the inputs, and it goes red the moment a
 * component changes without a regeneration — which is the failure the equality
 * was trying, and failing, to catch. It is the same shape as
 * `evidenceIsCurrent()` in `../quality/git.ts`, applied one level up.
 *
 * ## The four rules
 *
 * 1. **On this history.** `sourceCommit` resolves and is an ancestor of `HEAD`
 *    (or is `HEAD`). A stamp from an abandoned branch names a tree this
 *    checkout cannot reason about.
 * 2. **No input moved since.** No commit in `(sourceCommit, HEAD]` touches any
 *    of the artifact's `generatedFrom` pathspecs, excluding the paths declared
 *    as outputs of the same regeneration cycle.
 * 3. **The chain is ordered.** Where an input is itself a governed artifact,
 *    its stamp must be an ancestor of (or equal to) this artifact's stamp — a
 *    matrix may not claim to be built from a manifest newer than itself.
 * 4. **Uncommitted input edits are reported, not failed.** A dirty input means
 *    the artifact does not describe the working tree, but it says nothing about
 *    the committed binding, which is what this gate exists to prove. It prints
 *    as a `!` line, like the advisory findings in `peer-ranges.ts`.
 *
 * ## Why the matching is delegated to git
 *
 * The `generatedFrom` globs are handed to `git log -- :(glob)<pattern>`
 * unchanged, so git does the pathspec matching and this repository gains no
 * second glob implementation (constraint **B9**'s failure mode). One `git log`
 * per artifact answers the whole question, rather than one `git log` per file
 * across 200+ SFCs.
 *
 * Usage:
 *   tsx packages/tooling/src/validators/evidence-binding.ts
 *
 * Exit code 1 if violations found.
 *
 * @module @dzup-ui/tooling/validators/evidence-binding
 */

import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../')

export const CONFIG_PATH = resolve(ROOT, 'packages/tooling/src/validators/evidence-binding.json')

/** One governed artifact, as the config declares it. */
export interface GovernedArtifact {
  path: string
  generator: string
  order: number
}

export interface EvidenceBindingConfig {
  artifacts: GovernedArtifact[]
  generatedOutputs: string[]
}

export function readConfig(path: string = CONFIG_PATH): EvidenceBindingConfig {
  const parsed = JSON.parse(readFileSync(path, 'utf8')) as Partial<EvidenceBindingConfig>
  return {
    artifacts: parsed.artifacts ?? [],
    generatedOutputs: parsed.generatedOutputs ?? [],
  }
}

/**
 * The file a `generatedFrom` entry names.
 *
 * Two annotations appear in the committed artifacts and neither is part of the
 * path: `packages/core/package.json#exports` narrows the claim to one key, and
 * `packages/tooling/src/validators/story-dod.ts (report)` says the generator
 * consumes the script's output rather than its text. Both name a real file.
 */
export function normaliseInput(entry: string): string {
  return entry.replace(/\s*\(.*\)\s*$/, '').replace(/#.*$/, '').trim()
}

/** A pathspec git will match the way the artifact means it. */
export function toPathspec(input: string): string {
  return `:(glob)${input}`
}

export interface ArtifactStamp {
  path: string
  sourceCommit: string
  generatedFrom: string[]
}

/** Read an artifact's provenance without caring what else is in it. */
export function readStamp(path: string, root: string = ROOT): ArtifactStamp | undefined {
  const full = resolve(root, path)
  if (!existsSync(full))
    return undefined
  const json = JSON.parse(readFileSync(full, 'utf8')) as {
    sourceCommit?: string
    generatedFrom?: string[]
  }
  if (typeof json.sourceCommit !== 'string')
    return undefined
  return { path, sourceCommit: json.sourceCommit, generatedFrom: json.generatedFrom ?? [] }
}

function git(args: string[], root: string): string {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()
}

/** `true` when `ancestor` is `descendant` or an ancestor of it. */
export function isAncestorOrSame(ancestor: string, descendant: string, root: string = ROOT): boolean {
  if (ancestor === descendant)
    return true
  try {
    execFileSync('git', ['merge-base', '--is-ancestor', ancestor, descendant], {
      cwd: root,
      stdio: 'ignore',
    })
    return true
  }
  catch {
    return false
  }
}

export interface Violation {
  artifact: string
  rule: 'not-on-history' | 'input-moved' | 'chain-out-of-order' | 'unreadable'
  detail: string
  /** The concrete commits or paths that prove it, for the console. */
  evidence: string[]
  remedy: string
}

export interface Advisory {
  artifact: string
  detail: string
  paths: string[]
}

export interface BindingReport {
  head: string
  checked: number
  violations: Violation[]
  advisories: Advisory[]
}

/**
 * Commits in `(from, to]` that touch any of `pathspecs`, newest first.
 *
 * `--` separates the revision range from the pathspecs so a path that happens
 * to look like a ref cannot be read as one.
 */
export function commitsTouching(
  from: string,
  to: string,
  pathspecs: string[],
  root: string = ROOT,
): string[] {
  if (pathspecs.length === 0)
    return []
  const out = git(['log', '--format=%H %s', `${from}..${to}`, '--', ...pathspecs], root)
  return out === '' ? [] : out.split('\n')
}

/**
 * Strip the `XY ` status prefix from one `git status --porcelain` line.
 *
 * Spelled as a regex rather than `slice(3)` because the prefix is two status
 * characters followed by **one or more** spaces — git pads a staged-and-dirty
 * pair differently from an untracked one, and a fixed slice silently ate the
 * first character of the path on the padded form. A rename prints
 * `R  old -> new`; the new path is the one that exists.
 */
export function pathFromStatusLine(line: string): string {
  const withoutStatus = line.replace(/^..\s+/, '').trim()
  const arrow = withoutStatus.lastIndexOf(' -> ')
  return arrow === -1 ? withoutStatus : withoutStatus.slice(arrow + 4)
}

/** Input paths with uncommitted modifications, if any. */
export function dirtyInputs(pathspecs: string[], root: string = ROOT): string[] {
  if (pathspecs.length === 0)
    return []
  const out = git(['status', '--porcelain', '--', ...pathspecs], root)
  return out === '' ? [] : out.split('\n').map(pathFromStatusLine).filter(path => path !== '')
}

/**
 * Apply the four rules to every governed artifact.
 *
 * `head` is a parameter rather than a lookup so the unit tests can drive it.
 */
export function checkEvidenceBinding(
  config: EvidenceBindingConfig,
  head: string,
  root: string = ROOT,
): BindingReport {
  const violations: Violation[] = []
  const advisories: Advisory[] = []
  const governed = new Map<string, ArtifactStamp>()

  for (const artifact of [...config.artifacts].sort((a, b) => a.order - b.order)) {
    const stamp = readStamp(artifact.path, root)
    if (stamp === undefined) {
      violations.push({
        artifact: artifact.path,
        rule: 'unreadable',
        detail: 'missing, unparseable, or carrying no `sourceCommit`',
        evidence: [],
        remedy: `run ${artifact.generator}`,
      })
      continue
    }
    governed.set(artifact.path, stamp)

    // Rule 1 — on this history.
    if (!isAncestorOrSame(stamp.sourceCommit, head, root)) {
      violations.push({
        artifact: artifact.path,
        rule: 'not-on-history',
        detail: `sourceCommit ${stamp.sourceCommit.slice(0, 8)} is not HEAD and not an ancestor of it`,
        evidence: [`HEAD ${head.slice(0, 8)}`],
        remedy: `run ${artifact.generator} from this checkout`,
      })
      continue
    }

    // Rule 2 — no input moved since the stamp. Outputs of the same
    // regeneration cycle are excluded: a commit that lands a regeneration
    // touches all of them at once, and none of them is an input.
    const declared = stamp.generatedFrom.map(normaliseInput).filter(input => input !== '')
    const inputs = declared.filter(input => !config.generatedOutputs.includes(input))
    const moved = commitsTouching(stamp.sourceCommit, head, inputs.map(toPathspec), root)
    if (moved.length > 0) {
      const changed = git(
        ['diff', '--name-only', `${stamp.sourceCommit}..${head}`, '--', ...inputs.map(toPathspec)],
        root,
      )
      violations.push({
        artifact: artifact.path,
        rule: 'input-moved',
        detail:
          `${moved.length} commit(s) changed its declared inputs after it was stamped `
          + `at ${stamp.sourceCommit.slice(0, 8)}`,
        evidence: [...moved.slice(0, 3), ...changed.split('\n').filter(l => l !== '').slice(0, 5)],
        remedy: `run ${artifact.generator}`,
      })
    }

    // Rule 3 — the chain is ordered. This walks `declared`, not `inputs`: a
    // governed artifact is by definition an output of the same cycle, so rule
    // 2 filters it out, and reading the filtered list here made this rule
    // unreachable for the only inputs it can ever apply to.
    for (const input of declared) {
      const upstream = governed.get(input)
      if (upstream === undefined)
        continue
      if (!isAncestorOrSame(upstream.sourceCommit, stamp.sourceCommit, root)) {
        violations.push({
          artifact: artifact.path,
          rule: 'chain-out-of-order',
          detail:
            `built from ${input}, which is stamped ${upstream.sourceCommit.slice(0, 8)} — `
            + `newer than this artifact's own ${stamp.sourceCommit.slice(0, 8)}`,
          evidence: [],
          remedy: `re-run the chain in declared order, ending with ${artifact.generator}`,
        })
      }
    }

    // Rule 4 — advisory only.
    const dirty = dirtyInputs(inputs.map(toPathspec), root)
    if (dirty.length > 0)
      advisories.push({ artifact: artifact.path, detail: 'declared inputs are modified in the working tree', paths: dirty })
  }

  return { head, checked: config.artifacts.length, violations, advisories }
}

/* c8 ignore start -- CLI entry point, exercised via `tsx`, not the unit tests. */
const isMain = process.argv[1]
  && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))

if (isMain) {
  const config = readConfig()
  const head = git(['rev-parse', 'HEAD'], ROOT)
  const report = checkEvidenceBinding(config, head, ROOT)

  for (const advisory of report.advisories) {
    console.warn(`  ! [dirty-input] ${advisory.artifact}: ${advisory.detail}`)
    for (const path of advisory.paths.slice(0, 5))
      console.warn(`      ${path}`)
    console.warn('      the COMMITTED binding is what this gate proves; this line is not a failure')
  }

  if (report.violations.length === 0) {
    const stamps = config.artifacts
      .map(a => readStamp(a.path))
      .filter((s): s is ArtifactStamp => s !== undefined)
    const atHead = stamps.filter(s => s.sourceCommit === head).length
    console.warn(
      `✓ evidence-binding: ${report.checked} generated artifact(s) bound — every declared input's `
      + `last change is at or before the commit its artifact was stamped at `
      + `(HEAD ${head.slice(0, 8)}; ${atHead}/${stamps.length} also stamp HEAD exactly, `
      + `which is expected to be 0 immediately after the owner commits a regeneration)`,
    )
    process.exit(0)
  }

  for (const violation of report.violations) {
    console.error(`✗ [${violation.rule}] ${violation.artifact}: ${violation.detail}`)
    for (const line of violation.evidence)
      console.error(`      ${line}`)
    console.error(`  → ${violation.remedy}`)
  }
  console.error(
    `\n${report.violations.length} evidence-binding violation(s) at HEAD ${head.slice(0, 8)}.`,
  )
  // The order alone is not enough, and a bare list is what broke three agents'
  // validation runs in the 2026-09-22 programme: two of the steps are owed by changes
  // that do not look like they touch a generated artifact at all, and one required
  // command is in neither this list nor `validate:all` (RESIDUAL-07, 2026-09-25).
  console.error(
    '  Regeneration order: ownership → quality → capability → component-meta → llms → docs-pages.\n'
    + '    component-meta is owed by a CAPABILITY change (it carries a join of capability-matrix.json,\n'
    + '      checked by src/docs/evidence.spec.ts) and by any STORY edit (it records each story\'s\n'
    + '      example line range), and docs-pages is owed by every component-meta change, because\n'
    + '      nav.json\'s artifactSha256 IS the sha256 of component-meta.json.\n'
    + '  Not in that order and not in validate:all: yarn csp:inline-style-inventory. Run it after ANY\n'
    + '    edit to a .vue that carries an inline style= — the inventory records LINE NUMBERS, so a\n'
    + '    one-line insertion makes it stale, and the only gate that fails is the unit suite\n'
    + '    (packages/core/security/inline-style-inventory.spec.ts).',
  )
  process.exit(1)
}
/* c8 ignore stop */
