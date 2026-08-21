/**
 * Install the staged Nuxt consumer fixtures from their packed tarballs
 * (TASK-OSS-P1-03).
 *
 * Separate from the spec run on purpose. Each fixture is a real Nuxt app with
 * its own `node_modules` — that isolation is the point, because a shared
 * install would hoist `@dzup-ui-pro/pro` into the `pro-missing` fixture and
 * `reka-ui` into `optional-peer`, quietly deleting the two cases those fixtures
 * exist to cover. The cost is ~770 packages per fixture, so it is an explicit
 * step rather than something `yarn test` does by surprise.
 *
 * `npm install` rather than yarn: the fixtures live outside the workspace, and
 * npm's `overrides` is what repoints `@dzup-ui/core`'s published dependency
 * ranges (`@dzup-ui/contracts: 0.1.0`) at the local tarballs. Those versions are
 * not on any registry — these packages have never been published — so without
 * overrides the install fails on a package that does not exist.
 *
 * Usage:
 *   node packages/nuxt/scripts/install-fixtures.mjs              # every ready fixture
 *   node packages/nuxt/scripts/install-fixtures.mjs core-only    # just one
 */

import { execSync } from 'node:child_process'
import { existsSync, readFileSync, rmSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { STAGE_MANIFEST_PATH } from './pack-fixtures.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))

export function readStageManifest() {
  if (!existsSync(STAGE_MANIFEST_PATH)) {
    throw new Error(
      `${STAGE_MANIFEST_PATH} does not exist. Run \`node ${join(HERE, 'pack-fixtures.mjs')}\` first.`,
    )
  }
  return JSON.parse(readFileSync(STAGE_MANIFEST_PATH, 'utf8'))
}

export function installFixture(dir) {
  // The tarball paths are stable but their *contents* change on every repack,
  // and npm treats a `file:` dependency at an unchanged path as up to date. A
  // fixture would then keep testing the previous build of the library and
  // report a pass for code that no longer exists — the exact failure this whole
  // suite is meant to make impossible. Evict them before installing.
  rmSync(join(dir, 'package-lock.json'), { force: true })
  for (const scope of ['@dzup-ui', '@dzup-ui-pro'])
    rmSync(join(dir, 'node_modules', scope), { recursive: true, force: true })

  execSync('npm install --no-audit --no-fund', { cwd: dir, stdio: 'inherit' })
}

const isMain = process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))

if (isMain) {
  const manifest = readStageManifest()
  const ready = manifest.fixtures.filter(entry => entry.status === 'ready')
  const requested = process.argv.slice(2)
  const targets = requested.length > 0
    ? ready.filter(entry => requested.includes(entry.fixture))
    : ready

  const unknown = requested.filter(name => !ready.some(entry => entry.fixture === name))
  if (unknown.length > 0) {
    console.error(
      `✗ not ready: ${unknown.join(', ')}. A fixture stays unstaged when a tarball it needs `
      + 'is missing — see the `unrun` rows from pack-fixtures.mjs.',
    )
    process.exit(1)
  }

  for (const { fixture, dir } of targets) {
    console.warn(`\n── installing ${fixture} → ${dir} ──`)
    installFixture(dir)
  }

  console.warn(`\n✓ installed ${targets.length} fixture(s): ${targets.map(e => e.fixture).join(', ')}`)

  const unrun = manifest.fixtures.filter(entry => entry.status === 'unrun')
  for (const { fixture, missing } of unrun)
    console.warn(`· ${fixture}: unrun (needs ${missing.join(', ')})`)
}
