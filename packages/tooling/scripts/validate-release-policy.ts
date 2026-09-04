/**
 * Release-machinery gate (TASK-N5-01).
 *
 * The defect this exists to stop already happened once and survived on `main`.
 * `.changeset/the-catalog-says-what-it-owes.md` named `@dzup-ui/tooling`
 * alongside two published packages; changesets refuses a changeset that mixes
 * ignored and non-ignored packages, so `changeset status` — and `changeset
 * version` — **failed outright**. The release plan was blocked and nobody knew,
 * for one reason: *no gate in this repository ran `changeset status`*.
 * `validate:changelog` is a different script that reads CHANGELOG.md files.
 * TASK-SK-1 fixed the changeset and did not add the missing gate, so the same
 * failure could land again the next day, invisibly.
 *
 * Clause R1 below is that missing gate. The rest are the invariants
 * `changeset status` cannot see, each one written against a defect measured on
 * this checkout rather than an imagined one:
 *
 *   R1  `changeset status` assembles a release plan and exits 0.
 *   R2  `.changeset/config.json` sets `privatePackages.version: false`, so a
 *       private app can never enter a release plan. It did not, and
 *       `@dzup-ui/landing` — private, unpublishable — was standing in the plan
 *       for a patch bump.
 *   R3  Every workspace package is classified in release-policy.json as
 *       published / withheld / private, and the classification agrees with the
 *       package's own `private` flag and with the changesets `ignore` array. A
 *       new package with no entry fails: `apps/docs` was created by TASK-N2-D1
 *       and the changesets config never heard of it.
 *   R4  No changeset mixes a skipped package with a published one — reported by
 *       changeset filename and package name, before changesets throws a stack
 *       trace at line 576 of a bundled dependency.
 *   R5  No changeset declares `major` while its target is 0.x. Under
 *       VERSIONING.md a `major` bump IS the 1.0 release; shipping 1.0 as a side
 *       effect of a routine change is the one release accident this gate can
 *       actually prevent.
 *   R6  Every published package is 0.x. The moment one crosses 1.0 the policy
 *       document's scope is exceeded and this gate says so rather than
 *       continuing to enforce a rule that no longer applies.
 *   R7  Every changeset names at least one package, every named package exists
 *       in the workspace, and every level is patch/minor/major.
 *   R8  No `.changeset/pre.json`. Pre-mode residue silently changes what every
 *       subsequent command does; entering it is a decision, not a state to find.
 *   R9  Ratchet: how many PUBLISHED packages carry a newest CHANGELOG heading
 *       that `validate:changelog` would reject. See the note on the ceiling in
 *       release-policy.json — this is a ratchet on an open defect, not a pass.
 *   R10 Every published package is covered by `validate:changelog`'s hand-typed
 *       list, or is listed as exempt with a reason. `@dzup-ui/mcp` is neither
 *       covered nor coverable today; the exemption records why.
 *
 * It does not decide whether a change is breaking. Nothing can. It checks the
 * shape of the claim and proves the plan assembles.
 *
 * Usage:
 *   tsx packages/tooling/scripts/validate-release-policy.ts
 *
 * Exit code 1 if violations found.
 */

import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../')

/** Directories a workspace package can live in, per the root `workspaces` globs. */
const WORKSPACE_DIRS = ['packages', 'apps']

const LEVELS = new Set(['patch', 'minor', 'major'])

export interface Violation {
  rule: string
  message: string
}

export interface PackageRecord {
  name: string
  version: string
  private: boolean
  path: string
}

interface ChangesetsConfig {
  ignore?: string[]
  privatePackages?: { version?: boolean, tag?: boolean }
}

interface WithheldEntry { name: string, reason: string }

export interface ReleasePolicy {
  policy: string
  allowMajor: boolean
  published: string[]
  withheld: WithheldEntry[]
  private: string[]
  changelogCoverageExempt: WithheldEntry[]
  changelogFormatCollisionCeiling: number
}

export interface ChangesetRecord {
  file: string
  /** package name → level, in declaration order. */
  releases: Array<{ name: string, level: string }>
  malformed?: string
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(readFileSync(resolve(ROOT, relativePath), 'utf8')) as T
}

/** Every workspace package, read from disk rather than from a list. */
export function collectWorkspacePackages(root: string = ROOT): PackageRecord[] {
  const found: PackageRecord[] = []
  for (const dir of WORKSPACE_DIRS) {
    const full = resolve(root, dir)
    if (!existsSync(full))
      continue
    for (const entry of readdirSync(full)) {
      const manifestPath = join(full, entry, 'package.json')
      if (!existsSync(manifestPath))
        continue
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
        name?: string
        version?: string
        private?: boolean
      }
      if (manifest.name === undefined)
        continue
      found.push({
        name: manifest.name,
        version: manifest.version ?? '',
        private: manifest.private === true,
        path: `${dir}/${entry}`,
      })
    }
  }
  return found.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
}

