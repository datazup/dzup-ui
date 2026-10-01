/**
 * The declared capture environment, and the refusals that enforce it
 * (TASK-S1-O4).
 *
 * `packages/core/perf/baselines.json` records a threshold per metric. A
 * threshold is only meaningful beside the host that produced it, and until this
 * module existed nothing in the repository *declared* which host that should
 * be — the file simply recorded whichever machine happened to run
 * `yarn perf:capture` last. That is the same defect TASK-S1-O3 found in the
 * visual lane (baselines for one platform, runners on another, nothing reading
 * `process.platform`), and this is the same answer: **declare the authority as
 * data, check it in the write path, and refuse rather than capture.**
 *
 * ## Why the refusal matters more here than it does for pixels
 *
 * A visual baseline captured on the wrong platform fails loudly on the next
 * comparison. A perf baseline captured on a *contended* host does the opposite:
 * the distribution is wide, so `median + max(3σ, 5 %)` earns a **permissive**
 * threshold, and the lane goes green for a year while the component gets
 * slower. Worse, the ratchet is downward-only by policy, so that permissive
 * number cannot be tightened by a later quiet run without an owner decision.
 * **A bad perf capture is durable damage, not a wasted afternoon.**
 *
 * ## The four refusals
 *
 * An **in-place** write of `packages/core/perf/baselines.json` is refused
 * unless all four hold. `yarn perf:propose <path>` is never refused — measuring
 * and proposing is a contributor act, adopting a budget is an owner act, and
 * that split is TASK-R2-O7's `--propose` flag made load-bearing.
 *
 * 1. `undesignated` — no authoritative profile has been declared.
 * 2. `wrong-host` — the running host does not match the declared profile.
 * 3. `unattested` — quiescence was not attested (the tooling cannot measure
 *    thermal state or co-tenancy, so it asks for a signature instead of
 *    pretending to check).
 * 4. `raises-budget` — at least one recorded threshold would move **up**. This
 *    is defect **D132** from TASK-R2-O7: `mayRatchet()` has existed with six
 *    unit tests and *no production call site* since P5-05, and R2-O7 measured
 *    that an in-place capture at that moment would have silently raised **22 of
 *    33** committed budgets. This module is its call site.
 *
 * @module @dzup-ui/tooling/perf/capture-environment
 */

import type { Baseline, BaselineFile, MetricKind } from './baselines.ts'
import { existsSync, readFileSync } from 'node:fs'
import { arch, cpus, platform } from 'node:os'
import { resolve } from 'node:path'
import process from 'node:process'
import { ROOT } from '../ownership/generate-ownership-manifest.ts'
import { mayRatchet, MEASURABLE_CV, MINIMUM_RUNS } from './statistics.ts'

export const CAPTURE_ENVIRONMENT_PATH = resolve(
  ROOT,
  'packages/core/perf/capture-environment.json',
)

/** Every metric family the schema knows. Kept beside {@link MetricKind}. */
export const METRIC_KINDS: readonly MetricKind[] = [
  'size',
  'runtime',
  'leak',
  'longtask',
  'memory',
  'hydration',
]

/** A host class, declared rather than observed. */
export interface HostProfile {
  readonly platform: string
  readonly arch: string
  readonly minCpus: number
  readonly nodeMajor: number
  readonly description: string
}

/** What the running machine actually is. */
export interface Host {
  readonly platform: string
  readonly arch: string
  readonly cpus: number
  readonly node: string
}

export interface CaptureEnvironment {
  readonly schemaVersion: string
  readonly authoritative: {
    readonly designated: boolean
    readonly profileId: string | null
    readonly decision?: string
    readonly why?: string
    readonly blockedOn?: string
  }
  readonly profiles: Readonly<Record<string, HostProfile>>
  readonly candidates?: readonly unknown[]
  readonly committed?: {
    readonly profileId: string | null
    /**
     * Per-kind overrides of `profileId`. Since 2026-09-29 the 22 `size` baselines
     * are captured on linux (D135 / O7-D1) while the 11 `runtime` baselines are
     * still the 2026-08-21 win32 set, so one profile cannot describe the file.
     * A kind absent here falls back to `profileId`.
     */
    readonly byKind?: Readonly<Record<string, string>>
    readonly derivedFrom?: string
    readonly sourceCommit?: string
    readonly capturedOn?: string
    readonly note?: string
  }
  readonly quiescence?: {
    readonly required: boolean
    readonly why?: string
    readonly rules?: readonly string[]
    readonly attestation?: string
  }
  readonly policy?: Readonly<Record<string, string>>
}

