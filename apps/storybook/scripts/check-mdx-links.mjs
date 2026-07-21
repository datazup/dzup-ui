/**
 * check-mdx-links — asserts that what the built Storybook SERVES matches what the
 * docs CLAIM, by resolving both against the real `storybook-static/index.json`.
 *
 * Three classes of check, each installed after the corresponding defect shipped:
 *
 * 1. DEEP LINKS (TASK-FREE-11). Two links shipped dead for months because nothing
 *    resolved them: Typography.mdx → `getting-started-design-tokens--docs` and
 *    ComponentStatus.mdx → `guides-contributing--docs` (Contributing's
 *    `<Meta title="Contributing">` makes it `contributing--docs`, not the
 *    `guides-` prefixed id the author assumed). Every `?path=/docs/<id>` and
 *    `?path=/story/<id>` in the MDX guides AND the `_blocks/` doc blocks is now
 *    resolved against the built index.
 *
 * 2. INTERNAL-FILE LINKS. Filesystem-relative markdown links (`](../../CLAUDE.md)`)
 *    resolve to nothing from a docs iframe, and CLAUDE.md is an internal
 *    agent-instructions file that must not be handed to users in ANY form —
 *    including the absolute GitHub URL two pages had "fixed" it into (TASK-FREE2-03).
 *
 * 3. SIDEBAR SENTINELS (TASK-FREE2-02, TASK-FREE2-06). Two groups are excluded from
 *    public builds by `.storybook/main.ts` — the `Visual Refresh/*` demo screens and
 *    the `Core/Feedback/App-Specific/*` product badges — while `Guides/Design Tokens`
 *    IS published from the same `_gallery/` directory as the first group. All three
 *    facts are asserted here so a glob edit cannot silently leak an excluded group
 *    back in, or take the token browser out with it.
 *
 *    TASK-FREE2-06 exists because TASK-X.4's "revisit when …" clause was prose: the
 *    conditions it named came true and the record sat stale for months, until the
 *    shipped Feedback.mdx was describing components that had long since been built,
 *    exported, and published. A sentinel is a revisit clause the build enforces.
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
const BLOCKS_DIR = resolve(STORIES_DIR, '_blocks')
const INDEX_JSON = resolve(APP_ROOT, 'storybook-static', 'index.json')

/**
 * Ids that must / must not exist in a PUBLIC build.
 *
 * `guides-design-tokens--designtokens` is the id Storybook actually mints for
 * DesignTokens.mdx: it attaches via `<Meta of={DzTokenBrowserStories} />`, and an
 * `of`-attached docs entry is named after the MDX FILE, not `--docs`. Verified
 * against a real build — do not "correct" it to `guides-design-tokens--docs`,
 * which is not served.
 */
const SENTINELS = {
  /**
   * Prefixes no PUBLIC build may serve. Each is gated back in by an env flag in
   * `.storybook/main.ts`, so each also has a build that PROVES the check bites:
   *   visual-refresh              → DZUP_GALLERY=1       (24 ids)
   *   core-feedback-app-specific  → DZUP_APP_SPECIFIC=1  (38 ids, 4 components)
   */
  absentPrefixes: ['visual-refresh', 'core-feedback-app-specific'],
  present: ['guides-design-tokens--designtokens', 'guides-design-tokens--browser'],
}

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
// A deep link built from a variable (`?path=/docs/${row.docsId}`) — legitimate, but
// its target is only knowable at runtime, so it is counted and reported rather than
// silently passing as if it had been checked.
const DYNAMIC_DEEP_LINK = /\?path=\/(?:docs|story)\/\$\{/g
// CLAUDE.md is internal agent instructions. Banned in every form: relative path,
// absolute GitHub URL, or a bare markdown link target.
const CLAUDE_MD_LINK = /\]\([^)]*CLAUDE\.md[^)]*\)|href=["'][^"']*CLAUDE\.md[^"']*["']/g

const failures = []
let checked = 0
let dynamic = 0

/** Every file whose text can ship a link into the rendered docs. */
const sources = [
  ...readdirSync(STORIES_DIR)
    .filter(file => file.endsWith('.mdx'))
    .map(name => ({ name, path: join(STORIES_DIR, name), mdx: true })),
  ...readdirSync(BLOCKS_DIR)
    .filter(file => file.endsWith('.ts'))
    .map(name => ({ name: `_blocks/${name}`, path: join(BLOCKS_DIR, name), mdx: false })),
]

for (const { name, path, mdx } of sources) {
  const content = readFileSync(path, 'utf8')

  for (const match of content.matchAll(DEEP_LINK)) {
    checked += 1
    const id = match[1]
    if (!knownIds.has(id)) {
      failures.push(`${name}: dead deep link "${match[0]}" — no story/docs id "${id}" in the built index`)
    }
  }

  dynamic += [...content.matchAll(DYNAMIC_DEEP_LINK)].length

  for (const match of content.matchAll(CLAUDE_MD_LINK)) {
    failures.push(`${name}: links CLAUDE.md ("${match[0]}") — that file is internal agent instructions, not user documentation`)
  }

  // Filesystem-relative markdown links do not resolve in a rendered docs page.
  // Only meaningful in MDX prose; `_blocks/*.ts` relative paths are ES imports.
  if (mdx) {
    for (const match of content.matchAll(RELATIVE_MD_LINK)) {
      failures.push(`${name}: filesystem-relative link "${match[0]}" — use a GitHub URL or inline prose`)
    }
  }
}

// Sidebar sentinels — see SENTINELS above.
const INTERNAL_GROUPS = {
  'visual-refresh': 'the _gallery demo screens are internal (see .storybook/main.ts INCLUDE_GALLERY)',
  'core-feedback-app-specific':
    'the App-Specific badges encode datazup product vocabulary and do not publish '
    + '(see .storybook/main.ts INCLUDE_APP_SPECIFIC, docs/storybook-decisions.md TASK-FREE2-06)',
}
for (const prefix of SENTINELS.absentPrefixes) {
  const leaked = [...knownIds].filter(id => id.startsWith(prefix))
  if (leaked.length > 0) {
    failures.push(
      `${leaked.length} "${prefix}" id(s) in the public build (e.g. "${leaked[0]}") — `
      + `${INTERNAL_GROUPS[prefix]}. Did a stories glob change?`,
    )
  }
}
for (const id of SENTINELS.present) {
  if (!knownIds.has(id)) {
    failures.push(`missing required docs id "${id}" — the Guides/Design Tokens page did not build. Did the _gallery exclusion catch DzTokenBrowser?`)
  }
}

if (failures.length > 0) {
  console.error(`✗ check-mdx-links: ${failures.length} problem(s):\n  - ${failures.join('\n  - ')}`)
  process.exit(1)
}
console.log(
  `✓ check-mdx-links: ${checked} internal deep link(s) resolve against ${knownIds.size} built ids`
  + ` · ${dynamic} dynamic link(s) skipped (runtime-built ids)`
  + ` · sidebar sentinels OK (no ${SENTINELS.absentPrefixes.map(p => `${p}/*`).join(', ')};`
  + ` ${SENTINELS.present.length} required id(s) present)`,
)
