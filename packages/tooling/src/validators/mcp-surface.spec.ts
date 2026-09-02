/**
 * Specs for the `@dzup-ui/mcp` surface validator (TASK-N2-A1).
 *
 * A gate nobody has watched fail is not a gate. Each clause here is driven with
 * a deliberately broken input so the failure mode — not just the green run — is
 * pinned, and the end-to-end case asserts the real repository is currently green
 * through the same code path CI would take.
 */

import type { Ceilings, Report, SurfaceLike } from './mcp-surface.ts'
import { describe, expect, it } from 'vitest'
import {
  checkEvidence,
  checkPackaging,
  checkRatchets,
  checkRegistryManifest,
  checkVersions,
  latestChangelogVersion,
  REQUIRED_CELLS,
  runChecks,
} from './mcp-surface.ts'

function report(): Report {
  return { errors: [], warnings: [], notes: [] }
}

function surface(over: Partial<SurfaceLike> = {}): SurfaceLike {
  return {
    version: '0.2.0',
    serverName: 'dzup-ui',
    totals: {},
    catalogVisibility: { unreachable: 43, unreachableSymbols: [] },
    tools: [
      {
        name: 'list_things',
        dataSource: { kind: 'generated-artifact', reads: ['/r/registry.json'] },
        cells: [
          { kind: 'contract-spec', state: 'pass' },
          { kind: 'unit-spec', state: 'present' },
          { kind: 'malformed-input', state: 'present' },
          { kind: 'data-source', state: 'pass' },
          { kind: 'protocol-roundtrip', state: 'present' },
          { kind: 'e2e-smoke', state: 'unrun' },
        ],
      },
    ],
    ...over,
  }
}

const CEILINGS: Ceilings = {
  catalogVisibilityUnreachable: { ceiling: 43 },
  toolsWithoutE2eSmoke: { ceiling: 1 },
}

const PKG = {
  name: '@dzup-ui/mcp',
  version: '0.2.0',
  homepage: 'https://dzup-ui.com',
  repository: { url: 'https://github.com/datazup/dzup-ui.git' },
  files: ['README.md', 'dist', 'server.json'],
  bin: { 'dzup-ui-mcp': './dist/index.js' },
  exports: { '.': { types: './dist/index.d.ts', import: './dist/index.js' } },
}

const SERVER = {
  name: 'io.github.datazup/mcp',
  version: '0.2.0',
  repository: { url: 'https://github.com/datazup/dzup-ui' },
  packages: [
    {
      identifier: '@dzup-ui/mcp',
      version: '0.2.0',
      environmentVariables: [{ name: 'DZUP_UI_REGISTRY_URL', default: 'https://dzup-ui.com' }],
    },
  ],
}

const REGISTRY_SRC = `export const DEFAULT_REGISTRY_URL = 'https://dzup-ui.com'\n`
const PUBLISHING = 'set it to io.github.datazup/mcp'
const CHANGELOG = '# @dzup-ui/mcp\n\n## 0.2.0\n\n### Minor Changes\n'

describe('latestChangelogVersion', () => {
  it('reads the newest release heading', () => {
    expect(latestChangelogVersion(CHANGELOG)).toBe('0.2.0')
    expect(latestChangelogVersion('# x\n\n## 1.2.3-beta.1\n')).toBe('1.2.3-beta.1')
  })

  it('returns null when there is no release heading', () => {
    expect(latestChangelogVersion('# @dzup-ui/mcp\n\nnothing yet\n')).toBeNull()
  })
})

describe('checkVersions', () => {
  it('passes when every copy agrees', () => {
    const r = report()
    checkVersions(PKG, SERVER, CHANGELOG, surface(), r)
    expect(r.errors).toEqual([])
  })

  it('fails on the exact drift this task found — server.json left at 0.1.0', () => {
    const r = report()
    const stale = { ...SERVER, version: '0.1.0', packages: [{ ...SERVER.packages[0]!, version: '0.1.0' }] }
    checkVersions(PKG, stale, CHANGELOG, surface(), r)
    expect(r.errors).toHaveLength(2)
    expect(r.errors[0]).toContain('server.json#version')
    expect(r.errors[1]).toContain('packages[0].version')
  })

  it('fails when the server reports a version the package does not ship', () => {
    const r = report()
    checkVersions(PKG, SERVER, CHANGELOG, surface({ version: '0.1.0' }), r)
    expect(r.errors.join('\n')).toContain('what the server reports over MCP')
  })

  it('fails when the CHANGELOG has not been versioned', () => {
    const r = report()
    checkVersions(PKG, SERVER, '# @dzup-ui/mcp\n\n## 0.1.0\n', surface(), r)
    expect(r.errors.join('\n')).toContain('CHANGELOG.md')
  })
})

