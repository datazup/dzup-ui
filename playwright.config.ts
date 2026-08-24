import type { Project } from '@playwright/test'
import process from 'node:process'
import { defineConfig, devices } from '@playwright/test'

const useStaticStorybook = process.env.STORYBOOK_E2E_STATIC === '1'
const storybookPort = Number(process.env.STORYBOOK_E2E_PORT ?? (useStaticStorybook ? 6106 : 6006))
const storybookBaseUrl = `http://127.0.0.1:${storybookPort}`
const staticStorybookPreviewCommand = `yarn exec vite preview --outDir apps/storybook/storybook-static --host 127.0.0.1 --port ${storybookPort} --strictPort`
const staticStorybookCommand = process.env.STORYBOOK_E2E_PREBUILT === '1'
  ? staticStorybookPreviewCommand
  : [
      'yarn workspace @dzup-ui/tokens build',
      'yarn storybook:build',
      staticStorybookPreviewCommand,
    ].join(' && ')

/**
 * The five conditions the browser matrix runs every Tier B–D component
 * through, on top of the default (TASK-OSS-P5-03).
 *
 * Each is emulation the engine performs, not a class the story sets: a suite
 * that flipped a `data-` attribute would prove the CSS reacts to that attribute
 * and nothing about what the engine does with the media feature. `rtl` is the
 * exception and has to be — direction is a document property the Storybook
 * `direction` global already owns, so the condition is passed as a story global
 * rather than as a context option.
 *
 * Every one of these was measured against chromium, firefox and webkit at
 * Playwright 1.61.1 before being added. All three accept all five, including
 * `forcedColors` on WebKit and `isMobile` on Firefox, which older guidance says
 * are unsupported. `e2e/matrix/engine-exceptions.json` records what an engine
 * genuinely cannot do; it is deliberately empty rather than pre-loaded with
 * limitations nobody re-checked.
 */
export const MATRIX_CONDITIONS = [
  'default',
  'forced-colors',
  'reduced-motion',
  'rtl',
  'touch',
  'zoom-400',
] as const

export type MatrixCondition = typeof MATRIX_CONDITIONS[number]

const ENGINES = {
  chromium: devices['Desktop Chrome'],
  firefox: devices['Desktop Firefox'],
  webkit: devices['Desktop Safari'],
} as const

/** The context options each condition needs, on top of the engine's device. */
function conditionUse(condition: MatrixCondition): Record<string, unknown> {
  switch (condition) {
    case 'forced-colors':
      return { forcedColors: 'active' }
    case 'reduced-motion':
      return { reducedMotion: 'reduce' }
    case 'touch':
      // A phone viewport with a coarse pointer, so WCAG 2.5.8 target size is
      // measured against the pointer that actually has to hit it.
      return { hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } }
    case 'zoom-400':
      // 400% zoom of a 1280px viewport leaves 320 CSS px of width. WCAG 1.4.10
      // Reflow is written in exactly those terms, so this emulates the width
      // rather than a zoom factor no engine exposes to a test.
      return { viewport: { width: 320, height: 800 } }
    case 'rtl':
    case 'default':
      return {}
  }
}

const matrixProjects: Project[] = Object.entries(ENGINES).flatMap(([engine, device]) =>
  MATRIX_CONDITIONS.map(condition => ({
    name: `matrix-${engine}-${condition}`,
    testDir: './e2e/matrix',
    metadata: { engine, condition, lane: 'matrix' },
    use: { ...device, ...conditionUse(condition) },
  })),
)

export default defineConfig({
  testDir: './e2e',
  timeout: 90_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  // Set PLAYWRIGHT_JSON_OUTPUT to also emit the machine-readable report the
  // capability matrix reads (TASK-OSS-P5-06).
  //
  // Note for anyone who sets it and finds no file: `--reporter=line` on the
  // command line REPLACES this list rather than adding to it, so the JSON half
  // silently disappears. Pass the env var and no `--reporter` flag.
  reporter: process.env.PLAYWRIGHT_JSON_OUTPUT
    ? [['line'], ['json', { outputFile: process.env.PLAYWRIGHT_JSON_OUTPUT }]]
    : 'line',
  use: {
    baseURL: storybookBaseUrl,
    trace: 'on-first-retry',
  },
  projects: [
    // The pre-existing functional lanes. `testIgnore` keeps e2e/matrix out of
    // them: without it, adding the matrix directory under `testDir: './e2e'`
    // would silently triple the runtime of every existing engine project and
    // run each matrix spec once with no condition set.
    { name: 'chromium', use: { ...devices['Desktop Chrome'] }, testIgnore: /[\\/]matrix[\\/]/ },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] }, testIgnore: /[\\/]matrix[\\/]/ },
    { name: 'webkit', use: { ...devices['Desktop Safari'] }, testIgnore: /[\\/]matrix[\\/]/ },
    ...matrixProjects,
  ],
  webServer: {
    command: useStaticStorybook ? staticStorybookCommand : 'yarn storybook --no-open',
    url: storybookBaseUrl,
    // Static qualification must never attach to a developer's non-gallery
    // Storybook on 6006: that silently changes the catalog under test.
    reuseExistingServer: useStaticStorybook ? false : !process.env.CI,
    timeout: useStaticStorybook ? 420_000 : 120_000,
  },
})
