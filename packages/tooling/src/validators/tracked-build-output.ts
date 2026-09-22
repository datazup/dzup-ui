/**
 * Tracked-build-output validator (TASK-R1-O1).
 *
 * Fails when compiler output is **tracked by git** under any package's `src/`.
 * (The glob is spelled out rather than written literally: the two characters
 * that end a block comment are the two this sentence would otherwise contain.)
 *
 * The gate exists because of what it found: twelve files —
 * `DzThemeProvider.types.{d.ts,js,js.map}`, `index.{d.ts,js,js.map}`,
 * `theme-script.{d.ts,js,js.map}` and `useTheme.{d.ts,js,js.map}` — sat
 * committed in `packages/core/src/providers/` next to the `.ts` files they were
 * compiled from. Nothing imported them (ADR-12: `dist/` is published, never
 * committed) and nothing reported them, so they survived every gate in the
 * chain and shipped inside `yarn pack`'s `src` include for three releases'
 * worth of commits. A stray `tsc` in a component directory reproduces them in
 * seconds, which is why the repair is a gate and not a `git rm`.
 *
 * **Tracked, not present.** The check reads `git ls-files`, not the filesystem:
 * `dist/`, `.nuxt/` and a local `tsc --noEmit` scratch run are all ignored by
 * `.gitignore` and are none of this validator's business. Only what a clone
 * would receive is a violation.
 *
 * **Sourcemaps are never excusable.** A `.map` is written by a bundler and by
 * nothing else; there is no hand-authored sourcemap. It is the one extension
 * the allowlist may not cover, so the escape hatch can never be used to
 * re-admit the exact class of file this gate was written for.
 *
 * Hand-written non-`.ts` sources are real and are declared as data in
 * `tracked-build-output-allowlist.json`, each with a reason a reviewer can
 * argue with: the three `env.d.ts` ambient declarations, and the
 * `release-parser.mjs` / `.d.mts` pair that is plain JS on purpose so a
 * `node`-run `.mjs` and a `tsx`-run `.ts` can share one changelog parser.
 *
 * Usage:
 *   tsx packages/tooling/src/validators/tracked-build-output.ts
 *
 * Exit code 1 if violations found.
 *
 * @module @dzup-ui/tooling/validators/tracked-build-output
 */

import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../')

export const ALLOWLIST_PATH = resolve(
  ROOT,
  'packages/tooling/scripts/tracked-build-output-allowlist.json',
)

/**
 * Extensions a compiler emits, longest-first so `.d.ts` is recognised before
 * `.ts` would be and `.js.map` before `.map`.
 */
export const BUILD_OUTPUT_EXTENSIONS = [
  '.d.ts.map',
  '.d.mts.map',
  '.d.cts.map',
  '.js.map',
  '.mjs.map',
  '.cjs.map',
  '.css.map',
  '.d.ts',
  '.d.mts',
  '.d.cts',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
] as const

/** The directories this gate governs: the *source* of every workspace package. */
export const GOVERNED = /^packages\/[^/]+\/src\//

export interface AllowlistEntry {
  /** Repo-relative path, forward slashes. */
  readonly path: string
  /** Why this file is hand-written rather than emitted. Required. */
  readonly reason: string
}

export interface TrackedBuildOutputViolation {
  readonly path: string
  readonly extension: string
  /** A `.ts`/`.vue` sibling of the same base name, when one exists. */
  readonly compiledFrom?: string
  /** True when the extension may not be allowlisted under any reason. */
  readonly inexcusable: boolean
}

export function readAllowlist(path: string = ALLOWLIST_PATH): AllowlistEntry[] {
  if (!existsSync(path))
    return []
  const parsed = JSON.parse(readFileSync(path, 'utf8')) as { allowed?: AllowlistEntry[] }
  return parsed.allowed ?? []
}

/** The emitted extension this path ends with, or `undefined`. */
export function buildOutputExtension(path: string): string | undefined {
  return BUILD_OUTPUT_EXTENSIONS.find(extension => path.endsWith(extension))
}

/** A sourcemap is machine-written by definition, so no reason can excuse one. */
export function isInexcusable(extension: string): boolean {
  return extension.endsWith('.map')
}

