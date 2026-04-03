import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@dzup-ui/tokens': resolve(__dirname, 'packages/tokens/src'),
      '@dzup-ui/contracts': resolve(__dirname, 'packages/contracts/src'),
      '@dzup-ui/core': resolve(__dirname, 'packages/core/src'),
      '@dzup-ui/pro': resolve(__dirname, 'packages/pro/src'),
      '@dzup-ui/compat': resolve(__dirname, 'packages/compat/src'),
      '@dzup-ui/tooling': resolve(__dirname, 'packages/tooling/src'),
      // Mock optional peer dependencies not installed in dev
      'monaco-editor': resolve(__dirname, '__mocks__/monaco-editor.ts'),
      '@tiptap/vue-3': resolve(__dirname, '__mocks__/@tiptap/vue-3.ts'),
      '@tiptap/starter-kit': resolve(__dirname, '__mocks__/@tiptap/starter-kit.ts'),
      'chart.js': resolve(__dirname, '__mocks__/chart.js.ts'),
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
