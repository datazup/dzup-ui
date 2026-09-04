/**
 * The Vue 3.6 forward-compatibility lane (TASK-N5-03).
 *
 * Runs the repository's own suite against an unreleased Vue **without changing
 * what anybody else resolves**. The default toolchain is the thing this lane
 * most has to protect: a forward-compat experiment that leaves `vue@3.6.0-rc.6`
 * in the lockfile has not tested the future, it has shipped it.
 *
 * How the one-lane override is expressed
 * --------------------------------------
 * Yarn 4 has no "resolutions for this command only". Three options were on the
 * table and two are worse:
 *
 *   - **A second lockfile / second workspace.** Honest isolation, but it means
 *     a duplicate of a 4 MB lockfile that nothing keeps in step with the real
 *     one, so the lane slowly stops testing this repository.
 *   - **`yarn add vue@rc` in CI and never restore.** Fine in an ephemeral
 *     checkout, catastrophic when a contributor runs it locally — which is the
 *     first thing anybody does with a lane that finds something.
 *   - **Apply, run, restore (this).** The manifest and the lockfile are copied
 *     before the first write and restored in a `finally`, so an exception, a
 *     failing suite and a Ctrl-C all land in the same place: the tree the lane
 *     started from.
 *
 * The restore is verified, not assumed. `--verify` re-reads both files and
 * compares them to the copies; if either differs the runner exits non-zero
 * **even when the suite passed**, because a lane that quietly leaves an
 * unreleased Vue pinned is a worse outcome than a lane that failed.
 *
 * Usage:
 *   node packages/tooling/scripts/vue-next-lane.mjs                 # the default suite
 *   node packages/tooling/scripts/vue-next-lane.mjs --vapor         # + the Vapor interop smoke
 *   node packages/tooling/scripts/vue-next-lane.mjs -- vitest run packages/core
 *   node packages/tooling/scripts/vue-next-lane.mjs --plan          # print, change nothing
 *
 * Environment:
 *   DZUP_VUE_NEXT   Override the version this lane pins, e.g. `3.6.0` on the
 *                   day it is stable. Defaults to `resolutions.vue` in
 *                   vue-next-lane.json.
 *
 * Exit codes:
 *   0  the lane ran and the command passed
 *   1  the command failed — a real result, and under an RC it is advisory
 *   2  the lane could not run (install failed, network unavailable). NOT the
 *      same as a failing suite, and reported differently on purpose: "we never
 *      executed this" and "this is broken" are not interchangeable.
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
const CONFIG_PATH = join(HERE, 'vue-next-lane.json')
const MANIFEST = join(ROOT, 'package.json')
const LOCKFILE = join(ROOT, 'yarn.lock')

export function readConfig(path = CONFIG_PATH) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

/**
 * The resolutions this run applies, with the pinned version substituted.
 *
 * Every `@vue/*` entry moves with `vue` itself. Vue's packages are released in
 * lockstep and mixing them produces failures that belong to neither version —
 * `@vue/runtime-core` 3.6 against `@vue/shared` 3.5 is not a state anybody
 * ships, so a red run in that state says nothing about 3.6.
 */
export function resolutionsFor(config, version) {
  const out = {}
  for (const [name, pinned] of Object.entries(config.resolutions)) {
    if (name.startsWith('//'))
      continue
    out[name] = pinned.startsWith('3.') ? version : pinned
  }
  return out
}

/** The root manifest with the lane's resolutions merged over its own. */
export function applyResolutions(manifestJson, resolutions) {
  const parsed = JSON.parse(manifestJson)
  parsed.resolutions = { ...parsed.resolutions, ...resolutions }
  return `${JSON.stringify(parsed, null, 2)}\n`
}

