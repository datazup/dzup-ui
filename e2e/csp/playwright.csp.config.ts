import process from 'node:process'
import { defineConfig, devices } from '@playwright/test'

/**
 * The strict-CSP lane (TASK-R2-O4, closing TASK-N1-O5's O5-5).
 *
 * A config of its own rather than a nineteenth project in
 * `playwright.config.ts`, for the reason `e2e/styling/playwright.layer-order.config.ts`
 * records: that config's `webServer` builds and serves Storybook before any
 * project runs, and this lane needs a server of its own — one that sends a real
 * `Content-Security-Policy` header, which is the whole subject. Attaching it to
 * the shared config would add four minutes of Storybook build to a suite about
 * two response headers, and would couple a security claim to the gallery.
 *
 *   yarn test:e2e:csp
 *
 * Three engines, because CSP enforcement is engine behaviour: `style-src-attr`
 * shipped at different times in each, and a claim that the library works under a
 * strict policy is a claim about all three. WebKit on Windows is not Safari —
 * the same caveat E5 records for the browser matrix applies here.
 */
export default defineConfig({
  testDir: '.',
  testMatch: /csp\.spec\.ts$/,
  timeout: 60_000,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: process.env.PLAYWRIGHT_JSON_OUTPUT
    ? [['line'], ['json', { outputFile: process.env.PLAYWRIGHT_JSON_OUTPUT }]]
    : 'line',
  use: {
    baseURL: `http://127.0.0.1:${process.env.DZUP_CSP_PORT ?? 6180}`,
  },
  projects: [
    { name: 'csp-chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'csp-firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'csp-webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: 'node node_modules/tsx/dist/cli.mjs e2e/csp/serve-csp.ts',
    url: `http://127.0.0.1:${process.env.DZUP_CSP_PORT ?? 6180}/open/`,
    reuseExistingServer: !process.env.CI,
    // The first run builds the fixture with Vite; later runs reuse the stage.
    timeout: 300_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
})
