/**
 * Unit tests for the icon-library duplication gate (TASK-R1-O6, N5-04-F4).
 *
 * The centre of this file is `runSeeds()`, the same seeded run the CLI exposes
 * as `--self-test`: one deliberate defect per hard clause plus a clean control,
 * asserting that the clause — and that clause — turns red, and that the control
 * stays green. A gate nobody has watched fail is a gate nobody knows works, and
 * this repository has the receipts: `validate:capability-matrix` reported green
 * over a stale artifact for three packets (S1-F10).
 *
 * The second block asserts the state of the real repository. It is written to
 * describe reality rather than to demand a particular outcome, because the
 * duplication is an open owner decision (TASK-R1-O6 item 1, D174): when the
 * decision lands, `versions.length` becomes 1 and the assertion below is the
 * one line that has to change.
 */

import { describe, expect, it } from 'vitest'
import {
  checkIconDuplicates,
  checkRepository,
  collectDeclarations,
  collectShippedDeclarations,
  DEPRECATED_ICON_LIBRARIES,
  ICON_LIBRARIES,
  normaliseRange,
  parseLockfile,
  registryIdentCounts,
  runSeeds,
  seeds,
  SHIPPED_MANIFESTS,
  splitDescriptor,
  workspaceManifests,
} from './peer-icon-duplicates.ts'

describe('the seeded defects', () => {
  const results = runSeeds()

  it('drives every hard clause plus a clean control', () => {
    expect(results.map(r => r.rule)).toEqual([
      'single-version',
      'single-ident',
      'declared-family',
      'lockfile-coverage',
      'shipped-manifest-ident',
      'none',
    ])
  })

  for (const result of results) {
    it(result.rule === 'none'
      ? `passes the control: ${result.name}`
      : `[${result.rule}] catches: ${result.name}`, () => {
      expect({ rule: result.rule, caught: result.caught, fired: result.firedRules })
        .toEqual({ rule: result.rule, caught: true, fired: result.firedRules })
    })
  }

  it('attributes each defect to its own clause, not merely to some clause', () => {
    for (const seed of seeds()) {
      if (seed.rule === 'none')
        continue
      const report = checkIconDuplicates(
        seed.lock,
        seed.declared,
        seed.undeclaredFamily ?? [],
        null,
        ICON_LIBRARIES,
        seed.shipped ?? [],
        seed.registry ?? new Map(),
      )
      expect(report.violations.filter(v => v.level === 'error').map(v => v.rule)).toContain(seed.rule)
    }
  })
})

describe('the surfaces yarn.lock cannot see', () => {
  const shippedRow = {
    workspace: 'dzup-ui-playground',
    manifest: 'apps/landing/playground-template/package.json',
    field: 'dependencies' as const,
    ident: 'lucide-vue-next',
    range: '^0.475.0',
  }
  const coreDecl = {
    workspace: '@dzup-ui/core',
    manifest: 'packages/core/package.json',
    field: 'dependencies' as const,
    ident: 'lucide-vue-next',
    range: '^0.477.0',
  }
  const LOCK = `__metadata:
  version: 10

"lucide-vue-next@npm:^0.477.0":
  version: 0.477.0
  resolution: "lucide-vue-next@npm:0.477.0"
  languageName: node
`

  it('reports — does not fail — a shipped template whose RANGE lags the workspace', () => {
    const report = checkIconDuplicates(LOCK, [coreDecl], [], null, ICON_LIBRARIES, [shippedRow])
    expect(report.violations.filter(v => v.level === 'error')).toEqual([])
    expect(report.violations.map(v => v.rule)).toContain('shipped-manifest-range')
  })

  it('fails on a shipped template whose IDENT no workspace uses any more', () => {
    const swapped = { ...coreDecl, ident: '@lucide/vue', range: '^1.47.0' }
    const lock = LOCK.replace(/lucide-vue-next@npm:\^0\.477\.0/g, '@lucide/vue@npm:^1.47.0')
      .replace(/lucide-vue-next@npm:0\.477\.0/g, '@lucide/vue@npm:1.47.0')
      .replace('version: 0.477.0', 'version: 1.47.0')
    const report = checkIconDuplicates(lock, [swapped], [], null, ICON_LIBRARIES, [shippedRow])
    expect(report.violations.filter(v => v.level === 'error').map(v => v.rule))
      .toEqual(['shipped-manifest-ident'])
  })

  it('reports a generated registry naming an ident the workspaces have left', () => {
    const swapped = { ...coreDecl, ident: '@lucide/vue', range: '^1.47.0' }
    const report = checkIconDuplicates(
      LOCK,
      [swapped],
      [],
      null,
      ICON_LIBRARIES,
      [],
      new Map([['lucide-vue-next', 40]]),
    )
    const drift = report.violations.filter(v => v.rule === 'generated-surface-drift')
    expect(drift).toHaveLength(1)
    expect(drift[0]?.level).toBe('report')
    expect(drift[0]?.message).toContain('40 generated registry item(s)')
  })

  it('says nothing when nothing is shipped and no registry is built', () => {
    const report = checkIconDuplicates(LOCK, [coreDecl], [], null, ICON_LIBRARIES, [], new Map())
    expect(report.violations.map(v => v.rule)).toEqual(['deprecated-ident'])
  })
})

