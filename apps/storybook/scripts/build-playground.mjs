/**
 * build-playground.mjs — prebuild the assets the in-browser playground needs.
 *
 * The "Try it now" REPL (stories/_blocks/DzRepl.ts) and the "Open in StackBlitz"
 * action run *user* code inside a sandbox that has no access to Storybook's Vite
 * graph — it resolves `import { DzButton } from '@dzup-ui/core'` through an
 * import map that must point at a real URL. `@dzup-ui/*` is a workspace package
 * (not on a public CDN), so we bundle it here into a single self-contained ESM
 * that inlines every runtime dep EXCEPT `vue` (kept external so it stays a
 * singleton shared with the REPL's own Vue instance via the sandbox import map).
 *
 * Outputs to `apps/storybook/public/playground/` (served at `{BASE}playground/`):
 *   - dzup-core.mjs   bundled @dzup-ui/core (vue external)
 *   - tokens.css      the --dz-* design-token stylesheet
 *   - core.css        base interaction utilities (.dz-focus-ring-*, …)
 *
 * core.css is the stylesheet Rollup EXTRACTS from the bundle — `src/index.ts`
 * side-effect-imports `./styles/base.css`, and components carry no `<style>` of
 * their own (ADR-04: tv() + Tailwind), so the extracted asset is precisely the
 * CSS this bundle needs. It is therefore not copied from packages/core/dist:
 * extraction cannot drift from what the sandbox actually imports, and the
 * playground no longer needs core to have been built. Keep `cssFileName` in
 * sync with the <link> in stories/_blocks/playground.config.ts — a third name
 * (`dzup-core.css`) was once linked and never written, 404ing on every load.
 *
 * Tailwind utility classes used by components are generated at runtime in the
 * sandbox by the Tailwind v4 browser CDN (see DzRepl.ts headHTML), so we only
 * ship tokens + base css here, not a compiled utility sheet.
 *
 * Run automatically before `storybook dev` / `storybook build` (see the
 * `build:playground` script). The output dir is git-ignored — it is a build
 * artifact regenerated from the current workspace source, so it always tracks
 * the current major version (requirement: "stays in sync").
 */
import { existsSync } from 'node:fs'
import { copyFile, mkdir, rm } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { build } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))
const appRoot = resolve(__dirname, '..')
const repoRoot = resolve(appRoot, '../..')
const outDir = resolve(appRoot, 'public/playground')

/** Every file the sandbox <head>/import-map references. Asserted after the build. */
const PLAYGROUND_ASSETS = ['dzup-core.mjs', 'tokens.css', 'core.css']

/** Workspace aliases — mirror .storybook/main.ts so we bundle from source. */
const alias = [
  { find: '@dzup-ui/tokens/css', replacement: resolve(repoRoot, 'packages/tokens/dist/tokens.css') },
  { find: '@dzup-ui/tokens/tailwind', replacement: resolve(repoRoot, 'packages/tokens/dist/tailwind-theme.js') },
  { find: '@dzup-ui/tokens/utils', replacement: resolve(repoRoot, 'packages/tokens/src/utils/index.ts') },
  { find: '@dzup-ui/tokens', replacement: resolve(repoRoot, 'packages/tokens/src') },
  { find: '@dzup-ui/contracts', replacement: resolve(repoRoot, 'packages/contracts/src/index.ts') },
  { find: '@dzup-ui/core', replacement: resolve(repoRoot, 'packages/core/src') },
]

async function run() {
  await rm(outDir, { recursive: true, force: true })
  await mkdir(outDir, { recursive: true })

  await build({
    configFile: false,
    logLevel: 'warn',
    resolve: { alias },
    plugins: [vue()],
    define: { 'process.env.NODE_ENV': JSON.stringify('production') },
    // The output lives under public/; disable Vite's public-dir copy so it
    // doesn't try to copy public/ into itself.
    publicDir: false,
    build: {
      outDir,
      emptyOutDir: false,
      minify: true,
      target: 'esnext',
      lib: {
        entry: resolve(repoRoot, 'packages/core/src/index.ts'),
        formats: ['es'],
        fileName: () => 'dzup-core.mjs',
        // Deterministic name for the extracted stylesheet (base.css, imported by
        // src/index.ts) so the sandbox can link it. Default would be style.css.
        cssFileName: 'core',
      },
      rollupOptions: {
        // Keep Vue external so the library and the REPL-compiled component share
        // one Vue instance (resolved via the sandbox import map). Everything else
        // (reka-ui, tailwind-variants, lucide, …) is inlined for self-containment.
        external: ['vue', 'vue/server-renderer'],
        output: { inlineDynamicImports: true },
      },
    },
  })

  await copyFile(resolve(repoRoot, 'packages/tokens/dist/tokens.css'), resolve(outDir, 'tokens.css'))

  // Fail loudly rather than shipping a sandbox that links a stylesheet nobody wrote.
  for (const asset of PLAYGROUND_ASSETS) {
    if (!existsSync(resolve(outDir, asset)))
      throw new Error(`expected ${asset} in ${outDir}, but the build did not produce it`)
  }

  console.log(`[playground] wrote ${PLAYGROUND_ASSETS.join(' + ')} to`, outDir)
}

run().catch((err) => {
  console.error('[playground] build failed:', err)
  process.exitCode = 1
})
