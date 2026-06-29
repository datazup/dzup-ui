import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import { defineConfig } from 'vitest/config'

const dirname = fileURLToPath(new URL('.', import.meta.url))
const appDir = dirname
const pkgRoot = resolve(dirname, '../../..')

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
    browser: {
      enabled: true,
      provider: 'playwright',
      headless: true,
      instances: [{ browser: 'chromium' }],
    },
    setupFiles: ['./.storybook/vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['../../packages/core/src/**/*.{ts,vue}'],
      exclude: ['**/*.stories.ts', '**/*.types.ts', '**/*.tokens.ts', '**/index.ts'],
    },
  },
})
