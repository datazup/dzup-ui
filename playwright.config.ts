import { defineConfig, devices } from '@playwright/test'

const useStaticStorybook = process.env.STORYBOOK_E2E_STATIC === '1'
const staticStorybookPreviewCommand = 'yarn exec vite preview --outDir apps/storybook/storybook-static --host 127.0.0.1 --port 6006'
const staticStorybookCommand = process.env.STORYBOOK_E2E_PREBUILT === '1'
  ? staticStorybookPreviewCommand
  : [
      'yarn workspace @dzup-ui/tokens build',
      'yarn storybook:build',
      staticStorybookPreviewCommand,
    ].join(' && ')

export default defineConfig({
  testDir: './e2e',
  timeout: 90_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'line',
  use: {
    baseURL: 'http://127.0.0.1:6006', // Storybook
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: useStaticStorybook ? staticStorybookCommand : 'yarn storybook --no-open',
    url: 'http://127.0.0.1:6006',
    reuseExistingServer: !process.env.CI,
    timeout: useStaticStorybook ? 420_000 : 120_000,
  },
})
