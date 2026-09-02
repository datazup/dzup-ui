import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'
import { createDzupResolution } from '../../packages/tooling/src/resolution/dzup-resolution.ts'

const dirname = fileURLToPath(new URL('.', import.meta.url))
const appDir = dirname
// Two levels up from `apps/storybook/`, i.e. the monorepo root that holds
// `packages/` — the same derivation `apps/landing/vite.config.ts` uses.
// `'../../..'` walked one level too far (to the directory ABOVE the repo) and
// made `createDzupResolution` throw before vitest could load this config at
// all, so `yarn storybook:test` could not start. TASK-N1-O1.
const pkgRoot = resolve(dirname, '../..')
const dzup = createDzupResolution({ mode: 'merged-source', root: pkgRoot })
const ignoredVueCompilerWarning
  = '[@vue/compiler-core] decodeEntities option is passed but will be ignored in non-browser builds.'

export default defineConfig({
  plugins: [vue(), storybookTest({ configDir: `${dirname}.storybook` })],
  resolve: {
    alias: [
      // Ensure storybook/test resolves from app-local node_modules. App-specific,
      // so it stays here rather than in the shared list.
      {
        find: 'storybook/test',
        replacement: resolve(appDir, 'node_modules/storybook/dist/test/index.js'),
      },
      ...dzup.alias,
    ],
    dedupe: dzup.dedupe,
  },
  test: {
    name: 'storybook',
    onConsoleLog(log, type) {
      if (type === 'stderr' && log.includes(ignoredVueCompilerWarning))
        return false
    },
    browser: {
      enabled: true,
      provider: 'playwright',
      headless: true,
      instances: [{ browser: 'chromium' }],
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['../../packages/core/src/**/*.{ts,vue}'],
      exclude: ['**/*.stories.ts', '**/*.types.ts', '**/*.tokens.ts', '**/index.ts'],
    },
  },
})
