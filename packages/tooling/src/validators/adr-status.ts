/**
 * ADR status gate (TASK-S0-O3, 2026-09-24).
 *
 * An architecture decision record whose own `Status:` line says `Proposed`,
 * while shipped source builds on it, is not a decision record — it is a rumour
 * with a number. On the day this gate landed, **three** ADRs were in that state,
 * and one of them was cited from 250 files of shipped source: 104 `.anatomy.ts`
 * files, all six cascade layers and 90 `ui?:`-declaring `.types.ts` implement a
 * styling contract nobody has signed. A consumer reading it cannot tell whether
 * `data-part` is a promise or a draft.
 *
 * Every `ADR-NN` id in this file's own prose carries the `adr-example-ok:` marker
 * that `validate-adr-references.ts` defines, because they are the gate's subject
 * matter rather than code built on a decision. Without the markers the validator
 * inflates its own meter: its first run reported the runtime-floor ADR at **2**
 * shipped citations, one of which was a sentence in this comment describing it.
 *
 * `validate:adr-references` already measures that debt, as
 * `maxProposedCitedFromCode` in `packages/tooling/scripts/adr-registry.json`.
 * This gate is not a second copy of it, and the difference is the whole reason
 * it exists:
 *
 * - That ceiling is a **number**. With it at 3, accepting one ADR while one new
 *   unsigned decision becomes load-bearing in the same release leaves the
 *   arithmetic at 3 — equal to the ceiling, silently green. The next decision
 *   would become load-bearing exactly the way these three did.
 * - This gate is a **named set**: `adr-status-grandfather.json` lists the three
 *   ADRs that were already in that state, with a date, a reason and an exit
 *   condition each. A `Proposed` ADR that is not on the list fails whatever the
 *   arithmetic says. That is the hole closed, and `adr-status.spec.ts` proves it
 *   with a seeded swap that keeps the arithmetic ceiling intact.
 * - It also narrows the scope to **shipped source**. `isCodeCitation` in
 *   `validate-adr-references.ts` counts any non-Markdown file under `packages/`
 *   or `apps/` — a config, a JSON fixture, a generated release blob. The set
 *   that reaches a consumer's bundle is narrower and is the set that makes a
 *   decision load-bearing.
 *
 * ## It fails closed, on purpose
 *
 * "The gate greened because it found nothing to check" is the failure mode this
 * programme keeps catching — a `grep … | head` masked an exit code and produced
 * a false pass two tasks before this one. So:
 *
 * - **No ADR documents at all** is a violation, not a pass. An empty `docs/adr/`
 *   means the gate lost its input, and a gate with no input has no verdict.
 * - **An unreadable or missing `Status:` line** is a violation with a named
 *   reason. A document the parser cannot read would otherwise drop silently out
 *   of the `Proposed` set and turn the gate green by omission.
 * - **A status word outside the known lifecycle vocabulary** reads as unreadable,
 *   because `readStatus` only recognises {@link ADR_STATUSES}. `Accepted?`,
 *   `Draft` or `Ratified` therefore fail rather than quietly meaning "not
 *   Proposed".
 * - **A grandfather entry that has been discharged** — its ADR is no longer
 *   `Proposed`, or no longer cited from shipped source — fails. This is what
 *   makes the list empty itself instead of becoming a permanent allowance: the
 *   day an owner flips a `Status:` line, this gate goes red until the entry is
 *   deleted and `maxGrandfathered` lowered in the same change.
 *
 * Status is read from each document, never from the grandfather file. Mirroring
 * it would create a second place for one fact to be wrong, which is the
 * hand-typed-facts defect class the ADR registry's `$comment` records six prior
 * sightings of.
 *
 * ## What this gate does NOT do
 *
 * It does not freeze a citation count. A "blast radius may not grow" rule needs
 * a transcribed number per ADR, and a transcribed number goes stale — the same
 * reason `adr-registry.json` refuses to mirror status. The counts are reported
 * on every run so a reviewer sees movement; they are not asserted.
 *
 * Usage:
 *   tsx packages/tooling/src/validators/adr-status.ts
 *
 * Exit code 1 on any violation.
 */

import type { AdrDocument } from '../../scripts/validate-adr-references.ts'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import {
  ADR_STATUSES,
  collectDocuments,
  extractCitations,
  normaliseAdrId,
} from '../../scripts/validate-adr-references.ts'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../')

/** Where the dated, finite grandfather list lives. */
export const GRANDFATHER_PATH = 'packages/tooling/src/validators/adr-status-grandfather.json'

/** Where ADR documents live — the same directory `validate:adr-references` reads. */
export const ADR_DIR = 'docs/adr'

