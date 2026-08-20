import process from 'node:process'
import { defineConfig, devices } from '@playwright/test'

/**
 * Landing e2e config — deliberately separate from the repo-root
 * `playwright.config.ts`, whose `webServer` always boots Storybook (a multi-minute
 * build). These specs only need the landing app, so they get their own config.
 *
 * Run it with `yarn test:e2e:landing` (dev server, fast local iteration) or
 * `yarn test:e2e:landing:preview` (the BUILT dist, what CI runs). `:update`
 * refreshes the visual baselines.
 *
 * Those scripts invoke `@playwright/test`'s own CLI directly rather than the
 * `playwright` bin shim: the root declares BOTH `playwright` (1.60.x, hoisted, owns
 * `.bin/playwright`) and `@playwright/test` (1.61.x), so the shim would load a
 * different core than the specs import and every test errors out with
 * "two different versions of @playwright/test".
 *
 * ## Two targets, one suite (TASK-FREE3-06)
 *
 * `LANDING_E2E_TARGET=preview` swaps the dev server for `vite preview` over
 * `apps/landing/dist`. That distinction is the point of the task: until now the
 * only browser that ever touched the landing in CI drove the DEV server, so the
 * artifact users actually receive — code-split chunks, minified, `dist/storybook`
 * mounted, real asset URLs — had never been driven by a browser at all. The dev
 * target stays because it is seconds to iterate against; CI drives dist.
 *
 * Distinct ports (not the app's default 3001) so a dev server you already have
 * open is never adopted or clobbered by a test run, and so the two targets cannot
 * collide with each other. `--no-open` suppresses `server.open` in vite.config.ts;
 * otherwise every run would launch a browser.
 *
 * ## Projects
 *
 * `chromium` runs the desktop flows + the visual baselines. `mobile-chrome`
 * (Pixel 7, `isMobile`) runs `mobile.spec.ts` alone — the drawer and a block page
 * at phone width, which is behaviour no jsdom test and no desktop viewport can
 * reach. Snapshot baselines are per-platform AND per-project
 * (`…-chromium-linux.png`); keeping the desktop project named `chromium` keeps the
 * existing win32 baselines valid.
 */
const DEV_PORT = 4319
const PREVIEW_PORT = 4320

/** `preview` drives the built dist (what CI runs); anything else is the dev server. */
const usePreview = process.env.LANDING_E2E_TARGET === 'preview'
const PORT = usePreview ? PREVIEW_PORT : DEV_PORT

// Bind 127.0.0.1 explicitly: Vite's default `localhost` resolves to ::1 on
// Windows, which never answers the IPv4 readiness probe below and the run dies on
// a webServer timeout.
const HOST_ARGS = `--host 127.0.0.1 --port ${PORT} --strictPort`

export default defineConfig({
  testDir: './e2e',
  timeout: 90_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // One worker per core, minus the two the vite preview server and the test
  // runner itself need. Capped at 4: the flows are network-light but each one
  // screenshots, and more parallelism buys nothing past that.
  workers: process.env.CI ? 4 : 1,
  // `line` locally (this suite is short enough to read in the terminal); CI adds an
  // HTML report so a failed flow — and the trace the retry captured — is
  // inspectable from the run's artifacts without reproducing it locally.
  reporter: process.env.CI
    ? [['line'], ['html', { outputFolder: 'playwright-report', open: 'never' }]]
    : 'line',
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    // Nested under `contextOptions`, not a sibling of `baseURL`: Playwright 1.61
    // (which this merge pulled in) removed the top-level `use.reducedMotion`
    // shorthand and routes the emulation through BrowserContextOptions instead.
    // Same emulation, same value — only the key path moved.
    contextOptions: {
      reducedMotion: 'reduce',
    },
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: /mobile\.spec\.ts$/,
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'] },
      testMatch: /mobile\.spec\.ts$/,
    },
  ],
  webServer: {
    command: usePreview
      ? `yarn vite preview ${HOST_ARGS}`
      : `yarn vite ${HOST_ARGS} --no-open`,
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: !process.env.CI,
    // Cold Vite start on this repo's NTFS volume can be slow on first transform.
    // `vite preview` only has to serve files, so it is up almost immediately —
    // but the generous ceiling costs nothing when the server starts fast.
    timeout: 180_000,
  },
})
