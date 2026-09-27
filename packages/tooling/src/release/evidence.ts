#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Release evidence: SBOM, vulnerabilities, licences, hashes, provenance
 * (TASK-R1-O3).
 *
 * The 08-11 validation matrix (doc 08 §Package qualification matrix) requires,
 * per release and per tarball: *"SBOM, vulnerability/license report,
 * provenance/hash"*. Before this tool OSS had `validate:licenses` — which reads
 * **source** `package.json` files, not a tarball — and nothing else. No SBOM,
 * no hash record and no provenance statement had ever been produced.
 *
 * Ported from `ui/dzup-ui-pro/tools/release/evidence.mjs` (Pro TASK-REL-02) and
 * adapted: six packages instead of one, the OSS licence policy taken from
 * `../license-audit.ts` rather than a second private copy, and the provenance
 * `buildType` naming this repository's own pack command. No Pro code is
 * imported and no Pro path is read.
 *
 * ## What this tool refuses to do
 *
 * It does not publish, tag, sign, install, upgrade or mutate a registry. It
 * packs (`yarn pack`), extracts, reads, hashes and asks the public advisory
 * endpoint about **exact resolved versions**. Signing is a separate, explicit
 * act by an authorised operator, and the provenance statement says in its own
 * body that it is unsigned rather than leaving the field out for a later reader
 * to assume.
 *
 * ## Honesty rules
 *
 * - The SBOM's **root component is the tarball**, carrying the tarball's own
 *   hashes. An SBOM that describes a source tree cannot be checked against the
 *   bytes a consumer installed, which is the only thing an SBOM is for.
 * - A vulnerability query that could not run produces `status: "not-run"` with
 *   a reason, **never a zero**. "0 advisories" and "we could not ask" are
 *   different facts and the report prints them differently.
 * - A licence we could not read is `UNKNOWN`; a peer nobody installed here is
 *   `NOT INSTALLED`. Both are distinct from a licence we read and allowed.
 * - Every artifact carries `admissible`, false on a dirty tree (`binding.ts`).
 *
 * Usage:
 *   yarn release:evidence
 *   yarn release:evidence --no-network      # records the advisory gap, does not fabricate
 *   yarn release:evidence --out docs/qa/release/<bundle>
 *
 * @module @dzup-ui/tooling/release/evidence
 */