/** Extensions a bundler can pull into a consumer's build. */
const SHIPPED_EXTENSIONS = /\.(?:ts|tsx|mts|cts|js|mjs|cjs|vue|css)$/

/** Directories under a package's `src/` that never reach a consumer. */
const SKIP_DIRS = new Set([
  'node_modules',
  'dist',
  '__fixtures__',
  '__snapshots__',
  '__mocks__',
  '__tests__',
])

/**
 * Whether a repo-relative path is **shipped source**.
 *
 * Narrower than `isCodeCitation` in `validate-adr-references.ts` on purpose: a
 * decision is load-bearing when the code a consumer runs implements it, not when
 * a config file mentions it. Tests and fixtures are excluded for the same reason
 * `isSyntheticSource` excludes them one file over — a spec that asserts a gate
 * fires is discussing an ADR, not building on it.
 *
 * `packages/tooling` is a private package and is deliberately **not** exempt.
 * Keying the scope off publication status would couple this gate to
 * `release-policy.json`, and a validator that implements a decision is still code
 * adr-example-ok: the id below is this comment's subject, not a citation.
 * built on it — ADR-18's single shipped citation is exactly that case.
 */
export function isShippedSource(file: string): boolean {
  const normalised = file.replaceAll('\\', '/')
  if (!/^packages\/[^/]+\/src\//.test(normalised))
    return false
  if (/\.(?:spec|test|stories|bench)\.[cm]?[jt]sx?$/.test(normalised))
    return false
  if (normalised.split('/').some(segment => SKIP_DIRS.has(segment)))
    return false
  return SHIPPED_EXTENSIONS.test(normalised)
}

export interface ShippedCitation {
  /** `ADR-NN`, normalised to two digits. */
  id: string
  /** Repo-relative, forward-slashed. */
  file: string
  line: number
}

function walk(dir: string, out: string[]): void {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry) || entry.startsWith('.'))
      continue
    const full = join(dir, entry)
    if (statSync(full).isDirectory())
      walk(full, out)
    else out.push(full)
  }
}

/**
 * Every `ADR-NN` citation in shipped source.
 *
 * Reuses {@link extractCitations} so the `adr-example-ok:` opt-out, the two-digit
 * normalisation and the `ADR-XX` placeholder rule behave identically in both
 * gates. Two scanners with two notions of "a citation" would disagree, and the
 * disagreement would be invisible.
 */
export function collectShippedCitations(root: string = ROOT): ShippedCitation[] {
  const packages = resolve(root, 'packages')
  if (!existsSync(packages))
    return []

  const files: string[] = []
  for (const entry of readdirSync(packages)) {
    const src = join(packages, entry, 'src')
    if (!entry.startsWith('.') && existsSync(src) && statSync(src).isDirectory())
      walk(src, files)
  }

  return files.flatMap((full) => {
    const file = relative(root, full).replaceAll('\\', '/')
    if (!isShippedSource(file))
      return []
    return extractCitations(file, readFileSync(full, 'utf8'))
  })
}

/** One dated allowance for an ADR that was already load-bearing while `Proposed`. */
export interface GrandfatherEntry {
  /** `ADR-NN`. */
  id: string
  /** ISO `YYYY-MM-DD` — when the allowance was recorded. */
  recorded: string
  /** Why it was allowed, in enough detail to argue with. */
  reason: string
  /** What discharges it. Never "when we get to it". */
  exit: string
}

export interface GrandfatherList {
  entries: GrandfatherEntry[]
  /** Ratchet. Must equal `entries.length`, so a fourth entry is visible in review. */
  maxGrandfathered: number
}

export function readGrandfatherList(path: string = GRANDFATHER_PATH, root: string = ROOT): GrandfatherList {
  const raw = JSON.parse(readFileSync(resolve(root, path), 'utf8')) as Partial<GrandfatherList>
  return {
    entries: raw.entries ?? [],
    maxGrandfathered: raw.maxGrandfathered ?? 0,
  }
}

export interface AdrStatusViolation {
  rule: string
  message: string
}

/** What one `Proposed`, shipped-source-cited ADR looks like in the report. */
export interface ProposedInUse {
  id: string
  /** Number of citations in shipped source. */
  citations: number
  /** Number of distinct shipped-source files citing it. */
  files: number
  /** The first citation, for a reader who wants to see one. */
  first: string
  /** Whether a dated grandfather entry covers it. */
  grandfathered: boolean
}

export interface AdrStatusReport {
  violations: AdrStatusViolation[]
  /** Documents read from `docs/adr/`. */
  documents: number
  /** Ids whose document says `Proposed`, cited from shipped source or not. */
  proposed: string[]
  /** Ids whose document says `Accepted`. */
  accepted: string[]
  /** `Proposed` ADRs that shipped source builds on, worst first. */
  inUse: ProposedInUse[]
}

