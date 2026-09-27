/**
 * Unit cover for the release evidence tools (TASK-R1-O3).
 *
 * The end-to-end proof of these tools is the bundle they write
 * (`docs/qa/release/<date>-<sha>/`), and producing it packs six tarballs and
 * runs two TypeScript programs — not something a unit suite should do on every
 * save. What IS worth pinning here is everything that decides *what a number
 * means*: the 0.x level mapping, the classification of a change as breaking or
 * additive, the stop conditions, and — above all — the several places where the
 * honest answer is "not run" and a comfortable zero would be a lie.
 *
 * Three of the cases below exist because the first version of this code got
 * them wrong, and the wrong answers were all quiet: a capped dirty count, a
 * first path missing its first character, and a surface in which every
 * signature had collapsed to `any` while the compiler reported nothing.
 */

import type { PackageSurface, SurfaceSymbol } from './api-surface.ts'
import { Buffer } from 'node:buffer'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import {
  barrelDrift,
  declaredLevels,
  diffSurfaces,
  isWidening,
  levelFor,
  manifestNames,
  maxLevel,
  reconcileWithManifest,
  stopConditions,
} from './api-diff.ts'
import { ANY_SIGNATURE_CEILING, normaliseSignature } from './api-surface.ts'
import { parsePorcelainZ } from './binding.ts'
import {
  advisoryRows,
  buildProvenance,
  buildSbom,
  classifyRow,
  digestsOf,
  fetchAdvisories,
  licenceEntry,
  purl,
  unresolvedProtocols,
} from './evidence.ts'
import { releasePolicy } from './pack.ts'
import { atCounts, readJsonl, renderReport } from './report.ts'

const scratches: string[] = []
function scratch(): string {
  const dir = mkdtempSync(join(tmpdir(), 'dzup-release-spec-'))
  scratches.push(dir)
  return dir
}
afterEach(() => {
  while (scratches.length > 0)
    rmSync(scratches.pop() as string, { recursive: true, force: true })
})

function symbol(partial: Partial<SurfaceSymbol> & { name: string }): SurfaceSymbol {
  return {
    kind: 'const',
    subpaths: ['.'],
    signature: '',
    source: 'dist/index.d.ts',
    ...partial,
  }
}

function surface(symbols: SurfaceSymbol[]): PackageSurface {
  return {
    package: '@dzup-ui/core',
    version: '0.2.0',
    surfaceSchema: 1,
    degraded: false,
    degradedReason: null,
    resolutionErrors: [],
    anySignatures: 0,
    entryPoints: ['.'],
    symbols,
  }
}

// ── binding ──────────────────────────────────────────────────────────────────

describe('parsePorcelainZ', () => {
  it('keeps the first character of the first path', () => {
    // Pro's source-binding.mjs trimmed the whole status block before splitting,
    // so every artifact in that repository records `gitignore` for `.gitignore`
    // and `LAUDE.md` for `CLAUDE.md`. This is that defect, pinned.
    const entries = parsePorcelainZ(' M .gitignore\0 M CLAUDE.md\0')
    expect(entries.map(e => e.path)).toEqual(['.gitignore', 'CLAUDE.md'])
  })

  it('handles a path containing spaces', () => {
    const entries = parsePorcelainZ('?? docs/a file with spaces.md\0')
    expect(entries[0]?.path).toBe('docs/a file with spaces.md')
  })

  it('records the NEW path of a rename and consumes the old one', () => {
    const entries = parsePorcelainZ('R  new/name.ts\0old/name.ts\0 M other.ts\0')
    expect(entries.map(e => e.path)).toEqual(['new/name.ts', 'other.ts'])
  })

  it('returns an empty list for a clean tree', () => {
    expect(parsePorcelainZ('')).toEqual([])
  })

  it('sorts by path so two runs of the same tree agree', () => {
    const entries = parsePorcelainZ('?? z.ts\0?? a.ts\0')
    expect(entries.map(e => e.path)).toEqual(['a.ts', 'z.ts'])
  })
})

// ── the 0.x level mapping ────────────────────────────────────────────────────

