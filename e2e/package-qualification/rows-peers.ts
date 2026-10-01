import type { RowResult } from './matrix.ts'
import type { Stage } from './stage.ts'
/**
 * Rows 7 and 8 — the peer matrix, and optional peer absent / incompatible /
 * installed (TASK-S2-O1).
 *
 * Both rows read `peerDependencies` out of the **packed** manifests, never the
 * workspace ones: what a consumer is held to is what the tarball declares, and
 * the two can differ (a `workspace:*` that `yarn pack` resolved, a field added
 * after the last pack).
 *
 * Row 8's three lanes are only meaningful in a consumer workspace where absence
 * is real, which is why `controlledStage` exists and why it installs **no**
 * junction to the repository's `node_modules`. In a junctioned stage every peer
 * resolves, so an "absent" lane there would pass while proving nothing — the
 * precise failure mode doc-08 calls "optional-peer path fails open".
 *
 * @module e2e/package-qualification/rows-peers
 */
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { ROOT } from '../../packages/tooling/src/release/binding.ts'
import { SECOND_TIER_ABSENT } from './matrix.ts'
import { controlledStage, THIRD_PARTY_PEERS } from './stage.ts'

/** The optional-engine candidate doc-08 row 8 is written about. */
const ENGINE = 'reka-ui'

function secondTier(): Pick<RowResult, 'secondTier' | 'secondTierReason'> {
  return { secondTier: 'blocked', secondTierReason: SECOND_TIER_ABSENT }
}

/**
 * Lowest version a caret/tilde/gte range admits.
 *
 * Deliberately hand-rolled and deliberately strict: it returns `null` for any
 * range it does not fully understand, and a `null` floor is a **finding**
 * (`<stop_conditions>`: "when the minimum peer version is undeclared, file it as
 * a decision"). Guessing a floor would be worse than reporting that none is
 * declared.
 */
export function declaredFloor(range: string): string | null {
  const trimmed = range.trim()
  if (trimmed === '' || trimmed === '*' || trimmed === 'x' || trimmed === 'latest')
    return null
  const single = /^(?:\^|~|>=)?\s*(\d+\.\d+\.\d+(?:-[0-9A-Z-.]+)?)$/i.exec(trimmed)
  if (single?.[1] !== undefined)
    return single[1]
  // `a || b` — the floor is the lowest floor of any admitted branch.
  if (trimmed.includes('||')) {
    const floors = trimmed.split('||').map(part => declaredFloor(part)).filter((v): v is string => v !== null)
    if (floors.length === 0)
      return null
    return floors.sort(compareVersions)[0] ?? null
  }
  return null
}

export function compareVersions(a: string, b: string): number {
  const parse = (v: string): number[] => (v.split('-')[0] ?? '').split('.').map(n => Number.parseInt(n, 10) || 0)
  const [x, y] = [parse(a), parse(b)]
  for (let i = 0; i < 3; i++) {
    const d = (x[i] ?? 0) - (y[i] ?? 0)
    if (d !== 0)
      return d
  }
  return 0
}

/** The version actually installed in this repository, or `null`. */
export function installedVersion(name: string): string | null {
  const manifest = join(ROOT, 'node_modules', ...name.split('/'), 'package.json')
  if (!existsSync(manifest))
    return null
  const { version } = JSON.parse(readFileSync(manifest, 'utf8')) as { version?: string }
  return version ?? null
}

export interface PeerRow {
  peer: string
  declaredBy: Array<{ pkg: string, range: string, floor: string | null }>
  /** Distinct floors across publishers — more than one is a split floor. */
  floors: string[]
  installed: string | null
}

/**
 * Row 7 — minimum **and** current peer versions.
 *
 * Three clauses, all read from the packed manifests:
 *
 * 1. every declared peer range yields an explicit floor;
 * 2. two published packages never declare **different** floors for one peer
 *    (a split floor means a consumer satisfying one package breaks the other);
 * 3. the version installed here satisfies every declared floor, so the
 *    "current" column is a real measurement and not an assumption.
 *
 * The *runtime* half at the floor — install at the floor, typecheck, run the
 * suite — is owned by the pre-existing `test:min-peer` lane, which derives each
 * floor from `peerDependencies` rather than a literal and exits non-zero if the
 * version on disk is not the floor. That lane is cited, not rebuilt.
 */