describe('checkRegistryManifest', () => {
  it('passes on the shipped manifest', () => {
    const r = report()
    checkRegistryManifest(PKG, SERVER, REGISTRY_SRC, PUBLISHING, r)
    expect(r.errors).toEqual([])
  })

  it('fails when the registry entry points at another npm package', () => {
    const r = report()
    const wrong = { ...SERVER, packages: [{ ...SERVER.packages[0]!, identifier: '@someone/else' }] }
    checkRegistryManifest(PKG, wrong, REGISTRY_SRC, PUBLISHING, r)
    expect(r.errors.join('\n')).toContain('different npm package')
  })

  it('fails when the advertised env-var default is not the source default', () => {
    const r = report()
    checkRegistryManifest(
      PKG,
      SERVER,
      `export const DEFAULT_REGISTRY_URL = 'https://staging.dzup-ui.com'\n`,
      PUBLISHING,
      r,
    )
    expect(r.errors.join('\n')).toContain('advertises DZUP_UI_REGISTRY_URL default')
  })

  it('fails when the two repository URLs disagree', () => {
    const r = report()
    checkRegistryManifest(
      PKG,
      { ...SERVER, repository: { url: 'https://github.com/other/repo' } },
      REGISTRY_SRC,
      PUBLISHING,
      r,
    )
    expect(r.errors.join('\n')).toContain('different repositories')
  })

  it('fails when PUBLISHING.md documents a namespace server.json no longer uses', () => {
    const r = report()
    checkRegistryManifest(PKG, SERVER, REGISTRY_SRC, 'set it to io.github.dzup-ui/mcp', r)
    expect(r.errors.join('\n')).toContain('never mentions the namespace')
  })
})

describe('checkEvidence', () => {
  it('passes when every required cell is filled', () => {
    const r = report()
    checkEvidence(surface(), r)
    expect(r.errors).toEqual([])
  })

  it.each(REQUIRED_CELLS)('fails when %s is unrun', (kind) => {
    const s = surface()
    s.tools[0]!.cells = s.tools[0]!.cells.map(c => (c.kind === kind ? { ...c, state: 'unrun' } : c))
    const r = report()
    checkEvidence(s, r)
    expect(r.errors.join('\n')).toContain(`\`${kind}\` is unrun`)
  })

  it('fails a tool that answered without reading the catalog', () => {
    const s = surface()
    s.tools[0]!.dataSource = { kind: 'none', reads: [] }
    const r = report()
    checkEvidence(s, r)
    expect(r.errors.join('\n')).toContain('second source of truth')
  })

  it('fails an empty surface rather than reporting nothing to check', () => {
    const r = report()
    checkEvidence(surface({ tools: [] }), r)
    expect(r.errors.join('\n')).toContain('no tools at all')
  })
})

describe('checkPackaging', () => {
  it('passes on the shipped package.json', () => {
    const r = report()
    checkPackaging(PKG, r)
    expect(r.errors).toEqual([])
  })

  it('fails when the bin target is not in files', () => {
    const r = report()
    checkPackaging({ ...PKG, files: ['README.md', 'server.json'] }, r)
    expect(r.errors.join('\n')).toContain('does not ship')
  })

  it('fails when server.json would not reach the tarball', () => {
    const r = report()
    checkPackaging({ ...PKG, files: ['README.md', 'dist'] }, r)
    expect(r.errors.join('\n')).toContain('does not ship server.json')
  })

  it('fails on a README link to a real file `files` does not ship', () => {
    const r = report()
    checkPackaging(PKG, r, 'see [the surface](./docs/mcp-tool-surface.json)')
    expect(r.errors.join('\n')).toContain('`files` does not ship')
  })

  it('fails on a README link to a file that does not exist', () => {
    const r = report()
    checkPackaging({ ...PKG, files: [...PKG.files, 'docs'] }, r, 'see [nope](./docs/nope.json)')
    expect(r.errors.join('\n')).toContain('does not exist')
  })

  it('warns — rather than fails — on a link that leaves the package', () => {
    const r = report()
    checkPackaging(PKG, r, 'see [design](../../DESIGN.md)')
    expect(r.errors).toEqual([])
    expect(r.warnings.join('\n')).toContain('404s on the npm page')
  })
})

describe('checkRatchets', () => {
  it('passes exactly at the ceiling', () => {
    const r = report()
    checkRatchets(surface(), CEILINGS, r)
    expect(r.errors).toEqual([])
  })

  it('fails when a component becomes unreachable', () => {
    const r = report()
    checkRatchets(
      surface({ catalogVisibility: { unreachable: 44, unreachableSymbols: ['DzNew'] } }),
      CEILINGS,
      r,
    )
    expect(r.errors.join('\n')).toContain('above the ceiling of 43')
  })

  it('fails — and says to lower the ceiling — when the gap closes', () => {
    const r = report()
    checkRatchets(
      surface({ catalogVisibility: { unreachable: 40, unreachableSymbols: [] } }),
      CEILINGS,
      r,
    )
    expect(r.errors.join('\n')).toContain('Lower `catalogVisibilityUnreachable.ceiling`')
  })

  it('ratchets smoke coverage in both directions too', () => {
    const up = report()
    checkRatchets(surface(), { ...CEILINGS, toolsWithoutE2eSmoke: { ceiling: 0 } }, up)
    expect(up.errors.join('\n')).toContain('above the ceiling of 0')

    const down = report()
    const covered = surface()
    covered.tools[0]!.cells = covered.tools[0]!.cells.map(c =>
      c.kind === 'e2e-smoke' ? { ...c, state: 'present' } : c,
    )
    checkRatchets(covered, CEILINGS, down)
    expect(down.errors.join('\n')).toContain('Lower the ceiling')
  })
})

describe('the real repository', () => {
  it('is green through the same path the CLI takes', () => {
    const r = runChecks()
    expect(r.errors).toEqual([])
  }, 60_000)
})
