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
      // The active landing app is inside the gate (TASK-FREE-16). The legacy
      // apps/sandbox tree is retired and superseded by Storybook contract parity,
      // so including apps/* would count dead source at zero coverage.
      include: ['packages/*/src/**/*.{ts,vue}', 'apps/landing/src/**/*.{ts,vue}'],
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
        // Vitest applies global thresholds to every included file even when a
        // more specific glob also matches. Express both scopes as globs so the
        // package bar and active-app ratchet remain independent and complete.
        'packages/*/src/**': {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
        /**
         * The apps enter the gate at their MEASURED floor, rounded down — a
         * ratchet, not a rubber stamp. Measured 2026-07-16 across the active app:
         * statements 89.55 · branches 88.43 · functions 65.52 · lines 89.55.
         *
         * `functions` is the real gap and the reason this is not simply 80: the
         * app is rich in handlers and composable factories that mount-and-assert
         * tests never invoke. Raise each number as the work lands; never lower
         * one to make a build pass.
         *
         * Packages are checked separately above, so the app's intentional
         * function floor does not dilute or replace the package bar.
         */
        'apps/landing/src/**': {
          branches: 88,
          functions: 65,
          lines: 89,
          statements: 89,
        },
      },
    },
  },
})
