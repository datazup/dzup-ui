/**
 * Quality-tier validator (TASK-OSS-P5-01).
 *
 * The tier assignment in `quality/component-tiers.ts` is the one handwritten
 * inventory this repository keeps, so it is the one most able to drift. Six
 * gates, in the order a reviewer would apply them:
 *
 *   1. **coverage** — every public component in the ownership manifest has an
 *      assignment, and no assignment names a symbol that stopped being public.
 *   2. **justification** — a `custom` pattern, a Tier C or D component, and any
 *      security boundary each carry a reason. TASK-OSS-P5-01 states the rule
 *      for tiers C and D directly; `custom` gets it because "custom" without a
 *      reason is indistinguishable from "nobody looked".
 *   3. **catalog** — every WCAG id resolves to a criterion in
 *      `WCAG_22_CRITERIA`, and every `exceptions` key is an `EvidenceKind` the
 *      component actually owes. An exception for a row nobody owed is a typo
 *      that reads as diligence.
 *   4. **traits against source** — `teleports` is a fact, not a judgment, so it
 *      is checked. See {@link teleportingComponents}.
 *   5. **anatomy agreement** — where a component declares its own
 *      `riskTier`, the two must say the same thing, and a compound part must
 *      agree with its parent. This is the gate that would have caught the
 *      inverted tier scale P5-01 had to repair.
 *   6. **freshness** — the committed `quality-matrix.json` equals what the
 *      generator produces now, `sourceCommit` excluded for the reason the
 *      ownership validator states.
 *
 * Usage:
 *   tsx packages/tooling/src/validators/quality-tiers.ts
 *
 * Exit code 1 if violations found.
 */

import type { OwnershipManifest } from '../ownership/ownership-manifest.types.ts'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { basename, dirname, extname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
// Relative into contracts' SOURCE, not the package specifier: this runs under
// `tsx` with no build step, and these are runtime values.
import {
  APG_PATTERNS,
  EVIDENCE_KINDS,
  SECURITY_BOUNDARIES,
  WCAG_CRITERION_IDS,
} from '../../../contracts/src/quality-tiers.ts'
import { ROOT } from '../ownership/generate-ownership-manifest.ts'
import { compareSymbols } from '../ownership/ownership-manifest.types.ts'
import { COMPONENT_TIERS } from '../quality/component-tiers.ts'
import {
  buildQualityMatrix,
  QUALITY_MATRIX_PATH,
  readCommittedMatrix,
  readOwnershipManifest,
  serializeMatrix,
} from '../quality/generate-quality-matrix.ts'

export interface TierViolation {
  rule: string
  message: string
}

const COMPONENTS_DIR = resolve(ROOT, 'packages/core/src/components')
const PROVIDERS_DIR = resolve(ROOT, 'packages/core/src/providers')

/**
 * A tag that puts content somewhere other than where it was written: Vue's own
 * `<Teleport>`, or any Reka portal component (`<DialogPortal>`,
 * `<SelectPortal>`, …).
 *
 * Matched on the tag rather than on the import, because a component can import
 * `DialogPortal` for a type and never render it — and because the import list
 * is where `Portal` appears as a bare word, which is what a looser pattern
 * would trip over.
 */
const TELEPORT_TAG = /<(?:Teleport|[A-Z][A-Za-z]*Portal)\b/

/** `import DzFoo from './DzFoo.vue'` — a component this one renders. */
const LOCAL_VUE_IMPORT = /^import\s+\w+\s+from\s+'(\.[^']*\.vue)'/gm

function collectVue(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = resolve(dir, entry)
    if (statSync(full).isDirectory())
      collectVue(full, out)
    else if (extname(full) === '.vue')
      out.push(full)
  }
  return out
}

/**
 * Every `.vue` under Core that renders teleported content, transitively.
 *
 * **Transitively, and that is the point.** `DzRelativeTime` renders no portal
 * of its own — it discloses the absolute timestamp through a `DzTooltip`, and a
 * tooltip's content leaves the DOM position it was written in. A check that
 * looked only at the component's own file would say this static-looking
 * typography component owes no portal/hydration evidence, and it would be
 * wrong: what hydrates is the rendered tree, not the file.
 *
 * Following local `.vue` imports over-approximates — a component that imports
 * an overlay for one optional slot is counted the same as one that always
 * renders it. That is the safe direction: the cost of a false positive is one
 * evidence row someone has to satisfy or except, and the cost of a false
 * negative is a hydration mismatch nothing was watching for.
 */
