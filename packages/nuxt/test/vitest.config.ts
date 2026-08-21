import { defineConfig } from 'vitest/config'

/**
 * Config for the Nuxt consumer fixtures (TASK-OSS-P1-03).
 *
 * Deliberately separate from the root `vitest.config.ts`, and deliberately not
 * matched by its `include` globs. These tests install ~800 npm packages per
 * fixture and run a full Nuxt production build each: putting them in the
 * default `yarn test` lane would add minutes to every unrelated change, and a
 * gate people are tempted to skip is worth less than one they run on purpose.
 *
 * Run with `yarn test:nuxt-fixtures`.
 */
export default defineConfig({
  test: {
    include: ['fixtures.spec.ts'],
    root: import.meta.dirname,
    // One Nuxt build, on a cold machine, with a cold vite cache.
    testTimeout: 600_000,
    hookTimeout: 600_000,
    // Fixtures share an npm cache and each build saturates the CPU; running
    // them concurrently makes both slower and the failures harder to read.
    fileParallelism: false,
  },
})