describe('levelFor — VERSIONING.md §1, and NOT the 1.x mapping', () => {
  it('maps a breaking change to `minor`, not `major`', () => {
    // ^0.2.0 resolves to >=0.2.0 <0.3.0, so the minor position is the only one
    // a caret range protects while the packages are 0.x. Pro's api-diff maps
    // breaking -> major; that changeset is refused by validate:release-policy.
    expect(levelFor('breaking')).toBe('minor')
  })

  it('maps an additive change to `patch`', () => {
    expect(levelFor('additive')).toBe('patch')
  })

  it('never produces `major`, which allowMajor: false forbids', () => {
    const produced = new Set((['breaking', 'additive', 'none'] as const).map(levelFor))
    expect(produced.has('major' as never)).toBe(false)
  })

  it('orders levels so minor outranks patch outranks none', () => {
    expect(maxLevel('patch', 'minor')).toBe('minor')
    expect(maxLevel('none', 'patch')).toBe('patch')
    expect(maxLevel('none', 'none')).toBe('none')
  })
})

describe('isWidening', () => {
  it('calls an added OPTIONAL member additive', () => {
    expect(isWidening(['a: string'], ['a: string', 'b?: number'])).toBe(true)
  })

  it('calls an added REQUIRED member breaking', () => {
    expect(isWidening(['a: string'], ['a: string', 'b: number'])).toBe(false)
  })

  it('calls any removal breaking', () => {
    expect(isWidening(['a: string', 'b?: number'], ['a: string'])).toBe(false)
  })

  it('calls a retype breaking', () => {
    expect(isWidening(['a: string'], ['a: number'])).toBe(false)
  })
})

// ── diffSurfaces ─────────────────────────────────────────────────────────────

describe('diffSurfaces', () => {
  it('classifies a removal as breaking and requires a `minor`', () => {
    const diff = diffSurfaces(
      { symbols: [symbol({ name: 'useGone', kind: 'function' })] },
      surface([]),
      'snapshot',
      'seed',
    )
    expect(diff.changes).toHaveLength(1)
    expect(diff.changes[0]).toMatchObject({ kind: 'removed', severity: 'breaking', level: 'minor' })
    expect(diff.requiredLevel).toBe('minor')
  })

  it('classifies an addition as additive and requires only a `patch`', () => {
    const diff = diffSurfaces({ symbols: [] }, surface([symbol({ name: 'useNew', kind: 'function' })]), 'snapshot', 'seed')
    expect(diff.changes[0]).toMatchObject({ kind: 'added', severity: 'additive', level: 'patch' })
    expect(diff.requiredLevel).toBe('patch')
  })

  it('pairs an identical signature under a new name as a rename, not removal + addition', () => {
    const before = [symbol({ name: 'useOld', kind: 'function', signature: '(a: string) => void' })]
    const after = surface([symbol({ name: 'useNew', kind: 'function', signature: '(a: string) => void' })])
    const diff = diffSurfaces({ symbols: before }, after, 'snapshot', 'seed')
    expect(diff.changes).toHaveLength(1)
    expect(diff.changes[0]?.kind).toBe('renamed')
    expect(diff.changes[0]?.severity).toBe('breaking')
  })

  it('does not attempt rename pairing at manifest fidelity', () => {
    // A manifest records names only, so a rename is indistinguishable from a
    // removal plus an addition. Reporting it as a rename would be a guess
    // presented as a fact.
    const before = [symbol({ name: 'useOld', signature: '' })]
    const after = surface([symbol({ name: 'useNew', signature: '' })])
    const diff = diffSurfaces({ symbols: before }, after, 'manifest-only', 'manifest')
    expect(diff.changes.map(c => c.kind).sort()).toEqual(['added', 'removed'])
  })

  it('treats an added optional PROP as additive but any $emits change as breaking', () => {
    const before = [symbol({
      name: 'DzThing',
      kind: 'component',
      signature: 'props(1) emits(1) slots(0)',
      props: ['a: string'],
      emits: ['(event: "x"): void'],
      slots: [],
    })]
    const after = surface([symbol({
      name: 'DzThing',
      kind: 'component',
      signature: 'props(2) emits(2) slots(0)',
      props: ['a: string', 'b?: number'],
      emits: ['(event: "x"): void', '(event: "y"): void'],
      slots: [],
    })])
    const diff = diffSurfaces({ symbols: before }, after, 'snapshot', 'seed')
    const props = diff.changes.find(c => c.symbol.endsWith('$props'))
    const emits = diff.changes.find(c => c.symbol.endsWith('$emits'))
    expect(props?.severity).toBe('additive')
    // VERSIONING.md §2.1 names widening a type the library hands OUT as breaking.
    expect(emits?.severity).toBe('breaking')
    expect(diff.requiredLevel).toBe('minor')
  })

  it('reports an unbaselined package rather than calling every symbol "added"', () => {
    const diff = diffSurfaces({ symbols: [] }, surface([symbol({ name: 'a' }), symbol({ name: 'b' })]), 'none', 'nothing')
    expect(diff.changes).toHaveLength(1)
    expect(diff.changes[0]?.kind).toBe('unbaselined')
    expect(diff.changes[0]?.severity).toBe('none')
    expect(diff.requiredLevel).toBe('none')
  })

  it('at manifest fidelity counts non-root symbols as beyond the baseline, not as additions', () => {
    const after = surface([
      symbol({ name: 'atRoot', subpaths: ['.'] }),
      symbol({ name: 'onlySubpath', subpaths: ['./forms'] }),
    ])
    const diff = diffSurfaces({ symbols: [symbol({ name: 'atRoot' })] }, after, 'manifest-only', 'manifest')
    expect(diff.changes).toHaveLength(0)
    expect(diff.beyondBaseline.map(s => s.name)).toEqual(['onlySubpath'])
  })
})