import type { Buffer } from 'node:buffer'
import type { ArtifactProvenance, SourceBinding } from './binding.ts'
import type { PackedPackage } from './pack.ts'
import { execSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import process from 'node:process'
import { ALLOWED_LICENSES, BLOCKED_LICENSES, classifyLicense } from '../license-audit.ts'
import { bundleId, gitState, provenanceOf, ROOT } from './binding.ts'
import { cleanStage, packAll, releasePolicy, scratchDir } from './pack.ts'

export const ADVISORY_ENDPOINT = 'https://registry.npmjs.org/-/npm/v1/security/advisories/bulk'
export const EVIDENCE_DIR = resolve(ROOT, 'docs/qa/release')
export const EXCEPTIONS_PATH = resolve(ROOT, 'packages/tooling/scripts/licence-exceptions.json')

// --- Dependency closure ---

export interface ClosureEntry {
  name: string
  version: string | null
  licence: string
  resolved: boolean
  depth: number
  dependencies: string[]
  /** Whether the package ships its own licence text — a redistribution obligation. */
  licenceFile: boolean
}

/** Walk up from `fromDir` looking for `node_modules/<name>/package.json`. */
export function resolvePackageDir(name: string, fromDir: string): string | null {
  let dir = resolve(fromDir)
  for (;;) {
    const candidate = join(dir, 'node_modules', ...name.split('/'))
    if (existsSync(join(candidate, 'package.json')))
      return candidate
    const parent = dirname(dir)
    if (parent === dir)
      return null
    dir = parent
  }
}

function licenceOf(pkg: Record<string, unknown>): string {
  const license = pkg.license
  if (typeof license === 'string')
    return license
  if (typeof license === 'object' && license !== null && typeof (license as { type?: string }).type === 'string')
    return (license as { type: string }).type
  if (Array.isArray(pkg.licenses))
    return (pkg.licenses as Array<{ type?: string }>).map(l => l.type ?? 'UNKNOWN').join(' OR ')
  return 'UNKNOWN'
}

/**
 * The production dependency closure of a packed manifest.
 *
 * `dependencies` only — `devDependencies` are build-time and never in a
 * tarball, and `peerDependencies` are the host's to install and are recorded
 * separately rather than walked, because the version a host resolves is not
 * knowable from here.
 *
 * **Each child is resolved from its PARENT's directory, not from the root.**
 * That is what Node does, and it is not a detail: a package yarn installs
 * nested — because a peer-dependency virtualisation gave it its own copy —
 * exists only under `<parent>/node_modules/`. Resolving every name from the
 * tarball root instead reported `vue-demi` (depth 2, via `@floating-ui/vue`,
 * `node_modules/@floating-ui/vue/node_modules/vue-demi@0.14.10`, MIT) as
 * `resolved: false` with `licence: UNKNOWN`, which is a **false** supply-chain
 * finding and exactly the kind an SBOM must not invent. Measured on this tool's
 * first run.
 */
export function resolveClosure(manifest: Record<string, unknown>, fromDir: string): ClosureEntry[] {
  const seen = new Map<string, ClosureEntry>()
  const queue = Object.keys((manifest.dependencies ?? {}) as Record<string, string>)
    .map(name => ({ name, depth: 1, from: fromDir }))

  while (queue.length > 0) {
    const next = queue.shift()
    if (next === undefined)
      break
    const { name, depth, from } = next
    if (seen.has(name))
      continue

    const dir = resolvePackageDir(name, from)
    if (!dir) {
      seen.set(name, { name, version: null, licence: 'UNKNOWN', resolved: false, depth, dependencies: [], licenceFile: false })
      continue
    }

    const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')) as Record<string, unknown>
    const dependencies = Object.keys((pkg.dependencies ?? {}) as Record<string, string>)
    seen.set(name, {
      name,
      version: typeof pkg.version === 'string' ? pkg.version : null,
      licence: licenceOf(pkg),
      resolved: true,
      depth,
      dependencies,
      licenceFile: readdirSync(dir).some(f => /^(?:LICEN[SC]E|COPYING)/i.test(f)),
    })

    for (const child of dependencies)
      queue.push({ name: child, depth: depth + 1, from: dir })
  }

  return [...seen.values()].sort((a, b) => (a.name < b.name ? -1 : 1))
}

export interface PeerRecord {
  name: string
  range: string
  optional: boolean
  /** The version resolved *in this workspace* — evidence about what was tested. */
  observedVersion: string | null
  installed: boolean
  licence: string
}

/** Declared peers, flagged by optionality — the host installs these, we do not. */
export function peerRecords(manifest: Record<string, unknown>, fromDir: string): PeerRecord[] {
  const meta = (manifest.peerDependenciesMeta ?? {}) as Record<string, { optional?: boolean }>
  return Object.entries((manifest.peerDependencies ?? {}) as Record<string, string>)
    .map(([name, range]) => {
      const dir = resolvePackageDir(name, fromDir)
      const pkg = dir ? JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')) as Record<string, unknown> : null
      return {
        name,
        range,
        optional: meta[name]?.optional === true,
        observedVersion: pkg && typeof pkg.version === 'string' ? pkg.version : null,
        installed: pkg !== null,
        // `NOT INSTALLED` rather than `UNKNOWN`: an optional peer nobody
        // installed here has a licence we did not read, which is a different
        // statement from a package that declares none.
        licence: pkg === null ? 'NOT INSTALLED' : licenceOf(pkg),
      }
    })
    .sort((a, b) => (a.name < b.name ? -1 : 1))
}

// --- SBOM ---

/** `@scope/name@1.2.3` → `pkg:npm/%40scope/name@1.2.3`, the CycloneDX purl form. */
export function purl(name: string, version: string | null): string {
  const encoded = name.startsWith('@') ? `%40${name.slice(1)}` : name
  return version ? `pkg:npm/${encoded}@${version}` : `pkg:npm/${encoded}`
}

/** CycloneDX `licenses` entry — an SPDX id where we have one, a name otherwise. */
export function licenceEntry(expression: string | undefined): Array<{ license: { id: string } | { name: string } }> {
  const raw = String(expression ?? 'UNKNOWN').trim()
  if (ALLOWED_LICENSES.has(raw) || BLOCKED_LICENSES.has(raw))
    return [{ license: { id: raw } }]
  return [{ license: { name: raw } }]
}

export interface ArtifactRecord {
  file: string
  bytes: number
  sha256: string
  sha512: string
}

export interface Sbom {
  bomFormat: 'CycloneDX'
  specVersion: string
  version: number
  metadata: Record<string, unknown>
  components: Array<Record<string, unknown>>
}

/**
 * A CycloneDX 1.6 SBOM for one tarball.
 *
 * Deliberately **no `serialNumber`**: it is a fresh UUID per document, which
 * would make two SBOMs of identical bytes differ and defeat comparison. The
 * tarball hash is the identity that matters.
 */
export function buildSbom(input: {
  artifact: ArtifactRecord
  manifest: Record<string, unknown>
  closure: ClosureEntry[]
  peers: PeerRecord[]
  generatedAt: string
  binding: SourceBinding
  toolVersion: string
}): Sbom {
  const { artifact, manifest, closure, peers, generatedAt, binding, toolVersion } = input
  const components = [
    ...closure.map(dep => ({
      'type': 'library',
      'bom-ref': purl(dep.name, dep.version),
      'name': dep.name,
      'version': dep.version ?? 'unresolved',
      'purl': purl(dep.name, dep.version),
      'scope': 'required',
      'licenses': licenceEntry(dep.licence),
      'properties': [
        { name: 'dzup:relationship', value: 'bundled-dependency' },
        { name: 'dzup:depth', value: String(dep.depth) },
        { name: 'dzup:resolved', value: String(dep.resolved) },
        { name: 'dzup:shipsLicenceText', value: String(dep.licenceFile) },
      ],
    })),
    ...peers.map(peer => ({
      'type': 'library',
      'bom-ref': purl(peer.name, peer.observedVersion),
      'name': peer.name,
      'version': peer.observedVersion ?? peer.range,
      'purl': purl(peer.name, peer.observedVersion),
      'scope': peer.optional ? 'optional' : 'required',
      'licenses': licenceEntry(peer.licence),
      'properties': [
        { name: 'dzup:relationship', value: peer.optional ? 'optional-peer' : 'required-peer' },
        { name: 'dzup:declaredRange', value: peer.range },
        { name: 'dzup:versionIsObserved', value: 'true' },
      ],
    })),
  ]

  return {
    bomFormat: 'CycloneDX',
    specVersion: '1.6',
    version: 1,
    metadata: {
      timestamp: generatedAt,
      tools: { components: [{ type: 'application', name: '@dzup-ui/tooling release:evidence', version: toolVersion }] },
      component: {
        'type': 'library',
        'bom-ref': purl(String(manifest.name), String(manifest.version)),
        'name': String(manifest.name),
        'version': String(manifest.version),
        'purl': purl(String(manifest.name), String(manifest.version)),
        'description': typeof manifest.description === 'string' ? manifest.description : '',
        'licenses': licenceEntry(licenceOf(manifest)),
        'hashes': [
          { alg: 'SHA-256', content: artifact.sha256 },
          { alg: 'SHA-512', content: artifact.sha512 },
        ],
        'properties': [
          { name: 'dzup:tarball', value: artifact.file },
          { name: 'dzup:bytes', value: String(artifact.bytes) },
          { name: 'dzup:sourceCommit', value: binding.sourceCommit },
          { name: 'dzup:sourceWorktreeDirty', value: String(binding.dirty) },
          { name: 'dzup:admissible', value: String(binding.admissible) },
        ],
      },
    },
    components,
  }
}

/** One aggregate SBOM naming all six tarballs as its root components. */
export function aggregateSbom(input: {
  sboms: Sbom[]
  generatedAt: string
  binding: SourceBinding
  toolVersion: string
}): Sbom {
  const { sboms, generatedAt, binding, toolVersion } = input
  const roots = sboms.map(s => (s.metadata as { component: Record<string, unknown> }).component)
  const byRef = new Map<string, Record<string, unknown>>()
  for (const sbom of sboms) {
    for (const component of sbom.components)
      byRef.set(String(component['bom-ref']), component)
  }
  return {
    bomFormat: 'CycloneDX',
    specVersion: '1.6',
    version: 1,
    metadata: {
      timestamp: generatedAt,
      tools: { components: [{ type: 'application', name: '@dzup-ui/tooling release:evidence', version: toolVersion }] },
      component: {
        'type': 'application',
        'bom-ref': `dzup-ui-release-${binding.shortCommit}`,
        'name': 'dzup-ui release candidate',
        'version': binding.shortCommit,
        'description': `Every package release-policy.json classifies as published, packed at ${binding.sourceCommit}.`,
        'properties': [
          { name: 'dzup:sourceCommit', value: binding.sourceCommit },
          { name: 'dzup:sourceWorktreeDirty', value: String(binding.dirty) },
          { name: 'dzup:admissible', value: String(binding.admissible) },
          { name: 'dzup:tarballCount', value: String(sboms.length) },
        ],
      },
    },
    components: [...roots, ...[...byRef.values()].sort((a, b) => (String(a.name) < String(b.name) ? -1 : 1))],
  }
}

// --- Vulnerabilities ---

export interface AdvisoryResult {
  status: 'ok' | 'not-run'
  reason?: string
  source: string
  queriedAt: string | null
  packagesQueried: number
  advisories: Record<string, Array<Record<string, unknown>>>
}

/**
 * Advisories for a resolved dependency set.
 *
 * Posts to the same endpoint `npm audit` uses, keyed by **exact resolved
 * version**, so the answer is about the bytes in this closure rather than about
 * a range. It installs nothing and upgrades nothing.
 *
 * A failure is `status: 'not-run'` **with a reason**. `<stop_conditions>` for
 * this task is explicit: when the audit source is unavailable, record the gap;
 * do not fabricate a vulnerability count.
 */
export async function fetchAdvisories(
  closure: ClosureEntry[],
  options: { network?: boolean, fetchImpl?: typeof globalThis.fetch } = {},
): Promise<AdvisoryResult> {
  const { network = true, fetchImpl = globalThis.fetch } = options
  const queryable = closure.filter(d => d.resolved && d.version)
  const base = { source: ADVISORY_ENDPOINT, advisories: {}, packagesQueried: queryable.length, queriedAt: null }

  if (!network)
    return { ...base, status: 'not-run', reason: '--no-network was passed', packagesQueried: 0 }
  if (queryable.length === 0) {
    // "This package has no runtime dependencies" and "we could not resolve the
    // ones it has" are different facts, and a report that printed one for the
    // other would be the fabrication `<stop_conditions>` forbids.
    return {
      ...base,
      status: 'not-run',
      reason: closure.length === 0
        ? 'the package declares no runtime dependencies — there is nothing to query, which is not the same as a clean audit'
        : `none of its ${closure.length} declared dependencies resolved to a concrete version`,
      packagesQueried: 0,
    }
  }

  const body: Record<string, string[]> = {}
  for (const dep of queryable)
    body[dep.name] = [dep.version as string]

  try {
    const response = await fetchImpl(ADVISORY_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!response.ok)
      return { ...base, status: 'not-run', reason: `the advisory endpoint answered ${response.status}` }
    return {
      ...base,
      status: 'ok',
      queriedAt: new Date().toISOString(),
      advisories: await response.json() as AdvisoryResult['advisories'],
    }
  }
  catch (error) {
    return {
      ...base,
      status: 'not-run',
      reason: `the advisory endpoint could not be reached: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

export interface AdvisoryRow {
  package: string
  id: unknown
  severity: string
  title: string
  url: string
  vulnerableVersions: string
}

/** Advisory rows, flattened and sorted worst-first. */
export function advisoryRows(advisories: AdvisoryResult['advisories']): AdvisoryRow[] {
  const order: Record<string, number> = { critical: 0, high: 1, moderate: 2, low: 3, info: 4 }
  return Object.entries(advisories ?? {})
    .flatMap(([name, list]) => (list ?? []).map(a => ({
      package: name,
      id: a.id,
      severity: String(a.severity ?? 'unknown'),
      title: String(a.title ?? ''),
      url: String(a.url ?? ''),
      vulnerableVersions: String(a.vulnerable_versions ?? ''),
    })))
    .sort((a, b) => (order[a.severity] ?? 9) - (order[b.severity] ?? 9) || (a.package < b.package ? -1 : 1))
}

// --- Licences ---

export interface LicenceException {
  package: string
  licence: string
  owner: string
  reason: string
  expires: string | null
}

/**
 * Owned licence exceptions.
 *
 * An exception with no owner is indistinguishable from an oversight, so the
 * file's own shape requires one. The list may only shrink; a new entry is an
 * owner's act, not an agent's.
 */
export function licenceExceptions(path: string = EXCEPTIONS_PATH): LicenceException[] {
  if (!existsSync(path))
    return []
  const data = JSON.parse(readFileSync(path, 'utf8')) as { exceptions?: LicenceException[] }
  return data.exceptions ?? []
}

export type LicenceVerdict = 'allowed' | 'blocked' | 'unknown' | 'excepted' | 'first-party'

export interface LicenceRow {
  package: string
  version: string | null
  licence: string
  verdict: LicenceVerdict
  reason?: string
  shipsLicenceText: boolean
  relationship: 'bundled-dependency' | 'required-peer' | 'optional-peer'
}

/** Classify one closure/peer entry against the repository's licence policy. */
export function classifyRow(
  entry: { name: string, version: string | null, licence: string, licenceFile?: boolean },
  relationship: LicenceRow['relationship'],
  exceptions: LicenceException[],
): LicenceRow {
  const base = {
    package: entry.name,
    version: entry.version,
    licence: entry.licence,
    shipsLicenceText: entry.licenceFile ?? false,
    relationship,
  }
  if (entry.name.startsWith('@dzup-ui/'))
    return { ...base, verdict: 'first-party' }

  const exception = exceptions.find(e => e.package === entry.name)
  if (exception)
    return { ...base, verdict: 'excepted', reason: `${exception.reason} (owner: ${exception.owner})` }

  if (entry.licence === 'UNKNOWN' || entry.licence === 'NOT INSTALLED')
    return { ...base, verdict: 'unknown', reason: entry.licence === 'NOT INSTALLED' ? 'peer not installed here — its licence was not read' : 'the package declares no licence field' }

  const verdict = classifyLicense(entry.licence)
  if (verdict.allowed)
    return { ...base, verdict: 'allowed' }
  return { ...base, verdict: BLOCKED_LICENSES.has(entry.licence.trim()) ? 'blocked' : 'unknown', reason: verdict.reason }
}

// --- Hashes and provenance ---

/** sha256 and sha512 of a buffer. Both, because consumers pin with different ones. */
export function digestsOf(buffer: Buffer): { sha256: string, sha512: string } {
  return {
    sha256: createHash('sha256').update(buffer).digest('hex'),
    sha512: createHash('sha512').update(buffer).digest('base64'),
  }
}

export interface TreeEntry {
  path: string
  bytes: number
  sha256: string
  sha512: string
}

/**
 * Per-entry hashes for the extracted tarball.
 *
 * Every file, not just `dist`: `package.json`, `README.md` and `LICENSE` are in
 * the tarball and are exactly the files whose silent change nobody notices.
 */
export function hashTree(root: string): TreeEntry[] {
  const out: TreeEntry[] = []
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
      const full = join(dir, entry.name)
      if (entry.isDirectory())
        walk(full)
      else if (entry.isFile())
        out.push({ path: relative(root, full).replaceAll('\\', '/'), bytes: statSync(full).size, ...digestsOf(readFileSync(full)) })
    }
  }
  walk(root)
  return out
}

/**
 * An **unsigned** provenance statement, in the shape of an in-toto v1 subject
 * plus an SLSA v1 predicate.
 *
 * Every field is observed, not asserted, with one exception that is explicit:
 * `signature` is `null` and `signed` is `false`. The CI workflows in
 * `.github/workflows/` request `id-token: write` and **have never exercised
 * trusted publishing**; the statement says so in a field a reader cannot miss,
 * because a template that left it out would let a later reader assume it had
 * been done.
 */
export function buildProvenance(input: {
  artifact: ArtifactRecord
  manifest: Record<string, unknown>
  binding: SourceBinding
  toolchain: Record<string, string>
  generatedAt: string
  entries: number
}): Record<string, unknown> {
  const { artifact, manifest, binding, toolchain, generatedAt, entries } = input
  return {
    _type: 'https://in-toto.io/Statement/v1',
    subject: [{ name: artifact.file, digest: { sha256: artifact.sha256, sha512: artifact.sha512 } }],
    predicateType: 'https://slsa.dev/provenance/v1',
    predicate: {
      buildDefinition: {
        buildType: 'https://datazup.dev/dzup-ui/yarn-pack/v1',
        externalParameters: {
          package: String(manifest.name),
          version: String(manifest.version),
          buildCommand: `yarn build && yarn workspace ${String(manifest.name)} pack`,
        },
        resolvedDependencies: [{
          uri: 'git+https://github.com/datazup/dzup-ui',
          digest: { gitCommit: binding.sourceCommit },
          annotations: {
            branch: binding.branch,
            worktreeDirty: binding.dirty,
            dirtyPathCount: binding.dirtyCount,
          },
        }],
      },
      runDetails: {
        builder: { id: 'local-workstation', version: toolchain },
        metadata: { invocationId: null, startedOn: generatedAt, finishedOn: generatedAt },
      },
      _dzupArtifactEntries: entries,
    },
    _trustedPublishing: {
      exercised: false,
      note: 'NOT EXERCISED. `.github/workflows/release.yml` requests `id-token: write`, but no workflow has ever run a publish, so no npm provenance attestation exists for any @dzup-ui/* package. This statement is produced locally and is evidence about a local build, not a registry attestation.',
    },
    _signature: {
      signed: false,
      signature: null,
      keyId: null,
      note: 'UNSIGNED. TASK-R1-O3 produces this statement and does not sign it: signing requires a key and an authorised operator, and is a separate, explicit action.',
    },
    _admissible: binding.admissible,
    _inadmissibleReason: binding.inadmissibleReason,
  }
}

// --- Report shapes ---

/**
 * Dependency ranges in a PACKED manifest that a registry consumer cannot
 * install.
 *
 * `workspace:*` and `link:` are yarn's local protocols. `yarn pack` resolves
 * them; `npm pack` copies them verbatim and the tarball dies with
 * `EUNSUPPORTEDPROTOCOL`. Both `.github/workflows/ci.yml`'s "Pack smoke test"
 * and step 8 of `scripts/release-rehearsal.sh` believe they check this, and
 * neither can: they grep `npm pack --dry-run` output, which prints the tarball
 * **file list**, so there has never been anything to match (TASK-R1-O2 finding
 * F2 / decision D151). This reads the `dependencies` block of the manifest that
 * is actually inside the tarball, which is the thing the check was always meant
 * to be.
 */
export function unresolvedProtocols(manifest: Record<string, unknown>): string[] {
  const out: string[] = []
  for (const field of ['dependencies', 'peerDependencies', 'optionalDependencies']) {
    for (const [name, range] of Object.entries((manifest[field] ?? {}) as Record<string, string>)) {
      if (/^(?:workspace:|link:|portal:|file:)/.test(range))
        out.push(`${field}.${name} = "${range}"`)
    }
  }
  return out.sort()
}

export interface PackageEvidence {
  package: string
  version: string
  artifact: ArtifactRecord
  entries: number
  closureSize: number
  /** Local yarn protocols left in the packed manifest — a registry consumer cannot install these. */
  unresolvedProtocols: string[]
  peers: PeerRecord[]
  licences: LicenceRow[]
  advisories: AdvisoryResult
  advisoryRows: AdvisoryRow[]
}

export interface EvidenceResult {
  provenance: ArtifactProvenance
  toolchain: Record<string, string>
  packages: PackageEvidence[]
  withheld: Array<{ name: string, reason: string }>
  totals: {
    tarballs: number
    distinctDependencies: number
    blocked: number
    unknown: number
    excepted: number
    advisoriesTotal: number
    advisoryStatus: 'ok' | 'not-run' | 'mixed'
    /** Packed manifests still carrying a local yarn protocol. Must be 0. */
    unresolvedProtocols: number
  }
}

const SYMBOL: Record<LicenceVerdict, string> = {
  'allowed': 'OK',
  'blocked': 'BLOCKED',
  'unknown': 'UNKNOWN',
  'excepted': 'EXCEPTED',
  'first-party': 'FIRST-PARTY',
}

export function renderSupplyChainReport(result: EvidenceResult): string {
  const lines: string[] = []
  const p = result.provenance
  lines.push('# Supply-chain evidence — `@dzup-ui/*`')
  lines.push('')
  lines.push(`> Generated ${p.generatedAt} by \`${p.generator}\`.`)
  lines.push(`> Source: \`${p.sourceCommit}\` on \`${p.branch}\` · worktree **${p.worktreeDirty ? `dirty (${p.dirtyCount} path(s))` : 'clean'}** · **admissible: ${p.admissible}**`)
  if (p.inadmissibleReason)
    lines.push(`> ${p.inadmissibleReason}`)
  lines.push('')
  lines.push('## Tarballs')
  lines.push('')
  lines.push('| Package | Version | Bytes | Files | sha256 |')
  lines.push('|---|---|---|---|---|')
  for (const pkg of result.packages)
    lines.push(`| \`${pkg.package}\` | ${pkg.version} | ${pkg.artifact.bytes.toLocaleString('en-US')} | ${pkg.entries} | \`${pkg.artifact.sha256}\` |`)
  lines.push('')

  lines.push('### Installability — local protocols in the packed manifests')
  lines.push('')
  if (result.totals.unresolvedProtocols === 0) {
    lines.push('**0 across all tarballs.** Every `@dzup-ui/*` sibling range in a packed `package.json` is a real semver range, which is what `yarn pack` resolves `workspace:*` to. `npm pack` copies the literal string and the tarball dies with `EUNSUPPORTEDPROTOCOL`; this row is read from the manifest **inside the tarball**, not from `npm pack --dry-run` output (which prints a file list and therefore never matched the grep that CI and the rehearsal both rely on — TASK-R1-O2 F2 / D151).')
  }
  else {
    lines.push('| Package | Offending range |')
    lines.push('|---|---|')
    for (const pkg of result.packages) {
      for (const violation of pkg.unresolvedProtocols)
        lines.push(`| \`${pkg.package}\` | \`${violation}\` |`)
    }
  }
  lines.push('')

  lines.push('## Vulnerabilities')
  lines.push('')
  const notRun = result.packages.filter(p2 => p2.advisories.status === 'not-run')
  if (notRun.length > 0) {
    lines.push(`**The advisory query did not run for ${notRun.length} of ${result.packages.length} packages.** A count of zero is not claimed for those.`)
    lines.push('')
    for (const pkg of notRun)
      lines.push(`- \`${pkg.package}\`: ${pkg.advisories.reason}`)
    lines.push('')
  }
  const rows = result.packages.flatMap(p2 => p2.advisoryRows.map(r => ({ ...r, owner: p2.package })))
  if (rows.length === 0) {
    lines.push(`Source: \`${ADVISORY_ENDPOINT}\`, keyed by exact resolved version. **0 advisories** across ${result.totals.distinctDependencies} distinct resolved dependencies for the packages that were queried.`)
  }
  else {
    lines.push('| Severity | Package | Advisory | Vulnerable | Reached via |')
    lines.push('|---|---|---|---|---|')
    for (const row of rows)
      lines.push(`| **${row.severity}** | \`${row.package}\` | [${String(row.id)}](${row.url}) — ${row.title} | \`${row.vulnerableVersions}\` | \`${row.owner}\` |`)
  }
  lines.push('')

  lines.push('## Licences')
  lines.push('')
  lines.push(`Policy: \`packages/tooling/src/license-audit.ts\` — the same allow/block sets \`yarn validate:licenses\` gates on. Exceptions: \`packages/tooling/scripts/licence-exceptions.json\` (${licenceExceptions().length} entries, each with an owner).`)
  lines.push('')
  const seen = new Set<string>()
  const attention: string[] = []
  for (const pkg of result.packages) {
    for (const row of pkg.licences) {
      const key = `${row.package}@${row.version}#${row.relationship}`
      if (seen.has(key))
        continue
      seen.add(key)
      if (row.verdict === 'allowed' || row.verdict === 'first-party')
        continue
      attention.push(`| **${SYMBOL[row.verdict]}** | \`${row.package}\` | ${row.version ?? '—'} | ${row.licence} | ${row.relationship} | ${row.shipsLicenceText ? 'yes' : 'no'} | ${row.reason ?? ''} |`)
    }
  }
  if (attention.length === 0) {
    lines.push('**Nothing needs attention:** no blocked licence, no unread licence and no exception in use.')
  }
  else {
    lines.push('| Verdict | Package | Version | Licence | Relationship | Ships licence text | Note |')
    lines.push('|---|---|---|---|---|---|---|')
    lines.push(...attention)
  }
  lines.push('')
  lines.push(`**Totals across all tarballs:** ${result.totals.distinctDependencies} distinct dependencies · ${result.totals.blocked} blocked · ${result.totals.unknown} unknown · ${result.totals.excepted} excepted. Rows classified \`allowed\` or \`first-party\` are omitted from the table above and are in \`supply-chain.json\`.`)
  lines.push('')

  lines.push('## Provenance')
  lines.push('')
  lines.push('| Fact | Value |')
  lines.push('|---|---|')
  lines.push(`| Builder | local workstation — ${Object.entries(result.toolchain).map(([k, v]) => `${k} ${v}`).join(', ')} |`)
  lines.push('| Build command | `yarn build && yarn workspace <pkg> pack` |')
  lines.push(`| Source commit | \`${p.sourceCommit}\` |`)
  lines.push(`| Worktree | ${p.worktreeDirty ? `**dirty — ${p.dirtyCount} path(s)**` : 'clean'} |`)
  lines.push('| Signed | **no** — signing requires a key and an authorised operator |')
  lines.push('| Trusted publishing (npm provenance) | **never exercised** — `.github/workflows/release.yml` requests `id-token: write` and no workflow has ever published |')
  lines.push(`| Admissible as release evidence | **${p.admissible}** |`)
  lines.push('')
  lines.push('Per-tarball statements: `provenance.json`. Per-file hashes: `hashes.json`. SBOMs: `sbom.cdx.json` (aggregate) and `sbom/<package>.cdx.json`.')
  lines.push('')
  return `${lines.join('\n')}\n`
}

// --- CLI ---

export interface EvidenceArgs {
  network: boolean
  out: string | null
  keep: boolean
}

export function parseArgs(argv: string[]): EvidenceArgs {
  const args: EvidenceArgs = { network: true, out: null, keep: false }
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--no-network')
      args.network = false
    else if (arg === '--out')
      args.out = argv[++i] ?? null
    else if (arg === '--keep')
      args.keep = true
    else
      throw new Error(`unknown argument: ${arg}`)
  }
  return args
}

function toolVersions(): Record<string, string> {
  const versions: Record<string, string> = { node: process.version }
  try {
    versions.yarn = String(execSync('yarn --version', { cwd: ROOT, encoding: 'utf8' })).trim()
  }
  catch {
    versions.yarn = 'unknown'
  }
  versions.os = `${process.platform} ${process.arch}`
  return versions
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2))
  const binding = gitState()
  const generatedAt = new Date().toISOString()
  const toolchain = toolVersions()
  const toolVersion = String(
    (JSON.parse(readFileSync(resolve(ROOT, 'packages/tooling/package.json'), 'utf8')) as { version?: string }).version ?? '0.0.1',
  )

  const stage = scratchDir('dzup-release-evidence-')
  try {
    process.stdout.write('packing the published packages… ')
    const packed: PackedPackage[] = packAll(stage)
    console.log(`${packed.length} tarball(s)`)

    const exceptions = licenceExceptions()
    const packages: PackageEvidence[] = []
    const sboms: Sbom[] = []
    const provenanceStatements: Record<string, unknown>[] = []
    const hashRecords: Record<string, { artifact: ArtifactRecord, entries: TreeEntry[] }> = {}

    for (const pkg of packed) {
      const buffer = readFileSync(pkg.tarball)
      const artifact: ArtifactRecord = {
        file: `${pkg.name.replace('@', '').replace('/', '-')}-${pkg.version}.tgz`,
        bytes: buffer.length,
        ...digestsOf(buffer),
      }
      const closure = resolveClosure(pkg.manifest, pkg.root)
      const peers = peerRecords(pkg.manifest, pkg.root)
      const entries = hashTree(pkg.root)
      const advisories = await fetchAdvisories(closure, { network: args.network })

      const licences = [
        ...closure.map(entry => classifyRow(entry, 'bundled-dependency', exceptions)),
        ...peers.map(peer => classifyRow(
          { name: peer.name, version: peer.observedVersion, licence: peer.licence },
          peer.optional ? 'optional-peer' : 'required-peer',
          exceptions,
        )),
      ]

      packages.push({
        package: pkg.name,
        version: pkg.version,
        artifact,
        entries: entries.length,
        closureSize: closure.length,
        unresolvedProtocols: unresolvedProtocols(pkg.manifest),
        peers,
        licences,
        advisories,
        advisoryRows: advisoryRows(advisories.advisories),
      })

      sboms.push(buildSbom({ artifact, manifest: pkg.manifest, closure, peers, generatedAt, binding, toolVersion }))
      provenanceStatements.push(buildProvenance({ artifact, manifest: pkg.manifest, binding, toolchain, generatedAt, entries: entries.length }))
      hashRecords[pkg.name] = { artifact, entries }
      console.log(`  ${pkg.name}@${pkg.version}: ${entries.length} file(s) · ${closure.length} dep(s) · ${advisories.status === 'ok' ? `${advisoryRows(advisories.advisories).length} advisory row(s)` : `advisories NOT RUN (${advisories.reason})`}`)
    }

    const allLicences = packages.flatMap(p => p.licences)
    const distinct = new Set(allLicences.filter(r => r.verdict !== 'first-party').map(r => `${r.package}@${r.version}`))
    const statuses = new Set(packages.map(p => p.advisories.status))

    const result: EvidenceResult = {
      provenance: provenanceOf('release:evidence', binding),
      toolchain,
      packages,
      withheld: releasePolicy().withheld,
      totals: {
        tarballs: packed.length,
        distinctDependencies: distinct.size,
        blocked: allLicences.filter(r => r.verdict === 'blocked').length,
        unknown: allLicences.filter(r => r.verdict === 'unknown').length,
        excepted: allLicences.filter(r => r.verdict === 'excepted').length,
        advisoriesTotal: packages.reduce((n, p) => n + p.advisoryRows.length, 0),
        advisoryStatus: statuses.size === 1 ? [...statuses][0] as 'ok' | 'not-run' : 'mixed',
        unresolvedProtocols: packages.reduce((n, p) => n + p.unresolvedProtocols.length, 0),
      },
    }

    const outDir = args.out ? resolve(ROOT, args.out) : join(EVIDENCE_DIR, bundleId(binding))
    mkdirSync(join(outDir, 'sbom'), { recursive: true })

    for (const sbom of sboms) {
      const name = String((sbom.metadata as { component: { name: string } }).component.name).replace('@', '').replace('/', '-')
      writeFileSync(join(outDir, 'sbom', `${name}.cdx.json`), `${JSON.stringify(sbom, null, 2)}\n`, 'utf8')
    }
    writeFileSync(
      join(outDir, 'sbom.cdx.json'),
      `${JSON.stringify(aggregateSbom({ sboms, generatedAt, binding, toolVersion }), null, 2)}\n`,
      'utf8',
    )
    writeFileSync(join(outDir, 'hashes.json'), `${JSON.stringify({ provenance: result.provenance, packages: hashRecords }, null, 2)}\n`, 'utf8')
    writeFileSync(join(outDir, 'provenance.json'), `${JSON.stringify({ provenance: result.provenance, statements: provenanceStatements }, null, 2)}\n`, 'utf8')
    writeFileSync(join(outDir, 'supply-chain.json'), `${JSON.stringify(result, null, 2)}\n`, 'utf8')
    writeFileSync(join(outDir, 'supply-chain.md'), renderSupplyChainReport(result), 'utf8')

    console.log('')
    console.log(`  ${result.totals.tarballs} tarball(s) · ${result.totals.distinctDependencies} distinct dependencies · ${result.totals.blocked} blocked · ${result.totals.unknown} unknown · ${result.totals.excepted} excepted`)
    console.log(`  advisories: ${result.totals.advisoryStatus}${result.totals.advisoryStatus === 'ok' ? ` — ${result.totals.advisoriesTotal} row(s)` : ''}`)
    console.log(`  local protocols left in packed manifests: ${result.totals.unresolvedProtocols}`)
    console.log(`  written → ${outDir.slice(ROOT.length + 1).replaceAll('\\', '/')}/{sbom.cdx.json,sbom/,hashes.json,provenance.json,supply-chain.{json,md}}`)
    if (!binding.admissible)
      console.log(`  ADMISSIBLE: false — ${binding.inadmissibleReason}`)
  }
  finally {
    if (args.keep)
      console.log(`scratch kept at ${stage}`)
    else
      cleanStage(stage)
  }
}

const invokedDirectly = process.argv[1] !== undefined
  && /evidence\.(?:ts|js|mjs)$/.test(process.argv[1].replaceAll('\\', '/'))

if (invokedDirectly) {
  // `.catch` rather than top-level `await`: the module is imported by
  // `release.spec.ts`, and a top-level await in an imported module blocks the
  // importer's evaluation as well as tripping `antfu/no-top-level-await`.
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? (error.stack ?? error.message) : String(error))
    process.exit(1)
  })
}
