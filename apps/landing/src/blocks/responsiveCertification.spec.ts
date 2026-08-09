/**
 * Responsive trust-mark integrity guard.
 *
 * Playwright supplies the real-layout proof; these fast assertions prevent the
 * test manifest, declared mobile probes, visible badge, and CI command from
 * drifting apart between browser runs.
 */

import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { CERTIFICATIONS } from './certifications.ts'
import { BLOCKS } from './registry.ts'
import { RESPONSIVE_PROBES, RESPONSIVE_VIEWPORTS } from './responsiveCertification.ts'

interface PublishedRegistryIndex {
  items: Array<{ name: string, type: string }>
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
  })

  it('runs the responsive browser certification in CI', () => {
    expect(workflow).toContain('yarn test:responsive:landing')
  })
})
