/**
 * Build-output guard: the landing `dist/` must actually contain the Storybook.
 *
 * The vite plugin (`vite/serve-storybook.ts`) throws when its input is missing,
 * but `LANDING_SKIP_STORYBOOK=1` can skip it and a future refactor could
 * reintroduce a silent no-op. This asserts the OUTPUT, so a landing artifact
 * whose /storybook/ is missing can never ship green again.
 */
import { existsSync, statSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const dist = resolve(dirname(fileURLToPath(import.meta.url)), '../dist')
const entry = resolve(dist, 'storybook/index.html')

if (!existsSync(entry) || statSync(entry).size === 0) {
  console.error(
    `✗ ${entry} is missing or empty.\n`
    + '  The landing site mounts the Storybook at /storybook/ — the "Components" CTA,\n'
    + '  the docs links and the ⌘K palette all point there. This artifact would 404.\n'
    + '  Build the Storybook before the landing site: `yarn build && yarn storybook:build`.',
  )
  process.exit(1)
}

console.log(`✓ /storybook/ mounted in dist (${statSync(entry).size} bytes at storybook/index.html)`)
