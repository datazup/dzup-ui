/**
 * The published component-ownership manifest schema (TASK-S3-O1).
 *
 * This is the contract a **second-tier package** conforms to so that
 * `@dzup-ui/core`'s auto-import resolver and `@dzup-ui/nuxt`'s `includePro`
 * option can resolve its components by exact name. It is the artifact that had
 * been missing since 08-11 finding H1: both consumers advertised a second tier,
 * the repository knew how to *merge* a second manifest
 * (`@dzup-ui/tooling`'s `buildOwnershipMap`), and yet nothing published the
 * shape such a manifest had to have — so no downstream package could produce
 * one, and the seam stayed open for two programmes waiting on an artifact
 * nobody had specified.
 *
 * **Why here and not in `@dzup-ui/tooling`.** `@dzup-ui/tooling` is private
 * (`packages/tooling/scripts/release-policy.json`), so the generator's copy of
 * this shape is unreachable by anyone outside this repository. A contract a
 * consumer cannot import is not a published contract. `@dzup-ui/contracts` is
 * the package both tiers already depend on, it has zero runtime dependencies,
 * and everything below is pure — no `node:*`, no DOM, no clock, no locale — so
 * it runs in a build tool, on a server and in a browser alike.
 *
 * **Why here and not in `@dzup-ui/core`.** Same reason `form-value.ts` is here:
 * `@dzup-ui/core`'s public surface is carried in the ownership manifest, whose
 * schema has no `utility` kind, so every pure function added there lands as
 * `unclassified` under a ceiling that only ratchets down. Publishing the
 * contract must not cost the catalogue's classification budget.
 *
 * **What is deliberately NOT here.** Resolving a package from a consumer's
 * project and reading a file off disk are `node:module`/`node:fs` operations.
 * They stay in the two consumers (`@dzup-ui/core/resolver` and
 * `@dzup-ui/nuxt`), which are build-time modules. This module owns the parts
 * that must be identical for both — the shape, the version policy, the
 * validation and the diagnostics — so the two consumers cannot drift into two
 * opinions about what "conforming" means.
 *
 * @module @dzup-ui/contracts/ownership-manifest
 */

// ---------------------------------------------------------------------------
// Version policy
// ---------------------------------------------------------------------------

/**
 * Schema version this build of the contract emits and reads.
 *
 * It is the version of the **schema**, never of any package. It is kept
 * numerically identical to the version `@dzup-ui/tooling` stamps on this
 * repository's own `component-ownership.manifest.json`, because the whole point
 * of publishing it is that one reader serves both tiers: a manifest this
 * repository generates for itself and a manifest a second tier generates for
 * itself are the same document type.
 */
export const OWNERSHIP_MANIFEST_SCHEMA_VERSION = '1.1.0'

/**
 * The only major this build can read.
 *
 * **Compatibility rule, stated once so nobody has to infer it.** Within major 1
 * every change is additive: a reader written against 1.0.0 still reads a 1.1.0
 * manifest, because 1.1.0 only *added* optional fields. So a manifest whose
 * major matches is accepted even when its minor is higher than this build's —
 * the unknown fields are ignored, which is exactly what "additive" means.
 *
 * A manifest whose major does **not** match is refused outright, with the
 * version named. It is never parsed best-effort: a major bump is reserved for a
 * change that alters the meaning of a field a reader already understands, and a
 * resolver that guesses in that situation misroutes imports silently — the
 * precise failure 08-11 finding H1 recorded.
 */
export const OWNERSHIP_MANIFEST_SCHEMA_MAJOR = 1

/**
 * Where a conforming manifest lives inside a package, as an **exports subpath**.
 *
 * A declared subpath, not a deep path into the package directory. A consumer
 * that reaches past a package's `exports` map works only until the package
 * publishes one — this repository has already paid for that lesson once, when
 * `@dzup-ui/nuxt` pushed `@dzup-ui/tokens/dist/tokens.css` and every real
 * tarball install failed with `Missing "./dist/tokens.css" specifier`. A second
 * tier therefore *declares* this subpath; shipping the file without exporting it
 * is not conformance, and the diagnostic below says so.
 */
