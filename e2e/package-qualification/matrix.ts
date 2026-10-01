/**
 * The twelve rows of 08-11 doc 08's package-qualification matrix (TASK-S2-O1).
 *
 * This file is the **scope contract**: the row list, what each row must prove,
 * and which lane owns it. Row implementations live beside it; the orchestrator
 * is `qualify.ts`.
 *
 * Three rules govern every verdict produced here, taken from
 * `<repo_conventions><evidence_rules>`:
 *
 * 1. A row that cannot run is `blocked` **with a named reason**. It is never
 *    silently green and never quietly skipped.
 * 2. A row covered by a lane that already existed is `cited`, not rebuilt — but
 *    the citation names the lane and, where the lane is cheap, this run
 *    executes it rather than trusting a report.
 * 3. No ratchet is raised and no allowlist widened to turn a red row green.
 *
 * @module e2e/package-qualification/matrix
 */

export type Verdict = 'green' | 'red' | 'blocked'

export interface RowResult {
  /** 1-based doc-08 row number. */
  n: number
  title: string
  verdict: Verdict
  /**
   * Why, in one line. Mandatory for `red` and `blocked` — a blocked row with no
   * named reason is the failure mode this matrix exists to prevent.
   */
  reason: string
  /** Paths, commands or report references a reviewer can re-run or open. */
  evidence: string[]
  /** Measurements worth keeping, free-form per row. */
  detail?: Record<string, unknown>
  /**
   * True when a pre-existing lane owns this row and this task cited it rather
   * than building a second one.
   */
  cited: boolean
  /** Second-tier (commercial) column, which this repository cannot install. */
  secondTier: Verdict
  secondTierReason: string
}

export interface RowDefinition {
  n: number
  title: string
  /** What the row must prove, quoted in the report so the bar is visible. */
  requirement: string
  owner: string
}

/**
 * The twelve rows, in doc-08 order.
 *
 * Rows 1-5 were reported as "covered" by the 2026-08 P1-03 and 2026-09-04 R1-O2
 * packets. Measuring them (TASK-S2-O1 §2) moved two: row 2 has no tarball lane
 * at all, and row 4's packed half has never executed. Both corrections are
 * carried as the row's own verdict rather than rewritten into history.
 */
export const ROWS: RowDefinition[] = [
  {
    n: 1,
    title: 'ESM import and declarations resolve from the tarball',
    requirement: 'Every declared export subpath imports under plain Node from the packed artifact, and its `types` condition compiles.',
    owner: 'validate:published-imports',
  },
  {
    n: 2,
    title: 'Vite production build of a consumer app',
    requirement: 'A consumer app that installs the tarball builds for production with no unresolved import and no peer warning.',
    owner: 'TASK-S2-O1 (row-consumer-build)',
  },
  {
    n: 3,
    title: 'Nuxt SSR and auto-import',
    requirement: 'A Nuxt app installing the tarball server-renders and auto-imports components.',
    owner: 'test:nuxt-fixtures',
  },
  {
    n: 4,
    title: 'Resolver ownership',
    requirement: 'The resolver names the owning package for every symbol, first tier and second tier, from packed manifests.',
    owner: 'validate:ownership + test:nuxt-fixtures (core-pro)',
  },
  {
    n: 5,
    title: 'CSS and token import order',
    requirement: 'The published stylesheets cascade in the documented order when imported from the tarball.',
    owner: 'test:e2e:layer-order + nuxt css-order fixture',
  },
  {
    n: 6,
    title: 'Individual-component tree-shaking, optional engine measured separately',
    requirement: 'Importing one component from the packed artifact excludes the rest, and the optional engine\'s contribution is measured as its own number.',
    owner: 'TASK-S2-O1 (row-tree-shake)',
  },
  {
    n: 7,
    title: 'Minimum and current Vue/Reka peer versions',
    requirement: 'The declared peer floors are explicit, agree across published packages, and the packed artifacts are qualified at both the floor and the current version.',
    owner: 'TASK-S2-O1 (row-peers) + test:min-peer',
  },
  {
    n: 8,
    title: 'Optional peer absent / incompatible / installed',
    requirement: 'Each of the three states produces the documented degradation, not a crash and not a silent pass.',
    owner: 'TASK-S2-O1 (row-optional-peer)',
  },
  {
    n: 9,
    title: 'CSP and Trusted Types consumer fixture',
    requirement: 'The packed CSS and JS load under a strict policy with a nonce and raise no violation; Trusted-Types sinks are enumerated and policy-compatible.',
    owner: 'test:e2e:csp + TASK-S2-O1 (row-csp)',
  },
  {
    n: 10,
    title: 'Licence and entitlement failure behaviour',
    requirement: 'Every packed artifact carries correct licence metadata and a LICENSE file; a missing second-tier package produces the documented build-time diagnostic rather than a crash or a silent pass.',
    owner: 'TASK-S2-O1 (row-licence) + validate:licenses',
  },
  {
    n: 11,
    title: 'Tarball file / export / API diff',
    requirement: 'The packed artifact is diffed against the reviewed build and against its own declarations; undeclared files or entry points fail the row.',
    owner: 'TASK-S2-O1 (row-tarball-diff) + release:api-diff',
  },
  {
    n: 12,
    title: 'SBOM, vulnerability/licence report, provenance and artifact hash',
    requirement: 'Per release candidate: an SBOM, a vulnerability and licence report whose exceptions each carry owner + expiry + reachability, artifact hashes, and a provenance statement.',
    owner: 'TASK-S2-O1 (row-supply-chain) + release:evidence',
  },
]

/** The second-tier column's standing reason — probed once per run, not assumed. */
export const SECOND_TIER_ABSENT
  = 'blocked — no second-tier tarball installed (@dzup-ui-pro/pro does not resolve; obtaining one is not this repository\'s work)'

export function blocked(n: number, title: string, reason: string, evidence: string[] = []): RowResult {
  return {
    n,
    title,
    verdict: 'blocked',
    reason,
    evidence,
    cited: false,
    secondTier: 'blocked',
    secondTierReason: SECOND_TIER_ABSENT,
  }
}
