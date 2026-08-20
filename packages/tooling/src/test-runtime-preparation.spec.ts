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
  it('centralizes every ignored artifact consumed by root test entrypoints', () => {
    expect(rootPackage.scripts?.['test:prepare']).toBe(
      'yarn tokens:generate && yarn workspace @dzup-ui/landing build:counts',
    )
  })

  it.each(['test', 'test:coverage'])('%s runs the shared preparation before Vitest', (entrypoint) => {
    const command = rootPackage.scripts?.[entrypoint]
    expect(command, `missing root ${entrypoint} script`).toBeDefined()
    expect(command).toMatch(/^yarn test:prepare && vitest run(?:\s|$)/)
  })
})
