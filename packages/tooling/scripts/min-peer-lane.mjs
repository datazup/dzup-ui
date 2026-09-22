/**
 * The MINIMUM declared peer lane (TASK-R1-O4).
 *
 * The package matrix in the 08-11 validation/release document has a row nothing
 * ever ran: the lowest `vue` and `reka-ui` a consumer is *told* they may bring.
 * Every lane in this repository exercises the version the lockfile happens to
 * resolve, which is the newest one. The root manifest depends on `vue@^3.5.13`
 * while `@dzup-ui/core` publishes the peer range `vue@^3.5.0`, so 3.5.0-3.5.12
 * have never been installed here at all. `reka-ui@^2.0.0` is the same: the tree
 * resolves 2.9.x.
 *
 * A peer range is a promise to a consumer. This lane is the only thing that
 * checks the promise.
 *
 * Why the floor is DERIVED, never written down
 * --------------------------------------------
 * A version literal in this lane's config would be a second declaration of the
 * floor, and two declarations drift. The runner reads `peerDependencies` out of
 * the workspaces named in `min-peer-lane.json`, collects every declared range
 * for a peer, and pins the lowest version that satisfies all of them. Widening
 * a peer range therefore moves this lane automatically; a range that is widened
 * by accident is caught by the lane going red rather than by nobody noticing.
 *
 * Why a resolved version is ASSERTED, not reported
 * ------------------------------------------------
 * A lockfile can silently lift a floor. `resolutions` is a forced override in
 * yarn 4, but a transitive constraint, a `patch:` entry or a stale lockfile can
 * still leave a different version on disk, and a lane that prints "resolved to
 * 3.5.43" in the middle of a green run has produced evidence about the version
 * it was built to avoid. A mismatch here exits **2 (did not run)**, not 1, and
 * not 0 with a warning. That distinction is the whole point of the lane, and it
 * is the exact defect this task found in the Vue 3.6 lane, which warned and
 * carried on for three consecutive scheduled runs.
 *
 * Usage:
 *   node packages/tooling/scripts/min-peer-lane.mjs          # the lane
 *   node packages/tooling/scripts/min-peer-lane.mjs --plan   # print, change nothing
 *   node packages/tooling/scripts/min-peer-lane.mjs -- vitest run packages/core
 *
 * Exit codes:
 *   0  every command passed at the declared floor
 *   1  a command failed — a real result, and a defect claim against THIS
 *      repository: a published peer range does not hold
 *   2  the lane could not run (install failed, or the floor did not resolve).
 *      NOT the same as a failing suite, and reported differently on purpose
 *   3  the restore did not verify. The working tree needs attention.
 */

import { execSync } from 'node:child_process'
import { copyFileSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '../../..')
const CONFIG_PATH = join(HERE, 'min-peer-lane.json')
const MANIFEST = join(ROOT, 'package.json')
const LOCKFILE = join(ROOT, 'yarn.lock')

export function readConfig(path = CONFIG_PATH) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

/**
 * Compare two version strings the way a registry orders them.
 *
 * Numeric release parts first, then "a prerelease sorts below its release" —
 * which is the only prerelease rule this lane needs, because a floor is never
 * expressed as a prerelease and the comparison exists to pick the lowest of a
 * `||` union and the highest of several declared floors.
 */
export function compareVersions(a, b) {
  const [releaseA, preA = ''] = String(a).split('-')
  const [releaseB, preB = ''] = String(b).split('-')
  const partsA = releaseA.split('.').map(Number)
  const partsB = releaseB.split('.').map(Number)

  for (let i = 0; i < 3; i++) {
    const left = partsA[i] ?? 0
    const right = partsB[i] ?? 0
    if (left !== right)
      return left < right ? -1 : 1
  }

  if (preA === preB)
    return 0
  if (preA === '')
    return 1
  if (preB === '')
    return -1
  return preA < preB ? -1 : 1
}

/**
 * The lowest version a single range admits, or `null` when the range does not
 * name one.
 *
 * `^3.5.0` → `3.5.0`. `>=20.19.0` → `20.19.0`. `3.5.0` → `3.5.0`.
 * `>3.5.0` → **null**: the lowest admissible version is "the next release after
 * 3.5.0", which is not a version this lane can install, and guessing one would
 * produce a lane testing something the range never promised.
 * `*` and `x` → null for the same reason.
 */
export function floorOfAtom(atom) {
  const trimmed = atom.trim()
  if (trimmed === '' || trimmed === '*' || trimmed === 'x')
    return null
  // `>` without `=` has no lowest admissible version; `<`/`<=` is a ceiling.
  if (/^>[^=]/.test(trimmed) || trimmed.startsWith('<'))
    return null

  const match = trimmed.match(/(\d+\.\d+\.\d+(?:-[\w.-]+)?)/)
  return match ? match[1] : null
}