// ── changesets and stop conditions ───────────────────────────────────────────

describe('declaredLevels', () => {
  it('takes the strongest level per package and separates `major` offenders', () => {
    const dir = scratch()
    writeFileSync(join(dir, 'a.md'), '---\n\'@dzup-ui/core\': patch\n---\n\nsomething\n')
    writeFileSync(join(dir, 'b.md'), '---\n\'@dzup-ui/core\': minor\n\'@dzup-ui/tokens\': patch\n---\n\nelse\n')
    writeFileSync(join(dir, 'c.md'), '---\n\'@dzup-ui/core\': major\n---\n\nrefused\n')
    writeFileSync(join(dir, 'README.md'), 'not a changeset\n')

    const levels = declaredLevels(dir)
    expect(levels.byPackage.get('@dzup-ui/core')).toBe('minor')
    expect(levels.byPackage.get('@dzup-ui/tokens')).toBe('patch')
    expect(levels.majorOffenders).toEqual([{ file: 'c.md', package: '@dzup-ui/core' }])
    expect(levels.total).toBe(3)
  })

  it('returns an empty result for a directory that does not exist', () => {
    const levels = declaredLevels(join(scratch(), 'nope'))
    expect(levels.total).toBe(0)
    expect(levels.byPackage.size).toBe(0)
  })
})

