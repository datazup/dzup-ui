/**
 * Component-ownership manifest — types (TASK-OSS-P0-01).
 *
 * One deterministic answer to "who owns `DzFoo`?", generated from the approved
 * authorities (package entry barrels + `public-api.manifest.json` sections +
 * component/story files on disk). See `./README.md` for the authority table.
 *
 * The shape is shared verbatim by Core and Pro so the two manifests can be
 * merged into a cross-tier map (TASK-OSS-P0-02) without either tier importing
 * the other's runtime source.
 */

import type { ManifestAnatomy } from './anatomy-source.ts'

/** The tier that produced a manifest. Core never generates a `pro` manifest. */
export type OwnershipTier = 'core' | 'pro'

/**
 * What a public symbol *is*.
 *
 * `unclassified` is a first-class outcome, not a failure: the generator reports
 * what the authorities could not decide instead of guessing, and the ceiling
 * file ratchets that count down as maintainers decide (never up).
 */
export type OwnershipKind
  = | 'public-component'
    | 'compound-part'
    | 'composable'
    | 'type'
    | 'recipe'
    | 'token-module'
    | 'internal'
    | 'compat-alias'
    | 'unclassified'

/** Maturity as declared by the component's `status:*` story tag (ADR/TASK-DS-08). */
export type OwnershipStatus = 'experimental' | 'beta' | 'stable' | 'deprecated'

export interface OwnershipEntry {
  /** Exported symbol name, exactly as consumers import it. */
  symbol: string
  /** Owning package, e.g. `@dzup-ui/core`. */
  package: string
  /**
   * Primary import path: `.` when the symbol is reachable from the root barrel,
   * otherwise the most specific `package.json` subpath that exposes it.
   */
  subpath: string
  /** Every declared subpath that exposes the symbol, sorted. */
  subpaths?: string[]
  kind: OwnershipKind
  /** Required when `kind === 'compound-part'`. Always a `public-component`. */
  parentComponent?: string
  /** Required when `kind === 'compat-alias'`. */
  aliasOf?: string
  /** Copied from the story status badge when one exists. */
  status?: OwnershipStatus
  /**
   * Declared styling surface, copied verbatim from the component's
   * `Dz{Name}.anatomy.ts` (TASK-OSS-P3-02, ADR-19).
   *
   * Absent means the component has NOT declared one — which is the state most
   * of the catalog is in, counted by `validate:ownership` against a ceiling
   * that only ratchets down. A renderless component declares an anatomy whose
   * `parts` is the string `'none'`; that is a declaration, not an absence, and
   * the two must stay distinguishable.
   */
  anatomy?: ManifestAnatomy
  /** Authority paths (and, for unclassified entries, reasons) that justified the classification. */
  evidence: string[]
}

export interface OwnershipManifest {
  /** Semver of the *schema*, not of any package. */
  schemaVersion: string
  tier: OwnershipTier
  /**
   * Repository HEAD at generation time, or `unknown` outside a git checkout.
   *
   * Excluded from the freshness diff (see `validators/ownership-manifest.ts`):
   * it records provenance, and gating on it would make every unrelated commit
   * fail the validator.
   */
  sourceCommit: string
  /** Authority file globs the entries were derived from, sorted. */
  generatedFrom: string[]
  /** Sorted by `symbol` with a stable, locale-independent comparator. */
  entries: OwnershipEntry[]
}

/**
 * Current schema version emitted by the generator.
 *
 * 1.1.0 adds the optional `anatomy` field (TASK-OSS-P3-02). Minor, not major:
 * every 1.0.0 reader still reads a 1.1.0 manifest, and the cross-tier merge
 * gates on the major, so a Pro manifest at 1.0.0 still merges.
 */
export const OWNERSHIP_SCHEMA_VERSION = '1.1.0'

/** Every value `OwnershipKind` admits, in schema order. */
export const OWNERSHIP_KINDS: readonly OwnershipKind[] = [
  'public-component',
  'compound-part',
  'composable',
  'type',
  'recipe',
  'token-module',
  'internal',
  'compat-alias',
  'unclassified',
]

/** Every value `OwnershipStatus` admits. */
export const OWNERSHIP_STATUSES: readonly OwnershipStatus[] = [
  'experimental',
  'beta',
  'stable',
  'deprecated',
]

/**
 * Stable, locale-independent symbol comparator.
 *
 * `localeCompare` is deliberately avoided: its ordering depends on ICU data, so
 * two machines could produce byte-different manifests from identical inputs and
 * the determinism proof (`generate && generate && diff`) would be worthless.
 */
export function compareSymbols(a: string, b: string): number {
  if (a === b)
    return 0
  return a < b ? -1 : 1
}
