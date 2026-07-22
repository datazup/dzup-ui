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
         * The apps enter the gate BELOW their measured floor — a ratchet, not a
         * rubber stamp, and not a tripwire either. Measured 2026-07-21
         * (TASK-FREE3-12) with `yarn test:coverage`, before → after:
         *   functions   64.16 → 80.49 / 83.44   (a third of the app's handlers
         *                                        were never executed at all)
         *   branches    89.55 → 91.15 / 90.13
         *   statements  93.76 → 93.12 / 92.34
         *   lines       93.76 → 93.12 / 92.34
         *
         * TWO "after" figures because these percentages are NOT reproducible to
         * the decimal, and anyone re-deriving them needs to know that before they
         * tighten a number:
         *   • The function TOTAL moves between runs — 1,953 / 2,051 / 2,343 for
         *     the same tree — because how much of a compiled SFC v8 attributes to
         *     its file depends on what else ran. A file counted in its executed
         *     shape reports several times the functions of the same file counted
         *     statically, so BOTH sides of the fraction move together.
         *   • A narrower invocation reports differently again: with
         *     `--coverage.include=apps/landing/src/**` the same tree read 82.57%
         *     where `yarn test:coverage` read 80.49%.
         * So: measure with CI's own command, take the LOWEST reading, and leave a
         * point of margin. These four are floor(min observed) − 1, except
         * `functions`, held at the repo's own 80 bar (min observed 80.49).
         *
         * `functions` was the outlier — 65, a recorded accommodation rather than
         * a target. TASK-FREE3-12 closed it: the templates, blocks and routed
         * pages now have interaction sweeps that click one representative of
         * every distinct control (the `interactions.spec.ts` files), the motion
         * directives and scroll/timeline composables have unit suites, and every
         * template's Code-tab source is loaded rather than assumed. The app now
         * clears the repo's 80% bar rather than being excused from it.
         *
         * `statements`/`lines` slip ~1 point for an honest reason worth knowing:
         * newly EXECUTED files report their full compiled shape, so mounting more
         * code enlarges the denominator faster than the sweeps cover it. Both are
         * still raised here, and both stay far above their old floor.
         *
         * Remaining gap, dated 2026-07-21 (388 of 2,343 functions), by area —
         * visible debt, not silence:
         *   • templates 130 / blocks 68 — handlers behind a control the sweep
         *     cannot reach without domain knowledge (a second dialog inside a
         *     Teleported panel, a drag handler, a form's success branch).
         *   • motion/components 60 + gallery/demos 19 — rAF loops, canvas
         *     particle systems and pointer choreography that jsdom cannot run
         *     honestly; the gallery's render suite is their floor.
         *   • components 29 / components/blocks 29 / pages 27 — chrome reachable
         *     only through nav + keyboard flows, which `apps/landing/e2e` drives
         *     in a real browser instead.
         * Raise each number as that work lands; never lower one to make a build
         * pass.
         *
         * NB: files matching this glob are checked against THESE numbers and are
         * excluded from the global 80s above, so packages/ keeps its bar.
         */
        'apps/*/src/**': {
          branches: 89,
          functions: 80,
          lines: 91,
          statements: 91,
        },
      },
    },
  },
})