export function rowPeerMatrix(stage: Stage): RowResult {
  const evidence = [
    'e2e/package-qualification/rows-peers.ts (rowPeerMatrix)',
    'packages/tooling/scripts/min-peer-lane.mjs (cited for the runtime-at-floor half)',
  ]

  const byPeer = new Map<string, PeerRow>()
  for (const pkg of stage.packed) {
    const peers = (pkg.manifest.peerDependencies ?? {}) as Record<string, string>
    for (const [peer, range] of Object.entries(peers)) {
      const row = byPeer.get(peer) ?? { peer, declaredBy: [], floors: [], installed: installedVersion(peer) }
      row.declaredBy.push({ pkg: pkg.name, range, floor: declaredFloor(range) })
      byPeer.set(peer, row)
    }
  }

  const rows = [...byPeer.values()]
  for (const row of rows)
    row.floors = [...new Set(row.declaredBy.map(d => d.floor).filter((v): v is string => v !== null))]

  const undeclared = rows.filter(r => r.declaredBy.some(d => d.floor === null))
  const split = rows.filter(r => r.floors.length > 1)
  const unsatisfied = rows.filter(r =>
    r.installed !== null && r.floors.length === 1 && compareVersions(r.installed, r.floors[0] ?? '0.0.0') < 0,
  )

  const problems: string[] = []
  if (undeclared.length > 0)
    problems.push(`${undeclared.length} peer(s) with no computable floor: ${undeclared.map(r => `${r.peer} (${r.declaredBy.map(d => d.range).join(', ')})`).join('; ')}`)
  if (split.length > 0)
    problems.push(`${split.length} split floor(s): ${split.map(r => `${r.peer} → ${r.floors.join(' vs ')}`).join('; ')}`)
  if (unsatisfied.length > 0)
    problems.push(`${unsatisfied.length} installed version(s) below the declared floor: ${unsatisfied.map(r => `${r.peer}@${r.installed} < ${r.floors[0]}`).join('; ')}`)

  return {
    n: 7,
    title: 'Minimum and current Vue/Reka peer versions',
    verdict: problems.length === 0 ? 'green' : 'red',
    reason: problems.length === 0
      ? `${rows.length} peer(s) across ${stage.packed.length} packed manifests: every floor explicit, no split floor, every installed version at or above its floor`
      : problems.join(' · '),
    evidence,
    detail: { peers: rows },
    cited: false,
    ...secondTier(),
  }
}

export interface OptionalPeerLane {
  lane: 'installed' | 'absent' | 'incompatible'
  outcome: 'imported' | 'failed'
  /** Whether the failure names the peer — the difference between loud and silent. */
  namesPeer: boolean
  message: string
  asDocumented: boolean
}

/**
 * Row 8 — optional peer absent / incompatible / installed.
 *
 * The **documented** posture is asserted, per `<requirements><degradation>`.
 * `@dzup-ui/core` declares `reka-ui` in `peerDependencies` with **no**
 * `peerDependenciesMeta.optional` entry, so the engine is a **required** peer,
 * and the documented degradation is fail-closed:
 *
 * | lane | documented behaviour |
 * |---|---|
 * | installed | the packed entry imports |
 * | absent | import fails, and the failure **names `reka-ui`** |
 * | incompatible | the mismatch is detectable from the manifests — a consumer is told, not left to discover it at runtime |
 *
 * "Fails and names the peer" is the assertion that matters. A required peer that
 * vanished and produced a generic error, or worse imported anyway, is the
 * "fails open" stop condition. That posture is recorded in
 * `packages/core/README.md` (§Peer dependencies), written by this task because
 * `<requirements><degradation>` requires the documentation line to exist before
 * it can be asserted.
 */
