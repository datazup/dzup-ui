/* eslint-disable no-console */
import { Buffer } from 'node:buffer'
import { execSync } from 'node:child_process'
/**
 * Tree-shaking validation script.
 *
 * Creates a minimal Vite build that imports a single component,
 * then checks that other components' code is NOT in the bundle.
 *
 * Usage: npx tsx packages/tooling/src/tree-shake-check.ts
 *
 * @module @dzip-ui/tooling/tree-shake-check
 */
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import process from 'node:process'

interface TreeShakeResult {
  component: string
  bundleSize: number
  passed: boolean
  unexpectedIncludes: string[]
}

/** Components to individually import and build */
const COMPONENTS_TO_TEST = ['DzButton', 'DzInput', 'DzSelect', 'DzAlert']

/** Sentinel components — these should NOT appear in single-component bundles */
const SENTINEL_COMPONENTS = ['DzDataGrid', 'DzGantt', 'DzKanban']

const ROOT_DIR = resolve(import.meta.dirname, '..', '..', '..')

async function checkTreeShaking(): Promise<void> {
  const tmpDir = join(ROOT_DIR, '.tree-shake-test')
  const results: TreeShakeResult[] = []

  try {
    mkdirSync(tmpDir, { recursive: true })

    for (const component of COMPONENTS_TO_TEST) {
      const distDir = join(tmpDir, 'dist')

      // Create a minimal entry file that imports only this component
      const entryPath = join(tmpDir, 'entry.ts')
      const entryContent = [
        `import { ${component} } from '@dzip-ui/core'`,
        `console.log(${component})`,
        '',
      ].join('\n')
      writeFileSync(entryPath, entryContent)

      // Create a minimal vite config for library build.
      // Paths use forward slashes for cross-platform Vite compatibility.
      const coreAlias = join(ROOT_DIR, 'packages', 'core', 'src', 'index.ts').replace(/\\/g, '/')
      const contractsAlias = join(ROOT_DIR, 'packages', 'contracts', 'src', 'index.ts').replace(/\\/g, '/')
      const tokensAlias = join(ROOT_DIR, 'packages', 'tokens', 'src', 'index.ts').replace(/\\/g, '/')
      const entryForward = entryPath.replace(/\\/g, '/')
      const distForward = distDir.replace(/\\/g, '/')

      const viteConfig = `
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: { entry: '${entryForward}', formats: ['es'] },
    outDir: '${distForward}',
    rollupOptions: { external: ['vue', 'reka-ui', '@floating-ui/vue', '@internationalized/date', 'lucide-vue-next'] },
    minify: false,
  },
  resolve: {
    alias: {
      '@dzip-ui/core': '${coreAlias}',
      '@dzip-ui/contracts': '${contractsAlias}',
      '@dzip-ui/tokens': '${tokensAlias}',
    }
  }
})
`
      const configPath = join(tmpDir, 'vite.config.ts')
      writeFileSync(configPath, viteConfig)

      // Run vite build
      try {
        execSync(`npx vite build --config "${configPath}"`, {
          cwd: ROOT_DIR,
          stdio: 'pipe',
        })

        // Read the bundle output
        const distFiles = readdirSync(distDir)
        const jsFile = distFiles.find(f => f.endsWith('.js') || f.endsWith('.mjs'))

        if (!jsFile) {
          results.push({
            component,
            bundleSize: 0,
            passed: false,
            unexpectedIncludes: ['No output file found in dist'],
          })
          continue
        }

        const bundleContent = readFileSync(join(distDir, jsFile), 'utf-8')
        const bundleSize = Buffer.byteLength(bundleContent)

        // Check for sentinel components that should NOT be in the bundle
        const unexpectedIncludes: string[] = []
        for (const sentinel of SENTINEL_COMPONENTS) {
          if (bundleContent.includes(sentinel)) {
            unexpectedIncludes.push(sentinel)
          }
        }

        results.push({
          component,
          bundleSize,
          passed: unexpectedIncludes.length === 0,
          unexpectedIncludes,
        })
      }
      catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error)
        results.push({
          component,
          bundleSize: 0,
          passed: false,
          unexpectedIncludes: [`Build failed: ${message}`],
        })
      }

      // Clean dist for next iteration
      rmSync(distDir, { recursive: true, force: true })
    }

    // Print results
    console.log('\n=== Tree-shaking Validation ===\n')
    let allPassed = true

    for (const r of results) {
      const status = r.passed ? 'PASS' : 'FAIL'
      const sizeKB = (r.bundleSize / 1024).toFixed(1)
      console.log(`${status}  ${r.component} (${sizeKB} KB)`)

      if (!r.passed) {
        allPassed = false
        for (const u of r.unexpectedIncludes) {
          console.log(`       unexpected: ${u}`)
        }
      }
    }

    console.log(`\n${allPassed ? 'All checks passed!' : 'Some checks failed.'}`)
    process.exit(allPassed ? 0 : 1)
  }
  finally {
    rmSync(tmpDir, { recursive: true, force: true })
  }
}

checkTreeShaking()