export const OWNERSHIP_MANIFEST_SUBPATH = './manifests/component-ownership.manifest.json'

// ---------------------------------------------------------------------------
// The shape
// ---------------------------------------------------------------------------

/**
 * The tier that produced a manifest.
 *
 * Closed at two values on purpose: the merge this schema feeds is a two-tier
 * merge, and a third tier would need a precedence policy that nobody has
 * decided. A manifest naming any other tier is refused rather than guessed at.
 */
export type OwnershipManifestTier = 'core' | 'pro'

/**
 * What a public symbol *is*.
 *
 * Identical to the set `@dzup-ui/tooling`'s generator emits, so one reader
 * serves both tiers. `unclassified` is a first-class outcome, not a failure: a
 * generator that cannot decide reports what it saw instead of guessing, and
 * only `public-component` and `compound-part` are mountable — see
 * {@link MOUNTABLE_OWNERSHIP_KINDS}.
 */
export type OwnershipManifestKind
  = | 'public-component'
    | 'compound-part'
    | 'composable'
    | 'type'
    | 'recipe'
    | 'token-module'
    | 'internal'
    | 'compat-alias'
    | 'unclassified'

/** Every value {@link OwnershipManifestKind} admits, in schema order. */
export const OWNERSHIP_MANIFEST_KINDS: readonly OwnershipManifestKind[] = [
  'public-component',
  'compound-part',
  'composable',
  'type',
  'recipe',
  'token-module',
  'internal',
  'compat-alias',
  'unclassified',
]

/**
 * The kinds a consumer can actually mount, and therefore the only kinds an
 * auto-import resolver may answer for.
 *
 * A resolver that answered `DzButtonProps` would generate an import for a type,
 * and the build error lands in the consumer's app with this library's name on
 * it. The filter lives in the published contract rather than in each consumer
 * so both tiers agree on it by construction.
 */
export const MOUNTABLE_OWNERSHIP_KINDS: readonly OwnershipManifestKind[] = [
  'public-component',
  'compound-part',
]

/** Maturity, as the producing package declares it. */
export type OwnershipManifestStatus = 'experimental' | 'beta' | 'stable' | 'deprecated'

/** Every value {@link OwnershipManifestStatus} admits. */
export const OWNERSHIP_MANIFEST_STATUSES: readonly OwnershipManifestStatus[] = [
  'experimental',
  'beta',
  'stable',
  'deprecated',
]

/**
 * A deprecation, as the owning package can state it about itself.
 *
 * An object rather than a bare boolean because "deprecated" on its own is not
 * actionable: a consumer needs to know since when and what to move to. Both
 * extra fields are optional, so a package that only knows the fact can still
 * state the fact.
 */
export interface OwnershipManifestDeprecation {
  /** Version of the owning package in which the symbol was deprecated. */
  since?: string
  /** The symbol that replaces it, if there is one. */
  replacement?: string
  /** One sentence a consumer can act on. */
  reason?: string
}

