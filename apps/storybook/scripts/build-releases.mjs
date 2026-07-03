/**
 * build-releases.mjs — transform the source-of-truth changelog into the data the
 * "What's New" / Releases docs page renders (TASK-APP-07).
 *
 * The repo already produces a rich `CHANGELOG.md` via the workspace-changelog
 * tooling (date-grouped `## YYYY-MM-DD` → `### Added|Changed|Fixed` sections,
 * each entry wrapped in `<!-- workspace-changelog:entry … -->` markers) plus
 * pending `.changeset/*.md` entries that have not shipped a version yet. A docs
 * visitor has no way to see "what changed recently" or "what's deprecated", so
 * this script parses both and emits a single typed data module:
 *
 *   apps/storybook/stories/_data/releases.generated.ts
 *
 * consumed by `stories/Releases.mdx`. Generating from the changelog (rather than
 * hand-maintaining a second copy) is the whole point — the page can never drift
 * from the source of truth. Deprecations / breaking changes are detected across
 * *every* release and pulled forward into a `HIGHLIGHTS` list so they are easy to
 * spot even when buried in an old Added/Changed/Fixed bullet.
 *
 * Run automatically before `storybook dev` / `storybook build` (see the
 * `build:releases` package script), same lifecycle as `build-playground.mjs`.
 * The output file is git-ignored — it is a build artifact regenerated from the
 * current changelog, so it always tracks the source of truth.
 */
import { readFile, readdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const appRoot = resolve(__dirname, '..')
const repoRoot = resolve(appRoot, '../..')

const CHANGELOG = resolve(repoRoot, 'CHANGELOG.md')
const CHANGESET_DIR = resolve(repoRoot, '.changeset')
const PACKAGES_DIR = resolve(repoRoot, 'packages')
const OUT = resolve(appRoot, 'stories/_data/releases.generated.ts')

/** Most recent N releases to render on the page (deprecations scan ALL of them). */
const SHOWN_RELEASES = Number(process.env.RELEASES_LIMIT) || 12

/** Canonical render order for sections; unknown sections append after these. */
const SECTION_ORDER = ['Breaking', 'Deprecated', 'Removed', 'Security', 'Added', 'Changed', 'Fixed']

/** Detect a bullet that announces a deprecation / breaking change from its text. */
const DEPRECATED_RE = /deprecat/i
const BREAKING_RE = /\bbreaking\b|\bbackwards[- ]incompatible\b/i

/**
 * Split one changelog bullet into `{ text, author }`, discarding the trailing
 * `([file](path), …)` provenance group (noise on a docs page). Entry shape:
 *   `- <text>. ([README.md](README.md), …) (author.name)`
 * Both trailing groups are optional and parsed from the end so parens inside the
 * body text don't confuse it.
 */
function parseBullet(raw) {
  let s = raw.replace(/^\s*-\s+/, '').trim()

  // Trailing `(author)` — a plain-text group with no markdown link inside.
  let author
  const authorMatch = s.match(/\(([^()[\]]+)\)\s*$/)
  if (authorMatch) {
    author = authorMatch[1].trim()
    s = s.slice(0, authorMatch.index).trim()
  }

  // Trailing `([label](url), …)` file-provenance group — drop it entirely.
  const filesMatch = s.match(/\s*\((?:\[[^\]]+\]\([^)]*\)(?:,\s*)?)+\)\s*$/)
  if (filesMatch)
    s = s.slice(0, filesMatch.index).trim()

  return { text: s, author }
}