function run(command, options = {}) {
  execSync(command, { cwd: ROOT, stdio: 'inherit', ...options })
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
  const version = process.env.DZUP_VUE_NEXT ?? config.resolutions.vue
  const resolutions = resolutionsFor(config, version)

  // Two commands, and the difference between them is not convenience — they
  // ask different questions and need different module graphs.
  //
  //   default   `vitest run` on the ROOT config. "Does this library work under
  //             Vue 3.6, resolved exactly the way the default lane resolves
  //             it?" Changing resolution here would answer a question nobody
  //             asked.
  //
  //   --vapor   the Vapor smoke on `vue-next.vitest.config.ts`, which aliases
  //             `vue` to Vue's own single-file `runtime-with-vapor` build.
  //             That is the ONLY arrangement in which one process holds one
  //             Vue: assembled from the separate packages, the vapor runtime
  //             and the vDOM runtime come from different builds and
  //             `createVaporApp` dies in `prepareApp`. Measuring that seam
  //             would be measuring the test environment, not the interop.
  //             The config states the whole chain.
  //
  // On the default Vue the smoke reports `unverified` rather than passing, so
  // it is safe in the root suite too — it is only ever *verified* here.
  const withVapor = flags.includes('--vapor')
  const command = passthrough.length > 0
    ? passthrough.join(' ')
    : (withVapor
        ? 'vitest run -c packages/tooling/scripts/vue-next.vitest.config.ts packages/core/tests/vapor-interop.spec.ts'
        : 'vitest run')

  console.warn('Vue forward-compatibility lane — TASK-N5-03\n')
  console.warn(`  channel     ${config.channel}`)
  console.warn(`  pinning     ${Object.keys(resolutions).length} package(s) at ${version}`)
  console.warn(`  command     ${command}`)
  console.warn(`  status      ADVISORY — a failure here is information about an unreleased Vue.`)
  console.warn(`              It is not a defect claim against this repository, and it does not`)
  console.warn(`              gate a merge until \`vue@latest\` is 3.6.x.\n`)

  if (flags.includes('--plan')) {
    console.warn(`${JSON.stringify(resolutions, null, 2)}\n`)
    console.warn('· --plan: nothing was written.')
    process.exit(0)
  }

  const backupDir = tmpdir()
  const manifestBackup = join(backupDir, `dzup-vue-next-package.json.${process.pid}`)
  const lockBackup = join(backupDir, `dzup-vue-next-yarn.lock.${process.pid}`)
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
      // Distinguished from a failing suite on purpose. An unreachable registry
      // is "this lane never executed here", and recording that as a pass or as
      // a failure would both be lies.
      console.error(
        `\n✗ the lane could NOT RUN: \`yarn install\` failed while pinning Vue ${version}.\n`
        + '  Causes seen in practice: no network access, a yanked RC, or a peer range that\n'
        + '  the resolver refuses rather than warns about. This is NOT a test result — do\n'
        + '  not record it as one. Record the lane as wired-but-unrun.',
      )
      exitCode = 2
      throw new Error('install failed')
    }

    const installed = JSON.parse(
      readFileSync(join(ROOT, 'node_modules/vue/package.json'), 'utf8'),
    ).version
    console.warn(`\n· vue resolved to ${installed}`)
    if (installed !== version) {
      console.warn(
        `  ! that is not ${version}. Something else in the tree pinned it; the result below\n`
        + `    is evidence about ${installed} and must be reported as such.`,
      )
    }

    try {
      run(`yarn ${command}`)
      console.warn(`\n✓ vue-next lane PASSED under vue ${installed} (advisory).`)
    }
    catch {
      console.error(
        `\n✗ vue-next lane FAILED under vue ${installed}. ADVISORY — this does not block a\n`
        + '  merge. Triage each failure as library defect / RC behaviour change / test-env\n'
        + '  issue before changing any library code.',
      )
      exitCode = 1
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
        '· node_modules still holds the lane\'s Vue. Run `yarn install` to put the default\n'
        + '  toolchain back on disk — the lockfile is already correct, so it is a fast one.',
      )
    }
  }

  process.exit(exitCode)
}
/* c8 ignore stop */