export async function rowOptionalPeer(): Promise<RowResult> {
  const evidence = [
    'e2e/package-qualification/rows-peers.ts (rowOptionalPeer)',
    'packages/core/README.md (§Peer dependencies — the documented posture being asserted)',
  ]
  const lanes: OptionalPeerLane[] = []
  const others = THIRD_PARTY_PEERS.filter(p => p !== ENGINE)

  // ---- installed --------------------------------------------------------
  lanes.push(await importLane('installed', [
    ...others.map(name => ({ name, mode: 'link' as const })),
    { name: ENGINE, mode: 'link' as const },
  ], outcome => outcome === 'imported'))

  // ---- absent -----------------------------------------------------------
  lanes.push(await importLane('absent', [
    ...others.map(name => ({ name, mode: 'link' as const })),
    { name: ENGINE, mode: 'absent' as const },
  ], (outcome, namesPeer) => outcome === 'failed' && namesPeer))

  // ---- incompatible -----------------------------------------------------
  // A stub at 1.0.0 against a declared `^2.0.0`. The lane asserts the mismatch
  // is *detectable from the manifests*, which is what a consumer's package
  // manager reports; the stub throws if anything executes it, so an accidental
  // runtime pass cannot masquerade as a green.
  const incompatible = controlledStage([
    ...others.map(name => ({ name, mode: 'link' as const })),
    { name: ENGINE, mode: 'stub' as const, version: '1.0.0' },
  ])
  try {
    const core = incompatible.packed.find(p => p.name === '@dzup-ui/core')
    const declared = ((core?.manifest.peerDependencies ?? {}) as Record<string, string>)[ENGINE] ?? ''
    const floor = declaredFloor(declared)
    const staged = JSON.parse(
      readFileSync(join(incompatible.nodeModules, ENGINE, 'package.json'), 'utf8'),
    ) as { version: string }
    const detected = floor !== null && compareVersions(staged.version, floor) < 0
    lanes.push({
      lane: 'incompatible',
      outcome: 'failed',
      namesPeer: true,
      message: `staged ${ENGINE}@${staged.version} against declared "${declared}" (floor ${floor ?? 'none'}) → mismatch ${detected ? 'detected' : 'NOT detected'}`,
      asDocumented: detected,
    })
  }
  finally {
    incompatible.dispose()
  }

  const failed = lanes.filter(l => !l.asDocumented)
  return {
    n: 8,
    title: 'Optional peer absent / incompatible / installed',
    verdict: failed.length === 0 ? 'green' : 'red',
    reason: failed.length === 0
      ? `all three lanes behaved as documented (${ENGINE} is a REQUIRED peer — no peerDependenciesMeta.optional is declared — so absent and incompatible are both fail-closed)`
      : `${failed.length} lane(s) did not match the documented behaviour: ${failed.map(l => `${l.lane} → ${l.message}`).join('; ')}`,
    evidence,
    detail: { engine: ENGINE, optionalDeclared: false, lanes },
    cited: false,
    ...secondTier(),
  }
}

async function importLane(
  lane: OptionalPeerLane['lane'],
  peers: Array<{ name: string, mode: 'link' | 'absent' }>,
  expected: (outcome: 'imported' | 'failed', namesPeer: boolean) => boolean,
): Promise<OptionalPeerLane> {
  const stage = controlledStage(peers)
  try {
    const entry = join(stage.nodeModules, '@dzup-ui', 'core', 'dist', 'index.js')
    try {
      await import(pathToFileURL(entry).href)
      return { lane, outcome: 'imported', namesPeer: false, message: 'packed entry imported', asDocumented: expected('imported', false) }
    }
    catch (error) {
      const message = (error as Error).message.split('\n')[0] ?? String(error)
      const namesPeer = message.includes(ENGINE)
      return { lane, outcome: 'failed', namesPeer, message, asDocumented: expected('failed', namesPeer) }
    }
  }
  finally {
    stage.dispose()
  }
}
