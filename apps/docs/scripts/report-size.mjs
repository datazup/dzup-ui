/**
 * Size report for the docs site's static build (TASK-N2-D1).
 *
 * WHY THIS EXISTS AS A REPORTER AND NOT YET A GATE
 *
 * Constraint **B8** holds `apps/storybook/storybook-static` to 25 MB, enforced by
 * `apps/storybook/scripts/check-bundle-size.mjs --max-mb 25`. That script reads
 * `storybook-static` and nothing else, so this site — a separate app with its
 * own `dist` — **does not consume that budget**. Verified, not assumed.
 *
 * The consequence is that the repository has just gained a second multi-megabyte
 * publishable artifact with **no size gate on it at all**, which is the same
 * shape of gap `check-bundle-size.mjs` was written to close for Storybook. Its
 * own header records that it started as a reporter and was promoted to
 * `--max-mb` "once a baseline is trusted"; this follows the identical path. One
 * local build is not a trusted baseline, and choosing a ceiling is an owner
 * decision (D1-D4 in the handoff).
 *
 * Usage:
 *   node scripts/report-size.mjs
 *   node scripts/report-size.mjs --max-mb 20      # enforced: exit 1 when over
 */

import { readdirSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const APP_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = join(APP_ROOT, '.vitepress/dist')

/** Total bytes and file count under a directory, recursively. */
function measure(dir) {
  let bytes = 0
  let files = 0
  const stack = [dir]
  while (stack.length > 0) {
    const current = stack.pop()
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const full = join(current, entry.name)
      if (entry.isDirectory()) {
        stack.push(full)
      }
      else {
        bytes += statSync(full).size
        files += 1
      }
    }
  }
  return { bytes, files }
}

function mb(bytes) {
  return (bytes / (1024 * 1024)).toFixed(2)
}

let total
try {
  total = measure(DIST)
}
catch {
  console.error(
    'apps/docs/.vitepress/dist does not exist. Run `yarn workspace @dzup-ui/docs build` first.',
  )
  process.exit(1)
}

const parts = readdirSync(DIST, { withFileTypes: true })
  .filter(e => e.isDirectory())
  .map(e => ({ name: e.name, ...measure(join(DIST, e.name)) }))
  .sort((a, b) => b.bytes - a.bytes)

console.log(`docs site — apps/docs/.vitepress/dist`)
console.log(`  total   ${mb(total.bytes)} MB across ${total.files} files`)
for (const part of parts)
  console.log(`  ${part.name.padEnd(8)}${mb(part.bytes).padStart(7)} MB · ${part.files} files`)

const maxIndex = process.argv.indexOf('--max-mb')
if (maxIndex !== -1) {
  const max = Number(process.argv[maxIndex + 1])
  if (!Number.isFinite(max)) {
    console.error('--max-mb needs a number.')
    process.exit(1)
  }
  const actual = total.bytes / (1024 * 1024)
  if (actual > max) {
    console.error(`\n✗ docs site is ${mb(total.bytes)} MB, over the ${max} MB budget.`)
    process.exit(1)
  }
  console.log(`\n✓ within the ${max} MB budget (${((actual / max) * 100).toFixed(1)}%).`)
}
else {
  console.log('\n  (report only — no budget is enforced; see the header for why)')
}