/** The lowest version a whole range admits, taking the lowest of a `||` union. */
export function floorOfRange(range) {
  const floors = String(range)
    .split('||')
    .map(floorOfAtom)
    .filter(value => value !== null)

  if (floors.length === 0)
    return null

  return floors.reduce((lowest, candidate) => (compareVersions(candidate, lowest) < 0 ? candidate : lowest))
}

/**
 * Every declared range for one peer, read from the workspaces the config names.
 *
 * `manifests` is `{ '<workspace dir>': <parsed package.json> }` so this stays a
 * pure function; the CLI reads the files.
 */
export function declaredRanges(manifests, peer) {
  const out = []
  for (const [dir, manifest] of Object.entries(manifests)) {
    const range = manifest?.peerDependencies?.[peer]
    if (typeof range === 'string')
      out.push({ dir, name: manifest.name ?? dir, range })
  }
  return out
}

/**
 * The version this lane pins for a peer: the lowest one that satisfies **every**
 * declared range, i.e. the highest of the individual floors.
 *
 * Throws when a range names no installable floor, rather than picking one. A
 * lane that guessed would report a pass about a version nobody declared.
 */
export function floorFor(ranges) {
  if (ranges.length === 0)
    throw new Error('no workspace declares this peer')

  let floor = null
  for (const { name, range } of ranges) {
    const candidate = floorOfRange(range)
    if (candidate === null)
      throw new Error(`${name} declares \`${range}\`, which names no installable lowest version`)
    if (floor === null || compareVersions(candidate, floor) > 0)
      floor = candidate
  }
  return floor
}

/** The `resolutions` block this run applies: every floor, plus its lockstep set. */
export function resolutionsFor(config, floors) {
  const out = {}
  for (const [peer, version] of Object.entries(floors)) {
    out[peer] = version
    for (const companion of config.lockstep?.[peer] ?? []) {
      if (companion.startsWith('//'))
        continue
      out[companion] = version
    }
  }
  return out
}

/** The root manifest with the lane's resolutions merged over its own. */
export function applyResolutions(manifestJson, resolutions) {
  const parsed = JSON.parse(manifestJson)
  parsed.resolutions = { ...parsed.resolutions, ...resolutions }
  return `${JSON.stringify(parsed, null, 2)}\n`
}

/**
 * Which pins did not end up on disk.
 *
 * `installed` is `{ name: version | null }`; `null` means the package is not
 * present at all, which is a mismatch and not an absence to shrug at — a peer
 * the suite imports has to be installed for the run to mean anything.
 */
export function mismatches(expected, installed) {
  const out = []
  for (const [name, version] of Object.entries(expected)) {
    const actual = installed[name] ?? null
    if (actual !== version)
      out.push({ name, expected: version, actual })
  }
  return out
}

/** The commands the config asks for, or a `--` passthrough. */
export function commandsFor(config, passthrough) {
  if (passthrough.length > 0)
    return [{ name: 'passthrough', run: passthrough.join(' ') }]
  return config.commands.filter(entry => typeof entry.run === 'string')
}

function run(command, options = {}) {
  execSync(command, { cwd: ROOT, stdio: 'inherit', ...options })
}

function installedVersion(name) {
  try {
    return JSON.parse(readFileSync(join(ROOT, 'node_modules', name, 'package.json'), 'utf8')).version
  }
  catch {
    return null
  }
}

/* c8 ignore start -- CLI entry point; the pure helpers above are what the specs drive. */
const isMain = process.argv[1] !== undefined
  && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))