describe('stopConditions', () => {
  const clean = {
    sourceCommit: 'abc1234',
    shortCommit: 'abc1234',
    branch: 'main',
    dirty: false,
    dirtyCount: 0,
    dirtyFiles: [],
    admissible: true,
    inadmissibleReason: null,
    upstream: null,
  }

  it('reports a dirty tree, which is doc 08\'s first stop condition', () => {
    const stops = stopConditions([], [], [], declaredLevels(join(scratch(), 'none')), {
      ...clean,
      dirty: true,
      dirtyCount: 218,
      admissible: false,
      inadmissibleReason: 'worktree dirty: 218 path(s) differ from abc1234',
    })
    expect(stops.map(s => s.code)).toContain('dirty-source')
  })

  it('reports a removal no changeset explains', () => {
    const diff = diffSurfaces(
      { symbols: [symbol({ name: 'useGone', kind: 'function' })] },
      surface([]),
      'snapshot',
      'seed',
    )
    const stops = stopConditions([diff], [], [], declaredLevels(join(scratch(), 'none')), clean)
    const unexplained = stops.find(s => s.code === 'unexplained-api-diff')
    expect(unexplained).toBeDefined()
    expect(unexplained?.detail).toContain('require a `minor` changeset')
  })

  it('does NOT report a removal a `minor` changeset covers', () => {
    const dir = scratch()
    writeFileSync(join(dir, 'a.md'), '---\n\'@dzup-ui/core\': minor\n---\n\nremoves useGone\n')
    const diff = diffSurfaces(
      { symbols: [symbol({ name: 'useGone', kind: 'function' })] },
      surface([]),
      'snapshot',
      'seed',
    )
    const stops = stopConditions([diff], [], [], declaredLevels(dir), clean)
    expect(stops.filter(s => s.code === 'unexplained-api-diff')).toHaveLength(0)
  })

  it('treats a `patch` changeset as insufficient for a breaking change', () => {
    const dir = scratch()
    writeFileSync(join(dir, 'a.md'), '---\n\'@dzup-ui/core\': patch\n---\n\nnot enough\n')
    const diff = diffSurfaces(
      { symbols: [symbol({ name: 'useGone', kind: 'function' })] },
      surface([]),
      'snapshot',
      'seed',
    )
    expect(stopConditions([diff], [], [], declaredLevels(dir), clean).map(s => s.code))
      .toContain('unexplained-api-diff')
  })

  it('reports barrel lines `generate:exports` would drop as an unexplained diff', () => {
    const drift = {
      package: '@dzup-ui/core',
      packageDir: 'packages/core',
      clean: false,
      wouldDrop: ['export * from \'./composables/useAffix/index.ts\''],
      wouldAdd: [],
    }
    const stops = stopConditions([], [], [drift], declaredLevels(join(scratch(), 'none')), clean)
    expect(stops[0]?.code).toBe('unexplained-api-diff')
    expect(stops[0]?.detail).toContain('useAffix')
  })

  it('says nothing about a barrel that is already in sync', () => {
    const stops = stopConditions([], [], [{
      package: '@dzup-ui/core',
      packageDir: 'packages/core',
      clean: true,
      wouldDrop: [],
      wouldAdd: [],
    }], declaredLevels(join(scratch(), 'none')), clean)
    expect(stops).toHaveLength(0)
  })
})

// ── manifest reconciliation ──────────────────────────────────────────────────

describe('manifestNames / reconcileWithManifest', () => {
  const manifest = {
    version: '0.0.1',
    exports: {
      components: { buttons: { path: './src/components/buttons/index.ts', exports: ['DzButton'] } },
      composables: { a: { path: './src/composables/a/index.ts', exports: ['useA'] } },
      utilities: { cn: { path: './src/utilities/cn.ts', exports: ['cn'] } },
      injectionKeys: ['DZ_KEY'],
      variants: ['buttonVariants'],
      types: ['DzButtonProps'],
    },
  }

  it('collects every name from every group', () => {
    expect([...manifestNames(manifest)].sort())
      .toEqual(['DZ_KEY', 'DzButton', 'DzButtonProps', 'buttonVariants', 'cn', 'useA'])
  })

  it('separates exported-and-undocumented from documented-and-undelivered', () => {
    const packed = surface([
      symbol({ name: 'DzButton', kind: 'component' }),
      symbol({ name: 'useUndocumented', kind: 'function' }),
      symbol({ name: 'notAtRoot', subpaths: ['./forms'] }),
    ])
    const rec = reconcileWithManifest(packed, manifest)
    expect(rec.undocumented.map(s => s.name)).toEqual(['useUndocumented'])
    expect(rec.undelivered).toContain('useA')
    // A symbol reachable only through a subpath is not compared: the manifest
    // describes the ROOT barrel, and diffing units that do not match is how
    // hundreds of phantom findings get reported.
    expect(rec.undocumented.map(s => s.name)).not.toContain('notAtRoot')
  })
})

describe('barrelDrift', () => {
  it('measures the real repository without writing to it', () => {
    const drift = barrelDrift('packages/core')
    expect(drift.package).toBe('@dzup-ui/core')
    // Whatever the drift is today, every reported line must be an export line.
    for (const line of [...drift.wouldDrop, ...drift.wouldAdd])
      expect(line.startsWith('export ')).toBe(true)
    expect(drift.clean).toBe(drift.wouldDrop.length === 0 && drift.wouldAdd.length === 0)
  })
})

// ── supply chain ─────────────────────────────────────────────────────────────

