import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { createDzupResolution } from './packages/tooling/src/resolution/dzup-resolution.ts'

/**
 * Specs assert against the **working tree**, not the last build: without this,
 * `@dzup-ui/*` resolves through the yarn workspace link to a stale `dist/`, so a
 * helper added to `src` is invisible until someone rebuilds.
 *
 * This used to be a hand-written object of eight entries. It was missing five
 * of the specifiers the packages declare — `@dzup-ui/tokens/css`,
 * `/tailwind`, `/utils`, `@dzup-ui/core/styles` and `@dzup-ui/testing/vitest` —
 * and it carried its own copy of the "sub-paths first" ordering rule as a
 * comment, because an object's key order is the only thing keeping
 * `@dzup-ui/core` from swallowing `@dzup-ui/core/ownership`. Both are now
 * properties of the derived data rather than of this file's formatting.
 */
const dzup = createDzupResolution({ mode: 'merged-source', root: import.meta.dirname })

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: dzup.alias,
    dedupe: dzup.dedupe,
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
      // packages/*/scripts holds the validators invoked as `tsx <script>` rather
      // than imported from a barrel (validate-exports, validate-peers,
      // validate-package-names …). Their logic gates merges, so it is testable
      // in the default `yarn test` lane rather than only through the CLI it
      // happens to be wrapped in (TASK-OSS-P1-01).
      'packages/*/scripts/**/*.spec.ts',
      // packages/*/security holds Tier D evidence: a threat model beside the
      // hostile-input corpus that checks it (TASK-OSS-P5-06). Its own directory
      // rather than tests/, because the pairing is the point — a corpus without
      // the document that says what it is defending is a list of odd inputs,
      // and a document without the corpus is a claim.
      'packages/*/security/**/*.spec.ts',
      'apps/*/src/**/*.spec.ts',
      'apps/*/scripts/**/*.test.mjs',
      // apps/docs has no src/ — VitePress owns the layout, and the docs site's
      // only TypeScript lives under .vitepress/. TASK-N2-D3 put the theme
      // builder's URL round trip there, so the glob is widened deliberately
      // rather than the spec being moved somewhere the existing globs happen to
      // reach. Same reasoning as constraint B6: a new app is outside a gate by
      // default, and joining one is a decision, not an accident.
      'apps/*/.vitepress/**/*.spec.ts',
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
         * Packages are checked separately above, so the app's intentional
         * function floor does not dilute or replace the package bar.
         *
         * The key names the landing app explicitly instead of globbing every app
         * directory. Both select exactly the same files today — `include` above
         * admits only the landing — but a wildcard would silently adopt any
         * future app tree, including the retired `apps/sandbox`, into a ratchet
         * that was measured purely against the landing.
         * `coverage-policy.spec.ts` pins the explicit form.
         */
        'apps/landing/src/**': {
          branches: 89,
          functions: 80,
          lines: 91,
          statements: 91,
        },
      },
    },
  },
})
