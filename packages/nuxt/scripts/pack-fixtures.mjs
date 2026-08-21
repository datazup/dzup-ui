/**
 * Pack the workspace into real tarballs and stage the Nuxt consumer fixtures
 * outside the repository (TASK-OSS-P1-03).
 *
 * Two things this does that a workspace-alias test cannot:
 *
 * **It installs what consumers install.** A workspace alias resolves
 * `@dzup-ui/core` to `packages/core/src`, so it cannot fail the way a published
 * package fails — a missing `exports` target, a stylesheet that never got
 * emitted, a `workspace:*` range that escaped into the published
 * `dependencies`. The first run of this script found one: the module pushed
 * `@dzup-ui/tokens/dist/tokens.css`, a deep path the tokens package does not
 * export, and every consumer install died on
 * `Missing "./dist/tokens.css" specifier`.
 *
 * **It runs the fixture outside the monorepo.** Node resolution walks up the
 * directory tree, so a fixture kept under `packages/nuxt/test/` finds the
 * repository's own `node_modules` — its nuxt, its nitropack, its vite — and
 * stops being a consumer at all. The checked-in fixture *sources* live in the
 * repo; each *run* is staged into a directory outside it.
 *
 * `yarn pack` is used rather than `npm pack` because it resolves the
 * `workspace:*` protocol to the real version, which is what the registry would
 * receive. `npm pack` copies the literal string and produces a tarball nobody
 * can install.
 *
 * Usage:
 *   node packages/nuxt/scripts/pack-fixtures.mjs
 *   DZUP_PRO_TARBALL=/path/pro.tgz node …/pack-fixtures.mjs   # include the Pro tier
 *   DZUP_FIXTURE_STAGE=/some/dir   node …/pack-fixtures.mjs   # choose the stage root
 *
 * Environment:
 *   DZUP_PRO_TARBALL    Absolute path to a tarball produced by a Pro checkout.
 *                       Core never builds Pro; when unset, fixtures needing it
 *                       are reported `unrun` rather than quietly skipped.
 *   DZUP_FIXTURE_STAGE  Where to stage the runnable copies.
 *                       Default: <tmpdir>/dzup-nuxt-fixtures
 */

import { execSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(HERE, '../../..')
const TARBALL_DIR = resolve(HERE, '../test/.tarballs')
const FIXTURES_DIR = resolve(HERE, '../test/fixtures')

export const STAGE_MANIFEST_PATH = join(TARBALL_DIR, 'stage.json')

/** Dependency order: a package is packed after everything it depends on. */
const WORKSPACES = ['@dzup-ui/contracts', '@dzup-ui/tokens', '@dzup-ui/core', '@dzup-ui/nuxt']

/** Files copied into a staged fixture. Everything else is install or build output. */
const STAGED_ENTRIES = ['nuxt.config.ts', 'app.vue', 'assets', 'pages', 'components', 'server']

export function stageRoot() {
  return process.env.DZUP_FIXTURE_STAGE ?? join(tmpdir(), 'dzup-nuxt-fixtures')
}

/** Absolute path → a `file:` specifier npm accepts on every platform. */
function fileSpecifier(path) {
  return `file:${path.replaceAll('\\', '/')}`
}

/**
 * Run `yarn` through the platform shell.
 *
 * `execFileSync('yarn', …)` cannot start yarn on Windows, where it is a `.cmd`
 * shim, and `execFileSync(…, { shell: true })` concatenates arguments rather
 * than escaping them (DEP0190). A single quoted command string survives both.
 */
function yarn(command) {
  execSync(`yarn ${command}`, { cwd: REPO_ROOT, stdio: 'inherit' })
}

function packWorkspace(name) {
  const out = join(TARBALL_DIR, `${name.replace('@', '').replace('/', '-')}.tgz`)
  yarn(`workspace ${name} pack --out "${out}"`)
  return out
}

export function packAll() {
  rmSync(TARBALL_DIR, { recursive: true, force: true })
  mkdirSync(TARBALL_DIR, { recursive: true })

  /** @type {Record<string, string>} */
  const tarballs = {}
  for (const name of WORKSPACES)
    tarballs[name] = packWorkspace(name)

  const proTarball = process.env.DZUP_PRO_TARBALL
  if (proTarball !== undefined && proTarball !== '') {
    if (!existsSync(proTarball))
      throw new Error(`DZUP_PRO_TARBALL is set to ${proTarball}, which does not exist`)
    tarballs['@dzup-ui-pro/pro'] = resolve(proTarball)
  }

  return tarballs
}

/**
 * Copy each fixture to the stage root and render its `package.json` there.
 *
 * A fixture whose template names a package no tarball provides is staged
 * with no `package.json` at all, which is what makes its spec report `unrun`
 * instead of silently testing something else.
 */
export function stageFixtures(tarballs) {
  const root = stageRoot()
  const results = []

  for (const fixture of readdirSync(FIXTURES_DIR)) {
    const source = join(FIXTURES_DIR, fixture)
    if (!statSync(source).isDirectory())
      continue

    const templatePath = join(source, 'package.template.json')
    if (!existsSync(templatePath))
      continue

    const target = join(root, fixture)
    mkdirSync(target, { recursive: true })

    // `node_modules` is deliberately preserved across runs: one fixture install
    // is ~770 packages, and re-downloading that on every pack would make the
    // suite something nobody runs. install-fixtures.mjs evicts the @dzup-ui
    // packages, which are the only ones whose contents change.
    rmSync(join(target, '.nuxt'), { recursive: true, force: true })
    rmSync(join(target, '.output'), { recursive: true, force: true })
    for (const entry of STAGED_ENTRIES) {
      const from = join(source, entry)
      if (existsSync(from))
        cpSync(from, join(target, entry), { recursive: true })
    }

    const missing = []
    const rendered = readFileSync(templatePath, 'utf8').replaceAll(
      /"file:(@[^"]+)"/g,
      (match, name) => {
        const tarball = tarballs[name]
        if (tarball === undefined) {
          missing.push(name)
          return match
        }
        return `"${fileSpecifier(tarball)}"`
      },
    )

    const packageJson = join(target, 'package.json')
    if (missing.length > 0) {
      rmSync(packageJson, { force: true })
      results.push({ fixture, dir: target, status: 'unrun', missing })
      continue
    }

    writeFileSync(packageJson, rendered, 'utf8')
    results.push({ fixture, dir: target, status: 'ready', missing: [] })
  }

  return { root, results }
}

const isMain = process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))

if (isMain) {
  const tarballs = packAll()
  const { root, results } = stageFixtures(tarballs)

  writeFileSync(
    STAGE_MANIFEST_PATH,
    `${JSON.stringify({ stageRoot: root, tarballs, fixtures: results }, null, 2)}\n`,
    'utf8',
  )

  console.warn(`\n✓ packed ${Object.keys(tarballs).length} tarball(s) → ${TARBALL_DIR}`)
  for (const [name, path] of Object.entries(tarballs))
    console.warn(`  ${name} → ${path}`)

  if (tarballs['@dzup-ui-pro/pro'] === undefined) {
    console.warn(
      '\n· DZUP_PRO_TARBALL is not set. Fixtures that need the Pro package are marked unrun; '
      + 'they are not skipped silently.',
    )
  }

  console.warn(`\n✓ staged outside the repository → ${root}`)
  for (const { fixture, status, missing } of results) {
    console.warn(
      `  ${status === 'ready' ? '✓' : '·'} ${fixture}: ${status}${
        missing.length > 0 ? ` (needs ${missing.join(', ')})` : ''}`,
    )
  }
}