describe('descriptor parsing', () => {
  it('splits a scoped ident on the last @, not the first', () => {
    expect(splitDescriptor('@lucide/vue@npm:^1.47.0')).toEqual({ ident: '@lucide/vue', range: '^1.47.0' })
    expect(splitDescriptor('lucide-vue-next@npm:^0.477.0')).toEqual({ ident: 'lucide-vue-next', range: '^0.477.0' })
  })

  it('drops only the npm: protocol, so a lockfile range compares equal to a declared one', () => {
    expect(normaliseRange('npm:^0.477.0')).toBe('^0.477.0')
    expect(normaliseRange('workspace:apps/sandbox')).toBe('workspace:apps/sandbox')
    expect(normaliseRange('patch:x#./p.patch')).toBe('patch:x#./p.patch')
  })

  it('reads a multi-descriptor block header', () => {
    const lock = `__metadata:
  version: 10

"lucide-vue-next@npm:^0.477.0, lucide-vue-next@npm:0.477.0":
  version: 0.477.0
  resolution: "lucide-vue-next@npm:0.477.0"
  languageName: node
`
    const parsed = parseLockfile(lock)
    expect(parsed).toHaveLength(1)
    expect(parsed[0]?.ranges).toEqual(['^0.477.0', '0.477.0'])
    expect(parsed[0]?.version).toBe('0.477.0')
  })

  it('ignores entries outside the identity set', () => {
    const lock = `__metadata:
  version: 10

"vue@npm:^3.5.13":
  version: 3.5.22
  resolution: "vue@npm:3.5.22"
  languageName: node
`
    expect(parseLockfile(lock)).toHaveLength(0)
  })
})

describe('the identity set', () => {
  it('names both generations of the same library', () => {
    expect(ICON_LIBRARIES).toEqual(['lucide-vue-next', '@lucide/vue'])
  })

  it('marks only the deprecated generation deprecated', () => {
    expect(DEPRECATED_ICON_LIBRARIES).toEqual(['lucide-vue-next'])
    for (const name of DEPRECATED_ICON_LIBRARIES)
      expect(ICON_LIBRARIES).toContain(name)
  })

  it('reports deprecation without failing on it — currency is an owner decision', () => {
    const lock = `__metadata:
  version: 10

"lucide-vue-next@npm:^0.477.0":
  version: 0.477.0
  resolution: "lucide-vue-next@npm:0.477.0"
  languageName: node
`
    const report = checkIconDuplicates(lock, [
      { workspace: '@dzup-ui/core', manifest: 'packages/core/package.json', field: 'dependencies', ident: 'lucide-vue-next', range: '^0.477.0' },
    ], [], null)
    expect(report.violations.filter(v => v.level === 'error')).toEqual([])
    expect(report.violations.map(v => v.rule)).toContain('deprecated-ident')
  })
})

describe('the real repository', () => {
  const manifests = workspaceManifests()

  it('reads every workspace manifest, root included', () => {
    expect(manifests.length).toBeGreaterThan(10)
    expect(manifests.some(m => m.replace(/\\/g, '/').endsWith('packages/core/package.json'))).toBe(true)
  })

  it('finds no lucide-family package outside the declared identity set', () => {
    expect(collectDeclarations(manifests).undeclaredFamily).toEqual([])
  })

  it('records the duplication that is open as TASK-R1-O6 item 1 (D174)', () => {
    const report = checkRepository()
    // When D174 is taken this becomes 1 and the gate goes green. Until then the
    // fact is asserted rather than tolerated, so nobody can quietly re-introduce
    // a second version under cover of the first.
    expect(report.versions).toEqual(['0.475.0', '0.477.0'])
    expect(report.idents).toEqual(['lucide-vue-next'])
    expect(report.violations.filter(v => v.level === 'error').map(v => v.rule)).toEqual(['single-version'])
  })

  it('names every declarer in the diagnostic a human reads', () => {
    const report = checkRepository()
    const message = report.violations.find(v => v.rule === 'single-version')?.message ?? ''
    expect(message).toContain('packages/core/package.json')
    expect(message).toContain('apps/landing/package.json')
  })

  it('sees the playground template, which is shipped to consumers and is not a workspace', () => {
    expect(SHIPPED_MANIFESTS).toEqual(['apps/landing/playground-template/package.json'])
    const shipped = collectShippedDeclarations()
    expect(shipped).toHaveLength(1)
    expect(shipped[0]?.ident).toBe('lucide-vue-next')
    // It is NOT among the workspace manifests, which is the whole point.
    expect(workspaceManifests().some(m => m.replace(/\\/g, '/').includes('playground-template'))).toBe(false)
  })

  it('counts the generated registry items that hand the icon package to consumers', () => {
    const counts = registryIdentCounts()
    // Build output: absent on a fresh clone, and an absence must not fabricate a finding.
    if (counts.size === 0)
      return
    expect(counts.get('lucide-vue-next')).toBeGreaterThan(0)
  })
})