describe('purl and licenceEntry', () => {
  it('percent-encodes a scope, as CycloneDX requires', () => {
    expect(purl('@dzup-ui/core', '0.2.0')).toBe('pkg:npm/%40dzup-ui/core@0.2.0')
    expect(purl('vue', null)).toBe('pkg:npm/vue')
  })

  it('emits an SPDX `id` for a known licence and a `name` for anything else', () => {
    expect(licenceEntry('MIT')).toEqual([{ license: { id: 'MIT' } }])
    expect(licenceEntry('(MIT OR Apache-2.0)')).toEqual([{ license: { name: '(MIT OR Apache-2.0)' } }])
    expect(licenceEntry(undefined)).toEqual([{ license: { name: 'UNKNOWN' } }])
  })
})

describe('classifyRow', () => {
  it('marks a first-party package rather than auditing it against the policy', () => {
    const row = classifyRow({ name: '@dzup-ui/contracts', version: '0.1.0', licence: 'MIT' }, 'bundled-dependency', [])
    expect(row.verdict).toBe('first-party')
  })

  it('distinguishes an unread licence from an unacceptable one', () => {
    const notInstalled = classifyRow({ name: 'x', version: null, licence: 'NOT INSTALLED' }, 'optional-peer', [])
    expect(notInstalled.verdict).toBe('unknown')
    expect(notInstalled.reason).toContain('not installed')

    const blocked = classifyRow({ name: 'y', version: '1.0.0', licence: 'AGPL-3.0' }, 'bundled-dependency', [])
    expect(blocked.verdict).toBe('blocked')
  })

  it('applies an owned exception and carries the owner into the reason', () => {
    const row = classifyRow({ name: 'y', version: '1.0.0', licence: 'AGPL-3.0' }, 'bundled-dependency', [
      { package: 'y', licence: 'AGPL-3.0', owner: 'esmir', reason: 'build-time only', expires: null },
    ])
    expect(row.verdict).toBe('excepted')
    expect(row.reason).toContain('esmir')
  })

  it('allows a permissive licence', () => {
    expect(classifyRow({ name: 'clsx', version: '2.1.1', licence: 'MIT' }, 'bundled-dependency', []).verdict).toBe('allowed')
  })
})

describe('unresolvedProtocols', () => {
  it('finds a yarn local protocol left in a packed manifest', () => {
    // The thing CI's pack smoke test believes it checks and structurally cannot:
    // `npm pack --dry-run` prints a FILE LIST, so its grep never matched.
    expect(unresolvedProtocols({ dependencies: { '@dzup-ui/contracts': 'workspace:*' } }))
      .toEqual(['dependencies.@dzup-ui/contracts = "workspace:*"'])
  })

  it('accepts a resolved semver range', () => {
    expect(unresolvedProtocols({ dependencies: { '@dzup-ui/contracts': '0.1.0' } })).toEqual([])
  })

  it('checks peer and optional blocks too', () => {
    expect(unresolvedProtocols({ peerDependencies: { x: 'link:../x' } })).toHaveLength(1)
  })
})

describe('fetchAdvisories', () => {
  const closure = [{ name: 'lodash', version: '4.17.15', licence: 'MIT', resolved: true, depth: 1, dependencies: [], licenceFile: true }]

  it('records `not-run` with a reason when the network is off — never a zero', () => {
    return fetchAdvisories(closure, { network: false }).then((result) => {
      expect(result.status).toBe('not-run')
      expect(result.reason).toBeTruthy()
      expect(result.queriedAt).toBeNull()
    })
  })

  it('distinguishes "no dependencies at all" from "nothing resolved"', async () => {
    const none = await fetchAdvisories([], {})
    expect(none.reason).toContain('no runtime dependencies')

    const unresolved = await fetchAdvisories(
      [{ name: 'x', version: null, licence: 'UNKNOWN', resolved: false, depth: 1, dependencies: [], licenceFile: false }],
      {},
    )
    expect(unresolved.reason).toContain('none of its 1 declared dependencies resolved')
  })

  it('records `not-run` with the status code when the endpoint refuses', async () => {
    const result = await fetchAdvisories(closure, {
      fetchImpl: (async () => ({ ok: false, status: 503 })) as unknown as typeof globalThis.fetch,
    })
    expect(result.status).toBe('not-run')
    expect(result.reason).toContain('503')
  })

  it('records `not-run` with the error when the endpoint is unreachable', async () => {
    const result = await fetchAdvisories(closure, {
      fetchImpl: (async () => { throw new Error('ENOTFOUND') }) as unknown as typeof globalThis.fetch,
    })
    expect(result.status).toBe('not-run')
    expect(result.reason).toContain('ENOTFOUND')
  })

  it('queries by EXACT resolved version, not by a range', async () => {
    let sent: string | undefined
    await fetchAdvisories(closure, {
      fetchImpl: (async (_url: string, init: { body: string }) => {
        sent = init.body
        return { ok: true, status: 200, json: async () => ({}) }
      }) as unknown as typeof globalThis.fetch,
    })
    expect(JSON.parse(sent as string)).toEqual({ lodash: ['4.17.15'] })
  })
})

