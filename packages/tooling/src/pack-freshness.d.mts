/**
 * Types for `pack-freshness.mjs` — the shared "is this dist older than its
 * sources?" check. The runtime is plain JS so both a `node`-run `.mjs`
 * (`packages/nuxt/scripts/pack-fixtures.mjs`) and a `tsx`-run `.ts`
 * (`src/validators/published-imports.ts`) import the same definition of stale;
 * these declarations give the TypeScript consumer a checked view of it.
 */

/** A file and when it was last written. */
export interface FileStamp {
  /** Absolute path. A staleness report without the offending file is not actionable. */
  file: string
  /** `fs.Stats.mtimeMs`. */
  mtimeMs: number
}

/**
 * - `fresh` — dist exists and is at least as new as every source input
 * - `stale` — dist exists but predates a source input
 * - `unbuilt` — no dist directory, or one with no files in it
 * - `sourceless` — no `src/`; nothing to compare, treated as fresh
 */
export type FreshnessStatus = 'fresh' | 'stale' | 'unbuilt' | 'sourceless'

/** Freshness verdict for one workspace package. */
export interface FreshnessResult {
  name: string
  packageDir: string
  status: FreshnessStatus
  /** Newest of `src/**` and `package.json`; `null` when neither exists. */
  newestSource: FileStamp | null
  /** Newest file under `dist/`; `null` when the package is unbuilt. */
  newestDist: FileStamp | null
}

/** One workspace package to check. */
export interface FreshnessTarget {
  name: string
  packageDir: string
}

export interface FreshnessFormatOptions {
  /** Only shortens printed paths. */
  repoRoot?: string
  /** Replaces the default "run `yarn build`" line. */
  buildHint?: string
}

export interface AssertFreshOptions extends FreshnessFormatOptions {
  /** Skip the refusal. Explicit by design: the choice belongs in the caller's command. */
  allowStale?: boolean
}

export declare function newestFileUnder(dir: string): FileStamp | null
export declare function checkDistFreshness(packageDir: string, name: string): FreshnessResult
export declare function checkAllDistFreshness(packages: FreshnessTarget[]): FreshnessResult[]
export declare function formatFreshnessRefusal(results: FreshnessResult[], options?: FreshnessFormatOptions): string
export declare function assertDistFresh(packages: FreshnessTarget[], options?: AssertFreshOptions): FreshnessResult[]
