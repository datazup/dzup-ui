/**
 * Commercial templates (DT4): the free gallery may list them, never ship them.
 *
 *   - the optional snapshot is tolerated when absent or malformed;
 *   - every committed row links to the showroom over https and is not MIT;
 *   - no commercial row is in `TEMPLATES`, so the registry build emits no
 *     `/r/templates/<paid-slug>.json`;
 *   - no landing source imports the dzup-templates packages.
 */
import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import snapshot from '../generated/commercial-templates.snapshot.json'
import { COMMERCIAL_TEMPLATES, commercialTemplatesFrom, commercialTierLabel } from './commercial.ts'
import { TEMPLATES } from './registry.ts'

const SRC = resolve(__dirname, '..')
const row = snapshot.templates[0]!

describe('commercialTemplatesFrom', () => {
  it('yields no rows when the snapshot is absent', () => {
    expect(commercialTemplatesFrom({})).toEqual([])
  })

  it('yields no rows for an unknown schema version', () => {
    expect(commercialTemplatesFrom({ x: { ...snapshot, schemaVersion: 2 } })).toEqual([])
  })

  it('drops malformed, MIT or non-https rows instead of crashing', () => {
    const rows = [
      row,
      { ...row, slug: 'mit-row', licence: 'mit' },
      { ...row, slug: 'http-row', detailUrl: 'http://example.com/templates/x' },
      { slug: 'broken' },
    ]
    expect(commercialTemplatesFrom({ x: { ...snapshot, templates: rows } }).map(t => t.slug))
      .toEqual([row.slug])
  })
})

describe('the committed snapshot', () => {
  it('lists at least one commercial template, each linking to the showroom', () => {
    expect(COMMERCIAL_TEMPLATES.length).toBeGreaterThan(0)
    for (const t of COMMERCIAL_TEMPLATES) {
      expect(t.detailUrl).toBe(`${snapshot.showroomUrl}/templates/${t.slug}`)
      expect(t.previewUrl).toBe(`${snapshot.showroomUrl}/preview/${t.slug}`)
      expect(t.licence).not.toBe('mit')
      expect(commercialTierLabel(t)).toMatch(/^Commercial/)
    }
  })

  it('carries no source path', () => {
    expect(JSON.stringify(snapshot)).not.toMatch(/"source"|packages\/templates-(core|pro)/)
  })

  it('never puts a commercial row into the free registry', () => {
    const free = new Set(TEMPLATES.map(t => t.slug))
    for (const t of COMMERCIAL_TEMPLATES)
      expect(free.has(t.slug), t.slug).toBe(false)
  })
})

describe('the landing sources', () => {
  it('never import dzup-templates code', () => {
    const files = (readdirSync(SRC, { recursive: true }) as string[])
      .filter(name => /\.(?:ts|vue)$/.test(name) && !name.endsWith('.spec.ts'))
    const offenders = files.filter((name) => {
      const source = readFileSync(resolve(SRC, name), 'utf8')
      return /from\s+['"]@dzup-templates\//.test(source) || /import\s*\(\s*['"]@dzup-templates\//.test(source)
    })
    expect(offenders).toEqual([])
  })
})