/** The declared environment, or `undefined` when the file is absent. */
export function readCaptureEnvironment(
  path: string = CAPTURE_ENVIRONMENT_PATH,
): CaptureEnvironment | undefined {
  if (!existsSync(path))
    return undefined
  return JSON.parse(readFileSync(path, 'utf8')) as CaptureEnvironment
}

/** The running machine, in the shape a `Baseline.host` block records. */
export function currentHost(): Host {
  return {
    platform: platform(),
    arch: arch(),
    cpus: cpus().length,
    node: process.version,
  }
}

/** `v24.14.1` → `24`; anything unparseable → `NaN`, which never matches. */
export function nodeMajorOf(version: string): number {
  return Number.parseInt(version.replace(/^v/, ''), 10)
}

/**
 * Whether a host is an instance of a declared profile.
 *
 * `minCpus` rather than an exact count on purpose: a 32-core machine is a
 * legitimate instance of a "≥16 cores" profile, and refusing it would push the
 * profile towards naming one physical laptop. Platform, architecture and node
 * major are exact — each of them changes what is measured.
 */
export function hostMatchesProfile(
  profile: HostProfile,
  host: Host,
): { match: boolean, reasons: string[] } {
  const reasons: string[] = []
  if (host.platform !== profile.platform)
    reasons.push(`platform ${host.platform} ≠ ${profile.platform}`)
  if (host.arch !== profile.arch)
    reasons.push(`arch ${host.arch} ≠ ${profile.arch}`)
  if (host.cpus < profile.minCpus)
    reasons.push(`${host.cpus} CPUs < the declared minimum of ${profile.minCpus}`)
  if (nodeMajorOf(host.node) !== profile.nodeMajor)
    reasons.push(`node ${host.node} is not major ${profile.nodeMajor}`)
  return { match: reasons.length === 0, reasons }
}

export type CaptureRefusalCode
  = | 'no-environment'
    | 'undesignated'
    | 'unknown-profile'
    | 'wrong-host'
    | 'unattested'
    | 'raises-budget'

export interface CaptureRefusal {
  readonly code: CaptureRefusalCode
  readonly message: string
}

/** How a fresh capture would move each recorded threshold. */
export interface ThresholdMovements {
  /** Recorded threshold → higher. A budget raise; the thing doc 06 forbids by default. */
  readonly raised: readonly {
    id: string
    from: number
    to: number
    percent: number
    ratchetReason: string
  }[]
  /** Recorded threshold → lower, and `mayRatchet` agrees it earned the move. */
  readonly lowered: readonly { id: string, from: number, to: number, percent: number }[]
  /** Metric ids in the fresh set with no recorded counterpart. */
  readonly added: readonly string[]
  /** Recorded metric ids the fresh set does not contain. */
  readonly removed: readonly string[]
  /** Recorded with a threshold, fresh without one. Evidence lost, not gained. */
  readonly thresholdLost: readonly string[]
}

/**
 * Compare a proposed baseline set against the committed one.
 *
 * This is the function D132 asked for. It reads the recorded file — which
 * `capture-baselines.ts` never did — so the direction of every threshold move
 * is known *before* the write rather than discovered by a reader later.
 */
export function thresholdMovements(
  recorded: BaselineFile | undefined,
  fresh: readonly Baseline[],
): ThresholdMovements {
  const before = new Map((recorded?.baselines ?? []).map(b => [b.id, b]))
  const after = new Map(fresh.map(b => [b.id, b]))

  const raised: ThresholdMovements['raised'][number][] = []
  const lowered: ThresholdMovements['lowered'][number][] = []
  const added: string[] = []
  const thresholdLost: string[] = []

  for (const [id, next] of after) {
    const prior = before.get(id)
    if (prior === undefined) {
      added.push(id)
      continue
    }
    if (prior.threshold === null)
      continue
    if (next.threshold === null) {
      thresholdLost.push(id)
      continue
    }
    if (next.threshold === prior.threshold)
      continue

    const percent = ((next.threshold - prior.threshold) / prior.threshold) * 100
    if (next.threshold > prior.threshold) {
      const verdict = mayRatchet(prior.distribution, next.distribution)
      raised.push({
        id,
        from: prior.threshold,
        to: next.threshold,
        percent,
        ratchetReason: verdict.ratchet ? 'median improved but the band widened' : verdict.reason,
      })
      continue
    }
    lowered.push({ id, from: prior.threshold, to: next.threshold, percent })
  }

  const removed = [...before.keys()].filter(id => !after.has(id))
  return { raised, lowered, added: added.sort(), removed: removed.sort(), thresholdLost }
}