export interface AdrStatusInput {
  documents: AdrDocument[]
  citations: ShippedCitation[]
  grandfather: GrandfatherList
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/**
 * Pure rule evaluation, so every rule is testable without a filesystem — and so
 * the seeded proofs in `adr-status.spec.ts` never have to touch a real ADR.
 */
export function checkAdrStatus(input: AdrStatusInput): AdrStatusReport {
  const { documents, citations, grandfather } = input
  const violations: AdrStatusViolation[] = []

  // 0. Fail closed: no documents means the gate lost its input, not that all is
  //    well. A gate that greens on an empty scan is the defect this programme has
  //    now recorded twice.
  if (documents.length === 0) {
    violations.push({
      rule: 'no-documents',
      message: `no ADR documents were found in ${ADR_DIR}/. This gate reads each document's own `
        + '`Status:` line, so an empty scan is a lost input, not a clean bill of health. '
        + 'Check the path before believing the result.',
    })
  }

  // 1. Fail closed: every document must declare a status this gate can read.
  //    A document it cannot read would drop out of the `Proposed` set silently.
  for (const document of documents) {
    if (document.status === undefined) {
      violations.push({
        rule: 'unreadable-status',
        message: `${document.file} declares no status this gate can read. Give it a line like `
          + '"- **Status:** Proposed (TASK-ID, YYYY-MM-DD)" using exactly one of: '
          + `${ADR_STATUSES.join(', ')}. A status word outside that list reads as unreadable `
          + 'rather than as "not Proposed", so it fails here instead of turning the gate green '
          + 'by omission.',
      })
    }
  }

  // Citations, per ADR, in shipped source only.
  //
  // The scope test is re-applied here rather than trusted from the collector. A
  // caller that passed a wider citation set — a spec, a config, an `apps/` file —
  // would otherwise widen the gate silently and produce a red nobody can act on.
  // One notion of scope, enforced where the verdict is made.
  const perId = new Map<string, { citations: number, files: Set<string>, first: string }>()
  for (const citation of citations) {
    if (!isShippedSource(citation.file))
      continue
    let entry = perId.get(citation.id)
    if (entry === undefined) {
      entry = { citations: 0, files: new Set(), first: `${citation.file}:${citation.line}` }
      perId.set(citation.id, entry)
    }
    entry.citations += 1
    entry.files.add(citation.file)
  }

  const byId = new Map(documents.map(document => [document.id, document]))
  const covered = new Map(grandfather.entries.map(entry => [normaliseAdrId(entry.id), entry]))

  const inUse: ProposedInUse[] = []
  for (const document of documents) {
    if (document.status !== 'Proposed')
      continue
    const use = perId.get(document.id)
    if (use === undefined)
      continue
    inUse.push({
      id: document.id,
      citations: use.citations,
      files: use.files.size,
      first: use.first,
      grandfathered: covered.has(document.id),
    })
  }
  inUse.sort((a, b) => b.citations - a.citations || a.id.localeCompare(b.id))

  // 2. The rule the gate exists for. Keyed on the NAMED list, not on a count —
  //    so a fourth load-bearing proposal fails even if an acceptance elsewhere
  //    keeps the arithmetic ceiling intact.
  for (const entry of inUse) {
    if (entry.grandfathered)
      continue
    violations.push({
      rule: 'proposed-cited',
      message: `${entry.id} says \`Proposed\` in its own document but shipped source builds on it: `
        + `${entry.citations} citation(s) across ${entry.files} file(s) under packages/*/src/, `
        + `first at ${entry.first}. A decision nobody has signed cannot be a public contract. `
        + 'Get it accepted (an owner flips the `Status:` line), stop citing it from shipped '
        + `source, or — if it was already load-bearing before this gate landed — add a dated `
        + `entry to ${GRANDFATHER_PATH} with a reason and an exit condition and raise `
        + 'maxGrandfathered in the same, reviewable change. Adding an entry is an argument you '
        + 'have to make in writing, not a switch.',
    })
  }

  // 3. The list empties itself. An entry whose ADR has been signed — or is no
  //    longer cited from shipped source — is a licence nobody revoked.
  for (const entry of grandfather.entries) {
    const id = normaliseAdrId(entry.id)
    const document = byId.get(id)
    if (document === undefined) {
      violations.push({
        rule: 'grandfather-unknown',
        message: `${GRANDFATHER_PATH} grandfathers ${id}, which has no document in ${ADR_DIR}/. `
          + 'This list allows a DOCUMENTED decision to be cited while unsigned; an id with no '
          + 'document is a different debt and belongs in adr-registry.json. Remove the entry and '
          + 'lower maxGrandfathered.',
      })
      continue
    }
    if (document.status !== undefined && document.status !== 'Proposed') {
      violations.push({
        rule: 'grandfather-discharged',
        message: `${id} is grandfathered as \`Proposed\` but its document now says `
          + `\`${document.status}\`. The allowance is discharged: delete the entry from `
          + `${GRANDFATHER_PATH} and lower maxGrandfathered to `
          + `${grandfather.entries.length - 1} in the same change. Also lower `
          + 'maxProposedCitedFromCode in packages/tooling/scripts/adr-registry.json, which '
          + 'counts the same debt as a number.',
      })
      continue
    }
    if (!perId.has(id)) {
      violations.push({
        rule: 'grandfather-uncited',
        message: `${id} is grandfathered but nothing under packages/*/src/ cites it any more. `
          + 'The allowance bought time for code that no longer exists. Remove the entry and '
          + 'lower maxGrandfathered — the debt is paid without a signature.',
      })
    }
  }

  // 4. Entries must be arguable: a date, a reason, an exit condition.
  for (const entry of grandfather.entries) {
    const id = normaliseAdrId(entry.id)
    if (!ISO_DATE.test(entry.recorded ?? '')) {
      violations.push({
        rule: 'grandfather-date',
        message: `${id} in ${GRANDFATHER_PATH} needs \`recorded\` as an ISO YYYY-MM-DD date. `
          + 'An undated allowance cannot be aged, and an allowance nobody can age is permanent.',
      })
    }
    if ((entry.reason ?? '').trim() === '' || (entry.exit ?? '').trim() === '') {
      violations.push({
        rule: 'grandfather-entry',
        message: `${id} in ${GRANDFATHER_PATH} needs both a \`reason\` and an \`exit\` condition. `
          + 'An id alone tells the next reader nothing about what was allowed or when it ends.',
      })
    }
  }

  // 5. The ratchet itself, the same shape as maxUndocumented: the ceiling must
  //    EQUAL the list, so discharging an allowance is the only way it falls and
  //    adding one is visible in review.
  if (grandfather.maxGrandfathered !== grandfather.entries.length) {
    violations.push({
      rule: 'grandfather-ceiling',
      message: `${GRANDFATHER_PATH} lists ${grandfather.entries.length} grandfathered ADR(s) but `
        + `declares maxGrandfathered: ${grandfather.maxGrandfathered}. The two must agree, so that `
        + 'accepting an ADR is the only thing that lowers the number and adding an allowance '
        + 'cannot be done quietly.',
    })
  }

  return {
    violations,
    documents: documents.length,
    proposed: documents.filter(d => d.status === 'Proposed').map(d => d.id).sort(),
    accepted: documents.filter(d => d.status === 'Accepted').map(d => d.id).sort(),
    inUse,
  }
}

/** Filesystem entry point: read `docs/adr/`, shipped source and the list, then check. */
export function validateAdrStatus(adrDir: string = ADR_DIR, root: string = ROOT): AdrStatusReport {
  return checkAdrStatus({
    documents: collectDocuments(adrDir),
    citations: collectShippedCitations(root),
    grandfather: readGrandfatherList(GRANDFATHER_PATH, root),
  })
}

/* c8 ignore start -- CLI entry point, exercised via `tsx`, not the unit tests. */
const isMain = process.argv[1]
  && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))

