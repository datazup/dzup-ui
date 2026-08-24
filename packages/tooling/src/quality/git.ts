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