export interface CaptureRequest {
  /** True for an in-place write of `packages/core/perf/baselines.json`. */
  readonly inPlace: boolean
  /** The `--quiet-host-attested-by` signature, when one was given. */
  readonly attestedBy?: string
  /** True when `--raise-budget --owner … --reason …` were all supplied. */
  readonly budgetRaiseAuthorised?: boolean
  /** How the fresh set would move the recorded thresholds, when known. */
  readonly movements?: ThresholdMovements
}

/**
 * Decide whether a capture may be written, and say why not in full.
 *
 * Every refusal names itself, names the state that caused it and names the
 * action that would clear it. None of them is silenceable by an environment
 * variable — that is deliberate: `DZUP_PERF_GATE` already exists as the escape
 * hatch for *reading* a threshold, and an escape hatch for *writing* one would
 * make every refusal above decorative.
 */
export function checkCaptureAuthority(
  environment: CaptureEnvironment | undefined,
  host: Host,
  request: CaptureRequest,
): { allowed: boolean, refusals: CaptureRefusal[] } {
  // A proposal is always allowed. It writes to a path the caller names and
  // leaves the file thirty-three live metrics depend on untouched.
  if (!request.inPlace)
    return { allowed: true, refusals: [] }

  const refusals: CaptureRefusal[] = []

  if (environment === undefined) {
    refusals.push({
      code: 'no-environment',
      message: 'perf: packages/core/perf/capture-environment.json is missing, so no host is '
        + 'declared authoritative and an in-place capture cannot be qualified. Restore the '
        + 'file, or capture with `yarn perf:propose <path>`.',
    })
    return { allowed: false, refusals }
  }

  const { designated, profileId } = environment.authoritative
  if (!designated || profileId === null) {
    refusals.push({
      code: 'undesignated',
      message: 'perf: no authoritative capture host is designated '
        + `(authoritative.designated = ${String(designated)}). Designating one is an owner `
        + 'action — see `candidates` in packages/core/perf/capture-environment.json and '
        + `decision ${environment.authoritative.decision ?? 'D-S1O4-1'}. `
        + 'Until then, capture with `yarn perf:propose <path>`.',
    })
  }
  else {
    const profile = environment.profiles[profileId]
    if (profile === undefined) {
      refusals.push({
        code: 'unknown-profile',
        message: `perf: authoritative.profileId "${profileId}" is not one of the declared `
          + `profiles (${Object.keys(environment.profiles).sort().join(', ')}).`,
      })
    }
    else {
      const verdict = hostMatchesProfile(profile, host)
      if (!verdict.match) {
        refusals.push({
          code: 'wrong-host',
          message: `perf: this host is not the authoritative capture host "${profileId}" — `
            + `${verdict.reasons.join('; ')}. Re-run on that host, or capture with `
            + '`yarn perf:propose <path>`.',
        })
      }
    }
  }

  if (environment.quiescence?.required === true && (request.attestedBy ?? '').trim() === '') {
    refusals.push({
      code: 'unattested',
      message: 'perf: quiescence is not attested. A capture on a contended machine records a '
        + 'wide distribution, which earns a PERMISSIVE threshold, and the ratchet is downward '
        + 'only — so the damage is durable. Re-run with '
        + '`--quiet-host-attested-by "<name>"` once the rules in '
        + 'capture-environment.json `quiescence.rules` hold.',
    })
  }

  const raised = request.movements?.raised ?? []
  if (raised.length > 0 && request.budgetRaiseAuthorised !== true) {
    const worst = [...raised].sort((a, b) => b.percent - a.percent).slice(0, 5)
    refusals.push({
      code: 'raises-budget',
      message: `perf: this capture would RAISE ${raised.length} recorded threshold(s). `
        + '2026-08-11 doc 06: "A budget increase needs a recorded user benefit and owner; it '
        + 'is not the default response to regression." Worst: '
        + `${worst.map(r => `${r.id} ${r.from.toFixed(0)} → ${r.to.toFixed(0)} (+${r.percent.toFixed(1)} %)`).join('; ')}`
        + `${raised.length > worst.length ? `, and ${raised.length - worst.length} more` : ''}. `
        + 'Re-run with `--raise-budget --owner "<name>" --reason "<the user benefit>"`, or '
        + 'capture with `yarn perf:propose <path>` and let an owner decide.',
    })
  }

  return { allowed: refusals.length === 0, refusals }
}

