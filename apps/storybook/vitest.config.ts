import { fileURLToPath } from 'node:url'
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import { defineConfig } from 'vitest/config'

// TASK-0.9 — runs every story's `play()` as a real browser test (Playwright /
// Chromium) and runs the a11y addon audit alongside, surfacing pass/fail in the
// Storybook sidebar + test widget. This is the Vite-native replacement for the
// legacy test-runner.
//
// First-time setup (needs network — see Contributing.mdx):
//   yarn workspace @dzup-ui/storybook exec playwright install chromium
//
// Run:  yarn workspace @dzup-ui/storybook test-storybook
const dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  plugins: [
    storybookTest({ configDir: `${dirname}.storybook` }),
  ],
  test: {
    name: 'storybook',
    browser: {
      enabled: true,
      provider: 'playwright',
      headless: true,
      instances: [{ browser: 'chromium' }],
    },
    setupFiles: ['./.storybook/vitest.setup.ts'],
    // TASK-0.10 — coverage barometer (not a 100% gate). Published as a CI artifact.
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['../../packages/core/src/**/*.{ts,vue}'],
      exclude: ['**/*.stories.ts', '**/*.types.ts', '**/*.tokens.ts', '**/index.ts'],
    },
  },
})
