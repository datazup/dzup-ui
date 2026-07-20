/**
 * build-releases — generate the landing app's `/changelog` data module and its
 * Atom feed from the ONE source-of-truth changelog parser (FREE2-10).
 *
 * Emits two committed, drift-guarded artifacts (both pure projections of
 * `CHANGELOG.md` + `.changeset/*` + `packages/*\/CHANGELOG.md`, so CI regenerates
 * them and fails on a diff — the same guard `counts.ts` / `ogImages.ts` get):
 *
 *   • `src/generated/releases.ts` — typed release history consumed by
 *     `pages/ChangelogPage.vue` (and read back by `changelog.spec.ts`).
 *   • `public/feed.xml` — an Atom 1.0 feed, one `<entry>` per release, absolute
 *     URLs on `SITE_ORIGIN`, discoverable via the `<link rel="alternate">` this
 *     script asserts is present in `index.html`.
 *
 * The Storybook Guides/Releases page derives from the SAME parser
 * (`apps/storybook/scripts/build-releases.mjs`), so the two surfaces can never
 * disagree about what shipped. Nothing here is timestamped: the output is
 * deterministic given the source tree, which is what lets it be committed and
 * drift-checked. Run via `yarn build:releases`, wired ahead of `vite build`.
 *
 * FAIL-LOUD: no dated release, or a missing autodiscovery link in index.html,
 * exits non-zero and writes nothing — a silent empty feed is worse than none.
 */

import type { PendingChange, Release, ReleaseData } from '../../../packages/tooling/src/release-parser.mjs'
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { parseReleaseData } from '../../../packages/tooling/src/release-parser.mjs'
import { SITE_ORIGIN } from '../src/origin.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const LANDING_ROOT = resolve(__dirname, '..')
const REPO_ROOT = resolve(LANDING_ROOT, '../..')

const OUT_MODULE = resolve(LANDING_ROOT, 'src/generated/releases.ts')
const OUT_FEED = resolve(LANDING_ROOT, 'public/feed.xml')
const INDEX_HTML = resolve(LANDING_ROOT, 'index.html')

/** The `/changelog` page's canonical path and the feed's own URL. */
const CHANGELOG_PATH = '/changelog'
const FEED_PATH = '/feed.xml'

/** Most recent N releases to carry in the feed (the page shows the full history). */
const FEED_LIMIT = 20

/** A `## ` heading that is an ISO date — only these get an RFC-3339 feed timestamp. */
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/** RFC-3339 instant for a `YYYY-MM-DD` release heading (midnight UTC). */
function rfc3339(date: string): string {
  return `${date}T00:00:00Z`
}

/** Absolute URL on the canonical site origin. */
function abs(path: string): string {
  return `${SITE_ORIGIN}${path}`
}

/**
 * Render one release's sections as an escaped-HTML fragment for an Atom
 * `<content type="html">`: the human text is HTML-escaped, then the whole
 * fragment is XML-escaped for embedding (Atom `type="html"` = XML-escaped HTML).
 */
function releaseContentHtml(release: Release): string {
  const html = release.sections
    .map((section) => {
      const items = section.entries
        .map((entry) => {
          const author = entry.author ? ` <em>— ${escapeXml(entry.author)}</em>` : ''
          return `<li>${escapeXml(entry.text)}${author}</li>`
        })
        .join('')
      return `<h3>${escapeXml(section.name)}</h3><ul>${items}</ul>`
    })
    .join('')
  // Second pass: escape the HTML fragment itself for the type="html" payload.
  return escapeXml(html)
}

/** Build the Atom 1.0 feed from the most recent dated releases. */
function buildAtomFeed(dated: Release[]): string {
  const feedUpdated = rfc3339(dated[0]!.date)
  const entries = dated
    .slice(0, FEED_LIMIT)
    .map((release) => {
      const url = abs(`${CHANGELOG_PATH}#${release.date}`)
      const changeWord = release.entryCount === 1 ? 'change' : 'changes'
      return [
        '  <entry>',
        `    <title>Changes on ${escapeXml(release.date)}</title>`,
        `    <id>${escapeXml(url)}</id>`,
        `    <link rel="alternate" type="text/html" href="${escapeXml(url)}"/>`,
        `    <updated>${rfc3339(release.date)}</updated>`,
        `    <summary>${release.entryCount} ${changeWord} on ${escapeXml(release.date)}.</summary>`,
        `    <content type="html">${releaseContentHtml(release)}</content>`,
        '  </entry>',
      ].join('\n')
    })
    .join('\n')

  return `${[
    '<?xml version="1.0" encoding="utf-8"?>',
    '<feed xmlns="http://www.w3.org/2005/Atom">',
    '  <title>dzup-ui — Changelog</title>',
    '  <subtitle>Every shipped change to dzup-ui — new components, refinements and fixes, newest first.</subtitle>',
    `  <id>${escapeXml(abs(CHANGELOG_PATH))}</id>`,
    `  <link rel="alternate" type="text/html" href="${escapeXml(abs(CHANGELOG_PATH))}"/>`,
    `  <link rel="self" type="application/atom+xml" href="${escapeXml(abs(FEED_PATH))}"/>`,
    `  <updated>${feedUpdated}</updated>`,
    '  <author>',
    '    <name>dzup-ui</name>',
    `    <uri>${escapeXml(SITE_ORIGIN)}</uri>`,
    '  </author>',
    `  <generator uri="${escapeXml(abs('/'))}">dzup-ui build-releases</generator>`,
    entries,
    '</feed>',
    '',
  ].join('\n')}`
}