export function teleportingComponents(
  dirs: readonly string[] = [COMPONENTS_DIR, PROVIDERS_DIR],
): Set<string> {
  const files = dirs.flatMap(dir => (existsSync(dir) ? collectVue(dir) : []))
  const own = new Map<string, boolean>()
  const deps = new Map<string, string[]>()

  for (const file of files) {
    const source = readFileSync(file, 'utf8')
    own.set(file, TELEPORT_TAG.test(source))
    deps.set(
      file,
      [...source.matchAll(LOCAL_VUE_IMPORT)].map(m => resolve(dirname(file), m[1]!)),
    )
  }

  const memo = new Map<string, boolean>()
  function walk(file: string, seen: Set<string>): boolean {
    const cached = memo.get(file)
    if (cached !== undefined)
      return cached
    if (seen.has(file))
      return false
    seen.add(file)
    let result = own.get(file) === true
    if (!result) {
      for (const dep of deps.get(file) ?? []) {
        if (own.has(dep) && walk(dep, seen)) {
          result = true
          break
        }
      }
    }
    memo.set(file, result)
    return result
  }

  const out = new Set<string>()
  for (const file of files) {
    if (walk(file, new Set()))
      out.add(basename(file, '.vue'))
  }
  return out
}

/** Run every gate. Pure over its inputs — this is what the unit tests drive. */
export function checkQualityTiers(
  manifest: OwnershipManifest,
  options: {
    assignments?: typeof COMPONENT_TIERS
    teleporting?: Set<string>
    committed?: ReturnType<typeof readCommittedMatrix>
  } = {},
): TierViolation[] {
  const assignments = options.assignments ?? COMPONENT_TIERS
  const violations: TierViolation[] = []

  // 1 — coverage. buildQualityMatrix already reports both directions.
  const { matrix, problems } = buildQualityMatrix(manifest, assignments)
  for (const message of problems)
    violations.push({ rule: 'coverage', message })

  const byComponent = new Map(matrix.components.map(row => [row.component, row]))

  // 2, 3 — justification and catalog.
  for (const row of matrix.components) {
    if (!APG_PATTERNS.includes(row.pattern)) {
      violations.push({
        rule: 'catalog',
        message: `${row.component} names APG pattern \`${row.pattern}\`, which is not in the `
          + `catalog. Use the APG slug, or \`custom\` with a reason.`,
      })
    }

    if (row.pattern === 'custom' && row.patternJustification === undefined) {
      violations.push({
        rule: 'justification',
        message: `${row.component} declares \`pattern: 'custom'\` with no \`why\`. Say what APG `
          + `does not describe about it — otherwise \`custom\` reads as "nobody looked".`,
      })
    }

    if ((row.tier === 'C' || row.tier === 'D') && row.patternJustification === undefined) {
      violations.push({
        rule: 'justification',
        message: `${row.component} is Tier ${row.tier} with no \`why\`. A composite or a data `
          + `boundary owes the most evidence in the catalog; the reason it is one belongs `
          + `next to the tier.`,
      })
    }

    if (!SECURITY_BOUNDARIES.includes(row.securityBoundary)) {
      violations.push({
        rule: 'catalog',
        message: `${row.component} declares boundary \`${row.securityBoundary}\`, which is not a `
          + `SecurityBoundary.`,
      })
    }

    if (row.securityBoundary !== 'none' && row.boundaryJustification === undefined) {
      violations.push({
        rule: 'justification',
        message: `${row.component} declares \`boundary: '${row.securityBoundary}'\` with no `
          + `\`boundaryWhy\`. Name the prop and what it reaches.`,
      })
    }

    // The RAW assignment, not `row.wcag`. The generator emits its list in
    // catalog order, which it can only do by filtering to ids the catalog
    // knows — so by the time a row exists, an unrecognised id has already
    // disappeared. Checking the output would have made this gate unfailable.
    for (const id of assignments[row.component]?.wcag ?? []) {
      if (!WCAG_CRITERION_IDS.has(id)) {
        violations.push({
          rule: 'catalog',
          message: `${row.component} lists WCAG \`${id}\`, which is not in WCAG_22_CRITERIA. `
            + `Page-level criteria belong to the consumer and are deliberately absent; a `
            + `component-level one that is genuinely missing belongs in the catalog first.`,
        })
      }
    }

    for (const kind of Object.keys(row.exceptions ?? {})) {
      if (!EVIDENCE_KINDS.includes(kind as never)) {
        violations.push({
          rule: 'catalog',
          message: `${row.component} excepts \`${kind}\`, which is not an EvidenceKind.`,
        })
        continue
      }
      if (!row.evidence.includes(kind as never)) {
        violations.push({
          rule: 'catalog',
          message: `${row.component} excepts \`${kind}\`, which it does not owe at tier `
            + `${row.tier}. An exception for a row nobody owed reads as diligence and is a typo.`,
        })
      }
    }
  }

  // 4 — traits against source.
  const teleporting = options.teleporting ?? teleportingComponents()
  for (const row of matrix.components) {
    const declared = row.traits.includes('teleports')
    const actual = teleporting.has(row.component)
      || row.parts.some(part => teleporting.has(part))
    if (actual && !declared) {
      violations.push({
        rule: 'traits',
        message: `${row.component} renders teleported content but does not declare `
          + `\`traits: ['teleports']\`, so it is not being asked for portal/hydration evidence.`,
      })
    }
    if (declared && !actual) {
      violations.push({
        rule: 'traits',
        message: `${row.component} declares \`teleports\` but no <Teleport> or *Portal tag was `
          + `found in it, its compound parts, or anything it renders. Remove the trait, or find `
          + `out what stopped teleporting.`,
      })
    }
  }

  // 5 — anatomy agreement.
  for (const entry of manifest.entries) {
    if (entry.anatomy === undefined)
      continue
    if (entry.kind === 'public-component') {
      const row = byComponent.get(entry.symbol)
      if (row !== undefined && entry.anatomy.riskTier !== row.tier) {
        violations.push({
          rule: 'anatomy',
          message: `${entry.symbol} declares \`riskTier: '${entry.anatomy.riskTier}'\` in its `
            + `anatomy and \`tier: '${row.tier}'\` in component-tiers.ts. One of them is stale; `
            + `the scale is A presentational → D data boundary.`,
        })
      }
    }
    else if (entry.kind === 'compound-part' && entry.parentComponent !== undefined) {
      const parent = byComponent.get(entry.parentComponent)
      if (parent !== undefined && entry.anatomy.riskTier !== parent.tier) {
        violations.push({
          rule: 'anatomy',
          message: `${entry.symbol} declares \`riskTier: '${entry.anatomy.riskTier}'\` but its `
            + `parent ${entry.parentComponent} is Tier ${parent.tier}. A part ships with its `
            + `parent and cannot owe less evidence than it.`,
        })
      }
    }
  }

  // 6 — freshness.
  const committed = 'committed' in options ? options.committed : readCommittedMatrix()
  if (committed === undefined) {
    violations.push({
      rule: 'freshness',
      message: `packages/core/docs/quality-matrix.json does not exist. Run `
        + `\`yarn generate:quality-matrix\`.`,
    })
  }
  else {
    const strip = (m: typeof matrix): string =>
      serializeMatrix({ ...m, sourceCommit: 'excluded' })
    if (strip(committed) !== strip(matrix)) {
      violations.push({
        rule: 'freshness',
        message: `packages/core/docs/quality-matrix.json is stale. Run `
          + `\`yarn generate:quality-matrix\` and commit the result.`,
      })
    }
  }

  return violations
}

/* c8 ignore start -- CLI entry point, exercised via `tsx`, not the unit tests. */
const isMain = process.argv[1] !== undefined
  && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))

if (isMain) {
  const manifest = readOwnershipManifest()
  const violations = checkQualityTiers(manifest)

  if (violations.length === 0) {
    const { matrix } = buildQualityMatrix(manifest)
    const byTier = new Map<string, number>()
    for (const row of matrix.components)
      byTier.set(row.tier, (byTier.get(row.tier) ?? 0) + 1)
    const tiers = [...byTier.entries()].sort().map(([t, n]) => `${t}:${n}`).join(' ')
    console.warn(
      `✓ quality-tiers: ${matrix.components.length}/${matrix.components.length} public `
      + `components tiered (${tiers}); matrix fresh at ${QUALITY_MATRIX_PATH.replace(ROOT, '.')}`,
    )
    process.exit(0)
  }

  console.error('')
  for (const violation of [...violations].sort((a, b) => compareSymbols(a.rule, b.rule)))
    console.error(`✗ [${violation.rule}] ${violation.message}`)
  console.error(`\n${violations.length} quality-tier violation(s).`)
  process.exit(1)
}
/* c8 ignore stop */