if (isMain) {
  const report = validateAdrStatus()

  if (report.violations.length === 0) {
    const grandfather = readGrandfatherList()
    console.warn(
      `✓ adr-status: ${report.documents} ADR document(s) · `
      + `${report.accepted.length} Accepted · ${report.proposed.length} Proposed `
      + `(${report.proposed.join(', ') || 'none'}) · `
      + `${report.inUse.length} cited from shipped source while Proposed, `
      + `all ${grandfather.entries.length} grandfathered (ceiling ${grandfather.maxGrandfathered})`,
    )
    for (const entry of report.inUse) {
      const allowance = grandfather.entries.find(listed => normaliseAdrId(listed.id) === entry.id)
      console.warn(
        `  ${entry.id}: ${entry.citations} citation(s) in ${entry.files} shipped file(s) `
        + `— grandfathered ${allowance?.recorded ?? 'undated'}, first at ${entry.first}`,
      )
    }
    process.exit(0)
  }

  for (const violation of report.violations)
    console.error(`✗ [${violation.rule}] ${violation.message}`)
  console.error(
    `\n${report.violations.length} ADR status violation(s). `
    + `See ${GRANDFATHER_PATH} and docs/program-2026-09-22-architecture/reports/`
    + 'TASK-S0-O3-ratification-packet.md.',
  )
  process.exit(1)
}
/* c8 ignore stop */
