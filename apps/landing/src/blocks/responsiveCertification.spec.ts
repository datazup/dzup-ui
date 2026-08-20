/**
 * Responsive trust-mark integrity guard.
 *
 * Playwright supplies the real-layout proof; these fast assertions prevent the
 * test manifest, directions, declared mobile probes, visible badges, and CI
 * command from drifting apart between browser runs.
 */

import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { CERTIFICATIONS } from './certifications.ts'
import { BLOCKS } from './registry.ts'
import { CERTIFIED_DIRECTIONS, RESPONSIVE_PROBES, RESPONSIVE_VIEWPORTS } from './responsiveCertification.ts'

interface PublishedRegistryIndex {
  items: Array<{ name: string, type: string }>
}

interface RootPackageJson {
  scripts?: Record<string, string>
}

const repositoryRoot = existsSync(resolve(process.cwd(), '.github/workflows/ci.yml'))
  ? process.cwd()
  : resolve(process.cwd(), '../..')
const landingRoot = resolve(repositoryRoot, 'apps/landing')

const registry = JSON.parse(
  readFileSync(resolve(landingRoot, 'public/r/registry.json'), 'utf8'),
) as PublishedRegistryIndex

const publishedBlockIds = registry.items
  .filter(item => item.type === 'registry:block')
  .map(item => item.name)

const workflow = readFileSync(
  resolve(repositoryRoot, '.github/workflows/ci.yml'),
  'utf8',
)
const rootPackage = JSON.parse(
  readFileSync(resolve(repositoryRoot, 'package.json'), 'utf8'),
) as RootPackageJson

describe('responsive block certification', () => {
  it('drives the browser matrix from every live block id, in registry order', () => {
    expect(publishedBlockIds).toEqual(BLOCKS.map(block => block.id))
  })

  it('defines the exact mobile, tablet, and desktop viewport contract', () => {
    expect(RESPONSIVE_VIEWPORTS).toEqual([
      { id: 'mobile', label: 'Mobile', width: 390, height: 844 },
      { id: 'tablet', label: 'Tablet', width: 768, height: 1024 },
      { id: 'desktop', label: 'Desktop', width: 1280, height: 900 },
    ])
  })

  it('certifies both left-to-right and right-to-left rendering', () => {
    expect(CERTIFIED_DIRECTIONS).toEqual([
      { id: 'ltr', label: 'LTR' },
      { id: 'rtl', label: 'RTL' },
    ])
  })

  it('has one structural browser probe for every declared mobile variant', () => {
    const declared = BLOCKS
      .filter(block => block.responsive?.mobile)
      .map(block => block.id)
    expect(Object.keys(RESPONSIVE_PROBES)).toEqual(declared)
  })

  it('publishes the Responsive mark with the exact browser evidence it earns', () => {
    const responsive = CERTIFICATIONS.find(mark => mark.id === 'responsive')
    expect(responsive?.label).toBe('Responsive')
    for (const viewport of RESPONSIVE_VIEWPORTS)
      expect(responsive?.certifies).toContain(`${viewport.label} ${viewport.width}px`)
    expect(responsive?.certifies).toContain('horizontal overflow')
    expect(responsive?.certifies).toContain('mobile reflow')
    for (const direction of CERTIFIED_DIRECTIONS)
      expect(responsive?.certifies).toContain(direction.label)
  })

  it('publishes the RTL mark with the exact browser evidence it earns', () => {
    const rtl = CERTIFICATIONS.find(mark => mark.id === 'rtl')
    expect(rtl?.label).toBe('RTL')
    expect(rtl?.certifies).toContain('dir="rtl"')
    for (const viewport of RESPONSIVE_VIEWPORTS)
      expect(rtl?.certifies).toContain(`${viewport.label} ${viewport.width}px`)
    expect(rtl?.certifies).toContain('reaches block content')
    expect(rtl?.certifies).toContain('horizontal overflow')
  })

  it('runs the responsive browser certification with bounded fail-closed CI parallelism', () => {
    expect(rootPackage.scripts?.['test:responsive:landing:ci'])
      .toBe('yarn test:responsive:landing --workers=2 --fail-on-flaky-tests')
    expect(workflow).toContain('yarn test:responsive:landing:ci')
  })
})
