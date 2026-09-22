/**
 * pack-freshness.mjs — "is this `dist/` newer than the sources it was built
 * from?", asked once and answered the same way everywhere a tarball is made.
 *
 * TASK-R1-O2 (N5-04 `F10`). `yarn pack` archives whatever `dist/` happens to be
 * on disk. Nothing built it, nothing checked it, and nothing said so: on
 * 2026-09-21 a deliberately stale `packages/core/dist` (built 11:36:43Z, sources
 * edited 12:02:06Z) was packed into four tarballs and staged into seven Nuxt
 * fixtures by `yarn test:nuxt-fixtures:pack`, which exited **0**. Every
 * assertion those fixtures then make is evidence about a build nobody has, and
 * the report does not mention it. The same trap sits under
 * `validate:published-imports`: importing last week's `dist` proves last week's
 * package is importable.
 *
 * The check is mtime arithmetic, not a build:
 *
 *   newest mtime under `<pkg>/src` (plus `package.json`)  >  newest mtime under `<pkg>/dist`
 *     ⇒ dist is older than its sources ⇒ refuse, naming both timestamps.
 *
 * A build was deliberately NOT made the default. `test:nuxt-fixtures:pack` is
 * called from a test lane; forcing `yarn build` (minutes, and it rewrites
 * `packages/core/dist` for every other lane in the session) into every run is
 * the expensive answer to a question mtimes answer in ~40 ms. Callers that do
 * want the build can ask for it — `pack-fixtures.mjs --build` — and the refusal
 * message tells a human exactly which command to run.
 *
 * Plain JS with a hand-written `pack-freshness.d.mts`, for the same reason
 * `release-parser.mjs` is: a `node`-run `.mjs` (`packages/nuxt/scripts/
 * pack-fixtures.mjs`) and a `tsx`-run `.ts` (the published-imports validator)
 * must share ONE definition of "stale". Two copies would drift, and the drift
 * would be silent in exactly the direction this file exists to prevent.
 */
import { existsSync, readdirSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import process from 'node:process'

/** Never walked: install output, not package source. */
const SKIPPED_DIRS = new Set(['node_modules'])

/**
 * Newest file under `dir`, or `null` when the directory does not exist or holds
 * no files. Returns the path too — "dist is stale" is not actionable without
 * the name of the file that made it stale.
 */
export function newestFileUnder(dir) {
  if (!existsSync(dir))
    return null

  let best = null
  const stack = [dir]

  while (stack.length > 0) {
    const current = stack.pop()
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      if (SKIPPED_DIRS.has(entry.name))
        continue
      const abs = join(current, entry.name)
      if (entry.isDirectory()) {
        stack.push(abs)
        continue
      }
      const mtimeMs = statSync(abs).mtimeMs
      if (best === null || mtimeMs > best.mtimeMs)
        best = { file: abs, mtimeMs }
    }
  }

  return best
}

/**
 * Newest of several candidate paths — used to fold `package.json` (which
 * decides `exports`, `files` and the version a tarball carries) into the source
 * side of the comparison. A changed `exports` map with an unchanged `src` is a
 * stale tarball just the same.
 */
function newestOf(candidates) {
  let best = null
  for (const candidate of candidates) {
    if (candidate === null)
      continue
    if (best === null || candidate.mtimeMs > best.mtimeMs)
      best = candidate
  }
  return best
}

/**
 * Freshness of one workspace package.
 *
 * `status`:
 *   - `'fresh'`    — dist exists and is at least as new as every source input
 *   - `'stale'`    — dist exists but predates a source input (names both)
 *   - `'unbuilt'`  — no dist at all, or a dist with no files in it
 *   - `'sourceless'` — no src directory; nothing to compare, treated as fresh
 */
export function checkDistFreshness(packageDir, name) {
  const srcDir = resolve(packageDir, 'src')
  const distDir = resolve(packageDir, 'dist')

  const newestDist = newestFileUnder(distDir)
  if (newestDist === null)
    return { name, packageDir, status: 'unbuilt', newestSource: null, newestDist: null }

  const pkgJsonPath = resolve(packageDir, 'package.json')
  const pkgJson = existsSync(pkgJsonPath)
    ? { file: pkgJsonPath, mtimeMs: statSync(pkgJsonPath).mtimeMs }
    : null

  const newestSource = newestOf([newestFileUnder(srcDir), pkgJson])
  if (newestSource === null)
    return { name, packageDir, status: 'sourceless', newestSource: null, newestDist }

  return {
    name,
    packageDir,
    status: newestSource.mtimeMs > newestDist.mtimeMs ? 'stale' : 'fresh',
    newestSource,
    newestDist,
  }
}

/** `checkDistFreshness` for many packages, in the order given. */
export function checkAllDistFreshness(packages) {
  return packages.map(({ name, packageDir }) => checkDistFreshness(packageDir, name))
}

/** ISO-8601 with milliseconds — the timestamps a refusal must be arguable from. */
function stamp(mtimeMs) {
  return new Date(mtimeMs).toISOString()
}

/**
 * The refusal text. Names both timestamps and both files for every offending
 * package, then the one command that fixes it. `repoRoot` only shortens paths.
 */
export function formatFreshnessRefusal(results, { repoRoot = process.cwd(), buildHint } = {}) {
  const short = file => relative(repoRoot, file).replaceAll('\\', '/')
  const lines = []

  const stale = results.filter(r => r.status === 'stale')
  const unbuilt = results.filter(r => r.status === 'unbuilt')

  lines.push('dist freshness check FAILED — refusing to pack a build older than its sources')
  lines.push('')

  for (const r of stale) {
    lines.push(`  ${r.name}  STALE`)
    lines.push(`    newest source  ${stamp(r.newestSource.mtimeMs)}  ${short(r.newestSource.file)}`)
    lines.push(`    newest dist    ${stamp(r.newestDist.mtimeMs)}  ${short(r.newestDist.file)}`)
    lines.push(`    dist is ${describeLag(r.newestSource.mtimeMs - r.newestDist.mtimeMs)} behind`)
  }

  for (const r of unbuilt) {
    lines.push(`  ${r.name}  UNBUILT`)
    lines.push(`    no files under ${short(resolve(r.packageDir, 'dist'))}`)
  }

  lines.push('')
  lines.push(buildHint ?? '  Run `yarn build` (or the per-workspace build) and pack again.')
  lines.push('  A tarball built from a stale dist is evidence about a build nobody has.')

  return lines.join('\n')
}

/** "3 m 21 s" / "2 h 5 m" — a lag a reader can judge without doing the subtraction. */
function describeLag(deltaMs) {
  const seconds = Math.max(0, Math.round(deltaMs / 1000))
  if (seconds < 60)
    return `${seconds} s`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60)
    return `${minutes} m ${seconds % 60} s`
  const hours = Math.floor(minutes / 60)
  return `${hours} h ${minutes % 60} m`
}

/**
 * Throws unless every package's dist is at least as new as its sources.
 *
 * `allowStale` exists for one legitimate case — a caller that has just built,
 * or is deliberately packing a known-old tree to reproduce a bug — and it is an
 * explicit argument rather than a silent default so the choice shows up in the
 * command that made it.
 */
export function assertDistFresh(packages, { repoRoot = process.cwd(), allowStale = false, buildHint } = {}) {
  const results = checkAllDistFreshness(packages)
  const offending = results.filter(r => r.status === 'stale' || r.status === 'unbuilt')

  if (offending.length === 0 || allowStale)
    return results

  throw new Error(formatFreshnessRefusal(offending, { repoRoot, buildHint }))
}
