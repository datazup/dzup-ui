/**
 * release-parser.mjs — the single source-of-truth changelog parser, shared by
 * both apps that surface release history (FREE2-10).
 *
 * The repo produces a rich `CHANGELOG.md` via the workspace-changelog tooling
 * (date-grouped `## YYYY-MM-DD` → `### Added|Changed|Fixed` sections, each entry
 * wrapped in `<!-- workspace-changelog:entry … -->` markers) plus pending
 * `.changeset/*.md` entries staged for the next release, and per-package semver
 * `CHANGELOG.md` files where deprecations are formally announced. This module
 * turns all three into one typed dataset:
 *
 *   • Storybook's Guides/Releases page — `apps/storybook/scripts/build-releases.mjs`
 *   • The landing's `/changelog` page + Atom feed — `apps/landing/scripts/build-releases.ts`
 *
 * Extracted here (rather than forked) so the two surfaces can never disagree
 * about what shipped. Pure JS with no dependencies so a `node`-run `.mjs`
 * (Storybook) and a `tsx`-run `.ts` (landing) can both import it by relative
 * path; the co-located `release-parser.d.mts` carries the types for the latter.
 *
 * Deprecations / breaking changes are detected across *every* release and pulled
 * forward into a `highlights` list so they are easy to spot even when buried in
 * an old Added/Changed/Fixed bullet.
 */
import { readdir, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

/** Canonical render order for sections; unknown sections append after these. */
export const SECTION_ORDER = ['Breaking', 'Deprecated', 'Removed', 'Security', 'Added', 'Changed', 'Fixed']

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

/**
 * The text of a markdown ATX heading of exactly `depth` hashes, or null.
 *
 * Deliberately slice+trim rather than `/^#{depth}\s+(.+?)\s*$/`: a lazy `.+?`
 * followed by `\s*` can trade whitespace between the two, which is polynomial
 * backtracking on a long run of spaces.
 */
function heading(line, depth) {
  const prefix = '#'.repeat(depth)
  if (!line.startsWith(`${prefix} `) && !line.startsWith(`${prefix}\t`))
    return null
  return line.slice(depth).trim() || null
}

/**
 * Split a changeset's `---\n<yaml>\n---\n<body>` into its two halves, or null if
 * the file has no frontmatter.
 *
 * Deliberately indexOf+slice rather than one `/^---\s*([\s\S]*?)\s*---\s*([\s\S]*)$/`:
 * every `\s*` there can trade characters with the neighbouring `[\s\S]*?`, which
 * is polynomial backtracking on a file that never closes its frontmatter.
 */
function frontmatter(src) {
  if (!src.startsWith('---'))
    return null
  const close = src.indexOf('\n---', 3)
  if (close === -1)
    return null
  return {
    yaml: src.slice(3, close).trim(),
    // `close + 4` is just past the closing `\n---`; drop the rest of that line.
    body: src.slice(close + 4).replace(/^[^\n]*\n?/, ''),
  }
}

function sectionRank(name) {
  const i = SECTION_ORDER.indexOf(name)
  return i === -1 ? SECTION_ORDER.length : i
}

/** Parse the root CHANGELOG.md into date-grouped releases with sectioned bullets. */
async function parseChangelog(changelogPath) {
  const src = await readFile(changelogPath, 'utf8')
  const lines = src.split(/\r?\n/)

  const releases = []
  let release = null
  let section = null

  for (const line of lines) {
    if (line.startsWith('<!--'))
      continue // workspace-changelog:entry markers

    const date = heading(line, 2)
    if (date) {
      release = { date, sections: new Map() }
      releases.push(release)
      section = null
      continue
    }

    const sectionHeading = heading(line, 3)
    if (sectionHeading) {
      section = sectionHeading
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

/** Parse pending `.changeset/*.md` entries — changes staged but not yet released. */
async function parseChangesets(changesetDir) {
  let files = []
  try {
    files = await readdir(changesetDir)
  }
  catch {
    return []
  }

  const pending = []
  const rank = { patch: 0, minor: 1, major: 2 }

  for (const file of files.sort()) {
    if (!file.endsWith('.md') || file.toLowerCase() === 'readme.md')
      continue

    const src = await readFile(resolve(changesetDir, file), 'utf8')
    const fm = frontmatter(src)
    if (!fm)
      continue

    const packages = []
    let level = 'patch'
    for (const fmLine of fm.yaml.split(/\r?\n/)) {
      const m = fmLine.match(/^\s*["']?(@?[\w/-]+)["']?\s*:\s*(major|minor|patch)\s*$/)
      if (!m)
        continue
      packages.push(m[1])
      if (rank[m[2]] > rank[level])
        level = m[2]
    }

    const body = fm.body.trim()
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
async function parsePackageHighlights(packagesDir) {
  let pkgDirs = []
  try {
    pkgDirs = await readdir(packagesDir, { withFileTypes: true })
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
      src = await readFile(resolve(packagesDir, dir.name, 'CHANGELOG.md'), 'utf8')
    }
    catch {
      continue // package has no changelog yet
    }

    const pkg = src.match(/^#\s+(\S+)/m)?.[1] ?? (`@dzup-ui/${dir.name}`)
    let version = ''
    let changeType = ''
    for (const raw of src.split(/\r?\n/)) {
      const versionHeading = heading(raw, 2)
      if (versionHeading) {
        version = versionHeading
        changeType = ''
        continue
      }
      const typeHeading = heading(raw, 3)
      if (typeHeading) {
        changeType = typeHeading
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
  s = s.replace(/`([^`]+)`/g, '$1') // drop backticks — rendered as plain text
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

/**
 * Parse the repo's release sources into one dataset. `repoRoot` locates
 * `CHANGELOG.md`, `.changeset/` and `packages/*` — the three inputs. The result
 * is deterministic given the same source tree (no timestamps), so a committed
 * projection of it can be drift-guarded in CI.
 *
 * @param {{ repoRoot: string }} options
 */
export async function parseReleaseData({ repoRoot }) {
  const allReleases = await parseChangelog(resolve(repoRoot, 'CHANGELOG.md'))
  const pending = await parseChangesets(resolve(repoRoot, '.changeset'))
  const packageHighlights = await parsePackageHighlights(resolve(repoRoot, 'packages'))
  const highlights = collectHighlights(allReleases, pending, packageHighlights)

  return {
    sectionOrder: SECTION_ORDER,
    totalReleases: allReleases.length,
    allReleases,
    pending,
    highlights,
  }
}
