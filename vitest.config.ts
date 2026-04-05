import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@dzip-ui/tokens': resolve(__dirname, 'packages/tokens/src'),
      '@dzip-ui/contracts': resolve(__dirname, 'packages/contracts/src'),
      '@dzip-ui/core': resolve(__dirname, 'packages/core/src'),
      '@dzip-ui/compat': resolve(__dirname, 'packages/compat/src'),
      '@dzip-ui/tooling': resolve(__dirname, 'packages/tooling/src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts', './vitest.setup.a11y.ts'],
    include: [
      'packages/*/src/**/*.spec.ts',
      'packages/*/tests/**/*.spec.ts',
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['packages/*/src/**/*.{ts,vue}'],
      exclude: [
        '**/*.spec.ts',
        '**/*.contract.spec.ts',
        '**/*.a11y.spec.ts',
        '**/*.stories.ts',
        '**/*.types.ts',
        '**/*.tokens.ts',
        '**/index.ts',
        '**/dist/**',
        '**/env.d.ts',
        '**/generate.ts',
      ],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },
})
