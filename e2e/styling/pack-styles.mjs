/**
 * Pack `@dzup-ui/tokens` and `@dzup-ui/core` into real tarballs and extract the
 * two stylesheets a consumer actually receives (TASK-R5-O1, ADR-19 §2).
 *
 * **Why a tarball and not `packages/core/src/styles/base.css`.** The override
 * guarantee is a promise about the CSS that arrives in `node_modules`, and every
 * step between the source file and that CSS can break it: the `@import
 * './prose.css'` at the top of `base.css` is inlined at build time, Vite may
 * hoist or reorder at-rules, a minifier may drop a layer statement it judges
 * empty, and `files`/`exports` decide whether the sheet ships at all. A fixture
 * that reads source proves the author's intent. This one proves the artifact.
 *
 * `yarn pack` rather than `npm pack`, for the reason `packages/nuxt/scripts/
 * pack-fixtures.mjs` records: yarn resolves `workspace:*` to a real version.
 *
 * The tarball is EXTRACTED rather than `npm install`ed. Installing adds a
 * dependency resolution step that cannot change the bytes of a CSS file, and
 * costs minutes; what is under test is the stylesheet the package publishes and
 * the layer statement inside it.
 *
 * Usage:
 *   node e2e/styling/pack-styles.mjs            # pack, extract, print the stage
 *   DZUP_STYLE_STAGE=/some/dir node …           # choose the stage root
 *
 * Writes <stage>/stylesheets.json:
 *   { "tokensCss": "<abs>", "coreCss": "<abs>", "tarballs": { … } }
 */

import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { gunzipSync } from 'node:zlib'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const STAGE = process.env.DZUP_STYLE_STAGE ?? join(tmpdir(), 'dzup-layer-order')

/** The two published stylesheets, and where each one lives inside its tarball. */
const SHEETS = [
  { key: 'tokensCss', pkg: '@dzup-ui/tokens', entry: 'package/dist/tokens.css' },
  { key: 'coreCss', pkg: '@dzup-ui/core', entry: 'package/dist/core.css' },
]

/** `yarn` is a shim on Windows and needs a shell to be found. */
function run(command, args, { cwd = ROOT, shell = false } = {}) {
  return execFileSync(command, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], shell })
}

/**
 * Read one file out of a `.tgz`, in Node, with no external `tar`.
 *
 * Measured, not preferred-in-the-abstract: GNU tar on Windows reads `C:\path`
 * as `host:path` and tries to open an rmt connection to a machine called `C`
 * (`Cannot connect to C: resolve failed`), and `--force-local` then mangles the
 * `-C` destination instead. A ustar header is 512 bytes with the name at 0 and
 * the octal size at 124, and the payload is padded to the next 512 boundary —
 * that is the whole format this needs, and it behaves the same on every OS a
 * contributor might run the fixture on.
 */
export function readFromTarball(tarball, entry) {
  const buffer = gunzipSync(readFileSync(tarball))
  for (let offset = 0; offset + 512 <= buffer.length;) {
    const header = buffer.subarray(offset, offset + 512)
    const name = header.subarray(0, 100).toString('utf8').replace(/\0.*$/, '')
    if (name === '')
      break
    const size = Number.parseInt(header.subarray(124, 136).toString('utf8').replace(/\0.*$/, '').trim(), 8) || 0
    const start = offset + 512
    if (name === entry)
      return buffer.subarray(start, start + size).toString('utf8')
    offset = start + Math.ceil(size / 512) * 512
  }
  return undefined
}

export function packStylesheets(stage = STAGE) {
  rmSync(stage, { recursive: true, force: true })
  mkdirSync(stage, { recursive: true })

  const result = { tarballs: {} }
  for (const { key, pkg, entry } of SHEETS) {
    const tarball = join(stage, `${pkg.replace('@', '').replace('/', '-')}.tgz`)
    run('yarn', ['workspace', pkg, 'pack', '--out', JSON.stringify(tarball)], { shell: true })
    if (!existsSync(tarball))
      throw new Error(`yarn pack produced no tarball for ${pkg} at ${tarball}`)

    const contents = readFromTarball(tarball, entry)
    if (contents === undefined) {
      throw new Error(
        `${pkg} packed without ${entry}. The stylesheet a consumer imports is not in the `
        + 'published tarball, which is the failure this fixture exists to catch — do not fall '
        + 'back to reading the source file.',
      )
    }
    const outDir = join(stage, key)
    mkdirSync(outDir, { recursive: true })
    const css = join(outDir, entry.replaceAll('/', '-'))
    writeFileSync(css, contents, 'utf8')
    result[key] = css
    result.tarballs[pkg] = tarball
  }

  writeFileSync(join(stage, 'stylesheets.json'), `${JSON.stringify(result, null, 2)}\n`, 'utf8')
  return result
}

/** Read a previously packed stage, packing it first if it is not there. */
export function readPackedStylesheets(stage = STAGE) {
  const manifest = join(stage, 'stylesheets.json')
  const paths = existsSync(manifest)
    ? JSON.parse(readFileSync(manifest, 'utf8'))
    : packStylesheets(stage)
  return {
    tokensCss: readFileSync(paths.tokensCss, 'utf8'),
    coreCss: readFileSync(paths.coreCss, 'utf8'),
    paths,
  }
}

if (resolve(process.argv[1] ?? '') === resolve(fileURLToPath(import.meta.url))) {
  const result = packStylesheets()
  console.warn(`✓ packed stylesheets → ${STAGE}`)
  for (const { key } of SHEETS)
    console.warn(`   · ${key}: ${result[key]}`)
}