// ---------------------------------------------------------------------------
// Repository-state checks — the half that needs no host (`validate:perf-baselines`)
// ---------------------------------------------------------------------------

export type PerfViolationRule
  = | 'environment'
    | 'profile'
    | 'host-drift'
    | 'provenance'
    | 'sample-discipline'
    | 'threshold-consistency'
    | 'gate-claim'
    | 'family-ratchet'
    | 'unmeasurable-ratchet'

export interface PerfViolation {
  readonly rule: PerfViolationRule
  readonly message: string
}

export interface PerfCeilings {
  readonly metricFamiliesWithoutBaseline: { ceiling: number, families: string[], blockedOn: string }
  readonly unmeasurableMetrics: { ceiling: number, blockedOn: string }
}

export const PERF_CEILINGS_PATH = resolve(
  ROOT,
  'packages/tooling/src/validators/perf-baselines-ceilings.json',
)

export function readPerfCeilings(path: string = PERF_CEILINGS_PATH): PerfCeilings | undefined {
  if (!existsSync(path))
    return undefined
  return JSON.parse(readFileSync(path, 'utf8')) as PerfCeilings
}

/** Metric families with at least one recorded baseline. */
export function familiesWithBaseline(file: BaselineFile | undefined): Set<string> {
  return new Set((file?.baselines ?? []).map(b => b.kind))
}

/**
 * Everything about the committed perf evidence that can be checked without a
 * host, a browser or a stopwatch.
 *
 * Deliberately excludes anything environment-dependent. TASK-S1-O3 made the
 * same split for the visual lane and stated the reason: a check that is red on
 * every developer machine for a legitimate reason gets a `--skip` flag within
 * the week. "Am I on the capture host" belongs in the capture command; "is the
 * committed evidence coherent" belongs in `validate:all`.
 */
