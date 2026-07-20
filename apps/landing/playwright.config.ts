import process from 'node:process'
import { defineConfig, devices } from '@playwright/test'

/**
 * Landing visual/regression config — deliberately separate from the repo-root
 * `playwright.config.ts`, whose `webServer` always boots Storybook (a multi-minute
 * build). These specs only need the landing dev server, so they get their own
 * config and can run in seconds.
 *
 * Port 4319 (not the app's default 3001) so a dev server you already have open
 * is never adopted or clobbered by a test run. `--no-open` suppresses the
 * `server.open` in vite.config.ts — otherwise every run would launch a browser.
 *
 * Run it with `yarn test:visual:landing` (and `:update` to refresh baselines).
 * Those scripts invoke `@playwright/test`'s own CLI directly rather than the
 * `playwright` bin shim: the root declares BOTH `playwright` (1.60.x, hoisted, owns
 * `.bin/playwright`) and `@playwright/test` (1.61.x), so the shim would load a
 * different core than the specs import and every test errors out with
 * "two different versions of @playwright/test".
 *
 * Snapshot baselines are per-platform (`…-chromium-win32.png`). CI runs only the
 * platform-independent render guard (`--grep "renders real pixels"`); add Linux
 * baselines if you want the hero snapshots enforced there too.
 */
const PORT = 4319

export default defineConfig({
  testDir: './e2e',
  timeout: 90_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'line',
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // Bind 127.0.0.1 explicitly: Vite's default `localhost` resolves to ::1 on
    // Windows, which never answers the IPv4 readiness probe below and the run
    // dies on a webServer timeout.
    command: `yarn vite --host 127.0.0.1 --port ${PORT} --strictPort --no-open`,
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: !process.env.CI,
    // Cold Vite start on this repo's NTFS volume can be slow on first transform.
    timeout: 180_000,
  },
})
