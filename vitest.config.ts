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
      '@dzup-ui/compat': resolve(__dirname, 'packages/compat/src'),
      '@dzup-ui/tooling': resolve(__dirname, 'packages/tooling/src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    // 60s, not 30s: bringing apps/ into `coverage.include` (below) puts the
    // landing under v8 instrumentation, and the /blocks a11y sweep — one axe
    // pass over a page that mounts all 87 blocks — measures 35.2s instrumented
    // versus comfortably under 30s without. At the old 30s it timed out only in
    // `yarn test:coverage`, i.e. only in the CI job that gates merges. This is
    // headroom for the instrumented worst case, not cover for a hang.
    testTimeout: 60_000,
    hookTimeout: 60_000,
    setupFiles: ['./vitest.setup.ts', './vitest.setup.a11y.ts'],
    include: [
      'packages/*/src/**/*.spec.ts',
      'packages/*/tests/**/*.spec.ts',
      'apps/*/src/**/*.spec.ts',
      'apps/*/scripts/**/*.test.mjs',
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      // Both apps are inside the gate (TASK-FREE-16). They shipped for months
      // contributing nothing to coverage and held to no bar, which is how the
      // router's ~150 lines of head management reached production untested.
      include: ['packages/*/src/**/*.{ts,vue}', 'apps/*/src/**/*.{ts,vue}'],
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
        /**
         * The apps enter the gate at their MEASURED floor, rounded down — a
         * ratchet, not a rubber stamp. Measured 2026-07-16 across apps/*\/src:
         * statements 89.55 · branches 88.43 · functions 65.52 · lines 89.55.
         *
         * `functions` is the real gap and the reason this is not simply 80: the
         * app is rich in handlers and composable factories that mount-and-assert
         * tests never invoke. Raise each number as the work lands; never lower
         * one to make a build pass.
         *
         * NB: files matching this glob are checked against THESE numbers and are
         * excluded from the global 80s above, so packages/ keeps its bar.
         */
        'apps/*/src/**': {
          branches: 88,
          functions: 65,
          lines: 89,
          statements: 89,
        },
      },
    },
  },
})
