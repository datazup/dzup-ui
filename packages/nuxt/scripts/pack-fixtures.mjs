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
 *   DZUP_FIXTURE_NUXT   The `nuxt` range each fixture installs, overriding the
 *                       one in its `package.template.json` (TASK-N5-03).
 *                       Unset means the templates decide, so the default lane
 *                       is byte-for-byte what it was before this option
 *                       existed. Set it to run the SAME fixtures against a
 *                       different Nuxt major — the only way to answer "does
 *                       @dzup-ui/nuxt still work on Nuxt 3?" with a run rather
 *                       than an opinion.
 *
 *                       The Node floor moves with it: `nuxt` <= 4.4.5 declares
 *                       `^20.19.0 || >=22.12.0`, `nuxt` >= 4.4.6 declares
 *                       `^22.12.0 || ^24.11.0 || >=26.0.0`. CI runs this
 *                       repository's declared floor, 20.19.0, so a range that
 *                       resolves above 4.4.5 cannot be installed there.
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

/**
 * The entries Nuxt 4 expects under `app/` rather than at the project root.
 *
 * TASK-N5-03, and it is not a style preference — it is the difference between
 * a fixture that tests something and one that tests nothing. Nuxt 4 changed the
 * default `srcDir` from `.` to `app/`. A root `app.vue` under Nuxt 4 is not an
 * error: it is *ignored*, the app has no root component, `nuxt generate`
 * prerenders no route, and `.output/public/` contains only the SPA fallback
 * `200.html` and `404.html` with an empty `<div id="__nuxt">`. The suite's
 * assertions then read an empty string and fail with `expected '' to contain
 * data-testid=…`, which looks exactly like a broken module and is not one.
 *
 * `nuxt.config.ts` stays at the root in both majors, and so does `server/`.
 */
const APP_DIR_ENTRIES = new Set(['app.vue', 'assets', 'pages', 'components'])

/**
 * The `nuxt` range a fixture will actually install: the override if set,
 * otherwise the one its own template declares.
 */
export function effectiveNuxtRange(templatePath) {
  const override = nuxtOverride()
  if (override !== undefined)
    return override
  try {
    return JSON.parse(readFileSync(templatePath, 'utf8')).dependencies?.nuxt
  }
  catch {
    return undefined
  }
}

/**
 * Whether this range wants the Nuxt 4 `app/` layout.
 *
 * Conservative by construction: anything it cannot parse gets the Nuxt 3
 * layout, which is what every checked-in template declares today. Guessing
 * "probably 4" from an unreadable range would silently relocate a fixture's
 * only component and turn a staging bug into six assertion failures.
 */
export function appDirLayout(range) {
  if (typeof range !== 'string')
    return false
  const major = /(\d+)/.exec(range.replace(/^\D*/, ''))
  return major !== null && Number.parseInt(major[1], 10) >= 4
}

export function stageRoot() {
  return process.env.DZUP_FIXTURE_STAGE ?? join(tmpdir(), 'dzup-nuxt-fixtures')
}

/** The `nuxt` range to install, or `undefined` to keep each template's own. */
export function nuxtOverride() {
  const value = process.env.DZUP_FIXTURE_NUXT
  return value === undefined || value === '' ? undefined : value
}

/**
 * Rewrite the `nuxt` dependency range in a rendered template.
 *
 * Only the top-level `dependencies.nuxt` entry. `@nuxt/kit` and the rest arrive
 * transitively at whatever the chosen `nuxt` pulls in, and pinning them
 * separately here would let a fixture install a kit its nuxt was never released
 * against — the opposite of what a consumer test is for.
 *
 * Exported so the manifest can record what was actually installed. A fixture
 * report that does not say which Nuxt it built is a pass about an unknown.
 */
export function applyNuxtOverride(rendered, range) {
  if (range === undefined)
    return rendered
  const parsed = JSON.parse(rendered)
  if (parsed.dependencies?.nuxt === undefined)
    return rendered
  parsed.dependencies.nuxt = range
  return `${JSON.stringify(parsed, null, 2)}\n`
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
    // Both layouts are cleared before staging, or a Nuxt 3 run after a Nuxt 4
    // run finds a leftover `app/app.vue` shadowing the root one it just wrote.
    rmSync(join(target, 'app'), { recursive: true, force: true })
    for (const entry of STAGED_ENTRIES)
      rmSync(join(target, entry), { recursive: true, force: true })

    const appSubdir = appDirLayout(effectiveNuxtRange(templatePath))
    for (const entry of STAGED_ENTRIES) {
      const from = join(source, entry)
      if (!existsSync(from))
        continue
      const to = appSubdir && APP_DIR_ENTRIES.has(entry)
        ? join(target, 'app', entry)
        : join(target, entry)
      mkdirSync(dirname(to), { recursive: true })
      cpSync(from, to, { recursive: true })
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

    const withNuxt = applyNuxtOverride(rendered, nuxtOverride())
    writeFileSync(packageJson, withNuxt, 'utf8')
    results.push({
      fixture,
      dir: target,
      status: 'ready',
      missing: [],
      // Recorded per fixture rather than once for the run: a template with no
      // `nuxt` dependency is not covered by the override, and reading the run's
      // intent instead of the fixture's fact is how a matrix starts claiming
      // coverage it does not have.
      nuxt: JSON.parse(withNuxt).dependencies?.nuxt ?? null,
    })
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

  const override = nuxtOverride()
  if (override !== undefined) {
    console.warn(
      `\n· DZUP_FIXTURE_NUXT=${override} — every fixture's \`nuxt\` range was overridden. `
      + 'This run is evidence about that range and no other.',
    )
  }

  console.warn(`\n✓ staged outside the repository → ${root}`)
  for (const { fixture, status, missing, nuxt } of results) {
    console.warn(
      `  ${status === 'ready' ? '✓' : '·'} ${fixture}: ${status}${
        nuxt ? ` (nuxt ${nuxt})` : ''}${
        missing.length > 0 ? ` (needs ${missing.join(', ')})` : ''}`,
    )
  }
}