export function checkPerfBaselines(
  file: BaselineFile | undefined,
  environment: CaptureEnvironment | undefined,
  ceilings: PerfCeilings | undefined,
): PerfViolation[] {
  const violations: PerfViolation[] = []

  if (environment === undefined) {
    violations.push({
      rule: 'environment',
      message: 'packages/core/perf/capture-environment.json is missing. Without it no host is '
        + 'declared authoritative, so no perf threshold can be qualified (TASK-S1-O4).',
    })
    return violations
  }

  if (file === undefined) {
    violations.push({
      rule: 'provenance',
      message: 'packages/core/perf/baselines.json is missing. Run `yarn perf:propose <path>` '
        + 'and have an owner adopt the result.',
    })
    return violations
  }

  const profileIds = Object.keys(environment.profiles).sort()

  // --- the declared profiles resolve -------------------------------------
  const byKind = environment.committed?.byKind ?? {}
  for (const [field, id] of [
    ['authoritative.profileId', environment.authoritative.profileId],
    ['committed.profileId', environment.committed?.profileId ?? null],
    ...Object.entries(byKind).map(([kind, id]) => [`committed.byKind.${kind}`, id] as const),
  ] as const) {
    if (id !== null && environment.profiles[id] === undefined) {
      violations.push({
        rule: 'profile',
        message: `${field} = "${id}" is not one of the declared profiles (${profileIds.join(', ')}).`,
      })
    }
  }

  // --- every committed baseline is on the profile the file claims --------
  const committedId = environment.committed?.profileId ?? null
  const committedProfile = committedId === null ? undefined : environment.profiles[committedId]
  if (committedProfile !== undefined) {
    const drifted = new Map<string, string[]>()
    for (const baseline of file.baselines) {
      const kindId = byKind[baseline.kind]
      const profileForKind = kindId === undefined ? committedProfile : environment.profiles[kindId]
      if (profileForKind === undefined)
        continue // already reported by the `profile` rule above
      const verdict = hostMatchesProfile(profileForKind, {
        platform: baseline.host.platform,
        arch: baseline.host.arch,
        cpus: baseline.host.cpus,
        node: baseline.host.node,
      })
      if (!verdict.match)
        drifted.set(verdict.reasons.join('; '), [...(drifted.get(verdict.reasons.join('; ')) ?? []), baseline.id])
    }
    for (const [reason, ids] of drifted) {
      violations.push({
        rule: 'host-drift',
        message: `${ids.length} baseline(s) were captured on a host that is not `
          + `the committed profile for their kind ("${committedId}"`
          + `${Object.keys(byKind).length > 0 ? `, byKind ${JSON.stringify(byKind)}` : ''}) — `
          + `${reason}. First: ${ids.slice(0, 3).join(', ')}. `
          + 'A file whose entries disagree about the measuring host cannot be compared against '
          + 'as one budget.',
      })
    }
  }

  // --- provenance, sample discipline, internal consistency ---------------
  const noProvenance = file.baselines.filter(b => (b.sourceCommit ?? '').trim() === '')
  if (noProvenance.length > 0) {
    violations.push({
      rule: 'provenance',
      message: `${noProvenance.length} baseline(s) carry no sourceCommit, so a capability cell `
        + `fed by them can never be told current from stale: ${noProvenance.slice(0, 3).map(b => b.id).join(', ')}.`,
    })
  }

  const thin = file.baselines.filter(b => b.threshold !== null && b.distribution.runs < MINIMUM_RUNS)
  if (thin.length > 0) {
    violations.push({
      rule: 'sample-discipline',
      message: `${thin.length} baseline(s) carry a threshold derived from fewer than `
        + `${MINIMUM_RUNS} samples: ${thin.slice(0, 3).map(b => `${b.id} (n=${b.distribution.runs})`).join(', ')}. `
        + 'A metric with fewer than the floor is reported as unmeasured, never as a number.',
    })
  }

  const inconsistent = file.baselines.filter(
    b => (b.threshold === null) !== (b.unmeasurable !== null),
  )
  if (inconsistent.length > 0) {
    violations.push({
      rule: 'threshold-consistency',
      message: `${inconsistent.length} baseline(s) are neither "has a threshold" nor "has a `
        + `reason it has none": ${inconsistent.slice(0, 3).map(b => b.id).join(', ')}.`,
    })
  }

  const overCv = file.baselines.filter(
    b => b.threshold !== null && b.distribution.cv > MEASURABLE_CV,
  )
  if (overCv.length > 0) {
    violations.push({
      rule: 'threshold-consistency',
      message: `${overCv.length} baseline(s) carry a threshold despite a captured cv above `
        + `${MEASURABLE_CV}: ${overCv.slice(0, 3).map(b => `${b.id} (cv ${b.distribution.cv.toFixed(2)})`).join(', ')}. `
        + 'A threshold derived from a distribution that wide is a gate that fires at random.',
    })
  }

  // --- a designated gate whose evidence is on another host ---------------
  if (
    environment.authoritative.designated
    && environment.authoritative.profileId !== null
    && committedId !== null
    && environment.authoritative.profileId !== committedId
  ) {
    violations.push({
      rule: 'gate-claim',
      message: `the authoritative capture host is "${environment.authoritative.profileId}" but `
        + `every committed baseline is on "${committedId}". A gate whose thresholds were `
        + 'measured on another host can never pass honestly — re-capture on the authoritative '
        + 'host, or change the designation.',
    })
  }

  // --- the two one-way ratchets ------------------------------------------
  if (ceilings !== undefined) {
    const present = familiesWithBaseline(file)
    const absent = METRIC_KINDS.filter(kind => !present.has(kind))
    const { ceiling, families } = ceilings.metricFamiliesWithoutBaseline
    if (absent.length > ceiling) {
      violations.push({
        rule: 'family-ratchet',
        message: `${absent.length} metric famil(ies) have no recorded baseline `
          + `(${absent.join(', ')}), above the ceiling of ${ceiling}. A lane that runs and has `
          + 'nothing to compare against reports and can never fail. Ratchets move one way only.',
      })
    }
    else if (absent.length < ceiling) {
      violations.push({
        rule: 'family-ratchet',
        message: `${absent.length} metric famil(ies) have no recorded baseline, below the `
          + `ceiling of ${ceiling}. Lower metricFamiliesWithoutBaseline.ceiling to `
          + `${absent.length} in packages/tooling/src/validators/perf-baselines-ceilings.json `
          + 'in the same change, so the improvement cannot be silently re-spent.',
      })
    }
    else {
      const declared = [...families].sort()
      const actual = [...absent].sort()
      if (declared.join(',') !== actual.join(',')) {
        violations.push({
          rule: 'family-ratchet',
          message: `the families without a baseline are [${actual.join(', ')}] but the ceiling `
            + `file names [${declared.join(', ')}]. The count is unchanged, so a bare count `
            + 'would not have noticed: one family gained evidence while another lost it.',
        })
      }
    }

    const unmeasurable = file.baselines.filter(b => b.threshold === null).length
    if (unmeasurable > ceilings.unmeasurableMetrics.ceiling) {
      violations.push({
        rule: 'unmeasurable-ratchet',
        message: `${unmeasurable} metric(s) are recorded unmeasurable, above the ceiling of `
          + `${ceilings.unmeasurableMetrics.ceiling}. A metric whose variance swamps its signal `
          + 'protects nothing; more of them is not progress.',
      })
    }
    else if (unmeasurable < ceilings.unmeasurableMetrics.ceiling) {
      violations.push({
        rule: 'unmeasurable-ratchet',
        message: `${unmeasurable} metric(s) are recorded unmeasurable, below the ceiling of `
          + `${ceilings.unmeasurableMetrics.ceiling}. Lower unmeasurableMetrics.ceiling to `
          + `${unmeasurable} in the same change.`,
      })
    }
  }

  return violations
}