/**
 * One public symbol and who owns it.
 *
 * **Field-by-field rationale.** The governing constraint is the one the task
 * states: *a schema that cannot be satisfied is the same failure as no schema*.
 * So every required field is something a component library can generate about
 * **itself**, from its own barrels, its own `package.json#exports` and its own
 * source — nothing that would require knowledge only a specific downstream
 * package could have.
 *
 * | Field | Required | Why a library can produce it | Why a consumer needs it |
 * |---|---|---|---|
 * | `symbol` | yes | it is the exported identifier | resolution is by **exact name**; a prefix cannot separate two packages that both use `Dz` |
 * | `package` | yes | its own `name` | the specifier the resolver emits |
 * | `subpath` | yes | its own `exports` map | lets the consumer import from the narrowest declared subpath instead of a barrel — and a subpath that is not declared cannot be written here without the producer noticing |
 * | `kind` | yes | its own classification pass | only mountable kinds may auto-import |
 * | `evidence` | **no** (diverges) | it is generator provenance | the resolver never reads it; see below |
 * | `subpaths` | no | its own `exports` map | tree-shaking and docs; the resolver uses `subpath` |
 * | `parentComponent` | conditional | the part's own compound registration | a part must not outlive its parent in a registry |
 * | `aliasOf` | conditional | its own alias table | a compat alias with no target is a dangling import |
 * | `status` | no | its own story/status metadata | lets a consumer avoid experimental surface |
 * | `family` | no | its own directory layout | grouping in docs and registries |
 * | `since` | no | its own changelog/version | "when can I use this" without a release note hunt |
 * | `deprecated` | no | its own deprecation table | a build-time warning instead of a silent removal later |
 * | `anatomy` | no | its own `*.anatomy.ts` | docs and styling surface (ADR-19) |
 *
 * **The one deliberate divergence from this repository's own manifest:
 * `evidence` is optional here and required there.** Its content is a list of
 * authority *file paths inside the producing repository* — `evidence` exists so
 * that a generator can prove, to its own validator, why it classified a symbol
 * the way it did. That proof is meaningful to the repository that produced it
 * and meaningless to a consumer, who cannot open those paths; requiring a
 * second tier to publish its internal file layout to satisfy a resolver would
 * be requiring a field for no consumer benefit. `@dzup-ui/tooling` continues to
 * require it of **this** repository's manifest, where it is checkable. It is
 * still accepted, and still validated when present, so a tier that wants to
 * publish its provenance may.
 */
export interface OwnershipManifestEntry {
  /** Exported symbol name, exactly as consumers import it. */
  symbol: string
  /** Owning package, e.g. `@dzup-ui-pro/pro`. */
  package: string
  /**
   * Primary import path: `.` when the symbol is reachable from the root barrel,
   * otherwise the most specific declared `exports` subpath that exposes it.
   */
  subpath: string
  /** Every declared subpath that exposes the symbol, sorted. */
  subpaths?: string[]
  kind: OwnershipManifestKind
  /** Required when `kind === 'compound-part'`. Names a `public-component`. */
  parentComponent?: string
  /** Required when `kind === 'compat-alias'`. Names a symbol in this manifest. */
  aliasOf?: string
  /** Maturity, when the producing package tracks it. */
  status?: OwnershipManifestStatus
  /** Component family / grouping, as the producing package names it. */
  family?: string
  /** Version of `package` in which the symbol first appeared. */
  since?: string
  /** Present only when the symbol is deprecated. */
  deprecated?: OwnershipManifestDeprecation
  /**
   * Declared styling surface (ADR-19), copied verbatim from the component's
   * anatomy declaration.
   *
   * Typed as `unknown` rather than as `ComponentAnatomy`: the anatomy contract
   * versions on its own schedule, and pinning this field to today's interface
   * would make a second tier's manifest fail to type-check the day the anatomy
   * vocabulary grows — over a field no resolver reads. Validated only as
   * "an object if present"; a consumer that wants the anatomy narrows it itself
   * against `ComponentAnatomy`.
   */
  anatomy?: unknown
  /** Authority paths that justified the classification. Optional — see above. */
  evidence?: string[]
}

/** A conforming component-ownership manifest. */
export interface OwnershipManifestDocument {
  /** Semver of the **schema**, not of any package. */
  schemaVersion: string
  tier: OwnershipManifestTier
  /**
   * Repository HEAD at generation time, or `unknown` outside a git checkout.
   *
   * Provenance only. No consumer gates on it — it records which checkout
   * produced the file, and a resolver that refused a manifest over it would
   * fail on every unrelated commit while proving nothing about the entries.
   */
  sourceCommit: string
  /** Authority file globs the entries were derived from, sorted. */
  generatedFrom: string[]
  /** Sorted by `symbol` with a stable, locale-independent comparator. */
  entries: OwnershipManifestEntry[]
}

