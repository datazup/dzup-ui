/**
 * Types for `release-parser.mjs` — the shared changelog parser. The runtime is
 * plain JS (so both a `node`-run `.mjs` and a `tsx`-run `.ts` can import it);
 * these declarations give the TypeScript consumer (the landing build script) a
 * checked view of the same shapes the Storybook `emit()` already encodes.
 */

/** One bullet within a release section, with deprecation/breaking flags. */
export interface ReleaseEntry {
  /** Bullet text with its provenance/author stripped. */
  text: string
  /** Commit author, when the changelog recorded one. */
  author?: string
  /** True when the bullet announces a deprecation. */
  deprecated: boolean
  /** True when the bullet announces a breaking change. */
  breaking: boolean
}

/** A named group of entries (`Added` | `Changed` | `Fixed` | …). */
export interface ReleaseSection {
  name: string
  entries: ReleaseEntry[]
}

/** One `## ` heading from CHANGELOG.md — a date (`2026-06-27`) or version. */
export interface Release {
  date: string
  sections: ReleaseSection[]
  entryCount: number
}

/** A change staged in `.changeset/` but not yet released. */
export interface PendingChange {
  packages: string[]
  level: 'major' | 'minor' | 'patch'
  summary: string
  body: string
  breaking: boolean
  deprecated: boolean
}

/** A deprecation / breaking note pulled forward from anywhere in the history. */
export interface Highlight {
  source: 'changeset' | 'package' | 'changelog'
  date: string
  kind: 'breaking' | 'deprecated'
  section: string
  text: string
  author?: string
}

/** The full parsed dataset — deterministic given the same source tree. */
export interface ReleaseData {
  sectionOrder: string[]
  totalReleases: number
  allReleases: Release[]
  pending: PendingChange[]
  highlights: Highlight[]
}

/** Canonical section render order; unknown sections sort after these. */
export declare const SECTION_ORDER: string[]

/** Parse `CHANGELOG.md` + `.changeset/*` + `packages/*\/CHANGELOG.md` under `repoRoot`. */
export declare function parseReleaseData(options: { repoRoot: string }): Promise<ReleaseData>
