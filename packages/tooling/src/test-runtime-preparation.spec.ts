import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

interface RootPackageJson {
  scripts?: Record<string, string>
}

const repositoryRoot = resolve(import.meta.dirname, '..', '..', '..')
const rootPackage = JSON.parse(
  readFileSync(resolve(repositoryRoot, 'package.json'), 'utf8'),
) as RootPackageJson

describe('aggregate test runtime preparation', () => {
  it('generates every ignored artifact consumed by the root test suite', () => {
    expect(rootPackage.scripts?.test).toBe(
      'yarn tokens:generate && yarn workspace @dzup-ui/landing build:counts && vitest run',
    )
  })
})
