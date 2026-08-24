/**
 * Per-export tree-shaken bundle size (TASK-OSS-P5-05).
 *
 * `bundlesize.config.json` budgets whole build artifacts, which answers "did
 * the package grow" and not "what does importing `DzDataGrid` cost me". A
 * consumer importing one component pays for that component and its transitive
 * dependencies, and that number is the one a budget should be about.
 *
 * So each measured export gets its own minimal Vite build — one entry that
 * imports one symbol — and the gzipped bytes of the result are the measurement.
 * `tree-shake-check.ts` already builds fixtures this way to prove unrelated
 * families are absent; this reuses the shape and keeps the number instead of
 * discarding it.
 *
 * Externals mirror the library build, so the figure is the Dzup code a consumer
 * adds, not a second copy of Vue.
 *
 * @module @dzup-ui/tooling/perf/export-sizes
 */

import { execFileSync } from 'node:child_process'
import { mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import process from 'node:process'
import { gzipSync } from 'node:zlib'
import { ROOT } from '../ownership/generate-ownership-manifest.ts'

/** Peers a consumer already has; counting them would measure Vue, not us. */
const EXTERNALS = [
  'vue',
  'reka-ui',
  '@floating-ui/vue',
  '@internationalized/date',
  'lucide-vue-next',
  'tailwind-variants',
  'clsx',
  'qrcode-generator',
]

const FIXTURE_DIR = resolve(ROOT, '.perf-export-size')

function forward(path: string): string {
  return path.replaceAll('\\', '/')
}

/** Total gzipped bytes of every `.js`/`.mjs` a build emitted. */
function gzippedOutput(dir: string): number {
  let total = 0
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      total += gzippedOutput(full)
      continue
    }
    if (!/\.(?:js|mjs)$/.test(entry))
      continue
    total += gzipSync(readFileSync(full)).length
  }
  return total
}

export interface ExportSize {
  readonly component: string
  readonly gzipBytes: number
}

/**
 * Build one fixture per component and return its gzipped size.
 *
 * Serial rather than parallel: these are full Vite builds, and running twenty
 * of them at once on a machine that is also the measurement host would make
 * every number a function of how many finished first. Sizes are deterministic,
 * so the cost buys correctness rather than repetition.
 */
export function measureExportSizes(components: readonly string[]): ExportSize[] {
  mkdirSync(FIXTURE_DIR, { recursive: true })
  const sizes: ExportSize[] = []

  const coreAlias = forward(resolve(ROOT, 'packages/core/src/index.ts'))
  const contractsAlias = forward(resolve(ROOT, 'packages/contracts/src/index.ts'))
  const tokensAlias = forward(resolve(ROOT, 'packages/tokens/src/index.ts'))

  try {
    for (const component of components) {
      const distDir = join(FIXTURE_DIR, 'dist')
      rmSync(distDir, { recursive: true, force: true })

      const entryPath = join(FIXTURE_DIR, 'entry.ts')
      writeFileSync(
        entryPath,
        `import { ${component} } from '@dzup-ui/core'\nconsole.log(${component})\n`,
        'utf8',
      )

      const configPath = join(FIXTURE_DIR, 'vite.config.mjs')
      writeFileSync(configPath, `
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  logLevel: 'error',
  resolve: {
    alias: {
      '@dzup-ui/core': '${coreAlias}',
      '@dzup-ui/contracts': '${contractsAlias}',
      '@dzup-ui/tokens': '${tokensAlias}',
    },
  },
  build: {
    lib: { entry: '${forward(entryPath)}', formats: ['es'], fileName: 'entry' },
    outDir: '${forward(distDir)}',
    emptyOutDir: true,
    rollupOptions: { external: ${JSON.stringify(EXTERNALS)} },
    // Minified, because the number is meant to be what a consumer ships.
    minify: 'esbuild',
    reportCompressedSize: false,
  },
})
`, 'utf8')

      execFileSync(
        process.execPath,
        [resolve(ROOT, 'node_modules/vite/bin/vite.js'), 'build', '--config', configPath],
        { cwd: ROOT, stdio: 'pipe' },
      )

      sizes.push({ component, gzipBytes: gzippedOutput(distDir) })
    }
  }
  finally {
    rmSync(FIXTURE_DIR, { recursive: true, force: true })
  }

  return sizes
}
