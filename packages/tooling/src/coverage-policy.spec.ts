import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const repositoryRoot = resolve(import.meta.dirname, '..', '..', '..')
const vitestConfig = readFileSync(resolve(repositoryRoot, 'vitest.config.ts'), 'utf8')
const ciWorkflow = readFileSync(resolve(repositoryRoot, '.github/workflows/ci.yml'), 'utf8')

describe('coverage policy custody', () => {
  it('covers the active landing app without reviving the retired sandbox', () => {
    expect(vitestConfig).toContain('\'apps/landing/src/**/*.{ts,vue}\'')
    expect(vitestConfig).toContain('\'packages/*/src/**\':')
    expect(vitestConfig).toContain('\'apps/landing/src/**\':')
    expect(vitestConfig).not.toContain('\'apps/*/src/**/*.{ts,vue}\'')
  })

  it('keeps threshold ownership in Vitest instead of replacing its scoped ratchet', () => {
    const coverageStep = ciWorkflow
      .split('- name: Run coverage with threshold enforcement', 2)[1]
      ?.split('- name: Upload coverage', 1)[0]

    expect(coverageStep).toContain('run: yarn test:coverage')
    expect(coverageStep).not.toContain('--coverage.thresholds')
  })
})
