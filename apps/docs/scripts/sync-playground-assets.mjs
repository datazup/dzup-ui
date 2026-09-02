/**
 * sync-playground-assets.mjs — TASK-N2-D3.
 *
 * Copies the three playground assets into `apps/docs/public/playground/`.
 *
 * **It is a copy step, and that is the whole design.** The bundle is produced by
 * `apps/storybook/scripts/build-playground.mjs`, which has existed since
 * 2026-07-17 and is the only thing in this repository that knows how to turn
 * `@dzup-ui/core` into something a browser sandbox can import. Writing a second
 * bundler here would be the fifth "second implementation" this lane has found —
 * after a second component-API extractor (B9), a second `llms` structural
 * validator (A3 F-3), a second component-page renderer (D1 §4) and a second
 * theme designer (`apps/landing`, found by this packet).
 *
 * It is deliberately the same shape TASK-N2-A3 gave
 * `apps/storybook/scripts/build-llms.mjs` when it went from a 567-line second
 * extractor to a 73-line copy step: one producer, N consumers, and a `--check`
 * mode that fails when a consumer's copy has drifted.
 *
 *   node scripts/sync-playground-assets.mjs           build then copy
 *   node scripts/sync-playground-assets.mjs --check   copies exist and match
 *   node scripts/sync-playground-assets.mjs --no-build  copy what is already there
 *
 * The copied assets are git-ignored (they are build output, regenerated from
 * current source, exactly like the Storybook original). `seeds.json`, which sits
 * in the same directory, is NOT — it is generated truth written by
 * `yarn generate:docs-pages` and committed so `yarn validate:docs-pages` has
 * something to compare against.
 */
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const APP_ROOT = resolve(HERE, '..')
const REPO_ROOT = resolve(APP_ROOT, '../..')
const PRODUCER = resolve(REPO_ROOT, 'apps/storybook/scripts/build-playground.mjs')
const SOURCE_DIR = resolve(REPO_ROOT, 'apps/storybook/public/playground')
const TARGET_DIR = resolve(APP_ROOT, 'public/playground')

/**
 * Kept in sync with `PLAYGROUND_ASSETS` in
 * `packages/tooling/src/playground/playground-contract.ts` by
 * `yarn validate:playground-parity`, which reads both files rather than trusting
 * this comment.
 */
const ASSETS = ['dzup-core.mjs', 'tokens.css', 'core.css']

/**
 * `@vue/repl`'s own stylesheets, copied from node_modules and served as files.
 *
 * They are NOT part of the shared sandbox contract — Storybook's producer does
 * not write them — so they are a separate list, handled here only.
 *
 * The reason they are copied at all: VitePress 1.6.4 builds with Vite's
 * `cssCodeSplit` disabled, so `import('@vue/repl/style.css')` — even behind a
 * dynamic import — is emitted into the single shared `style.css` that every
 * page of the site downloads. Measured at **+18,422 B on every page**. Served
 * as files and `<link>`ed at launch time, the cost falls to zero for anyone who
 * never opens a playground.
 */
const REPL_STYLES = [
  ['@vue/repl/dist/vue-repl.css', 'repl/vue-repl.css'],
  ['@vue/repl/dist/codemirror-editor.css', 'repl/codemirror-editor.css'],
]

const check = process.argv.includes('--check')
const noBuild = process.argv.includes('--no-build')

function sha256(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex')
}

if (!check && !noBuild) {
  const result = spawnSync(process.execPath, [PRODUCER], { stdio: 'inherit', cwd: REPO_ROOT })
  if (result.status !== 0) {
    console.error('[playground] the producer failed; nothing was copied.')
    process.exit(1)
  }
}

const problems = []
for (const asset of ASSETS) {
  const from = resolve(SOURCE_DIR, asset)
  const to = resolve(TARGET_DIR, asset)
  if (!existsSync(from)) {
    problems.push(
      `${asset} is missing from apps/storybook/public/playground. `
      + 'Run `node apps/storybook/scripts/build-playground.mjs`.',
    )
    continue
  }
  if (check) {
    if (!existsSync(to)) {
      problems.push(`${asset} has not been copied into apps/docs/public/playground.`)
      continue
    }
    if (sha256(from) !== sha256(to)) {
      problems.push(
        `${asset} in apps/docs/public/playground DIFFERS from the producer's output. `
        + 'The docs playground would run a different library than Storybook\'s. '
        + 'Run `yarn workspace @dzup-ui/docs playground`.',
      )
    }
    continue
  }
  mkdirSync(TARGET_DIR, { recursive: true })
  copyFileSync(from, to)
}

for (const [spec, target] of REPL_STYLES) {
  const from = resolve(REPO_ROOT, 'node_modules', spec)
  const to = resolve(TARGET_DIR, target)
  if (!existsSync(from)) {
    problems.push(`${spec} is missing from node_modules — is @vue/repl installed?`)
    continue
  }
  if (check) {
    if (!existsSync(to) || sha256(from) !== sha256(to)) {
      problems.push(
        `${target} is missing or differs from ${spec}. Without it the playground editor `
        + 'renders unstyled. Run `yarn workspace @dzup-ui/docs playground`.',
      )
    }
    continue
  }
  mkdirSync(dirname(to), { recursive: true })
  copyFileSync(from, to)
}

if (problems.length > 0) {
  for (const p of problems)
    console.error(`  ✗ ${p}`)
  console.error(`\n${problems.length} playground-asset violation(s).`)
  process.exit(1)
}

const sizes = ASSETS.map(a => `${a} ${statSync(resolve(TARGET_DIR, a)).size} B`).join(' · ')
console.warn(check
  ? `  ✓ playground assets match the producer — ${sizes}`
  : `[playground] copied to apps/docs/public/playground — ${sizes}`)
