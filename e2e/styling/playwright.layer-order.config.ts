import process from 'node:process'
import { defineConfig, devices } from '@playwright/test'

/**
 * The cascade-layer lane (TASK-R5-O1, ADR-19 §2).
 *
 * A config of its own rather than a nineteenth project in
 * `playwright.config.ts`, for one reason: that config's `webServer` builds and
 * serves Storybook before any project runs, and this lane needs no server at
 * all. It renders a document from the CSS inside the **packed tarballs** with
 * `page.setContent`, so attaching it to the shared config would add four
 * minutes of Storybook build to a suite whose subject is two stylesheets — and
 * would couple the override guarantee to the gallery, which is exactly the kind
 * of accidental dependency this ADR is about.
 *
 *   yarn workspace @dzup-ui/tokens build
 *   yarn workspace @dzup-ui/core build
 *   yarn test:e2e:layer-order
 *
 * Three engines, because layer precedence is an engine behaviour and the whole
 * point of the fixture is that no engine decides it differently.
 */
export default defineConfig({
  testDir: '.',
  testMatch: /layer-order\.spec\.ts$/,
  timeout: 60_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: process.env.PLAYWRIGHT_JSON_OUTPUT
    ? [['line'], ['json', { outputFile: process.env.PLAYWRIGHT_JSON_OUTPUT }]]
    : 'line',
  projects: [
    { name: 'layer-order-chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'layer-order-firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'layer-order-webkit', use: { ...devices['Desktop Safari'] } },
  ],
})