/**
 * Whether the perf input can fail a CI run today, in the shape
 * `capability-matrix.json` `inputs[].gate` records (TASK-S1-O3 added the field
 * and named `perf-baselines` as the other host-sensitive input that should
 * carry one).
 */
export function perfInputGate(
  file: BaselineFile | undefined,
  environment: CaptureEnvironment | undefined,
): { platform: string, authoritative: string, ciGate: boolean, blockedOn?: string } | undefined {
  if (file === undefined)
    return undefined

  const hosts = new Set(file.baselines.map(b => `${b.host.platform}/${b.host.arch}`))
  const platformOf = hosts.size === 1 ? [...hosts][0]! : `mixed (${[...hosts].sort().join(', ')})`
  const designated = environment?.authoritative.designated === true
    && environment.authoritative.profileId !== null
  const authoritative = designated
    ? environment!.authoritative.profileId!
    : 'undesignated'

  // `ciGate` is false whatever the hosts say, and that is a measurement rather
  // than a caution: no workflow in `.github/` invokes `yarn test:perf`, and
  // `DZUP_PERF_GATE` is unset everywhere, so no perf threshold is reachable by
  // any CI run. Recording `true` here because the platforms happened to agree
  // would be the exact misreading TASK-S1-O3 added this field to prevent.
  return {
    platform: platformOf,
    authoritative,
    ciGate: false,
    blockedOn: designated
      ? 'a CI job that runs `DZUP_PERF_GATE=1 yarn test:perf` on the authoritative capture '
      + 'host. No workflow in .github/ invokes it today (D-S1O4-3).'
      : 'two owner actions: designate an authoritative capture host in '
        + 'packages/core/perf/capture-environment.json (D-S1O4-1), then add a CI job that runs '
        + '`DZUP_PERF_GATE=1 yarn test:perf` on it (D-S1O4-3).',
  }
}

/** The sentence the generated docs pages print above the matrix for this input. */
export function perfInputNote(
  file: BaselineFile | undefined,
  environment: CaptureEnvironment | undefined,
): string {
  if (file === undefined) {
    return 'No captured baselines, so every `perf-baseline` cell is `unrun` — the absence of an '
      + 'input, not a lane that ran and failed.'
  }

  const present = familiesWithBaseline(file)
  const absent = METRIC_KINDS.filter(kind => !present.has(kind))
  const withThreshold = file.baselines.filter(b => b.threshold !== null).length
  const designated = environment?.authoritative.designated === true

  return `${file.baselines.length} metric(s) recorded, ${withThreshold} with a derived `
    + `threshold and ${file.baselines.length - withThreshold} "not yet measurable" `
    + `(variance exceeds signal).${
      absent.length === 0
        ? ''
        : ` ${absent.length} declared metric famil(ies) have NO baseline at all — `
          + `${absent.join(', ')} — so those lanes run, report, and cannot fail.`
    } The capture host is ${designated ? 'declared' : '**not declared**'}: see `
    + 'packages/core/perf/capture-environment.json. No CI workflow runs `yarn test:perf`, so no '
    + 'perf threshold gates anything today.'
}
