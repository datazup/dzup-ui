/**
 * build-llms.mjs — put the generated component-API `llms.txt` / `llms-full.txt`
 * where Storybook serves them.
 *
 * THIS SCRIPT NO LONGER EXTRACTS ANYTHING (TASK-N2-A3).
 *
 * It used to be 567 lines that parsed `packages/contracts/src/*.types.ts` and
 * every component's `*.types.ts` with its own TypeScript AST walker, resolved
 * `extends` chains and generic parameters by hand, and scraped each `.vue`
 * header with regexes — a **second component-API extractor**, which constraint
 * B9 exists to prevent. It also drove its roster from
 * `packages/core/manifests/public-api.manifest.json`, which TASK-N2-A1 measured
 * **stale by 43 public components**; because `@dzup-ui/mcp`'s `list_components`
 * and `get_component` answer out of the file this produced, those 43 were
 * invisible to every MCP client in production (A1 finding F1).
 *
 * Both files are now rendered by `yarn generate:llms` from
 * `packages/core/docs/component-meta.json` (the one extraction) plus the
 * curated intro source at `packages/tooling/src/llms/llms-content.ts`, and are
 * COMMITTED at `packages/core/docs/llms{,-full}.txt`. `yarn validate:llms`
 * fails when they disagree with a fresh render, and fails when this copy stops
 * happening — `public/` is where Storybook picks them up, so without it the
 * deployed `/storybook/llms.txt` is whatever was last built, or nothing.
 *
 * OUTPUT (git-ignored copies of committed files):
 *   apps/storybook/public/llms.txt
 *   apps/storybook/public/llms-full.txt
 *
 * Storybook copies `public/` into `storybook-static/`, which the landing build
 * nests at `/storybook/`, so both shipping apps serve the same bytes.
 *
 * Run automatically before `storybook dev` / `storybook build` (the `build:llms`
 * package script), same lifecycle as build-playground / build-releases.
 */
import { copyFile, mkdir, stat } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const appRoot = resolve(__dirname, '..')
const repoRoot = resolve(appRoot, '../..')

/** The committed, generated sources — one per served file. */
const FILES = [
  ['packages/core/docs/llms.txt', 'public/llms.txt'],
  ['packages/core/docs/llms-full.txt', 'public/llms-full.txt'],
]

async function run() {
  await mkdir(resolve(appRoot, 'public'), { recursive: true })
  const sizes = []
  for (const [src, dest] of FILES) {
    const from = resolve(repoRoot, src)
    try {
      await stat(from)
    }
    catch {
      throw new Error(
        `${src} is missing. It is a generated, committed artifact — run \`yarn generate:llms\` `
        + `(which needs \`yarn generate:component-meta\` first). This script only copies; it `
        + `deliberately no longer knows how to extract a component API.`,
      )
    }
    await copyFile(from, resolve(appRoot, dest))
    sizes.push(`${dest} ← ${src}`)
  }
  console.log(`[llms] copied ${FILES.length} generated files\n  ${sizes.join('\n  ')}`)
}

run().catch((err) => {
  console.error('[llms] copy failed:', err.message)
  process.exitCode = 1
})
