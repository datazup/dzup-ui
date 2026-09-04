/**
 * The two git questions the evidence matrix asks (TASK-OSS-P5-04, P5-06).
 *
 * @module @dzup-ui/tooling/quality/git
 */

import { execFileSync } from 'node:child_process'
import { ROOT } from '../ownership/generate-ownership-manifest.ts'

/** The commit that last touched a path, or `unknown` outside a git checkout. */
export function lastCommitFor(path: string): string {
  if (path === '')
    return 'unknown'
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%H', '--', path], {
      cwd: ROOT,
      encoding: 'utf8',
    }).trim()
    return out === '' ? 'unknown' : out
  }
  catch {
    return 'unknown'
  }
}

/**
 * Whether evidence recorded at `observed` still describes a component whose
 * last change was `changed`.
 *
 * **Not `observed === changed`.** That was the first implementation and it was
 * wrong in a way that made the staleness column noise: a tester records the
 * repository HEAD they observed, and a perf baseline records the HEAD it was
 * captured at — neither is the commit that last touched the component, so the
 * two hashes are almost never equal and almost every cell read `stale`. A
 * staleness signal that fires on everything says nothing.
 *
 * The real question is ordering: is the component's last change at or before
 * the commit the evidence was taken at? `merge-base --is-ancestor` answers
 * exactly that, and answers it correctly across merges, where comparing dates
 * would not.
 *
 * Returns `true` (current) when either hash is unknown or git cannot answer —
 * the conservative direction here is *not* to cry stale, because a false
 * `stale` on 144 components trains people to ignore the column, and the column
 * is the point.
 */
export function evidenceIsCurrent(observed: string, changed: string): boolean {
  if (observed === 'unknown' || changed === 'unknown' || observed === '-' || changed === '-')
    return true
  if (observed === changed)
    return true
  try {
    execFileSync('git', ['merge-base', '--is-ancestor', changed, observed], {
      cwd: ROOT,
      stdio: 'ignore',
    })
    return true
  }
  catch {
    // Non-zero exit means `changed` is NOT an ancestor of `observed`: the
    // component moved after the evidence was taken.
    return false
  }
}

/**
 * Blank every `componentCommit` stamp before a freshness comparison
 * (TASK-N5-03, Item 0).
 *
 * `componentCommit` is `lastCommitFor(source)` — **git provenance recorded
 * inside an artifact that is then byte-compared against a fresh build**. That
 * combination cannot ever be green in a committed state, and the reason is an
 * off-by-one nothing in the working tree can fix: a commit that touches
 * `DzButton.vue` becomes the answer to `lastCommitFor('…/DzButton.vue')` the
 * instant it lands, but the artifact regenerated *before* that commit recorded
 * the previous hash. The artifact is stale at birth, in the same commit that
 * created it, and the only way out is a second commit that regenerates — every
 * time, forever, with CI red on the first one.
 *
 * `validate:component-meta`, `validate:ownership` and `validate:capability-matrix`
 * already exclude the top-level `sourceCommit` for exactly this reason
 * (`stripProvenance` in `../meta/component-meta.ts` states it). `componentCommit`
 * is the same field one level down, and was missed because it repeats per row.
 *
 * **This weakens nothing.** No clause in either validator reads the *committed*
 * `componentCommit`: the staleness clauses in `at-matrix.ts` and
 * `capability-matrix.ts` both run against the **freshly built** index, where
 * the value is recomputed from git on every run. The field exists in the file
 * so a human reading the artifact can see which revision a row was measured
 * against — which is the definition of provenance.
 *
 * A real content change — a row that flips `covered` → `stale`, a count that
 * moves, a cell that gains an artifact — is untouched and still fails the gate.
 */
export function stripComponentCommits(json: string): string {
  return json.replace(/"componentCommit": "[^"]*"/g, '"componentCommit": "-"')
}
