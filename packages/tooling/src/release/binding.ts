/**
 * Source binding and admissibility for release evidence (TASK-R1-O3).
 *
 * Every artifact a release tool writes carries the same two questions in its
 * head: **which tree was this measured from**, and **is that tree one anybody
 * can review**. This module is the single answer, so that an SBOM, an API diff
 * and a report bundle cannot disagree about what they describe.
 *
 * ## Ported from Pro, minus two defects
 *
 * `ui/dzup-ui-pro/tools/shared/source-binding.mjs` is the original. Its release
 * ledger (`docs/qa/release/2026-09-03-cda4816/ledger.md`) records two defects
 * in it, both found by the bundle it produced, and neither is reproduced here:
 *
 * - **E-1 — the dirty count was capped at 50 and the message reported the cap.**
 *   `dirtyFiles: dirtyFiles.slice(0, 50)` with a message built from
 *   `dirtyFiles.length` made three *different* trees all report
 *   `dirty (50 path(s))`. Here `dirtyCount` is always the true count, and the
 *   list is uncapped; a caller that wants a short list slices it at the point
 *   of rendering, where the number next to it is still true.
 * - **E-2 — the first path in every record lost its first character.** The
 *   original trimmed the whole status block before splitting on newlines, so
 *   line 1 lost its leading status space and `slice(3)` ate one character too
 *   many: every Pro artifact records `gitignore` for `.gitignore`. Here the
 *   parse uses `git status --porcelain -z`, splitting on NUL, which also makes
 *   the parser correct for paths containing spaces, quotes or non-ASCII bytes
 *   (porcelain v1 C-quotes those in the newline form, and the quoting was never
 *   undone).
 *
 * ## Admissibility
 *
 * `admissible` is `false` whenever the worktree is dirty. That is doc 08's
 * first release stop condition ("dirty/unidentified source"), and it is
 * recorded rather than enforced: an inadmissible bundle is still worth
 * producing — it is how you find out what a release *would* say — it simply may
 * not be quoted as release evidence. Nothing in this repository byte-compares a
 * provenance block, by the rule stated in `../quality/git.ts`.
 *
 * @module @dzup-ui/tooling/release/binding
 */

import type { Buffer } from 'node:buffer'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync, statSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../')

/** One entry of `git status --porcelain`. */
export interface DirtyEntry {
  /** The two-character XY status code, e.g. ` M`, `??`, `D `. */
  status: string
  path: string
}

export interface SourceBinding {
  /** `git rev-parse HEAD`, or `unknown` outside a checkout. */
  sourceCommit: string
  /** Seven-character form, for directory names and tables. */
  shortCommit: string
  branch: string
  /** True when `git status --porcelain` is non-empty. */
  dirty: boolean
  /** The **true** number of dirty paths. Never capped (Pro E-1). */
  dirtyCount: number
  /** Every dirty path, uncapped and unquoted (Pro E-2). */
  dirtyFiles: DirtyEntry[]
  /** False on a dirty tree — doc 08's first stop condition. */
  admissible: boolean
  /** Why not, when `admissible` is false. `null` otherwise. */
  inadmissibleReason: string | null
  /** Commits ahead / behind the tracking branch, when there is one. */
  upstream: { ref: string, ahead: number, behind: number } | null
}

function git(args: string[]): string {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()
}

function gitOrNull(args: string[]): string | null {
  try {
    return git(args)
  }
  catch {
    return null
  }
}

/**
 * Parse `git status --porcelain -z` output.
 *
 * NUL-separated, so no path is ever quoted and no path can be split by a space
 * inside it. A rename entry (`R`) is `XY<space>new\0old\0` — the second field
 * is consumed and the **new** path recorded, because that is the path that
 * exists in the tree being measured.
 */
export function parsePorcelainZ(raw: string): DirtyEntry[] {
  const fields = raw.split('\0')
  const out: DirtyEntry[] = []
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i]
    if (field === undefined || field === '')
      continue
    const status = field.slice(0, 2)
    const path = field.slice(3)
    if (status[0] === 'R' || status[0] === 'C')
      i++ // the following field is the source path of the rename/copy
    out.push({ status, path })
  }
  return out.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0))
}

