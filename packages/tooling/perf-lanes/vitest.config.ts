import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'
import { createDzupResolution } from '../src/resolution/dzup-resolution.ts'

/**
 * Config for the leak / long-task / memory / hydration lanes (TASK-R2-O7).
 *
 * **Why a config of its own, and not the root `include` globs.** The four lanes
 * mount every Tier C component fifty times over. `yarn test` already runs 534
 * files and ~10,170 tests; adding ~1,100 mounts of the catalogue's heaviest
 * components to it would slow down every unrelated change, and — worse — the
 * leak lane would then be competing for the CPU it is trying to measure. The
 * same argument the Nuxt fixtures made (`packages/nuxt/test/vitest.config.ts`),
 * for the same reason.
 *
 * Their directory therefore sits **outside** `packages/&#42;/src`,
 * `packages/&#42;/tests`, `packages/&#42;/scripts` and `packages/&#42;/security`, which is
 * what actually keeps them out of `yarn test` — vitest's positional filters
 * narrow the `include` set, they do not extend it, so a file the root config
 * cannot see is a file no root invocation can run by accident.
 *
 * Everything that decides *what a measurement means* is inherited from the root
 * config on purpose: the same `jsdom` environment, the same two setup files,
 * the same working-tree `@dzup-ui/*` resolution. A lane measuring a different
 * environment from `perf-bench.spec.ts` would produce numbers that cannot be
 * compared with the ones already in `baselines.json`, and both are hashed into
 * the harness identity (`harness-hash.ts`) so the inheritance is checkable
 * rather than assumed.
 *
 * Run with `yarn test:perf:lanes` (or `yarn test:perf`, which runs both halves).
 */
const root = fileURLToPath(new URL('../../..', import.meta.url))
const dzup = createDzupResolution({ mode: 'merged-source', root })

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: dzup.alias,
    dedupe: dzup.dedupe,
  },
  test: {
    root,
    include: ['packages/tooling/perf-lanes/*.spec.ts'],
    environment: 'jsdom',
    globals: true,
    setupFiles: [
      './vitest.setup.ts',
      './vitest.setup.a11y.ts',
      './packages/tooling/perf-lanes/setup.ts',
    ],
    // Fifty cycles × 22 components in one file, on a cold vite cache.
    testTimeout: 600_000,
    hookTimeout: 600_000,
    // The measurement is the point: lanes that run concurrently measure each
    // other's CPU contention. This is the same reason `perf-bench.spec.ts`
    // reports 9 of its 11 runtime metrics as `variance-exceeds-signal` — the
    // committed evidence that a contended host cannot be thresholded.
    fileParallelism: false,
    // Sequential but **isolated**: one fork per file, not one fork for all
    // four. Sharing a process made the memory lane's heap the memory lane's
    // problem *and* the next lane's starting point, and it let a throw inside
    // Vue's post-flush queue in one file break `app.mount()` in the next (see
    // `setup.ts`). Isolation costs a few seconds of process start-up per file
    // and buys a measurement that means what it says.
    pool: 'forks',
    poolOptions: { forks: { singleFork: false, minForks: 1, maxForks: 1 } },
  },
})