/**
 * The frontmatter of one changeset.
 *
 * Deliberately a small hand parser rather than an import of `@changesets/parse`:
 * `packages/tooling` declares no `@dzup-ui/*` dependencies and carries no
 * changesets dependency of its own, and R1 already delegates the authoritative
 * read to the CLI itself. This parser exists so R4–R7 can name the *file* that
 * is wrong, which the CLI's error does not.
 */
export function parseChangeset(file: string, source: string): ChangesetRecord {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source)
  if (match === null)
    return { file, releases: [], malformed: 'no `---` frontmatter block' }

  const releases: Array<{ name: string, level: string }> = []
  for (const rawLine of match[1].split(/\r?\n/)) {
    const line = rawLine.trim()
    if (line.length === 0)
      continue
    const entry = /^(?:"([^"]+)"|'([^']+)'|([^:\s]+))\s*:\s*(\S.*)$/.exec(line)
    if (entry === null)
      return { file, releases, malformed: `unparseable frontmatter line: ${JSON.stringify(line)}` }
    const name = entry[1] ?? entry[2] ?? entry[3] ?? ''
    releases.push({ name, level: entry[4].trim().replace(/^["']|["']$/g, '') })
  }
  return { file, releases }
}

/** Every `.changeset/*.md` except the directory's own README. */
export function collectChangesets(root: string = ROOT): ChangesetRecord[] {
  const dir = resolve(root, '.changeset')
  if (!existsSync(dir))
    return []
  return readdirSync(dir)
    .filter(entry => entry.endsWith('.md') && entry !== 'README.md')
    .sort()
    .map(entry => parseChangeset(entry, readFileSync(join(dir, entry), 'utf8')))
}

/** `0.x` for the purposes of this policy: a leading major of `0`. */
export function isZeroVersion(version: string): boolean {
  return /^0\./.test(version)
}

/**
 * Whether `validate:changelog` would accept this file's newest version heading.
 *
 * Mirrors `validate-changelog.ts` exactly — heading matches `^##\s+\[?x.y.z`
 * and carries an ISO date on the same line. Duplicated on purpose: importing it
 * would couple the ratchet to a script that may be rewritten when N5-01-D1 is
 * decided, and the ratchet has to keep measuring the same thing across that
 * rewrite.
 */
export function changelogHeadingWouldPass(changelog: string): boolean | undefined {
  const headings = changelog.split(/\r?\n/).filter(line => /^##\s+\[?\d+\.\d+\.\d+/.test(line))
  if (headings.length === 0)
    return undefined
  return /\d{4}-\d{2}-\d{2}/.test(headings[0])
}

/** The hand-typed list inside validate-changelog.ts, read as data. */
export function changelogCoveredPackages(source: string): string[] {
  const block = /PUBLISHABLE_PACKAGES[\s\S]*?\n\]/.exec(source)
  if (block === null)
    return []
  return [...block[0].matchAll(/name:\s*'([^']+)'/g)].map(m => m[1])
}

export function checkReleasePolicy(root: string = ROOT): Violation[] {
  const violations: Violation[] = []
  const add = (rule: string, message: string): void => void violations.push({ rule, message })

  const policy = readJson<ReleasePolicy>('packages/tooling/scripts/release-policy.json')
  const config = readJson<ChangesetsConfig>('.changeset/config.json')
  const packages = collectWorkspacePackages(root)
  const byName = new Map(packages.map(p => [p.name, p]))
  const ignore = new Set(config.ignore ?? [])

  const withheldNames = new Set(policy.withheld.map(e => e.name))
  const publishedNames = new Set(policy.published)
  const privateNames = new Set(policy.private)

  // R2 — private packages cannot enter a release plan.
  if (config.privatePackages?.version !== false) {
    add('R2', '.changeset/config.json does not set `privatePackages.version: false`, so every '
    + 'private app in the workspace is eligible for a version bump and a generated CHANGELOG '
    + 'it can never publish. `@dzup-ui/landing` was standing in the release plan for exactly '
    + 'that reason. See packages/contracts/VERSIONING.md §6.')
  }

  // R3 — classification is complete and agrees with reality.
  for (const pkg of packages) {
    const classes = [
      publishedNames.has(pkg.name) ? 'published' : null,
      withheldNames.has(pkg.name) ? 'withheld' : null,
      privateNames.has(pkg.name) ? 'private' : null,
    ].filter((c): c is string => c !== null)

    if (classes.length === 0) {
      add('R3', `${pkg.name} (${pkg.path}) has no entry in release-policy.json. Every workspace `
      + 'package must be classified published / withheld / private before it can be released '
      + 'or deliberately not released. Add it.')
      continue
    }
    if (classes.length > 1) {
      add('R3', `${pkg.name} is classified ${classes.join(' and ')} in release-policy.json. `
      + 'Exactly one.')
      continue
    }

    const actual = pkg.private ? 'private' : ignore.has(pkg.name) ? 'withheld' : 'published'
    if (actual !== classes[0]) {
      add('R3', `${pkg.name} is classified "${classes[0]}" in release-policy.json but the repository `
      + `says "${actual}" (${pkg.path}/package.json private=${pkg.private}, changesets `
      + `ignore=${ignore.has(pkg.name)}). One of the two is wrong.`)
    }
  }
  for (const name of [...publishedNames, ...withheldNames, ...privateNames]) {
    if (!byName.has(name)) {
      add('R3', `release-policy.json classifies ${name}, which is not a workspace package. `
      + 'A renamed or deleted package leaves a stale classification behind.')
    }
  }

  // R6 — the policy document only speaks for 0.x.
  for (const name of policy.published) {
    const pkg = byName.get(name)
    if (pkg !== undefined && pkg.version !== '' && !isZeroVersion(pkg.version)) {
      add('R6', `${name} is ${pkg.version}, not 0.x. packages/contracts/VERSIONING.md states the `
      + 'pre-1.0 mapping (minor = breaking, patch = additive) and stops applying at 1.0. '
      + 'Revisit the policy rather than letting this gate enforce a rule that has expired.')
    }
  }

  // R4, R5, R7 — the changesets themselves.
  for (const cs of collectChangesets(root)) {
    if (cs.malformed !== undefined) {
      add('R7', `.changeset/${cs.file}: ${cs.malformed}`)
      continue
    }
    if (cs.releases.length === 0) {
      add('R7', `.changeset/${cs.file} names no package. An empty changeset produces no changelog `
      + 'entry and no bump; it is almost always a lost edit.')
      continue
    }

    const skipped: string[] = []
    const released: string[] = []
    for (const { name, level } of cs.releases) {
      const pkg = byName.get(name)
      if (pkg === undefined) {
        add('R7', `.changeset/${cs.file} names ${name}, which is not a workspace package.`)
        continue
      }
      if (!LEVELS.has(level)) {
        add('R7', `.changeset/${cs.file} declares level ${JSON.stringify(level)} for ${name}; `
        + 'legal levels are patch, minor and major.')
        continue
      }
      if (level === 'major' && !policy.allowMajor && isZeroVersion(pkg.version)) {
        add('R5', `.changeset/${cs.file} declares \`major\` for ${name} (${pkg.version}). Under `
        + 'packages/contracts/VERSIONING.md §1 a major bump before 1.0 IS the 1.0 release — '
        + 'this changeset would ship 1.0.0 as a side effect. A breaking change ships as '
        + '`minor` while the library is 0.x. Releasing 1.0 flips `allowMajor` in '
        + 'release-policy.json deliberately.')
      }
      if (pkg.private || ignore.has(name))
        skipped.push(name)
      else
        released.push(name)
    }

    if (skipped.length > 0 && released.length > 0) {
      add('R4', `.changeset/${cs.file} names both skipped (${skipped.join(', ')}) and released `
      + `(${released.join(', ')}) packages. Changesets refuses this outright and the whole `
      + 'release plan stops assembling — the TASK-SK-1 failure. Split it into two changesets, '
      + 'or the skipped package is being kept out of the plan for a reason worth revisiting '
      + '(release-policy.json `withheld`).')
    }
  }

  // R8 — pre-mode residue.
  if (existsSync(resolve(root, '.changeset/pre.json'))) {
    add('R8', '.changeset/pre.json exists. Pre-release mode changes what `changeset version` and '
    + '`changeset publish` do to every package, silently. Entering it is a decision; finding '
    + 'it is a defect. `yarn changeset pre exit` leaves it.')
  }

  // R9, R10 — changelog coverage and the format collision.
  const changelogSource = readFileSync(
    resolve(root, 'packages/tooling/scripts/validate-changelog.ts'),
    'utf8',
  )
  const covered = new Set(changelogCoveredPackages(changelogSource))
  const exempt = new Set(policy.changelogCoverageExempt.map(e => e.name))

  for (const name of policy.published) {
    if (!covered.has(name) && !exempt.has(name)) {
      add('R10', `${name} is published but packages/tooling/scripts/validate-changelog.ts does not `
      + 'list it, so its CHANGELOG.md is never checked. Add it to that list, or record why it '
      + 'cannot be added in release-policy.json `changelogCoverageExempt`.')
    }
  }
  for (const name of exempt) {
    if (covered.has(name)) {
      add('R10', `${name} is listed as changelog-coverage exempt but validate-changelog.ts now `
      + 'covers it. Remove the exemption — the list may only shrink.')
    }
  }

  let colliding = 0
  const collidingNames: string[] = []
  for (const name of policy.published) {
    const pkg = byName.get(name)
    if (pkg === undefined)
      continue
    const changelogPath = resolve(root, pkg.path, 'CHANGELOG.md')
    if (!existsSync(changelogPath))
      continue
    if (changelogHeadingWouldPass(readFileSync(changelogPath, 'utf8')) === false) {
      colliding += 1
      collidingNames.push(name)
    }
  }
  if (colliding > policy.changelogFormatCollisionCeiling) {
    add('R9', `${colliding} published package(s) carry a newest CHANGELOG heading that `
    + `validate:changelog rejects (${collidingNames.join(', ')}); the recorded ceiling is `
    + `${policy.changelogFormatCollisionCeiling}. That heading shape — \`## x.y.z\` with no `
    + 'ISO date — is exactly what `changeset version` writes, so this number growing means the '
    + 'release path and the changelog gate have drifted further apart. Owner decision N5-01-D1.')
  }
  if (colliding < policy.changelogFormatCollisionCeiling) {
    add('R9', `Only ${colliding} published package(s) now collide with validate:changelog, below `
    + `the recorded ceiling of ${policy.changelogFormatCollisionCeiling}. Lower the ceiling in `
    + 'release-policy.json — a ratchet that is not tightened is not a ratchet.')
  }

  return violations
}

/**
 * R1 — the clause nothing in this repository had.
 *
 * Spawns the changesets CLI rather than importing it: `packages/tooling` carries
 * no changesets dependency, and the authority on whether a release plan
 * assembles is the tool that assembles it, not a re-implementation.
 */
export function checkChangesetStatus(root: string = ROOT): Violation[] {
  const bin = resolve(root, 'node_modules/@changesets/cli/bin.js')
  if (!existsSync(bin)) {
    return [{
      rule: 'R1',
      message: 'node_modules/@changesets/cli/bin.js is missing, so `changeset status` cannot be '
        + 'run and this gate cannot certify the release plan. Install dependencies.',
    }]
  }

  const run = spawnSync(process.execPath, [bin, 'status'], {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, FORCE_COLOR: '0' },
  })

  if (run.status === 0)
    return []

  const output = `${run.stdout ?? ''}${run.stderr ?? ''}`
    .split(/\r?\n/)
    .map(line => line.replace(/^🦋\s*/u, '').trim())
    .filter(line => line.length > 0 && !line.startsWith('at '))
    .slice(0, 12)
    .join('\n        ')

  return [{
    rule: 'R1',
    message: `\`changeset status\` exited ${run.status}. The release plan does not assemble, which `
      + 'means `changeset version` and `changeset publish` are both blocked — the TASK-SK-1 '
      + `failure, which sat on \`main\` unnoticed because no gate ran this command:\n        ${output}`,
  }]
}

/* c8 ignore start -- CLI entry point, exercised via `tsx`, not the unit tests. */
const isMain = process.argv[1]
  && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))

if (isMain) {
  const violations = [...checkChangesetStatus(), ...checkReleasePolicy()]
  const policy = readJson<ReleasePolicy>('packages/tooling/scripts/release-policy.json')

  if (violations.length === 0) {
    const packages = collectWorkspacePackages()
    const changesets = collectChangesets()
    console.warn(
      `✓ release-policy: \`changeset status\` assembles; ${policy.published.length} published, `
      + `${policy.withheld.length} withheld, ${policy.private.length} private of `
      + `${packages.length} workspace packages; ${changesets.length} pending changeset(s), `
      + `0 major, 0 mixed; changelog-format collisions at the ceiling of `
      + `${policy.changelogFormatCollisionCeiling}`,
    )
    process.exit(0)
  }

  for (const violation of violations)
    console.error(`✗ [${violation.rule}] ${violation.message}`)
  console.error(`\n${violations.length} release-policy violation(s). `
    + 'See packages/contracts/VERSIONING.md.')
  process.exit(1)
}
/* c8 ignore stop */
