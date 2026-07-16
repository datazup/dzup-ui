/**
 * check-mdx-links — validates every internal Storybook deep link in the MDX
 * guides against the REAL story index of a built Storybook (TASK-FREE-11).
 *
 * Two dead links shipped for months because nothing resolved them:
 *   • Typography.mdx → `?path=/docs/getting-started-design-tokens--docs`
 *     (no such id; the Design Tokens guide is `guides-design-tokens--docs`);
 *   • ComponentStatus.mdx → `?path=/docs/guides-contributing--docs`
 *     (Contributing's `<Meta title="Contributing">` makes it `contributing--docs`).
 *
 * This script re-derives the truth every build: it reads `?path=/docs/<id>` and
 * `?path=/story/<id>` links out of `stories/*.mdx` and asserts each id exists in
 * `storybook-static/index.json`. It also rejects filesystem-relative markdown
 * links (`](../../CLAUDE.md)`) — those resolve to nothing in a browser.
 *
 * Run AFTER `storybook build`: `yarn workspace @dzup-ui/storybook check:mdx-links`.
 * Wired into the `storybook` CI job.
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const APP_ROOT = resolve(__dirname, '..')
const STORIES_DIR = resolve(APP_ROOT, 'stories')
const INDEX_JSON = resolve(APP_ROOT, 'storybook-static', 'index.json')

if (!existsSync(INDEX_JSON)) {
  console.error(
    '✗ check-mdx-links: storybook-static/index.json not found — run `yarn storybook:build` first.',
  )
  process.exit(1)
}

/** All story/docs ids the built Storybook actually serves. */
const index = JSON.parse(readFileSync(INDEX_JSON, 'utf8'))
const knownIds = new Set(Object.keys(index.entries ?? {}))
if (knownIds.size === 0) {
  console.error('✗ check-mdx-links: index.json has no entries — broken build?')
  process.exit(1)
}

// The id is everything after /docs/ or /story/ ('--docs' suffixes included).
const DEEP_LINK = /\?path=\/(?:docs|story)\/([a-z0-9-]+)/g
const RELATIVE_MD_LINK = /\]\((\.\.?\/[^)]+)\)/g

const failures = []
let checked = 0

for (const name of readdirSync(STORIES_DIR).filter(file => file.endsWith('.mdx'))) {
  const content = readFileSync(join(STORIES_DIR, name), 'utf8')

  for (const match of content.matchAll(DEEP_LINK)) {
    checked += 1
    const id = match[1]
    if (!knownIds.has(id)) {
      failures.push(`${name}: dead deep link "${match[0]}" — no story/docs id "${id}" in the built index`)
    }
  }

  for (const match of content.matchAll(RELATIVE_MD_LINK)) {
    // Filesystem-relative markdown links do not resolve in a rendered docs page.
    failures.push(`${name}: filesystem-relative link "${match[0]}" — use a GitHub URL or inline prose`)
  }
}

if (failures.length > 0) {
  console.error(`✗ check-mdx-links: ${failures.length} problem(s):\n  - ${failures.join('\n  - ')}`)
  process.exit(1)
}
console.log(`✓ check-mdx-links: ${checked} internal deep link(s) resolve against ${knownIds.size} built ids`)
