import { defineConfig, devices } from '@playwright/test'

const useStaticStorybook = process.env.STORYBOOK_E2E_STATIC === '1'
const staticStorybookCommand = [
  'yarn storybook:build',
  'yarn exec vite preview --outDir apps/storybook/storybook-static --host 127.0.0.1 --port 6006',
].join(' && ')

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'line',
  use: {
    baseURL: 'http://localhost:6006', // Storybook
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: useStaticStorybook ? staticStorybookCommand : 'yarn storybook --no-open',
    url: 'http://localhost:6006',
    reuseExistingServer: !process.env.CI,
    timeout: useStaticStorybook ? 300_000 : 120_000,
  },
})
