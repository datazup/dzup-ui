/**
 * The page contract: one check and one ratchet per generated section
 * (TASK-R5-O5).
 *
 * The 2026-08-11 reassessment's doc **03** names ten sections for every public
 * component page. Rendering them was half the job; this module is the other
 * half, and it is the half that keeps them true.
 *
 * ## Why a ratchet rather than a pass/fail
 *
 * Seven of the ten sections render from an artifact that does not exist for
 * every component yet — 43 of the 144 public components have no
 * `Dz{Name}.anatomy.ts` at all, and no component in the catalogue declares an
 * `@intent` block today. A gate that simply failed would be turned off within a
 * week; a section that was silently omitted where its artifact is missing would
 * let the catalogue drift back to the state this packet found it in, where all
 * 144 pages said *"Not yet derived"* and nothing counted them.
 *
 * So the contract is: **a section is always rendered, a missing artifact
 * renders an honest "not declared" cell, and the number of pages in that state
 * is a ceiling that may only fall.** The ceilings below are today's measured
 * values. Lowering one is how progress is recorded; raising one is refused,
 * including — especially — to make a gate pass.
 *
 * @module @dzup-ui/tooling/docs/page-contract
 */

import type { ComponentMetaArtifact, ComponentMetaRecord } from '../meta/component-meta.ts'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ROOT } from '../ownership/generate-ownership-manifest.ts'

/** Where the ceilings live. Data, not code — the same shape every other ratchet uses. */
export const SECTION_CEILINGS_PATH = join(ROOT, 'packages/tooling/src/docs/page-contract-ceilings.json')

/** One section of the page contract, and the question its ratchet asks. */
export interface SectionCheck {
  /** Stable id — the ceilings file's key and the failure message's rule name. */
  id: string
  /** Section number in the 08-11 doc 03 contract. */
  section: number
  /** The heading the section renders under, asserted present on every page. */
  heading: string
  /** True when THIS record's section has no artifact behind it. */
  missing: (record: ComponentMetaRecord) => boolean
  /** What the reader loses while the artifact is absent. */
  why: string
}

/**
 * The ten sections, and what "missing" means for each.
 *
 * Sections 2 and 3 (the API tables and the usage snippet) have carried a
 * check since TASK-N2-D1 — they are the freshness comparison the whole
 * generator is built around — so they are listed with a `missing` predicate
 * that is never true rather than being left out and looking unguarded.
 */
export const SECTION_CHECKS: readonly SectionCheck[] = [
  {
    id: 'intent',
    section: 1,
    heading: '## Intent and selection guidance',
    missing: r => r.intent === undefined || r.intent === '',
    why: 'the reader is told what the component IS but never what it is FOR, or when to reach for a different one',
  },
  {
    id: 'api',
    section: 2,
    heading: '## Props',
    missing: () => false,
    why: 'the prop, event, slot and expose tables would be absent',
  },
  {
    id: 'usage',
    section: 3,
    heading: '## Usage',
    missing: () => false,
    why: 'no paste-ready example would exist',
  },
  {
    id: 'variants',
    section: 4,
    heading: '## Variants and controlled state',
    missing: r => (r.anatomy.recipes ?? []).length === 0
      && !r.props.some(p => r.events.some(e => e.name === `update:${p.name}`)),
    why: 'neither the recipe axes nor a controlled/uncontrolled example can be shown',
  },
  {
    id: 'parts',
    section: 5,
    heading: '## Parts, states and tokens',
    missing: r => r.anatomy.state !== 'declared',
    why: 'nothing says which nodes a consumer may address, so a descendant selector against generated class names is the only way in',
  },
  {
    id: 'provider',
    section: 6,
    heading: '## Provider defaults and context',
    missing: r => r.providerHooks.length === 0,
    why: 'nothing an application sets on its DzProvider reaches the component (ADR-20 adoption)',
  },
  {
    id: 'keyboard',
    section: 7,
    heading: '### Keyboard interaction',
    missing: r => r.anatomy.keyboard === undefined,
    why: 'the page cannot say which key does what — the section an accessibility buyer reads first',
  },
  {
    id: 'locale',
    section: 8,
    heading: '## Locale, direction and formats',
    missing: r => r.anatomy.rtl === undefined,
    why: 'the page cannot say whether the component mirrors, whether its arrow keys swap, or which icons carry direction',
  },
  {
    id: 'operational',
    section: 9,
    heading: '## Server rendering, portals, performance and security',
    missing: r => r.capability === undefined,
    why: 'the component has no capability-matrix row, so nothing says what it owes on a server, in a portal or at a security boundary',
  },
  {
    id: 'states',
    section: 10,
    heading: '## States and migration',
    missing: r => r.anatomy.state !== 'declared',
    why: 'there is no declared state union to show examples for',
  },
] as const

