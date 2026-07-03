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
 * Tailwind utility classes used by components are generated at runtime in the
 * sandbox by the Tailwind v4 browser CDN (see DzRepl.ts headHTML), so we only
 * ship tokens + base css here, not a compiled utility sheet.
 *
 * Run automatically before `storybook dev` / `storybook build` (see the
 * `build:playground` script). The output dir is git-ignored — it is a build
 * artifact regenerated from the current workspace source, so it always tracks
 * the current major version (requirement: "stays in sync").
 */
import { copyFile, mkdir, rm } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'vite'
import vue from '@vitejs/plugin-vue'

const __dirname = dirname(fileURLToPath(import.meta.url))
const appRoot = resolve(__dirname, '..')
const repoRoot = resolve(appRoot, '../..')
const outDir = resolve(appRoot, 'public/playground')

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
        // Deterministic name for the extracted SFC <style> output (scoped
        // reduced-motion guards etc.) so the sandbox can link it.
        cssFileName: 'dzup-core',
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
  await copyFile(resolve(repoRoot, 'packages/core/dist/core.css'), resolve(outDir, 'core.css'))

  console.log('[playground] wrote dzup-core.mjs + tokens.css + core.css to', outDir)
}

run().catch((err) => {
  console.error('[playground] build failed:', err)
  process.exitCode = 1
})