/**
 * Check a list of tracked paths. Pure, so the spec can seed a failure without
 * writing to the repository or touching the git index.
 *
 * @param tracked - repo-relative paths, forward slashes, as `git ls-files` prints them.
 * @param allowlist - declared hand-written exceptions.
 * @param siblingExists - answers "is there a `.ts`/`.vue` this was compiled from?";
 *   defaults to a filesystem probe, and is injected by the spec.
 */
export function checkTrackedBuildOutput(
  tracked: readonly string[],
  allowlist: readonly AllowlistEntry[] = readAllowlist(),
  siblingExists: (path: string) => boolean = path => existsSync(resolve(ROOT, path)),
): TrackedBuildOutputViolation[] {
  const excused = new Set(allowlist.map(entry => entry.path))
  const violations: TrackedBuildOutputViolation[] = []

  for (const path of tracked) {
    if (!GOVERNED.test(path))
      continue
    const extension = buildOutputExtension(path)
    if (extension === undefined)
      continue

    const inexcusable = isInexcusable(extension)
    // An allowlist entry is honoured for everything except a sourcemap. That
    // single exception is what stops the escape hatch from re-admitting the
    // class of file the gate was written for.
    if (excused.has(path) && !inexcusable)
      continue

    const base = path.slice(0, -extension.length)
    const compiledFrom = [`${base}.ts`, `${base}.mts`, `${base}.cts`, `${base}.vue`]
      .find(candidate => siblingExists(candidate))

    violations.push({ path, extension, compiledFrom, inexcusable })
  }

  return violations
}

/** Every path git tracks under `packages/`, forward slashes, sorted by git. */
export function trackedPackageFiles(root: string = ROOT): string[] {
  const out = execFileSync('git', ['ls-files', '--', 'packages'], {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  })
  return out.split('\n').filter(line => line !== '')
}

/**
 * Tracked files **plus** files git would add on the next `git add`: present on
 * disk, under `packages/`, and not ignored.
 *
 * Only the allowlist's anti-rot check uses this, and it exists because of who
 * writes that allowlist. An agent that adds a hand-written `.mjs` under a
 * package's `src/` MUST allowlist it — `.mjs` and `.d.mts` are build-output
 * extensions, so the gate goes red the moment the file is committed — and is
 * **not authorised to commit** (every task prompt in this program: the owner
 * commits). Checking `git ls-files` alone therefore fails an entry that is
 * correct and one `git add` away from being tracked, which is not rot.
 *
 * Ignored files are still excluded, so the real risk — allowlisting something
 * that lives in a gitignored `dist/` — stays a failure.
 */
export function trackablePackageFiles(root: string = ROOT): string[] {
  const untracked = execFileSync('git', ['ls-files', '--others', '--exclude-standard', '--', 'packages'], {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  })
  return [...trackedPackageFiles(root), ...untracked.split('\n').filter(line => line !== '')]
}

/* c8 ignore start -- CLI entry point, exercised via `tsx`, not the unit tests. */
const isMain = process.argv[1]
  && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))

if (isMain) {
  const allowlist = readAllowlist()
  const violations = checkTrackedBuildOutput(trackedPackageFiles(), allowlist)

  if (violations.length === 0) {
    console.warn(
      `✓ tracked-build-output: no compiler output tracked under packages/*/src `
      + `(${allowlist.length} declared hand-written exception(s))`,
    )
    process.exit(0)
  }

  for (const violation of violations) {
    console.error(`✗ ${violation.path} is tracked build output (${violation.extension})`)
    if (violation.compiledFrom !== undefined)
      console.error(`  compiled from ${violation.compiledFrom}, which is the file that belongs in git`)
    if (violation.inexcusable) {
      console.error('  a sourcemap is never hand-written: delete it — the allowlist does not cover `.map`')
    }
    else {
      console.error(`  → git rm --cached "${violation.path}" and delete it (ADR-12: dist/ is published, never committed)`)
      console.error(`  → if it is genuinely hand-written, add it to ${'packages/tooling/scripts/tracked-build-output-allowlist.json'} with a reason`)
    }
  }
  console.error(`\n${violations.length} tracked build-output file(s) under packages/*/src.`)
  process.exit(1)
}
/* c8 ignore stop */
