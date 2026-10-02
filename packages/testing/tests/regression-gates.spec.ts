import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = resolve(import.meta.dirname, '../../..')
const scripts = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')).scripts as Record<string, string>

describe('clean-checkout regression gate wiring', () => {
  it('discovers pre-hydration CSP in normal tests and the documented SSR command', () => {
    expect(readFileSync(resolve(root, 'vitest.config.ts'), 'utf8')).toContain('e2e/csp/ssr.spec.ts')
    expect(scripts['test:ssr']).toContain('e2e/csp/ssr.spec.ts')
  })

  it('runs the isolated packed consumer and packed browser policy in blocking CI', () => {
    expect(scripts['test:resolution:packed']).toContain('packages/testing/tests/run-resolution-consumer.mjs')
    expect(scripts['test:csp:packed']).toContain('e2e/csp/packed-policy.mjs')
    const ci = readFileSync(resolve(root, '.github/workflows/ci.yml'), 'utf8')
    expect(ci).toContain('run: yarn test:resolution:packed')
    expect(ci).toContain('run: yarn test:csp:packed')
  })
})