describe('advisoryRows', () => {
  it('sorts worst-first', () => {
    const rows = advisoryRows({
      a: [{ id: 1, severity: 'moderate', title: 'm', url: '', vulnerable_versions: '<1' }],
      b: [{ id: 2, severity: 'critical', title: 'c', url: '', vulnerable_versions: '<1' }],
      c: [{ id: 3, severity: 'low', title: 'l', url: '', vulnerable_versions: '<1' }],
    })
    expect(rows.map(r => r.severity)).toEqual(['critical', 'moderate', 'low'])
  })

  it('returns nothing for an empty advisory set', () => {
    expect(advisoryRows({})).toEqual([])
  })
})

describe('digestsOf', () => {
  it('hashes with both algorithms, because consumers pin with different ones', () => {
    const d = digestsOf(Buffer.from('dzup'))
    expect(d.sha256).toMatch(/^[0-9a-f]{64}$/)
    expect(d.sha512.length).toBeGreaterThan(80)
  })
})

describe('buildSbom', () => {
  const artifact = { file: 'dzup-ui-core-0.2.0.tgz', bytes: 123, sha256: 'a'.repeat(64), sha512: 'b'.repeat(88) }
  const binding = {
    sourceCommit: 'abc1234',
    shortCommit: 'abc1234',
    branch: 'main',
    dirty: true,
    dirtyCount: 218,
    dirtyFiles: [],
    admissible: false,
    inadmissibleReason: 'dirty',
    upstream: null,
  }
  const sbom = buildSbom({
    artifact,
    manifest: { name: '@dzup-ui/core', version: '0.2.0', license: 'MIT' },
    closure: [{ name: 'clsx', version: '2.1.1', licence: 'MIT', resolved: true, depth: 1, dependencies: [], licenceFile: true }],
    peers: [{ name: 'vue', range: '^3.5.0', optional: false, observedVersion: '3.5.31', installed: true, licence: 'MIT' }],
    generatedAt: '2026-09-21T00:00:00.000Z',
    binding,
    toolVersion: '0.0.1',
  })

  it('is valid CycloneDX 1.6 with the TARBALL as its root component', () => {
    expect(sbom.bomFormat).toBe('CycloneDX')
    expect(sbom.specVersion).toBe('1.6')
    const root = (sbom.metadata as { component: { name: string, hashes: Array<{ alg: string, content: string }> } }).component
    expect(root.name).toBe('@dzup-ui/core')
    expect(root.hashes.map(h => h.alg)).toEqual(['SHA-256', 'SHA-512'])
  })

  it('carries no `serialNumber`, so two SBOMs of identical bytes compare equal', () => {
    expect('serialNumber' in sbom).toBe(false)
  })

  it('records admissibility on the root component rather than only in prose', () => {
    const props = (sbom.metadata as { component: { properties: Array<{ name: string, value: string }> } }).component.properties
    expect(props.find(p => p.name === 'dzup:admissible')?.value).toBe('false')
  })

  it('marks an optional peer `optional`, so a reader can tell "must install" from "unlocks"', () => {
    const withOptional = buildSbom({
      artifact,
      manifest: { name: '@dzup-ui/core', version: '0.2.0' },
      closure: [],
      peers: [{ name: 'x', range: '^1', optional: true, observedVersion: null, installed: false, licence: 'NOT INSTALLED' }],
      generatedAt: '2026-09-21T00:00:00.000Z',
      binding,
      toolVersion: '0.0.1',
    })
    expect(withOptional.components[0]?.scope).toBe('optional')
  })
})