/** Serialise the parsed data as the committed, typechecked `releases.ts` module. */
function buildModule(data: ReleaseData, feedUpdated: string): string {
  const banner = `/**
 * GENERATED FILE — do not edit by hand.
 *
 * Written by \`apps/landing/scripts/build-releases.ts\` from the source-of-truth
 * changelog (CHANGELOG.md + .changeset + per-package changelogs) via the
 * shared \`@dzup-ui/tooling\` release parser — the SAME parser the Storybook
 * Releases page uses, so the two can never disagree.
 *
 * Consumed by \`src/pages/ChangelogPage.vue\` and the Atom feed at
 * \`public/feed.xml\`. Committed and drift-guarded (CI regenerates and diffs);
 * regenerate with \`yarn build:releases\`. Deterministic — no build timestamp —
 * so an unchanged changelog produces a byte-identical file.
 */
`

  const types = `export interface ReleaseEntry {
  text: string
  author?: string
  deprecated: boolean
  breaking: boolean
}

export interface ReleaseSection {
  name: string
  entries: ReleaseEntry[]
}

export interface Release {
  /** The \`## \` heading from CHANGELOG.md — an ISO date (\`2026-06-27\`). */
  date: string
  sections: ReleaseSection[]
  entryCount: number
}

export interface PendingChange {
  packages: string[]
  level: 'major' | 'minor' | 'patch'
  summary: string
  body: string
  breaking: boolean
  deprecated: boolean
}

export interface Highlight {
  source: 'changeset' | 'package' | 'changelog'
  date: string
  kind: 'breaking' | 'deprecated'
  section: string
  text: string
  author?: string
}
`

  const constLine = (name: string, value: unknown, type: string): string =>
    `export const ${name}: ${type} = ${JSON.stringify(value, null, 2)}\n`

  return [
    banner,
    types,
    constLine('SECTION_ORDER', data.sectionOrder, 'string[]'),
    constLine('TOTAL_RELEASES', data.totalReleases, 'number'),
    constLine('FEED_UPDATED', feedUpdated, 'string'),
    constLine('RELEASES', data.allReleases, 'Release[]'),
    constLine('PENDING', data.pending, 'PendingChange[]'),
    constLine('HIGHLIGHTS', data.highlights, 'Highlight[]'),
  ].join('\n')
}

/**
 * Confirm the feed autodiscovery link is present in index.html. The link itself
 * is static (a fixed URL, so it cannot drift), but the feed is worthless if a
 * crawler can't find it — so a missing link fails the build rather than silently
 * shipping an undiscoverable feed.
 */
async function assertAutodiscovery(): Promise<void> {
  const html = await readFile(INDEX_HTML, 'utf8')
  const hasLink
    = /rel=["']alternate["']/.test(html)
      && /type=["']application\/atom\+xml["']/.test(html)
      && html.includes(FEED_PATH)
  if (!hasLink) {
    throw new Error(
      `index.html is missing the Atom autodiscovery link. Add:\n`
      + `  <link rel="alternate" type="application/atom+xml" title="dzup-ui changelog" href="${FEED_PATH}" />`,
    )
  }
}

async function main(): Promise<void> {
  const data = await parseReleaseData({ repoRoot: REPO_ROOT })

  const dated = data.allReleases.filter(r => ISO_DATE.test(r.date))
  if (dated.length === 0) {
    throw new Error('No dated releases parsed from CHANGELOG.md — refusing to write an empty feed.')
  }

  await assertAutodiscovery()

  const feedUpdated = rfc3339(dated[0]!.date)
  await writeFile(OUT_MODULE, buildModule(data, feedUpdated))
  await writeFile(OUT_FEED, buildAtomFeed(dated))

  const pending: PendingChange[] = data.pending
  console.log(
    `✓ build-releases: ${data.allReleases.length} releases (${Math.min(dated.length, FEED_LIMIT)} in feed), `
    + `${pending.length} pending, ${data.highlights.length} highlights → releases.ts + feed.xml`,
  )
}

main().catch((error: unknown) => {
  console.error(`\n✗ build-releases failed: ${(error as Error).message}\n`)
  process.exitCode = 1
})
