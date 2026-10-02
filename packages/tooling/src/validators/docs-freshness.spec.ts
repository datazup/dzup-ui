/**
 * Specs for `validate:docs-freshness` (TASK-S2-O3).
 *
 * The point of every case here is a **seeded defect**: a gate that has never
 * been watched to fail is not a gate. Each clause is driven red on a synthetic
 * tree, and the green case is driven too, so "it passes" is a measurement and
 * not an absence of evidence.
 */

import { mkdirSync, mkdtempSync, rmSync, utimesSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  checkDocsFreshness,
  INPUT_DIRS,
  INPUT_FILES,
  listMarkdown,
  readStamp,
  shouldRequireDist,
  STAMPED_ARTIFACTS,
} from './docs-freshness.ts'

/** A synthetic repository root with the shape the validator reads. */
function seed(root: string, options: {
  commit?: string
  /** Per-artifact override, for the disagreement case. */
  commits?: Record<string, string>
  /** Omit these stamped artifacts entirely. */
  omitStamped?: readonly string[]
  /** Write no dist at all. */
  noDist?: boolean
} = {}): void {
  const commit = options.commit ?? 'a'.repeat(40)
  // Everything seeded is older than the dist stamp the clause-2 cases set
  // (-600s), so a test's own setMtime(..., 0) is the ONLY input newer than the
  // build. Without this the fixture leaned on write-time mtimes, which made
  // every seeded input stale on Linux (11 of 11, CI run 36997534497) and only
  // happened to read as one on the Windows machine the test was written on.
  const written: string[] = []
  for (const rel of STAMPED_ARTIFACTS) {
    if (options.omitStamped?.includes(rel))
      continue
    const abs = join(root, rel)
    mkdirSync(join(abs, '..'), { recursive: true })
    writeFileSync(abs, JSON.stringify({ sourceCommit: options.commits?.[rel] ?? commit }))
    written.push(abs)
  }
  for (const dir of INPUT_DIRS) {
    mkdirSync(join(root, dir), { recursive: true })
    writeFileSync(join(root, dir, 'DzButton.md'), '# DzButton\n')
    written.push(join(root, dir, 'DzButton.md'))
  }
  for (const rel of INPUT_FILES) {
    if (STAMPED_ARTIFACTS.includes(rel as (typeof STAMPED_ARTIFACTS)[number]))
      continue
    const abs = join(root, rel)
    mkdirSync(join(abs, '..'), { recursive: true })
    writeFileSync(abs, '{}')
    written.push(abs)
  }
  if (!options.noDist) {
    const dist = join(root, 'apps/docs/.vitepress/dist')
    mkdirSync(dist, { recursive: true })
    writeFileSync(join(dist, 'index.html'), '<!doctype html>')
    written.push(join(dist, 'index.html'))
  }
  for (const abs of written)
    setMtime(abs, -1200)
}

/** Moves a file's mtime by `deltaSeconds` relative to now. */
function setMtime(path: string, deltaSeconds: number): void {
  const t = new Date(Date.now() + deltaSeconds * 1000)
  utimesSync(path, t, t)
}