// ---------------------------------------------------------------------------
// Reading a manifest
// ---------------------------------------------------------------------------

/**
 * Why a manifest was refused, in a form a caller can branch on.
 *
 * - `malformed` — not an object, or a required top-level field is missing.
 * - `unreadable-version` — `schemaVersion` absent or not `major.minor.patch`.
 * - `unsupported-major` — a major this build does not implement.
 * - `invalid-entries` — the document parsed, but entries break the field rules.
 */
export type OwnershipManifestRejection
  = 'invalid-entries'
    | 'malformed'
    | 'unreadable-version'
    | 'unsupported-major'

/** One problem, addressed so a diagnostic can point at it. */
export interface OwnershipManifestProblem {
  /** Which rule it breaks — `schema`, `version`, `compound-part`, … */
  rule: string
  /** Where, e.g. `entries[12] (DzFoo)` or `<document>`. */
  at: string
  message: string
}

/** The outcome of {@link readOwnershipManifest}. */
export interface OwnershipManifestReadResult {
  ok: boolean
  /** Present only when `ok`. */
  manifest?: OwnershipManifestDocument
  /** Present only when `ok === false`. */
  rejection?: OwnershipManifestRejection
  /** The `schemaVersion` as written, whenever one could be read at all. */
  schemaVersion?: string
  problems: OwnershipManifestProblem[]
}