if (isMain) {
  const argv = process.argv.slice(2)
  const separator = argv.indexOf('--')
  const flags = separator === -1 ? argv : argv.slice(0, separator)
  const passthrough = separator === -1 ? [] : argv.slice(separator + 1)

  const config = readConfig()

  const floors = {}
  const provenance = []
  let derivationFailed = false
  for (const [peer, entry] of Object.entries(config.peers)) {
    if (peer.startsWith('//'))
      continue

    const manifests = {}
    for (const dir of entry.sources)
      manifests[dir] = JSON.parse(readFileSync(join(ROOT, dir, 'package.json'), 'utf8'))

    const ranges = declaredRanges(manifests, peer)
    try {
      floors[peer] = floorFor(ranges)
      provenance.push({ peer, floor: floors[peer], ranges })
    }
    catch (error) {
      console.error(`✗ cannot derive a floor for \`${peer}\`: ${error instanceof Error ? error.message : error}`)
      derivationFailed = true
    }
  }

  if (derivationFailed) {
    console.error(
      '\n  The lane refuses to run rather than pin a version nobody declared. Fix the\n'
      + '  peer range, or name a different source workspace in min-peer-lane.json.',
    )
    process.exit(2)
  }

  const resolutions = resolutionsFor(config, floors)
  const commands = commandsFor(config, passthrough)

  console.warn('Minimum declared peer lane — TASK-R1-O4\n')
  for (const { peer, floor, ranges } of provenance) {
    console.warn(`  ${peer.padEnd(12)}floor ${floor}   (declared ${ranges.map(r => `${r.name} ${r.range}`).join(', ')})`)
    console.warn(`  ${''.padEnd(12)}on disk now: ${installedVersion(peer) ?? 'not installed'}`)
  }
  console.warn(`\n  pinning     ${Object.keys(resolutions).length} package(s)`)
  console.warn(`  commands    ${commands.map(c => c.run).join('  |  ')}`)
  console.warn(
    '  status      BLOCKING in meaning: a failure here says a peer range this\n'
    + '              repository PUBLISHES does not hold, which is a defect claim\n'
    + '              against this repository and not about somebody else\'s release.\n',
  )

  if (flags.includes('--plan')) {
    console.warn(`${JSON.stringify(resolutions, null, 2)}\n`)
    console.warn('· --plan: nothing was written.')
    process.exit(0)
  }

  const backupDir = tmpdir()
  const manifestBackup = join(backupDir, `dzup-min-peer-package.json.${process.pid}`)
  const lockBackup = join(backupDir, `dzup-min-peer-yarn.lock.${process.pid}`)
  copyFileSync(MANIFEST, manifestBackup)
  copyFileSync(LOCKFILE, lockBackup)
  console.warn(`· saved package.json → ${manifestBackup}`)
  console.warn(`· saved yarn.lock    → ${lockBackup}\n`)

  let exitCode = 0
  try {
    writeFileSync(MANIFEST, applyResolutions(readFileSync(MANIFEST, 'utf8'), resolutions), 'utf8')

    try {
      run('yarn install --no-immutable')
    }
    catch {
      console.error(
        '\n✗ the lane could NOT RUN: `yarn install` failed while pinning the declared\n'
        + '  floors. Causes seen in practice: no network access, or a transitive\n'
        + '  constraint the resolver refuses rather than warns about. The second one is\n'
        + '  itself a finding — it means the declared floor is not installable and the\n'
        + '  peer range is wrong — but it is NOT a suite result. Record the lane as\n'
        + '  wired-but-unrun and read the resolver error above.',
      )
      exitCode = 2
      throw new Error('install failed')
    }

    const installed = Object.fromEntries(
      Object.keys(resolutions).map(name => [name, installedVersion(name)]),
    )
    console.warn('\n· resolved on disk:')
    for (const [name, version] of Object.entries(installed))
      console.warn(`    ${name.padEnd(24)} ${version ?? 'NOT INSTALLED'}`)

    const drift = mismatches(resolutions, installed)
    if (drift.length > 0) {
      const rows = drift.map(d => `    ${d.name}: expected ${d.expected}, got ${d.actual ?? 'nothing'}`).join('\n')
      console.error(
        `\n✗ the lane could NOT RUN: ${drift.length} package(s) did not resolve to the declared\n`
        + `  floor, so anything below would be evidence about a version this lane exists\n`
        + `  to avoid testing:\n${rows}\n\n`
        + `  A lockfile can lift a floor. This is not a warning on purpose — a lane that\n`
        + `  warns and carries on produces a green run about the wrong version.`,
      )
      exitCode = 2
    }
    else {
      for (const command of commands) {
        try {
          run(`yarn ${command.run}`)
          console.warn(`\n✓ ${command.name} PASSED at the declared floor.`)
        }
        catch {
          console.error(
            `\n✗ ${command.name} FAILED at the declared peer floor.\n`
            + '  This is a defect claim against THIS repository: the peer range it publishes\n'
            + '  admits a version it does not work on. Either fix the code or raise the\n'
            + '  declared floor with a changeset — narrowing a peer range is `minor` under\n'
            + '  packages/contracts/VERSIONING.md, which is the breaking position for 0.x.',
          )
          exitCode = 1
          break
        }
      }
    }
  }
  catch (error) {
    if (exitCode === 0) {
      console.error(`\n✗ the lane could not run: ${error instanceof Error ? error.message : error}`)
      exitCode = 2
    }
  }
  finally {
    copyFileSync(manifestBackup, MANIFEST)
    copyFileSync(lockBackup, LOCKFILE)
    console.warn('\n· restored package.json and yarn.lock')

    const manifestRestored = readFileSync(MANIFEST, 'utf8') === readFileSync(manifestBackup, 'utf8')
    const lockRestored = readFileSync(LOCKFILE, 'utf8') === readFileSync(lockBackup, 'utf8')
    if (!manifestRestored || !lockRestored) {
      console.error(
        '\n✗ RESTORE DID NOT VERIFY. The working tree still carries the lane\'s pins.\n'
        + `  package.json restored: ${manifestRestored}\n`
        + `  yarn.lock restored:    ${lockRestored}\n`
        + `  Copies are at ${manifestBackup} and ${lockBackup}.`,
      )
      exitCode = 3
    }
    else {
      console.warn(
        '· node_modules still holds the floor versions. Run `yarn install` to put the\n'
        + '  default toolchain back on disk — the lockfile is already correct, so it is a\n'
        + '  fast one.',
      )
    }
  }

  process.exit(exitCode)
}
/* c8 ignore stop */
