/**
 * The perf harness's config hash (TASK-R2-O7 — settles owner decision **D90**).
 *
 * **The problem D90 records.** TASK-R5-O9's toolchain migration carried a stop
 * condition worded "stop if the migration alters the perf harness's config
 * hash", and phase 1 discovered that no such hash existed anywhere in the
 * repository. It defined one out-of-band — a `sha256sum` manifest written into
 * `docs/program-2026-09-04/reports/TASK-R5-O9-baseline/perf-harness.sha256` —
 * and raised the choice as D90: (a) keep the report-directory manifest, or
 * (b) "add a real config hash to `baselines.json`", explicitly this task's lane.
 *
 * **This module is (b), and it keeps (a)'s semantics.** The file list below is
 * R5-O9's list, plus the four lanes this task added, minus
 * `packages/core/perf/baselines.json`. The subtraction is not a weakening:
 *
 *   - A hash a file records *about itself* is unverifiable — writing it changes
 *     the bytes it claims to describe.
 *   - The two manifests answer different questions. R5-O9 asked "did the
 *     migration touch anything in the perf packet, outputs included?", for
 *     which byte-identity of `baselines.json` is exactly right. This asks "were
 *     these numbers produced by the instrument I am holding?", for which the
 *     output is the thing being judged, not part of the judge.
 *
 * So both survive. `perf-harness.sha256` remains the migration check R5-O9
 * needs; `configHash` becomes the comparability check a *reader of a threshold*
 * needs, and it lives in the artifact rather than in a report directory, which
 * is what "a real config hash" meant.
 *
 * **Why the runner version is part of the identity.** `capture-baselines.ts`
 * shells out to `node_modules/vitest/vitest.mjs` in child processes. A Vitest
 * major therefore changes the measurement while every hashed file stays
 * byte-identical — R5-O9 §4c measured exactly that (`yarn test` 305 s → 241 s
 * on an unchanged tree). A hash that ignored the runner would report "same
 * instrument" across a change that moved every number.
 *
 * @module @dzup-ui/tooling/perf/harness-hash
 */

import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { ROOT } from '../ownership/generate-ownership-manifest.ts'

/** Where the lane specs added by TASK-R2-O7 live. */
export const LANES_DIR = 'packages/tooling/perf-lanes'

/** Where the harness modules live. */
const PERF_DIR = 'packages/tooling/src/perf'

/**
 * Every file whose bytes decide what a measurement means, repo-relative and
 * sorted, so the hash is stable across platforms and directory orders.
 *
 * Derived rather than listed: a module added to `src/perf/` or a lane added to
 * `perf-lanes/` joins the identity on the day it is written. A hand-maintained
 * list is a list that goes stale silently, which is the failure D90 is about.
 *
 * `.spec.ts` files under `src/perf/` are included — they are the harness's own
 * unit tests and cannot move a measurement, but they are cheap to hash and
 * their exclusion would need a rule a reader has to remember.
 */
export function harnessFiles(root: string = ROOT): string[] {
  const listed: string[] = [
    'packages/tooling/src/perf-bench.spec.ts',
    'vitest.config.ts',
    'vitest.setup.ts',
    'vitest.setup.a11y.ts',
  ]

  for (const dir of [PERF_DIR, LANES_DIR]) {
    const absolute = resolve(root, dir)
    if (!existsSync(absolute))
      continue
    for (const entry of readdirSync(absolute, { withFileTypes: true })) {
      if (entry.isFile() && entry.name.endsWith('.ts'))
        listed.push(`${dir}/${entry.name}`)
    }
  }

  return listed.filter(path => existsSync(resolve(root, path))).sort()
}

/**
 * sha256 over the harness sources.
 *
 * Each file contributes `<repo-relative path>\n<sha256 of its bytes>\n` rather
 * than its raw content, so a rename is a change (it is — the lane runner
 * selects files by path) and the digest does not depend on how the bytes
 * happened to concatenate.
 *
 * Line endings are **not** normalised. On this repository's Windows hosts a
 * CRLF/LF flip is a real change to a file vitest imports — one already broke a
 * spec import (a CRLF shebang), so a hash that smoothed it away would hide the
 * class of change most likely to bite here.
 */
export function harnessConfigHash(root: string = ROOT): {
  configHash: string
  files: string[]
} {
  const files = harnessFiles(root)
  const digest = createHash('sha256')
  for (const path of files) {
    digest.update(path)
    digest.update('\n')
    digest.update(createHash('sha256').update(readFileSync(resolve(root, path))).digest('hex'))
    digest.update('\n')
  }
  return { configHash: digest.digest('hex'), files }
}

/** The runner version, read from the installed package rather than a range. */
export function vitestVersion(root: string = ROOT): string {
  const manifest = resolve(root, 'node_modules/vitest/package.json')
  if (!existsSync(manifest))
    return 'unknown'
  const parsed = JSON.parse(readFileSync(manifest, 'utf8')) as { version?: string }
  return parsed.version ?? 'unknown'
}

/** The whole identity block, ready to be written into `baselines.json`. */
export function harnessIdentity(root: string = ROOT): {
  configHash: string
  files: string[]
  vitest: string
} {
  return { ...harnessConfigHash(root), vitest: vitestVersion(root) }
}

/** How a recorded identity compares to the one in the working tree. */
export type HarnessComparison
  = | { readonly state: 'match' }
    | { readonly state: 'unrecorded', readonly detail: string }
    | { readonly state: 'drifted', readonly detail: string }

/**
 * Compare a recorded identity against the current tree.
 *
 * Reported, never thrown. A drifted harness does not make a recorded threshold
 * wrong — it makes it **unverified**, which is a different word, and the
 * maturity ladder this repository keeps has a rung for each. The lane prints
 * the verdict beside every assertion so nobody reads a green run as evidence
 * that the instrument is the one that produced the number.
 */
export function compareHarness(
  recorded: { configHash: string, vitest: string } | undefined,
  current: { configHash: string, vitest: string },
): HarnessComparison {
  if (recorded === undefined) {
    return {
      state: 'unrecorded',
      detail: 'the recorded baselines predate schema 1.1.0, so the instrument that '
        + `produced them has no name; this tree is ${current.configHash.slice(0, 12)} `
        + `on vitest ${current.vitest}`,
    }
  }
  if (recorded.configHash === current.configHash && recorded.vitest === current.vitest)
    return { state: 'match' }

  const parts: string[] = []
  if (recorded.configHash !== current.configHash) {
    parts.push(
      `config ${recorded.configHash.slice(0, 12)} → ${current.configHash.slice(0, 12)}`,
    )
  }
  if (recorded.vitest !== current.vitest)
    parts.push(`vitest ${recorded.vitest} → ${current.vitest}`)
  return { state: 'drifted', detail: parts.join(', ') }
}