/** The ceilings file's shape. `//` keys are prose and are ignored. */
export interface SectionCeilings {
  [key: string]: { 'ceiling': number, '//'?: string } | string | undefined
}

/** Read the ceilings, or an empty set when the file is absent. */
export function readSectionCeilings(path: string = SECTION_CEILINGS_PATH): SectionCeilings {
  if (!existsSync(path))
    return {}
  return JSON.parse(readFileSync(path, 'utf8')) as SectionCeilings
}

/** Pages whose section has no artifact behind it, by section id, over PUBLIC components. */
export function measureSections(artifact: ComponentMetaArtifact): Record<string, number> {
  const pub = artifact.components.filter(c => c.kind === 'public-component')
  const counts: Record<string, number> = {}
  for (const check of SECTION_CHECKS)
    counts[check.id] = pub.filter(r => check.missing(r)).length
  return counts
}

/** One page-contract violation, in the shape the CLI prints. */
export interface SectionViolation {
  rule: string
  message: string
}

/**
 * Every page-contract violation: a heading missing from a rendered page, and a
 * ratchet that moved in either direction.
 *
 * Both directions fail, which is the same rule every other ratchet in this
 * repository runs on. A number that fell is good news and the ceiling has to be
 * lowered to record it, because a ceiling nobody lowers stops meaning anything.
 *
 * @param artifact the component-metadata artifact every section is measured from
 * @param pages the rendered component pages, keyed by component name
 * @param ceilings today's recorded debt per section
 */
export function checkPageContract(
  artifact: ComponentMetaArtifact,
  pages: ReadonlyMap<string, string>,
  ceilings: SectionCeilings = readSectionCeilings(),
): SectionViolation[] {
  const violations: SectionViolation[] = []
  const measured = measureSections(artifact)

  // 1. Every section is rendered on every page, artifact or no artifact. A
  //    silently-omitted section is how 144 pages shipped without a keyboard
  //    table; an honest "not declared" cell cannot hide.
  for (const check of SECTION_CHECKS) {
    const absent = [...pages.entries()]
      .filter(([, body]) => !body.includes(check.heading))
      .map(([name]) => name)
      .sort()
    if (absent.length > 0) {
      violations.push({
        rule: `section-${check.id}`,
        message: `Section ${check.section} (${check.heading.replace(/^#+ /, '')}) is missing from `
          + `${absent.length} page(s): ${absent.slice(0, 5).join(', ')}${absent.length > 5 ? ', …' : ''}. `
          + 'Every section renders on every page; where the artifact is missing it renders an '
          + 'honest "not declared" cell, never nothing.',
      })
    }
  }

  // 2. The per-section debt ratchets.
  for (const check of SECTION_CHECKS) {
    const entry = ceilings[check.id]
    if (typeof entry !== 'object' || entry === undefined) {
      violations.push({
        rule: `ratchet-${check.id}`,
        message: `No ceiling is recorded for section ${check.section} (\`${check.id}\`). `
          + `${measured[check.id]} of ${artifact.totals.publicComponents} pages render it as `
          + `"not declared". Add it to ${SECTION_CEILINGS_PATH.replace(/\\/g, '/')}.`,
      })
      continue
    }
    const now = measured[check.id]!
    if (now > entry.ceiling) {
      violations.push({
        rule: `ratchet-${check.id}`,
        message: `Section ${check.section} (\`${check.id}\`) debt ROSE ${entry.ceiling} → ${now}. `
          + `On those pages ${check.why}. Ratchets move one way only — declare the artifact, do not `
          + 'raise the ceiling.',
      })
    }
    else if (now < entry.ceiling) {
      violations.push({
        rule: `ratchet-${check.id}`,
        message: `Section ${check.section} (\`${check.id}\`) debt FELL ${entry.ceiling} → ${now}. `
          + `Lower the ceiling in ${SECTION_CEILINGS_PATH.replace(/\\/g, '/')} to record it — a `
          + 'ceiling nobody lowers stops meaning anything.',
      })
    }
  }
  return violations
}