/** `major.minor.patch`, ignoring pre-release and build metadata. */
function parseMajor(version: unknown): number | undefined {
  if (typeof version !== 'string')
    return undefined
  const match = /^(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/.exec(version)
  if (match === null)
    return undefined
  return Number(match[1])
}

/**
 * True when this build can read a manifest at `version`.
 *
 * Exported because both consumers and this repository's `validate:ownership`
 * ask the same question, and a second opinion about it is how a "conforming"
 * manifest becomes non-conforming halfway through a build.
 */
export function isSupportedOwnershipSchema(version: unknown): boolean {
  return parseMajor(version) === OWNERSHIP_MANIFEST_SCHEMA_MAJOR
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const PACKAGE_NAME_RE = /^(?:@[a-z0-9-][\w.-]*\/)?[a-z0-9-][\w.-]*$/
const SUBPATH_RE = /^\.(?:\/[\w.-]+)*$/

/** The field rules, applied to one entry. */
function checkEntry(value: unknown, index: number): OwnershipManifestProblem[] {
  const problems: OwnershipManifestProblem[] = []
  if (!isRecord(value)) {
    return [{ rule: 'schema', at: `entries[${index}]`, message: 'entry is not an object' }]
  }

  const symbol = typeof value.symbol === 'string' ? value.symbol : ''
  const at = `entries[${index}] (${symbol || '<unnamed>'})`
  const require = (rule: string, ok: boolean, message: string): void => {
    if (!ok)
      problems.push({ rule, at, message })
  }

  require('schema', symbol.length > 0, 'symbol is required')
  require(
    'schema',
    typeof value.package === 'string' && PACKAGE_NAME_RE.test(value.package),
    `package ${JSON.stringify(value.package)} is not a package name`,
  )
  require(
    'schema',
    typeof value.subpath === 'string' && SUBPATH_RE.test(value.subpath),
    `subpath ${JSON.stringify(value.subpath)} is not an exports subpath (".", "./forms", …)`,
  )
  require(
    'schema',
    OWNERSHIP_MANIFEST_KINDS.includes(value.kind as OwnershipManifestKind),
    `kind ${JSON.stringify(value.kind)} is not a known kind`,
  )
  require(
    'schema',
    value.subpaths === undefined
    || (Array.isArray(value.subpaths) && value.subpaths.every(entry => typeof entry === 'string' && SUBPATH_RE.test(entry))),
    'subpaths, when present, must be an array of exports subpaths',
  )
  require(
    'schema',
    value.status === undefined || OWNERSHIP_MANIFEST_STATUSES.includes(value.status as OwnershipManifestStatus),
    `status ${JSON.stringify(value.status)} is not a known maturity`,
  )
  require(
    'compound-part',
    value.kind !== 'compound-part' || typeof value.parentComponent === 'string',
    'a compound-part must name its parentComponent',
  )
  require(
    'compat-alias',
    value.kind !== 'compat-alias' || typeof value.aliasOf === 'string',
    'a compat-alias must name the symbol it aliases',
  )
  require(
    'schema',
    value.family === undefined || typeof value.family === 'string',
    'family, when present, must be a string',
  )
  require(
    'schema',
    value.since === undefined || typeof value.since === 'string',
    'since, when present, must be a version string',
  )
  require(
    'schema',
    value.deprecated === undefined || isRecord(value.deprecated),
    'deprecated, when present, must be an object ({ since?, replacement?, reason? })',
  )
  require(
    'schema',
    value.anatomy === undefined || isRecord(value.anatomy),
    'anatomy, when present, must be an object',
  )
  require(
    'schema',
    value.evidence === undefined
    || (Array.isArray(value.evidence) && value.evidence.every(entry => typeof entry === 'string')),
    'evidence, when present, must be an array of strings',
  )

  return problems
}

/**
 * Parse and validate a manifest **value** (already `JSON.parse`d).
 *
 * Pure: it never touches the filesystem, so the same function checks a manifest
 * a consumer resolved from `node_modules`, a fixture in a unit test, and this
 * repository's own generated file.
 *
 * It **fails closed**. A document it cannot fully understand is refused with the
 * reason and the version named, never accepted partially — a resolver working
 * from half a manifest answers `undefined` for real components and a package
 * name for names that were never checked, which is worse than answering nothing
 * at all.
 *
 * @param value - the parsed JSON document.
 * @param options - reader options.
 * @param options.maxProblems - cap on reported entry problems (default 10); the
 * count is always complete even when the list is truncated.
 */
export function readOwnershipManifest(
  value: unknown,
  options: { maxProblems?: number } = {},
): OwnershipManifestReadResult {
  const { maxProblems = 10 } = options

  if (!isRecord(value)) {
    return {
      ok: false,
      rejection: 'malformed',
      problems: [{ rule: 'schema', at: '<document>', message: 'the manifest is not a JSON object' }],
    }
  }

  const schemaVersion = typeof value.schemaVersion === 'string' ? value.schemaVersion : undefined

  if (parseMajor(value.schemaVersion) === undefined) {
    return {
      ok: false,
      rejection: 'unreadable-version',
      schemaVersion,
      problems: [{
        rule: 'version',
        at: '<document>',
        message: `schemaVersion ${JSON.stringify(value.schemaVersion)} is not a major.minor.patch version`,
      }],
    }
  }

  if (!isSupportedOwnershipSchema(value.schemaVersion)) {
    return {
      ok: false,
      rejection: 'unsupported-major',
      schemaVersion,
      problems: [{
        rule: 'version',
        at: '<document>',
        message: `schemaVersion ${schemaVersion} is not readable by this build, which implements `
          + `major ${OWNERSHIP_MANIFEST_SCHEMA_MAJOR} (currently ${OWNERSHIP_MANIFEST_SCHEMA_VERSION}). `
          + 'A major bump changes the meaning of a field a reader already understands, so it is '
          + 'refused rather than parsed best-effort.',
      }],
    }
  }

  const problems: OwnershipManifestProblem[] = []

  if (value.tier !== 'core' && value.tier !== 'pro') {
    problems.push({
      rule: 'schema',
      at: '<document>',
      message: `tier ${JSON.stringify(value.tier)} is not "core" or "pro"`,
    })
  }
  if (typeof value.sourceCommit !== 'string' || value.sourceCommit.length === 0)
    problems.push({ rule: 'schema', at: '<document>', message: 'sourceCommit is required ("unknown" outside a git checkout)' })
  if (!Array.isArray(value.generatedFrom) || value.generatedFrom.some(entry => typeof entry !== 'string'))
    problems.push({ rule: 'schema', at: '<document>', message: 'generatedFrom must be an array of strings' })
  if (!Array.isArray(value.entries))
    problems.push({ rule: 'schema', at: '<document>', message: 'entries must be an array' })

  if (problems.length > 0)
    return { ok: false, rejection: 'malformed', schemaVersion, problems }

  const entries = value.entries as unknown[]
  const seen = new Set<string>()
  for (let index = 0; index < entries.length; index += 1) {
    problems.push(...checkEntry(entries[index], index))
    const entry = entries[index]
    if (isRecord(entry) && typeof entry.symbol === 'string') {
      if (seen.has(entry.symbol)) {
        problems.push({
          rule: 'duplicate-symbol',
          at: `entries[${index}] (${entry.symbol})`,
          message: 'the same symbol appears twice; one manifest must give one answer per name',
        })
      }
      seen.add(entry.symbol)
    }
  }

  if (problems.length > 0) {
    const total = problems.length
    const shown = problems.slice(0, maxProblems)
    if (total > maxProblems) {
      shown.push({
        rule: 'schema',
        at: '<document>',
        message: `…and ${total - maxProblems} further problem(s) not listed.`,
      })
    }
    return { ok: false, rejection: 'invalid-entries', schemaVersion, problems: shown }
  }

  return {
    ok: true,
    manifest: value as unknown as OwnershipManifestDocument,
    schemaVersion,
    problems: [],
  }
}

// ---------------------------------------------------------------------------
// Using a manifest
// ---------------------------------------------------------------------------

/** One resolvable component, as a consumer needs it. */
export interface OwnershipManifestResolution {
  /** The real export name. */
  symbol: string
  /** The specifier to import from — `package` plus `subpath`, already joined. */
  from: string
  kind: OwnershipManifestKind
  deprecated?: OwnershipManifestDeprecation
  since?: string
}

/**
 * Join a package name and an exports subpath into the specifier to import from.
 *
 * `.` is the root barrel, so it produces the bare package name; anything else
 * produces `pkg/sub`. Exported because a consumer that builds this string by
 * hand will eventually build `pkg/./sub`.
 */
export function ownershipSpecifier(packageName: string, subpath: string): string {
  return subpath === '.' ? packageName : `${packageName}${subpath.slice(1)}`
}

/**
 * Index a manifest into the exact-name lookup a resolver uses.
 *
 * Only mountable kinds are indexed ({@link MOUNTABLE_OWNERSHIP_KINDS}), so a
 * type or a composable in the manifest can never be answered as a component.
 *
 * Pure, and separate from reading, so a consumer can index a manifest it
 * obtained any way at all — from `node_modules`, from a fixture, from a
 * generator's in-memory output.
 */
export function indexOwnershipManifest(
  manifest: OwnershipManifestDocument,
): Record<string, OwnershipManifestResolution> {
  const index: Record<string, OwnershipManifestResolution> = Object.create(null) as Record<string, OwnershipManifestResolution>
  for (const entry of manifest.entries) {
    if (!MOUNTABLE_OWNERSHIP_KINDS.includes(entry.kind))
      continue
    index[entry.symbol] = {
      symbol: entry.symbol,
      from: ownershipSpecifier(entry.package, entry.subpath),
      kind: entry.kind,
      ...(entry.deprecated === undefined ? {} : { deprecated: entry.deprecated }),
      ...(entry.since === undefined ? {} : { since: entry.since }),
    }
  }
  return index
}

// ---------------------------------------------------------------------------
// Diagnostics
// ---------------------------------------------------------------------------

/**
 * Why a second tier could not be consumed, from the consumer's point of view.
 *
 * `not-installed` and `no-manifest` are different failures with different
 * owners — one a consumer fixes by installing a package, one only the producing
 * package can fix — and collapsing them into "Pro didn't work" is what makes an
 * integration defect take a day to diagnose.
 *
 * - `loaded` — a conforming manifest was read.
 * - `not-installed` — the package does not resolve from the consumer's project.
 * - `no-manifest` — the package resolves but does not export the subpath.
 * - `unreadable` — the subpath resolves but the file is not readable JSON.
 * - `non-conforming` — the document parsed but is not conforming.
 */
export type OwnershipManifestAvailability
  = 'loaded'
    | 'no-manifest'
    | 'non-conforming'
    | 'not-installed'
    | 'unreadable'

/**
 * The two filesystem operations consuming a manifest needs, injected.
 *
 * Injected rather than performed here because this package must stay free of
 * `node:*` — it is imported by browser code. Each consumer supplies six lines
 * (`createRequire(...).resolve`, `readFileSync`) and gets the *decisions* from
 * here, which is the half that must not differ between them.
 */
export interface OwnershipManifestIo {
  /** Resolve a package specifier to a path, or `undefined` when it does not resolve. */
  resolve: (specifier: string) => string | undefined
  /** Read a resolved path as text. May throw; the caller of `consume` catches. */
  readText: (path: string) => string
}

/** The outcome of {@link consumeOwnershipManifest}. */
export interface OwnershipManifestConsumption {
  availability: OwnershipManifestAvailability
  /** Mountable names only; empty unless `availability === 'loaded'`. */
  symbols: Record<string, OwnershipManifestResolution>
  /** As declared by the manifest, whenever one could be read at all. */
  schemaVersion?: string
  /** The resolved path, when the subpath resolved. */
  path?: string
  /** Already-formatted parenthetical detail for {@link ownershipManifestDiagnostic}. */
  detail?: string
}

/**
 * Resolve, read, validate and index a second tier's ownership manifest.
 *
 * This is the shared half of consumption: **which failure happened** and
 * **what a consumer may do with the result**. It lives here so that
 * `@dzup-ui/core`'s resolver and `@dzup-ui/nuxt` cannot develop two opinions
 * about what "installed but not conforming" means — the exact class of drift
 * that let a handwritten Pro list in the Nuxt module disagree with a
 * handwritten Pro list in the resolver, and with both packages, for a year.
 *
 * Three distinct failures, kept distinct because they have three different
 * owners: the consumer installs a package, the producing package exports a
 * manifest, this library ships a reader for a major.
 *
 * Nothing here throws, including on unreadable JSON: an optional second tier
 * must never be able to kill a consumer's build.
 *
 * The manifest is only ever read **as data**. No consumer `import()`s the
 * second-tier package to obtain it, so nothing in that package executes.
 */
export function consumeOwnershipManifest(
  packageName: string,
  io: OwnershipManifestIo,
): OwnershipManifestConsumption {
  const path = io.resolve(`${packageName}${OWNERSHIP_MANIFEST_SUBPATH.slice(1)}`)

  if (path === undefined) {
    // The subpath did not resolve. Is the package there at all? Two probes:
    // `./package.json` is a condition-free export that answers "is it on disk
    // here?" for an ESM-only package, and the bare name still answers for one
    // published before that export existed.
    const installed = io.resolve(`${packageName}/package.json`) ?? io.resolve(packageName)
    if (installed === undefined)
      return { availability: 'not-installed', symbols: {} }

    return {
      availability: 'no-manifest',
      symbols: {},
      detail: `("${packageName}" itself resolves, so this is a packaging gap in that package, `
        + 'not a missing install.)',
    }
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(io.readText(path))
  }
  catch (error) {
    return {
      availability: 'unreadable',
      symbols: {},
      path,
      detail: `(${path}: ${error instanceof Error ? error.message : String(error)})`,
    }
  }

  const result = readOwnershipManifest(parsed)
  if (!result.ok || result.manifest === undefined) {
    return {
      availability: 'non-conforming',
      symbols: {},
      path,
      schemaVersion: result.schemaVersion,
      detail: `(declared schemaVersion ${result.schemaVersion ?? '<absent>'}; `
        + `${result.problems.map(problem => `${problem.at} ${problem.message}`).join('; ')})`,
    }
  }

  return {
    availability: 'loaded',
    symbols: indexOwnershipManifest(result.manifest),
    path,
    schemaVersion: result.schemaVersion,
  }
}

/**
 * The one actionable sentence a consumer sees, built once for both consumers.
 *
 * Defined here rather than in each consumer so that `@dzup-ui/core/resolver`
 * and `@dzup-ui/nuxt` cannot drift into two different accounts of the same
 * situation — which is how "my Pro components stopped auto-importing" becomes
 * unanswerable. Every branch names **what is wrong, which package, and what
 * would fix it**, and every branch offers the off switch, because a consumer
 * who does not want the second tier should not have to keep reading the
 * diagnostic.
 *
 * @param availability - what happened.
 * @param context - who is reporting, about which package, and with what detail.
 * @param context.consumer - log prefix, e.g. `@dzup-ui/nuxt`.
 * @param context.packageName - the second-tier package, e.g. `@dzup-ui-pro/pro`.
 * @param context.option - how the consumer turns the tier off in *that* tool.
 * @param context.detail - extra, already-formatted detail (a version, a path, a
 * list of problems). Appended verbatim.
 */
export function ownershipManifestDiagnostic(
  availability: Exclude<OwnershipManifestAvailability, 'loaded'>,
  context: { consumer: string, packageName: string, option: string, detail?: string },
): string {
  const { consumer, packageName, option, detail } = context
  const head = `[${consumer}] includePro is enabled but `
  const tail = detail === undefined ? '' : ` ${detail}`

  switch (availability) {
    case 'not-installed':
      return `${head}"${packageName}" cannot be resolved from this project. Those components will `
        + `not auto-import. Install it (yarn add ${packageName}), or set ${option}.${tail}`
    case 'no-manifest':
      return `${head}no conforming ownership manifest was resolvable from "${packageName}". Those `
        + `components will not auto-import. Install a version that exports `
        + `"${OWNERSHIP_MANIFEST_SUBPATH}" at schema major ${OWNERSHIP_MANIFEST_SCHEMA_MAJOR} `
        + `(this build reads ${OWNERSHIP_MANIFEST_SCHEMA_VERSION}), or set ${option}.${tail}`
    case 'unreadable':
      return `${head}"${packageName}${OWNERSHIP_MANIFEST_SUBPATH.slice(1)}" resolved but could not `
        + `be read as JSON. Those components will not auto-import. Reinstall "${packageName}", or `
        + `set ${option}.${tail}`
    case 'non-conforming':
      return `${head}the ownership manifest published by "${packageName}" does not conform to the `
        + `schema in @dzup-ui/contracts (${OWNERSHIP_MANIFEST_SUBPATH}, major `
        + `${OWNERSHIP_MANIFEST_SCHEMA_MAJOR}, this build reads `
        + `${OWNERSHIP_MANIFEST_SCHEMA_VERSION}). It is refused rather than read best-effort, so `
        + `those components will not auto-import. Report it to "${packageName}", or set `
        + `${option}.${tail}`
  }
}

/**
 * The sentence a consumer sees when one name is claimed by both tiers.
 *
 * It names **both** packages and takes no side, because choosing a winner is an
 * owner decision recorded in this repository's collision policy — not something
 * a resolver decides at a consumer's build time. What the consumer needs from
 * the message is which two packages disagree and that the answer they get is
 * the first tier's, unchanged.
 */
export function ownershipCollisionDiagnostic(
  symbol: string,
  context: { consumer: string, firstTier: string, secondTier: string },
): string {
  const { consumer, firstTier, secondTier } = context
  return `[${consumer}] "${symbol}" is exported by both "${firstTier}" and "${secondTier}". `
    + `Auto-import keeps the "${firstTier}" answer and ignores the "${secondTier}" entry — this `
    + 'library never picks a winner between two tiers at build time. Import the one you want '
    + 'explicitly, or ask the packages to settle the name.'
}