describe('buildProvenance', () => {
  const statement = buildProvenance({
    artifact: { file: 'x.tgz', bytes: 1, sha256: 'a', sha512: 'b' },
    manifest: { name: '@dzup-ui/core', version: '0.2.0' },
    binding: {
      sourceCommit: 'abc1234',
      shortCommit: 'abc1234',
      branch: 'main',
      dirty: true,
      dirtyCount: 218,
      dirtyFiles: [],
      admissible: false,
      inadmissibleReason: 'dirty',
      upstream: null,
    },
    toolchain: { node: 'v24' },
    generatedAt: '2026-09-21T00:00:00.000Z',
    entries: 10,
  })

  it('says it is unsigned in a field, not only in a comment', () => {
    expect((statement._signature as { signed: boolean }).signed).toBe(false)
  })

  it('says trusted publishing was never exercised', () => {
    expect((statement._trustedPublishing as { exercised: boolean }).exercised).toBe(false)
  })

  it('records the TRUE dirty count, uncapped', () => {
    const deps = (statement.predicate as { buildDefinition: { resolvedDependencies: Array<{ annotations: { dirtyPathCount: number } }> } })
      .buildDefinition
      .resolvedDependencies
    // Pro capped this at 50 and reported the cap as the truth, which made three
    // distinguishable trees look identical in the one field meant to tell them
    // apart (its finding E-1).
    expect(deps[0]?.annotations.dirtyPathCount).toBe(218)
  })
})

// ── report ───────────────────────────────────────────────────────────────────

describe('readJsonl', () => {
  it('returns an empty list when the ledger does not exist', () => {
    expect(readJsonl(join(scratch(), 'results.jsonl'))).toEqual([])
  })

  it('parses one row per line and ignores blank lines', () => {
    const file = join(scratch(), 'results.jsonl')
    writeFileSync(file, '{"n":1,"name":"a","command":"yarn a","exit":0,"seconds":3,"log":"01-a.txt","startedAt":"t"}\n\n')
    expect(readJsonl(file)).toHaveLength(1)
  })
})

describe('atCounts', () => {
  it('counts an unrun cell as unexecuted rather than as a pass', () => {
    const counts = atCounts({
      pairs: [],
      entries: [{ component: 'DzX', tier: 'B', rows: [{ result: 'unrun' }, { result: 'pass' }, { result: 'fail' }] }],
    })
    expect(counts.cells).toBe(3)
    expect(counts.executed).toBe(2)
    expect(counts.byResult).toEqual({ unrun: 1, pass: 1, fail: 1 })
  })

  it('returns zeroes, not a guess, when the index is absent', () => {
    expect(atCounts(null)).toEqual({ cells: 0, executed: 0, byResult: {} })
  })
})

