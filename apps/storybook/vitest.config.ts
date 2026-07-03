import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

const dirname = fileURLToPath(new URL('.', import.meta.url))
const appDir = dirname
const pkgRoot = resolve(dirname, '../../..')
const ignoredVueCompilerWarning
  = '[@vue/compiler-core] decodeEntities option is passed but will be ignored in non-browser builds.'

export default defineConfig({
  plugins: [vue(), storybookTest({ configDir: `${dirname}.storybook` })],
  resolve: {
    alias: [
      // Ensure storybook/test resolves from app-local node_modules
      {
        find: 'storybook/test',
        replacement: resolve(appDir, 'node_modules/storybook/dist/test/index.js'),
      },
      // Workspace package aliases
      {
        find: '@dzup-ui/tokens/css',
        replacement: resolve(pkgRoot, 'packages/tokens/dist/tokens.css'),
      },
      {
        find: '@dzup-ui/tokens/tailwind',
        replacement: resolve(pkgRoot, 'packages/tokens/dist/tailwind-theme.js'),
      },
      {
        find: '@dzup-ui/tokens/utils',
        replacement: resolve(pkgRoot, 'packages/tokens/src/utils/index.ts'),
      },
      { find: '@dzup-ui/tokens', replacement: resolve(pkgRoot, 'packages/tokens/src') },
      {
        find: '@dzup-ui/contracts',
        replacement: resolve(pkgRoot, 'packages/contracts/src/index.ts'),
      },
      { find: '@dzup-ui/core', replacement: resolve(pkgRoot, 'packages/core/src') },
    ],
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