/** The tree this process is measuring. */
export function gitState(): SourceBinding {
  const sourceCommit = gitOrNull(['rev-parse', 'HEAD']) ?? 'unknown'
  const branch = gitOrNull(['rev-parse', '--abbrev-ref', 'HEAD']) ?? 'unknown'
  const raw = gitOrNull(['status', '--porcelain', '-z']) ?? ''
  const dirtyFiles = parsePorcelainZ(raw)
  const dirty = dirtyFiles.length > 0

  let upstream: SourceBinding['upstream'] = null
  const upstreamRef = gitOrNull(['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{upstream}'])
  if (upstreamRef !== null) {
    const counts = gitOrNull(['rev-list', '--left-right', '--count', `${upstreamRef}...HEAD`])
    const [behind, ahead] = (counts ?? '0\t0').split(/\s+/).map(n => Number.parseInt(n, 10) || 0)
    upstream = { ref: upstreamRef, ahead: ahead ?? 0, behind: behind ?? 0 }
  }

  return {
    sourceCommit,
    shortCommit: sourceCommit === 'unknown' ? 'unknown' : sourceCommit.slice(0, 7),
    branch,
    dirty,
    dirtyCount: dirtyFiles.length,
    dirtyFiles,
    admissible: !dirty && sourceCommit !== 'unknown',
    inadmissibleReason: sourceCommit === 'unknown'
      ? 'not a git checkout — nothing identifies the source'
      : dirty
        ? `worktree dirty: ${dirtyFiles.length} path(s) differ from ${sourceCommit.slice(0, 7)}`
        : null,
    upstream,
  }
}

export interface ContentDigest {
  /** sha256 over `<path>\0<sha256(file)>\n` for every file, sorted by path. */
  digest: string
  fileCount: number
  bytes: number
  files: Array<{ path: string, sha256: string, bytes: number }>
}

/**
 * A digest of **exactly what was measured**, for a candidate that is not a
 * commit.
 *
 * A dirty tree has no reviewable name. `527dbd1` labels seven different content
 * states in this repository's own evidence, which is the defect Pro's ledger
 * §0 records. So a bundle produced from a dirty tree names the commit *and*
 * this digest, and lists every file behind it, so that "what did you measure"
 * has an answer even though "which commit" does not.
 *
 * It is **not** a commit id and confers no reviewability. It covers tracked
 * plus untracked-and-not-ignored files: exactly the set `git add -A` would
 * stage, which is the set a reviewer would receive.
 */
export function contentDigest(): ContentDigest {
  const tracked = (gitOrNull(['ls-files', '-z']) ?? '').split('\0').filter(Boolean)
  const untrackedRaw = gitOrNull(['ls-files', '--others', '--exclude-standard', '-z']) ?? ''
  const untracked = untrackedRaw.split('\0').filter(Boolean)
  const paths = [...new Set([...tracked, ...untracked])].sort()

  const files: ContentDigest['files'] = []
  let bytes = 0
  const overall = createHash('sha256')
  for (const path of paths) {
    let buffer: Buffer
    try {
      const abs = resolve(ROOT, path)
      if (!statSync(abs).isFile())
        continue
      buffer = readFileSync(abs)
    }
    catch {
      continue // deleted-but-still-indexed; it is in dirtyFiles, not here
    }
    const sha256 = createHash('sha256').update(buffer).digest('hex')
    overall.update(`${path}\0${sha256}\n`)
    files.push({ path, sha256, bytes: buffer.length })
    bytes += buffer.length
  }

  return { digest: overall.digest('hex'), fileCount: files.length, bytes, files }
}

/** The provenance block every release artifact carries, identically. */
export interface ArtifactProvenance {
  sourceCommit: string
  branch: string
  worktreeDirty: boolean
  dirtyCount: number
  admissible: boolean
  inadmissibleReason: string | null
  generatedAt: string
  generator: string
}

/**
 * Stamp an artifact.
 *
 * `generatedAt` is an ISO timestamp, which makes two runs of the same tool over
 * the same tree differ byte-wise. That is deliberate for *evidence* (as opposed
 * to a generated artifact under a freshness gate): a release bundle records
 * when it was produced, and no gate byte-compares it.
 */
export function provenanceOf(generator: string, binding: SourceBinding = gitState()): ArtifactProvenance {
  return {
    sourceCommit: binding.sourceCommit,
    branch: binding.branch,
    worktreeDirty: binding.dirty,
    dirtyCount: binding.dirtyCount,
    admissible: binding.admissible,
    inadmissibleReason: binding.inadmissibleReason,
    generatedAt: new Date().toISOString(),
    generator,
  }
}

/** `2026-09-21-527dbd1` — the bundle directory name doc 08 evidence uses. */
export function bundleId(binding: SourceBinding = gitState(), at: Date = new Date()): string {
  const date = at.toISOString().slice(0, 10)
  return `${date}-${binding.shortCommit}`
}