describe('renderReport', () => {
  const base = {
    binding: {
      sourceCommit: 'abc1234def',
      shortCommit: 'abc1234',
      branch: 'main',
      dirty: true,
      dirtyCount: 218,
      dirtyFiles: [],
      admissible: false,
      inadmissibleReason: 'worktree dirty: 218 path(s)',
      upstream: null,
    },
    bundle: '2026-09-21-abc1234',
    gates: [],
    apiDiff: null,
    supplyChain: null,
    hashes: null,
    experience: {
      capability: null,
      quality: null,
      at: null,
      browser: null,
      wcag: null,
      perf: null,
      security: null,
      securityDeviations: null,
      visual: null,
    },
    digest: { digest: 'f'.repeat(64), fileCount: 10, bytes: 100, files: [] },
    chainLinks: 48,
    versions: {},
    tags: [],
  }

  it('renders all eight sections doc 08 §Required release report names', () => {
    const markdown = renderReport(base)
    for (const heading of [
      '## 1. Implemented scope and source commit',
      '## 2. Focused validation',
      '## 3. Aggregate repository qualification',
      '## 4. Browser / AT / security / performance experience qualification',
      '## 5. Packed-artifact qualification',
      '## 6. Downstream canary / adoption evidence',
      '## 7. Publication / production authority and actual operation status',
      '## 8. Known gaps, accepted exceptions, rollback, ranked next work',
    ])
      expect(markdown).toContain(heading)
  })

  it('reports an absent gate ledger as UNRUN, never as green', () => {
    const markdown = renderReport(base)
    expect(markdown).toContain('**No gate record.**')
    expect(markdown).toContain('*unrun*, not green')
  })

  it('states the true dirty count and admissibility in section 1', () => {
    const markdown = renderReport(base)
    expect(markdown).toContain('**218 entries**')
    expect(markdown).toContain('**Admissible as release evidence** | **false**')
  })

  it('leaves the operator-approval row empty rather than omitting the section', () => {
    const markdown = renderReport(base)
    expect(markdown).toContain('| Release operator | _(empty)_ | _(empty)_ | _(empty)_ |')
  })

  it('names the failing gates and says the fail-fast tail did not run', () => {
    const markdown = renderReport({
      ...base,
      gates: [
        { n: 1, name: 'lint', command: 'yarn lint', exit: 0, seconds: 12, log: '01-lint.txt', startedAt: 't' },
        { n: 2, name: 'test', command: 'yarn test', exit: 1, seconds: 300, log: '02-test.txt', startedAt: 't' },
      ],
    })
    expect(markdown).toContain('**1 of 2 gates failed**')
    expect(markdown).toContain('did not run and is absent from this table rather than recorded as passing')
  })
})

// ── the inventory is data, not a hand-kept list ──────────────────────────────

describe('release inventory', () => {
  it('drives the release tools from release-policy.json', () => {
    const policy = releasePolicy()
    expect(policy.published).toContain('@dzup-ui/core')
    // compat is public and publishable but on the changesets ignore list:
    // withheld, with a reason, not forgotten. Its sibling codemods is released
    // (N5-01-D2, 2026-09-26).
    expect(policy.withheld.map(w => w.name)).toEqual(['@dzup-ui/compat'])
    expect(policy.published).toContain('@dzup-ui/codemods')
    for (const entry of policy.withheld)
      expect(entry.reason.length).toBeGreaterThan(20)
  })
})

describe('normaliseSignature', () => {
  it('rewrites an absolute scratch import to the specifier a consumer writes', () => {
    // The scratch directory is a fresh mkdtemp per run, so leaving the absolute
    // path in a signature made every such symbol differ from ITSELF on the next
    // run. Measured: 185 phantom signature changes diffing a tree against a
    // snapshot of the same tree.
    const raw = 'ui?: Partial<Record<"root", import("C:/Users/x/AppData/Local/Temp/dzup-api-surface-Tf9Iau/consumer/node_modules/@dzup-ui/contracts/dist/anatomy.types").DzClassValue>>'
    expect(normaliseSignature(raw))
      .toBe('ui?: Partial<Record<"root", import("@dzup-ui/contracts/dist/anatomy.types").DzClassValue>>')
  })

  it('is stable when the same type is seen from two different scratch roots', () => {
    const a = 'x: import("/tmp/aaa/consumer/node_modules/pkg/dist/t").T'
    const b = 'x: import("/tmp/zzz/consumer/node_modules/pkg/dist/t").T'
    expect(normaliseSignature(a)).toBe(normaliseSignature(b))
  })

  it('drops the per-program ordinal from a well-known symbol member', () => {
    expect(normaliseSignature('__@iterator@32: () => Iterator<string>'))
      .toBe('__@iterator: () => Iterator<string>')
  })

  it('leaves a relative or bare import alone', () => {
    expect(normaliseSignature('x: import("./local").T')).toBe('x: import("./local").T')
    expect(normaliseSignature('y: import("vue").Ref<number>')).toBe('y: import("vue").Ref<number>')
  })
})

describe('aNY_SIGNATURE_CEILING', () => {
  it('is low, because the failure it guards against is total', () => {
    // When `vue` does not resolve in the scratch consumer, EVERY DefineComponent
    // collapses to `any` at once — and skipLibCheck hides it, because a packed
    // surface is nothing but .d.ts files.
    expect(ANY_SIGNATURE_CEILING).toBeLessThanOrEqual(0.1)
    expect(ANY_SIGNATURE_CEILING).toBeGreaterThan(0)
  })
})