describe('validate:docs-freshness', () => {
  let root: string

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'dz-docs-freshness-'))
  })

  afterEach(() => {
    rmSync(root, { recursive: true, force: true })
  })

  describe('the green case', () => {
    it('passes when the build is newer than every input and the stamps agree', () => {
      seed(root)
      // Make the build unambiguously the youngest thing in the tree.
      setMtime(join(root, 'apps/docs/.vitepress/dist/index.html'), 60)

      const r = checkDocsFreshness({ root, requireDist: true })

      expect(r.violations).toEqual([])
      expect(r.stale).toEqual([])
      expect(r.inputsChecked).toBeGreaterThan(0)
      expect(new Set(Object.values(r.stamps)).size).toBe(1)
    })
  })

  describe('clause 1 — dist', () => {
    it('reports, and does not fail, an absent dist off CI', () => {
      seed(root, { noDist: true })

      const r = checkDocsFreshness({ root, requireDist: false })

      expect(r.buildStampMs).toBeUndefined()
      const dist = r.violations.filter(v => v.rule === 'dist')
      expect(dist).toHaveLength(1)
      expect(dist[0]!.level).toBe('report')
      expect(r.violations.filter(v => v.level === 'error')).toEqual([])
    })

    it('errors (not reports) on an absent dist under --require-dist', () => {
      seed(root, { noDist: true })

      const r = checkDocsFreshness({ root, requireDist: true })

      const dist = r.violations.filter(v => v.rule === 'dist')
      expect(dist).toHaveLength(1)
      expect(dist[0]!.level).toBe('error')
      expect(dist[0]!.message).toMatch(/UNMEASURED/)
    })

    it('stops after an absent dist rather than reporting a meaningless 0 stale', () => {
      seed(root, { noDist: true })

      const r = checkDocsFreshness({ root, requireDist: true })

      expect(r.inputsChecked).toBe(0)
      expect(r.stale).toEqual([])
    })
  })

  describe('clause 2 — stale', () => {
    it('seeded defect: a generated page newer than the build is caught', () => {
      seed(root)
      setMtime(join(root, 'apps/docs/.vitepress/dist/index.html'), -600)
      setMtime(join(root, 'apps/docs/components/DzButton.md'), 0)

      const r = checkDocsFreshness({ root, requireDist: true })

      const stale = r.violations.filter(v => v.rule === 'stale')
      expect(stale).toHaveLength(1)
      expect(stale[0]!.level).toBe('error')
      expect(stale[0]!.message).toContain('apps/docs/components/DzButton.md')
      expect(r.stale.map(s => s.rel)).toContain('apps/docs/components/DzButton.md')
    })

    it('seeded defect: a regenerated metadata artifact newer than the build is caught', () => {
      seed(root)
      setMtime(join(root, 'apps/docs/.vitepress/dist/index.html'), -600)
      setMtime(join(root, 'packages/core/docs/component-meta.json'), 0)

      const r = checkDocsFreshness({ root, requireDist: true })

      expect(r.stale.map(s => s.rel)).toContain('packages/core/docs/component-meta.json')
    })

    it('reports rather than fails a stale build off CI', () => {
      seed(root)
      setMtime(join(root, 'apps/docs/.vitepress/dist/index.html'), -600)
      setMtime(join(root, 'apps/docs/components/DzButton.md'), 0)

      const r = checkDocsFreshness({ root, requireDist: false })

      expect(r.violations.filter(v => v.rule === 'stale')[0]!.level).toBe('report')
      expect(r.violations.filter(v => v.level === 'error')).toEqual([])
    })

    it('names the newest input first and counts only the inputs that are actually newer', () => {
      seed(root)
      // Age every input behind the build, then push exactly two ahead of it, so the
      // count is a measurement of staleness and not of how many inputs exist.
      for (const rel of [...INPUT_FILES, ...STAMPED_ARTIFACTS, 'apps/docs/components/DzButton.md', 'apps/docs/evidence/DzButton.md'])
        setMtime(join(root, rel), -600)
      setMtime(join(root, 'apps/docs/.vitepress/dist/index.html'), -300)
      setMtime(join(root, 'apps/docs/components/DzButton.md'), -100)
      setMtime(join(root, 'apps/docs/evidence/DzButton.md'), -10)

      const r = checkDocsFreshness({ root, requireDist: true })

      expect(r.stale[0]!.rel).toBe('apps/docs/evidence/DzButton.md')
      expect(r.stale).toHaveLength(2)
      expect(r.inputsChecked).toBeGreaterThan(2)
    })
  })

  describe('clause 3 — stamp', () => {
    it('seeded defect: two artifacts stamped at different commits fail', () => {
      seed(root, {
        commit: 'a'.repeat(40),
        commits: { 'packages/core/docs/capability-matrix.json': 'b'.repeat(40) },
      })
      setMtime(join(root, 'apps/docs/.vitepress/dist/index.html'), 60)

      const r = checkDocsFreshness({ root, requireDist: true })

      const stamp = r.violations.filter(v => v.rule === 'stamp')
      expect(stamp).toHaveLength(1)
      expect(stamp[0]!.level).toBe('error')
      expect(stamp[0]!.message).toMatch(/2 different commits/)
    })

    it('seeded defect: an artifact with no sourceCommit fails — an unbound artifact is not evidence', () => {
      seed(root, { omitStamped: ['packages/core/docs/quality-matrix.json'] })
      setMtime(join(root, 'apps/docs/.vitepress/dist/index.html'), 60)

      const r = checkDocsFreshness({ root, requireDist: true })

      const stamp = r.violations.filter(v => v.rule === 'stamp')
      expect(stamp).toHaveLength(1)
      expect(stamp[0]!.level).toBe('error')
      expect(stamp[0]!.message).toContain('quality-matrix.json')
    })

    it('fails the stamp clause even with no dist — it does not depend on a build', () => {
      seed(root, {
        noDist: true,
        commits: { 'packages/core/docs/capability-matrix.json': 'c'.repeat(40) },
      })

      const r = checkDocsFreshness({ root, requireDist: false })

      expect(r.violations.some(v => v.rule === 'stamp' && v.level === 'error')).toBe(true)
    })

    it('does NOT fail on a stamp that differs from HEAD — that is register row #40', () => {
      // Every artifact stamped at the same non-HEAD commit is a legitimate state:
      // an artifact is stamped with the HEAD it was generated at and goes stale the
      // instant the owner commits. Reported by the CLI, never enforced.
      seed(root, { commit: 'f'.repeat(40) })
      setMtime(join(root, 'apps/docs/.vitepress/dist/index.html'), 60)

      const r = checkDocsFreshness({ root, requireDist: true })

      expect(r.violations).toEqual([])
    })
  })

  describe('shouldRequireDist', () => {
    it('is false by default off CI', () => {
      expect(shouldRequireDist([], {})).toBe(false)
    })

    it('is true with --require-dist', () => {
      expect(shouldRequireDist(['--require-dist'], {})).toBe(true)
    })

    it('is true when CI is set', () => {
      expect(shouldRequireDist([], { CI: 'true' })).toBe(true)
    })

    it('is false when --allow-missing-dist overrides CI', () => {
      expect(shouldRequireDist(['--allow-missing-dist'], { CI: 'true' })).toBe(false)
    })

    it('honours DOCS_SIZE_ALLOW_MISSING_DIST=1, the chain-level opt-out docs-size reads', () => {
      // The min-runtime lane runs the whole chain with no docs build and sets
      // this variable for docs-size; one opt-out must silence both dist gates.
      expect(shouldRequireDist([], { CI: 'true', DOCS_SIZE_ALLOW_MISSING_DIST: '1' })).toBe(false)
      expect(shouldRequireDist(['--require-dist'], { DOCS_SIZE_ALLOW_MISSING_DIST: '1' })).toBe(false)
      expect(shouldRequireDist([], { CI: 'true', DOCS_SIZE_ALLOW_MISSING_DIST: '0' })).toBe(true)
    })
  })

  describe('helpers', () => {
    it('listMarkdown returns forward-slashed repo-relative paths', () => {
      seed(root)
      const pages = listMarkdown('apps/docs/components', root)
      expect(pages).toEqual(['apps/docs/components/DzButton.md'])
    })

    it('listMarkdown returns [] for a directory that does not exist', () => {
      expect(listMarkdown('apps/docs/nope', root)).toEqual([])
    })

    it('readStamp reads a nested meta.sourceCommit', () => {
      const abs = join(root, 'nested.json')
      writeFileSync(abs, JSON.stringify({ meta: { sourceCommit: 'deadbee' } }))
      expect(readStamp('nested.json', root)).toBe('deadbee')
    })

    it('readStamp returns undefined for unparseable JSON rather than throwing', () => {
      writeFileSync(join(root, 'broken.json'), '{ not json')
      expect(readStamp('broken.json', root)).toBeUndefined()
    })

    it('readStamp returns undefined for an absent file', () => {
      expect(readStamp('absent.json', root)).toBeUndefined()
    })
  })
})
