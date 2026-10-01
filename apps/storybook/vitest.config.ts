import { existsSync, realpathSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'
import { createDzupResolution } from '../../packages/tooling/src/resolution/dzup-resolution.ts'

const dirname = fileURLToPath(new URL('.', import.meta.url))
const appDir = dirname

/** Same path, comparable: resolve symlinks, and ignore case on Windows. */
function canonical(path: string): string {
  let real = path
  try {
    real = realpathSync(path)
  }
  catch {
    // Not on disk (or not readable) — compare the normalised form instead.
  }
  return process.platform === 'win32' ? real.toLowerCase() : real
}

/**
 * Refuse a cross-install invocation instead of dying silently inside the browser.
 *
 * `apps/storybook/package.json` declares `installConfig.hoistingLimits:
 * "workspaces"`, so this app has its **own** `node_modules` — its own `vitest`,
 * its own `@vitest/browser`, and `vite` **6**, beside the root's `vite` **7**.
 * Driving THIS config with the ROOT binary
 * (`node ../../node_modules/vitest/vitest.mjs`, the invocation the repo's agent
 * guidance teaches for the root workspace) puts the Node-side orchestrator in one
 * install while the Vite server, the `storybookTest` plugin and the browser-side
 * client all resolve out of the other.
 *
 * The browser still launches and still connects, so nothing looks wrong. Then the
 * handshake fails, `[vitest] Browser connection was closed while running tests`
 * is printed, **nothing is ever collected** (`collect 0ms`) and the run never
 * returns — it has to be killed. Measured both ways in RESIDUAL-03: the app-local
 * binary runs one story file in 19 s, the root binary on the same file, same
 * config, same chromium is still hung at a 200 s cap with no output.
 *
 * That silence cost three agents ~45 minutes and was filed as a 🔴 regression
 * (`D-S5O2-1`) which did not exist. Seven minutes of nothing is not a diagnosable
 * error message, so the config now refuses the one shape it cannot survive.
 *
 * Fail-**open** by design: it judges only an entry point it can positively
 * identify as `…/vitest/vitest.mjs`. A vitest worker, an IDE integration or any
 * other entry shape is left alone, because a guard that guesses would break the
 * lane it exists to protect.
 *
 * See `docs/program-2026-09-22-architecture/reports/RESIDUAL-03-browser-lane-handoff.md`
 * and `docs/storybook-decisions.md`. `validate:browser-lane` fails if this guard
 * is removed.
 */
function assertAppLocalRunner(): void {
  const entry = process.argv[1]
  if (entry === undefined || !/[\\/]vitest[\\/]vitest\.m?js$/.test(entry))
    return

  const appRunner = resolve(appDir, 'node_modules/vitest/vitest.mjs')
  if (!existsSync(appRunner) || canonical(resolve(entry)) === canonical(appRunner))
    return

  throw new Error(
    'apps/storybook must be tested with its OWN vitest.\n'
    + `  invoked: ${resolve(entry)}\n`
    + `  required: ${appRunner}\n\n`
    + 'Use the shipped entry point:\n'
    + '  yarn storybook:test            # or: yarn workspace @dzup-ui/storybook test-storybook\n'
    + 'or the app-local binary directly:\n'
    + '  cd apps/storybook && node node_modules/vitest/vitest.mjs run --project=storybook\n\n'
    + 'Why: installConfig.hoistingLimits keeps this app on its own vite/@vitest/browser.\n'
    + 'Mixing the two installs makes the browser connect and then die at collection\n'
    + 'with no error for ~7 minutes (RESIDUAL-03 / D-S5O2-1).',
  )
}

assertAppLocalRunner()
// Two levels up from `apps/storybook/`, i.e. the monorepo root that holds
// `packages/` — the same derivation `apps/landing/vite.config.ts` uses.
// `'../../..'` walked one level too far (to the directory ABOVE the repo) and
// made `createDzupResolution` throw before vitest could load this config at
// all, so `yarn storybook:test` could not start. TASK-N1-O1.
const pkgRoot = resolve(dirname, '../..')
const dzup = createDzupResolution({ mode: 'merged-source', root: pkgRoot })
const ignoredVueCompilerWarning
  = '[@vue/compiler-core] decodeEntities option is passed but will be ignored in non-browser builds.'

export default defineConfig({
  plugins: [vue(), storybookTest({ configDir: `${dirname}.storybook` })],
  resolve: {
    alias: [
      // Ensure storybook/test resolves from app-local node_modules. App-specific,
      // so it stays here rather than in the shared list.
      {
        find: 'storybook/test',
        replacement: resolve(appDir, 'node_modules/storybook/dist/test/index.js'),
      },
      ...dzup.alias,
    ],
    dedupe: dzup.dedupe,
  },
  test: {
    name: 'storybook',
    onConsoleLog(log, type) {
      if (type === 'stderr' && log.includes(ignoredVueCompilerWarning))
        return false
    },
    browser: {
      enabled: true,
      provider: 'playwright',
      headless: true,
      instances: [{ browser: 'chromium' }],
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['../../packages/core/src/**/*.{ts,vue}'],
      exclude: ['**/*.stories.ts', '**/*.types.ts', '**/*.tokens.ts', '**/index.ts'],
    },
  },
})