/** Parse the root CHANGELOG.md into date-grouped releases with sectioned bullets. */
async function parseChangelog() {
  const src = await readFile(CHANGELOG, 'utf8')
  const lines = src.split(/\r?\n/)

  const releases = []
  let release = null
  let section = null

  for (const line of lines) {
    if (line.startsWith('<!--'))
      continue // workspace-changelog:entry markers

    const dateMatch = line.match(/^##\s+(.+?)\s*$/)
    if (dateMatch) {
      release = { date: dateMatch[1], sections: new Map() }
      releases.push(release)
      section = null
      continue
    }

    const sectionMatch = line.match(/^###\s+(.+?)\s*$/)
    if (sectionMatch) {
      section = sectionMatch[1]
      if (release && !release.sections.has(section))
        release.sections.set(section, [])
      continue
    }

    if (release && section && /^\s*-\s+/.test(line)) {
      const { text, author } = parseBullet(line)
      if (!text)
        continue
      release.sections.get(section).push({
        text,
        author,
        deprecated: DEPRECATED_RE.test(text),
        breaking: BREAKING_RE.test(text),
      })
    }
  }

  // Normalise: order sections canonically, count entries, drop empty releases.
  return releases
    .map((r) => {
      const sections = [...r.sections.entries()]
        .filter(([, entries]) => entries.length > 0)
        .map(([name, entries]) => ({ name, entries }))
        .sort((a, b) => sectionRank(a.name) - sectionRank(b.name))
      const entryCount = sections.reduce((n, s) => n + s.entries.length, 0)
      return { date: r.date, sections, entryCount }
    })
    .filter(r => r.entryCount > 0)
}

function sectionRank(name) {
  const i = SECTION_ORDER.indexOf(name)
  return i === -1 ? SECTION_ORDER.length : i
}

/** Parse pending `.changeset/*.md` entries — changes staged but not yet released. */
async function parseChangesets() {
  let files = []
  try {
    files = await readdir(CHANGESET_DIR)
  }
  catch {
    return []
  }

  const pending = []
  const rank = { patch: 0, minor: 1, major: 2 }

  for (const file of files.sort()) {
    if (!file.endsWith('.md') || file.toLowerCase() === 'readme.md')
      continue

    const src = await readFile(resolve(CHANGESET_DIR, file), 'utf8')
    const fm = src.match(/^---\s*([\s\S]*?)\s*---\s*([\s\S]*)$/)
    if (!fm)
      continue

    const packages = []
    let level = 'patch'
    for (const fmLine of fm[1].split(/\r?\n/)) {
      const m = fmLine.match(/^\s*["']?(@?[\w/-]+)["']?\s*:\s*(major|minor|patch)\s*$/)
      if (!m)
        continue
      packages.push(m[1])
      if (rank[m[2]] > rank[level])
        level = m[2]
    }

    const body = fm[2].trim()
    const summary = body.split(/\r?\n/).find(l => l.trim().length > 0)?.trim() ?? ''
    pending.push({
      packages,
      level,
      summary,
      body,
      breaking: level === 'major' || BREAKING_RE.test(body),
      deprecated: DEPRECATED_RE.test(body),
    })
  }
  return pending
}

/**
 * Scan the per-package Changesets changelogs (packages/<name>/CHANGELOG.md) for the
 * actual deprecation-policy notes ("kept as deprecated aliases…", "removed in
 * the next major", "Major Changes"). These semver changelogs — not the
 * date-based root timeline — are where deprecations are formally announced, so
 * they are the richest source for the pulled-forward highlights.
 */
async function parsePackageHighlights() {
  let pkgDirs = []
  try {
    pkgDirs = await readdir(PACKAGES_DIR, { withFileTypes: true })
  }
  catch {
    return []
  }

  const highlights = []
  for (const dir of pkgDirs) {
    if (!dir.isDirectory())
      continue
    let src
    try {
      src = await readFile(resolve(PACKAGES_DIR, dir.name, 'CHANGELOG.md'), 'utf8')
    }
    catch {
      continue // package has no changelog yet
    }

    const pkg = src.match(/^#\s+(\S+)/m)?.[1] ?? ('@dzup-ui/' + dir.name)
    let version = ''
    let changeType = ''
    for (const raw of src.split(/\r?\n/)) {
      const versionMatch = raw.match(/^##\s+(.+?)\s*$/)
      if (versionMatch) {
        version = versionMatch[1]
        changeType = ''
        continue
      }
      const typeMatch = raw.match(/^###\s+(.+?)\s*$/)
      if (typeMatch) {
        changeType = typeMatch[1]
        continue
      }
      if (!/^\s*-\s+/.test(raw))
        continue

      // "Features"/"Added" bullets DESCRIBE new capabilities (e.g. a codemod
      // literally named `remove-deprecated`) — they are not API-deprecation
      // announcements, so keyword-scanning them yields false positives. Real
      // deprecations/removals live in Changed/Minor/Major sections.
      const isAdditive = /feature|added/i.test(changeType)
      // A "Major Changes" bullet is breaking by definition; otherwise fall back
      // to keyword detection so deprecations buried in minor/patch notes surface.
      const isMajor = /major changes/i.test(changeType)
      const deprecated = !isAdditive && DEPRECATED_RE.test(raw)
      const breaking = isMajor || (!isAdditive && BREAKING_RE.test(raw))
      if (!deprecated && !breaking)
        continue

      highlights.push({
        source: 'package',
        date: `${pkg}@${version}`,
        kind: breaking ? 'breaking' : 'deprecated',
        section: changeType || 'Changes',
        text: cleanNote(raw),
      })
    }
  }
  return highlights
}

/** Strip changeset bullet noise (leading dash, commit hash) and truncate. */
function cleanNote(raw) {
  let s = raw.replace(/^\s*-\s+/, '').replace(/^[0-9a-f]{7,}:\s*/i, '').trim()
  s = s.replace(/`([^`]+)`/g, '$1') // drop backticks — MDX renders these as text
  if (s.length > 260)
    s = `${s.slice(0, 257).trimEnd()}…`
  return s
}

/** Pull every deprecation / breaking note forward into one prominent list. */
function collectHighlights(releases, pending, packageHighlights) {
  const highlights = []

  // Pending changesets first — the changes about to ship.
  for (const p of pending) {
    if (p.breaking || p.deprecated) {
      highlights.push({
        source: 'changeset',
        date: 'Unreleased',
        kind: p.breaking ? 'breaking' : 'deprecated',
        section: p.packages.join(', ') || 'changeset',
        text: p.summary,
      })
    }
  }

  // Formal deprecation-policy notes from the per-package semver changelogs.
  highlights.push(...packageHighlights)

  // Anything flagged in the date-based root timeline.
  for (const r of releases) {
    for (const s of r.sections) {
      for (const e of s.entries) {
        if (e.deprecated || e.breaking) {
          highlights.push({
            source: 'changelog',
            date: r.date,
            kind: e.breaking ? 'breaking' : 'deprecated',
            section: s.name,
            text: e.text,
            author: e.author,
          })
        }
      }
    }
  }

  // Dedupe identical notes announced by more than one package (e.g. a shared
  // token deprecation listed in both core and tokens), keeping the first seen.
  const seen = new Set()
  const unique = highlights.filter((h) => {
    const key = `${h.kind}::${h.text}`
    if (seen.has(key))
      return false
    seen.add(key)
    return true
  })

  // Breaking changes rank above deprecations; otherwise keep source order.
  return unique.sort((a, b) => (a.kind === b.kind ? 0 : a.kind === 'breaking' ? -1 : 1))
}

function banner() {
  return `/**
 * AUTO-GENERATED by apps/storybook/scripts/build-releases.mjs — DO NOT EDIT.
 *
 * Source of truth: /CHANGELOG.md + /.changeset/*.md
 * Regenerate:      yarn workspace @dzup-ui/storybook build:releases
 *
 * Consumed by stories/Releases.mdx. The file is git-ignored; it is rebuilt from
 * the changelog before every \`storybook dev\` / \`storybook build\`.
 */
/* eslint-disable */
// @ts-nocheck\n`
}

function emit(data) {
  const types = `
export interface ReleaseEntry {
  /** Bullet text with its provenance/author stripped. */
  text: string
  /** Commit author, when the changelog recorded one. */
  author?: string
  /** True when the bullet announces a deprecation. */
  deprecated: boolean
  /** True when the bullet announces a breaking change. */
  breaking: boolean
}

export interface ReleaseSection {
  /** Added | Changed | Fixed | Deprecated | Breaking | … */
  name: string
  entries: ReleaseEntry[]
}

export interface Release {
  /** The \`## \` heading from CHANGELOG.md — a date (\`2026-06-27\`) or version. */
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
  /** Where the note came from: pending changeset, package changelog, or timeline. */
  source: 'changeset' | 'package' | 'changelog'
  /** Release date, \`Unreleased\`, or \`pkg@version\` depending on the source. */
  date: string
  kind: 'breaking' | 'deprecated'
  section: string
  text: string
  author?: string
}
`

  const json = (label, value, type) =>
    `export const ${label}: ${type} = ${JSON.stringify(value, null, 2)}\n`

  return [
    banner(),
    types,
    json('GENERATED_AT', new Date().toISOString(), 'string'),
    json('SECTION_ORDER', SECTION_ORDER, 'string[]'),
    json('TOTAL_RELEASES', data.totalReleases, 'number'),
    json('RELEASES', data.releases, 'Release[]'),
    json('PENDING', data.pending, 'PendingChange[]'),
    json('HIGHLIGHTS', data.highlights, 'Highlight[]'),
  ].join('\n')
}

async function run() {
  const allReleases = await parseChangelog()
  const pending = await parseChangesets()
  const packageHighlights = await parsePackageHighlights()
  const highlights = collectHighlights(allReleases, pending, packageHighlights)
  const releases = allReleases.slice(0, SHOWN_RELEASES)

  const out = emit({
    releases,
    pending,
    highlights,
    totalReleases: allReleases.length,
  })
  await writeFile(OUT, out, 'utf8')

  console.log(
    `[releases] wrote ${releases.length}/${allReleases.length} releases, `
    + `${pending.length} pending, ${highlights.length} highlights → ${OUT}`,
  )
}

run().catch((err) => {
  console.error('[releases] build failed:', err)
  process.exitCode = 1
})
