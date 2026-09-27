/**
 * Unit tests for the docs-site evidence layer (TASK-N2-D2).
 *
 * Three of these tests are the packet, not decoration.
 *
 * 1. **The at-manual tripwire.** TASK-N1-O4 §6.2 proved that the capability
 *    matrix resolves a component whose every AT pairing FAILED to `state:
 *    'pass'`. That defect is latent only because nothing has been executed, so
 *    the only way to know this site will not publish it is to drive a synthetic
 *    index that contains failures — in memory, with no fabricated record on
 *    disk, exactly as N1-O4 did.
 * 2. **The prose gate.** A hand-typed number in a published statement is the
 *    class this program has found five times. `statements.ts` is asserted to
 *    contain no digit run and no English number word that is not allowlisted
 *    with a reason.
 * 3. **The whole-catalogue honesty sweep.** Every one of the real public
 *    components is rendered with the real artifacts, and the result is asserted
 *    to carry an unrun state where the matrix says unrun, a "not yet derived"
 *    keyboard section, and no markup VitePress would compile.
 */

import type { ComponentMetaArtifact, ComponentMetaRecord } from '../meta/component-meta.ts'
import type { AtIndex, CapabilityMatrix, EvidenceSources, QualityMatrix, WcagDeviations } from './evidence.ts'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { ROOT } from '../ownership/generate-ownership-manifest.ts'
import { buildTargetIn, classifyBrowserTargetSources, probeBrowserTarget } from './browser-target.ts'
import { renderComponentPage, unescapedMarkupLines } from './docs-pages.ts'
import {
  renderAccessibilityPage,
  renderAtMatrixPage,
  renderBrowserSupportPage,
  renderCapabilityMatrixPage,
  renderEvidenceIndex,
  renderStylingPosturePage,
} from './evidence-pages.ts'
import {
  apgLink,
  atManualTripwire,
  cell,
  crossCheckCapabilityJoin,
  crossCheckWcagDeviations,
  orAbsent,
  renderAtSection,
  renderEvidence,
  renderKeyboardSection,
  wcagUnderstandingUrl,
} from './evidence.ts'
import { readCascadeLayers, readEvidenceSources } from './read-evidence.ts'
import {
  ACCESSIBILITY_STATEMENT,
  BROWSER_SUPPORT,
  EVIDENCE_INDEX,
  PROSE_LITERAL_ALLOWLIST,
  STYLING_POSTURE,
} from './statements.ts'

// ── Synthetic fixtures ──────────────────────────────────────────────────────

function makeSources(overrides: Partial<EvidenceSources> = {}): EvidenceSources {
  const quality: QualityMatrix = {
    schemaVersion: '1.0.0',
    sourceCommit: 'deadbeef11223344',
    generatedFrom: [],
    rules: {
      tierIncrement: { A: ['unit-spec'], B: ['at-manual', 'keyboard-spec'], C: [], D: [] },
      traitEvidence: {},
      boundaryEvidence: {},
    },
    wcag: [{ id: '2.1.1', name: 'Keyboard', level: 'A', since: '2.0' }],
    components: [{
      component: 'DzThing',
      family: 'buttons',
      tier: 'B',
      pattern: 'button',
      securityBoundary: ['none'],
      traits: [],
      wcag: ['2.1.1'],
      evidence: ['unit-spec', 'at-manual', 'keyboard-spec'],
      evidenceOrigin: { 'unit-spec': 'tier A', 'at-manual': 'tier B', 'keyboard-spec': 'tier B' },
    }],
  }
  const capability: CapabilityMatrix = {
    schemaVersion: '1.1.0',
    sourceCommit: 'deadbeef11223344',
    generatedFrom: [],
    inputs: {},
    totals: { B: { pass: 1, present: 1, stale: 0, unrun: 1, excepted: 0 } },
    rows: [{
      component: 'DzThing',
      family: 'buttons',
      tier: 'B',
      pattern: 'button',
      securityBoundary: ['none'],
      traits: [],
      anatomy: 'absent',
      source: 'packages/core/src/components/buttons/DzThing.vue',
      componentCommit: 'cafebabe11223344',
      cells: [
        { kind: 'unit-spec', origin: 'tier A', scope: 'component', state: 'present', artifacts: ['a.spec.ts'] },
        { kind: 'keyboard-spec', origin: 'tier B', scope: 'component', state: 'unrun', artifacts: [] },
        { kind: 'at-manual', origin: 'tier B', scope: 'component', state: 'unrun', artifacts: ['e2e/at-matrix/DzThing.md'] },
      ],
    }],
  }
  const atMatrix: AtIndex = {
    schemaVersion: '1.0.0',
    generatedFrom: [],
    pairs: [
      { id: 'nvda-firefox', at: 'NVDA', browser: 'Firefox', platform: 'Windows', purpose: 'p' },
      { id: 'jaws-chrome', at: 'JAWS', browser: 'Chrome', platform: 'Windows', purpose: 'p' },
    ],
    entries: [{
      component: 'DzThing',
      tier: 'B',
      pattern: 'button',
      file: 'e2e/at-matrix/DzThing.md',
      tasks: ['reach'],
      // What `requiredAtPairs('B')` returns, which is what
      // `generate:at-matrix` stamps on a Tier B entry.
      requiredPairs: ['nvda-firefox'],
      componentCommit: 'cafebabe11223344',
      // `task: '*'` is ALL_TASKS -- the value `generate:at-matrix` writes into a
      // scaffolded row, which is the only value a row may carry while unrun.
      rows: [
        { pair: 'nvda-firefox', task: '*', result: 'unrun', versions: '-', tester: '-', date: '-', sourceCommit: '-', notes: 'not executed' },
        { pair: 'jaws-chrome', task: '*', result: 'unrun', versions: '-', tester: '-', date: '-', sourceCommit: '-', notes: 'not executed' },
      ],
    }],
  }
  const wcagDeviations: WcagDeviations = {
    schemaVersion: '1.0.0',
    note: '',
    recordedAt: { measuredBy: 'TASK-TEST', sourceCommit: 'deadbeef11223344', admissibility: 'test' },
    criterion: {
      id: '2.5.7',
      name: 'Dragging Movements',
      level: 'AA',
      since: '2.2',
      text: 't',
      url: 'https://example.invalid',
    },
    scope: '',
    conformanceStatement: '',
    ceiling: 0,
    openGaps: 0,
    surfaces: [],
    followUp: '',
  }
  return {
    quality,
    capability,
    atMatrix,
    wcagDeviations,
    cascadeLayers: ['dz-tokens'],
    browserTarget: { declared: [], syntaxLevels: [], scanned: ['package.json'] },
    atScripts: {},
    fingerprints: {},
    ...overrides,
  }
}

function withAtRows(results: readonly string[]): EvidenceSources {
  const ev = makeSources()
  ev.atMatrix.entries[0]!.rows = results.map((result, i) => ({
    pair: i === 0 ? 'nvda-firefox' : 'jaws-chrome',
    task: '*',
    result,
    versions: result === 'unrun' ? '-' : 'NVDA 2026.1 / Firefox 151',
    tester: result === 'unrun' ? '-' : 'A. Tester',
    date: result === 'unrun' ? '-' : '2026-09-02',
    sourceCommit: result === 'unrun' ? '-' : 'cafebabe11223344',
    notes: result === 'unrun' ? 'not executed' : 'see step 2',
  }))
  return ev
}

// ── 1. The at-manual tripwire ───────────────────────────────────────────────

describe('atManualTripwire — B-N1-AT, enforced', () => {
  it('is silent when nothing has been executed', () => {
    expect(atManualTripwire(makeSources())).toEqual([])
  })

  it('is silent when a genuinely passing run is summarised as a pass', () => {
    const ev = withAtRows(['pass', 'pass'])
    ev.capability.rows[0]!.cells[2]!.state = 'pass'
    expect(atManualTripwire(ev)).toEqual([])
  })

  it('leaves a PARTIAL run to the page rather than the gate', () => {
    // N1-O4's second defect — one pairing of six summarised as `pass` — is an
    // overstatement, not a falsehood, so it is not a build failure. The page
    // handles it by never reading the cell: it prints "1 of 2 executed" and
    // lists the unexecuted pairing by name.
    const ev = withAtRows(['pass', 'unrun'])
    ev.capability.rows[0]!.cells[2]!.state = 'pass'
    expect(atManualTripwire(ev)).toEqual([])
    const out = renderAtSection(ev.quality.components[0]!, ev, ev.atMatrix.entries[0]).join('\n')
    expect(out).toContain('**1 of 2 AT/browser pairs executed.**')
    expect(out).toContain('| `jaws-chrome` | JAWS | Chrome | Windows | `unrun` |')
  })

  // Title deliberately lower-case: `eslint --fix` rewrote an emphatic "REFUSES"
  // here to "rEFUSES" (test/prefer-lowercase-title lower-cases the first
  // character only). Fourth sighting of an autofix silently rewriting authored
  // text — see the handoff's findings.
  it('refuses the N1-O4 defect outright: every pairing failed, the cell says pass', () => {
    const ev = withAtRows(['fail', 'fail'])
    ev.capability.rows[0]!.cells[2]!.state = 'pass'
    const problems = atManualTripwire(ev)
    expect(problems).toHaveLength(1)
    expect(problems[0]).toContain('DzThing')
    expect(problems[0]).toContain('2 of 2 recorded AT rows are `fail`')
  })

  it('refuses a single failure hidden behind a pass', () => {
    const ev = withAtRows(['pass', 'fail'])
    ev.capability.rows[0]!.cells[2]!.state = 'pass'
    expect(atManualTripwire(ev)).toHaveLength(1)
  })

  it('refuses `blocked` and `partial` summarised as a pass', () => {
    for (const result of ['blocked', 'partial']) {
      const ev = withAtRows([result, 'unrun'])
      ev.capability.rows[0]!.cells[2]!.state = 'pass'
      expect(atManualTripwire(ev), result).toHaveLength(1)
    }
  })

  it('refuses a cell that claims a state while every run record is unrun', () => {
    const ev = makeSources()
    ev.capability.rows[0]!.cells[2]!.state = 'pass'
    expect(atManualTripwire(ev)[0]).toContain('No screen-reader session is recorded')
  })

  it('refuses the mirror image: a recorded run the matrix has not seen', () => {
    const ev = withAtRows(['pass', 'unrun'])
    expect(atManualTripwire(ev)[0]).toContain('still publishes at-manual `unrun`')
  })

  it('refuses a non-unrun cell with no scaffold entry behind it', () => {
    const ev = makeSources()
    ev.atMatrix.entries = []
    ev.capability.rows[0]!.cells[2]!.state = 'pass'
    expect(atManualTripwire(ev)[0]).toContain('no entry for it at all')
  })
})

describe('renderAtSection', () => {
  it('renders every unexecuted pairing as unrun, by name, with no pass anywhere', () => {
    const ev = makeSources()
    const out = renderAtSection(ev.quality.components[0]!, ev, ev.atMatrix.entries[0]).join('\n')
    expect(out).toContain('**0 of 2 AT/browser pairs executed.**')
    expect(out).toContain('| `nvda-firefox` | NVDA | Firefox | Windows | `unrun` |')
    expect(out).toContain('| `jaws-chrome` | JAWS | Chrome | Windows | `unrun` |')
    expect(out).not.toMatch(/`pass`/)
  })

  it('renders a failed pairing as a failure, with its tester and date', () => {
    const ev = withAtRows(['fail', 'unrun'])
    const out = renderAtSection(ev.quality.components[0]!, ev, ev.atMatrix.entries[0]).join('\n')
    expect(out).toContain('**`fail`**')
    expect(out).toContain('A. Tester')
    expect(out).toContain('2026-09-02')
    expect(out).toContain('**1 of 2 AT/browser pairs executed.**')
  })

  it('says the tier owes no run rather than rendering an empty table', () => {
    const ev = makeSources()
    const quality = { ...ev.quality.components[0]!, tier: 'A', evidence: ['unit-spec'] }
    const out = renderAtSection(quality, ev, undefined).join('\n')
    expect(out).toContain('does not owe a manual screen-reader run')
    expect(out).not.toContain('| Pair |')
  })

  it('does not silently render nothing when a component owes a run and has no entry', () => {
    const ev = makeSources()
    const out = renderAtSection(ev.quality.components[0]!, ev, undefined).join('\n')
    expect(out).toContain('has no scaffold entry')
  })
})

// ── 2. The prose gate ───────────────────────────────────────────────────────

/** English number words a count could hide behind. */
const NUMBER_WORDS = [
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
  'dozen',
  'hundred',
  'thousand',
]

function proseStrings(): Array<[string, string]> {
  const out: Array<[string, string]> = []
  for (const [name, statement] of Object.entries({
    STYLING_POSTURE,
    BROWSER_SUPPORT,
    ACCESSIBILITY_STATEMENT,
    EVIDENCE_INDEX,
  })) {
    out.push([`${name}.title`, statement.title], [`${name}.description`, statement.description])
    for (const [block, lines] of Object.entries(statement.blocks))
      lines.forEach((line, i) => out.push([`${name}.${block}[${i}]`, line]))
  }
  return out
}

describe('the authored statements carry no metric', () => {
  it('has no digit run that is not allowlisted with a reason', () => {
    const allowed = Object.keys(PROSE_LITERAL_ALLOWLIST)
    const offenders: string[] = []
    for (const [where, text] of proseStrings()) {
      let stripped = text
      for (const literal of allowed)
        stripped = stripped.split(literal).join('')
      const digits = stripped.match(/\d+/g)
      if (digits !== null)
        offenders.push(`${where}: ${digits.join(', ')} — in ${JSON.stringify(text)}`)
    }
    expect(offenders).toEqual([])
  })

  it('has no English number word standing in for a count', () => {
    const offenders: string[] = []
    for (const [where, text] of proseStrings()) {
      for (const word of NUMBER_WORDS) {
        if (new RegExp(`\\b${word}\\b`, 'i').test(text))
          offenders.push(`${where}: "${word}" — in ${JSON.stringify(text)}`)
      }
    }
    expect(offenders).toEqual([])
  })

  it('allowlists nothing without a reason', () => {
    for (const [literal, reason] of Object.entries(PROSE_LITERAL_ALLOWLIST)) {
      expect(reason.length, literal).toBeGreaterThan(20)
    }
  })
})

// ── 3. Derived links and small helpers ──────────────────────────────────────

describe('wcagUnderstandingUrl', () => {
  // Each of these was resolved against w3.org before the rule was adopted; they
  // are the four punctuation shapes the published dictionary contains.
  it.each([
    ['Target Size (Minimum)', 'target-size-minimum'],
    ['Name, Role, Value', 'name-role-value'],
    ['Pause, Stop, Hide', 'pause-stop-hide'],
    ['Accessible Authentication (Minimum)', 'accessible-authentication-minimum'],
    ['Non-text Content', 'non-text-content'],
    ['Reflow', 'reflow'],
  ])('%s → %s.html', (name, slug) => {
    expect(wcagUnderstandingUrl(name)).toBe(`https://www.w3.org/WAI/WCAG22/Understanding/${slug}.html`)
  })
})

describe('apgLink', () => {
  it('links a real pattern', () => {
    expect(apgLink('combobox')).toBe('https://www.w3.org/WAI/ARIA/apg/patterns/combobox/')
  })
  it('refuses to invent a page for `custom` and `none`', () => {
    expect(apgLink('custom')).toBeUndefined()
    expect(apgLink('none')).toBeUndefined()
  })
})

describe('table-cell safety', () => {
  it('escapes a pipe so a note cannot break the table it sits in', () => {
    expect(cell('a | b')).toBe('a \\| b')
  })
  it('renders an absent value as an em dash rather than an empty cell', () => {
    expect(cell(undefined)).toBe('—')
    expect(orAbsent('-')).toBe('—')
    expect(orAbsent('tbd')).toBe('—')
    expect(orAbsent('A. Tester')).toBe('A. Tester')
  })
})

describe('readCascadeLayers', () => {
  it('reads the ordering statement and not the blocks', () => {
    expect(readCascadeLayers('/* c */\n@layer a, b, c;\n@layer a { .x { color: red } }\n'))
      .toEqual(['a', 'b', 'c'])
  })
  it('returns nothing rather than guessing when no statement exists', () => {
    expect(readCascadeLayers('.x { color: red }')).toEqual([])
  })
})

/**
 * Migrated by TASK-R5-O5.
 *
 * The first assertion here used to be *"always says not yet derived, and never
 * prints a key table"*, and it was correct for N2-D2: no machine-readable
 * keyboard contract existed, so a table would have been hand-typed. It exists
 * now, so the specs assert the three states the section can be in — declared,
 * explicitly none, and not declared — and the distinction between the last two
 * is the one the whole contract turns on.
 */
describe('renderKeyboardSection', () => {
  it('says NOT DECLARED — never "has no keyboard" — when no contract exists', () => {
    const ev = makeSources()
    const out = renderKeyboardSection(ev.quality.components[0]!, ev.capability.rows[0]!).join('\n')
    expect(out).toContain('**Not declared.**')
    expect(out).toContain('not a claim that it has no keyboard behaviour')
    expect(out).toContain('https://www.w3.org/WAI/ARIA/apg/patterns/button/')
    expect(out).not.toContain('| Key |')
  })

  it('prints the declared table, with provenance, when a contract exists', () => {
    const ev = makeSources()
    const out = renderKeyboardSection(ev.quality.components[0]!, ev.capability.rows[0]!, {
      state: 'declared',
      parts: ['root'],
      source: 'packages/core/src/components/buttons/DzThing.anatomy.ts',
      keyboard: [
        { key: 'Enter', action: 'Activate the button.', wcag: ['2.1.1'], apg: 'button' },
        { key: ' ', action: 'Activate the button.', wcag: ['2.1.1'], apg: 'button' },
      ],
    }).join('\n')

    expect(out).toContain('**2 declared bindings.**')
    expect(out).toContain('| Key |')
    expect(out).toContain('`Enter`')
    // The space bar is spelled `' '` in the contract and must READ as Space.
    expect(out).toContain('`Space`')
    expect(out).toContain('DzThing.anatomy.ts')
    expect(out).not.toContain('Not declared')
  })

  it('publishes an explicit `none` as the claim it is, not as an absence', () => {
    const ev = makeSources()
    const out = renderKeyboardSection(ev.quality.components[0]!, ev.capability.rows[0]!, {
      state: 'declared',
      parts: ['root'],
      keyboard: 'none',
    }).join('\n')

    expect(out).toContain('No keyboard behaviour of its own')
    expect(out).toContain('explicit claim')
    expect(out).not.toContain('**Not declared.**')
    expect(out).not.toContain('| Key |')
  })

  it('marks an rtl-mirrored row as swapping, and leaves the rest alone', () => {
    const ev = makeSources()
    const out = renderKeyboardSection(ev.quality.components[0]!, ev.capability.rows[0]!, {
      state: 'declared',
      parts: ['root'],
      keyboard: [
        { key: 'ArrowRight', action: 'Move to the next tab.', rtl: 'mirrored' },
        { key: 'Enter', action: 'Activate.' },
      ],
    }).join('\n')

    expect(out).toContain('swaps with the writing direction')
    expect(out).toMatch(/\| `Enter` \|.*\| — \|/)
  })

  it('says there is no pattern to link rather than linking a nonexistent page', () => {
    const ev = makeSources()
    const quality = { ...ev.quality.components[0]!, pattern: 'custom' }
    const out = renderKeyboardSection(quality, ev.capability.rows[0]!).join('\n')
    expect(out).toContain('**no APG pattern applies**')
    expect(out).not.toContain('apg/patterns/custom')
  })
})

// ── 4. Cross-artifact agreement ─────────────────────────────────────────────

describe('an absent lane record is printed, not routed around', () => {
  it('says so on the browser page instead of rendering a confident one', () => {
    const page = renderBrowserSupportPage(makeSources())
    expect(page).toContain('No engine-lane record exists in this checkout')
    expect(page).toContain('**no engine numbers are shown on this page**')
    expect(page).not.toContain('| Engine | Version |')
  })

  it('marks the missing artifact absent in the provenance table', () => {
    const page = renderBrowserSupportPage(makeSources())
    expect(page).toContain('| `e2e/matrix/engine-ratchets.json` | — | **absent in this checkout** |')
  })
})

describe('crossCheckWcagDeviations', () => {
  it('fails when the audit and the `drags` trait disagree', () => {
    const ev = makeSources()
    ev.quality.components[0]!.traits = ['drags']
    expect(crossCheckWcagDeviations(ev)[0]).toContain('the `drags` trait names')
  })

  it('fails when a recorded gap also names a single-pointer path', () => {
    const ev = makeSources()
    ev.wcagDeviations.surfaces = [{
      component: 'DzThing',
      operation: 'o',
      keyboardAlternative: 'k',
      singlePointerNoDrag: 'a tap',
      state: 'gap',
    }]
    ev.wcagDeviations.openGaps = 1
    ev.wcagDeviations.ceiling = 1
    ev.quality.components[0]!.traits = ['drags']
    expect(crossCheckWcagDeviations(ev).some(p => p.includes('names a single-pointer path'))).toBe(true)
  })

  it('fails when the open-gap count exceeds its ceiling', () => {
    const ev = makeSources()
    ev.quality.components[0]!.traits = ['drags']
    ev.wcagDeviations.surfaces = [{
      component: 'DzThing',
      operation: 'o',
      keyboardAlternative: 'k',
      singlePointerNoDrag: null,
      state: 'gap',
    }]
    ev.wcagDeviations.openGaps = 1
    ev.wcagDeviations.ceiling = 0
    expect(crossCheckWcagDeviations(ev).some(p => p.includes('Ratchets move one way only'))).toBe(true)
  })
})

// ── 5. The real catalogue ───────────────────────────────────────────────────

describe('the real catalogue', () => {
  const artifact = JSON.parse(
    readFileSync(join(ROOT, 'packages/core/docs/component-meta.json'), 'utf8'),
  ) as ComponentMetaArtifact
  const ev = readEvidenceSources()
  const publics = artifact.components.filter(c => c.kind === 'public-component')

  it('agrees with the capability join in component-meta.json', () => {
    expect(crossCheckCapabilityJoin(artifact, ev)).toEqual([])
  })

  it('publishes no at-manual pass that the raw scaffold does not support', () => {
    expect(atManualTripwire(ev)).toEqual([])
  })

  it('keeps the SC 2.5.7 audit bound to the `drags` trait', () => {
    expect(crossCheckWcagDeviations(ev)).toEqual([])
  })

  it('gives every public component an evidence section', () => {
    for (const record of publics) {
      const out = renderEvidence(record as ComponentMetaRecord, ev).join('\n')
      expect(out.startsWith('## Accessibility and evidence'), record.name).toBe(true)
      expect(out, record.name).toContain('**Risk tier:**')
      expect(out, record.name).toContain('### WCAG 2.2 criteria in scope')
      expect(out, record.name).toContain('### Keyboard interaction')
      expect(out, record.name).toContain('### Evidence cells')
    }
  })

  it('no page in the catalogue says "not yet derived" any more', () => {
    // The state TASK-R5-O5 found: 144 of 144 pages carried that sentence where
    // the keyboard table belongs. Asserted as an absence so a renderer edit
    // cannot bring it back.
    for (const record of publics) {
      const out = renderEvidence(record as ComponentMetaRecord, ev).join('\n')
      expect(out.toLowerCase(), record.name).not.toContain('not yet derived')
    }
  })

  it('renders a real keyboard table wherever the component declares one', () => {
    const declared = publics.filter(r => (r as ComponentMetaRecord).anatomy.keyboard !== undefined
      && (r as ComponentMetaRecord).anatomy.keyboard !== 'none')
    // Guards against the whole section going vacuous: if the catalogue stopped
    // declaring contracts this test would pass trivially, so the count is
    // asserted too.
    expect(declared.length).toBeGreaterThan(80)
    for (const record of declared) {
      const out = renderEvidence(record as ComponentMetaRecord, ev).join('\n')
      expect(out, record.name).toContain('declared binding')
      expect(out, record.name).toContain('| Key |')
    }
  })

  it('names every unrun and stale cell on the page it belongs to', () => {
    for (const row of ev.capability.rows) {
      const record = publics.find(c => c.name === row.component)
      if (record === undefined)
        continue
      const out = renderEvidence(record as ComponentMetaRecord, ev).join('\n')
      for (const c of row.cells.filter(c => c.state === 'unrun'))
        expect(out, `${row.component}/${c.kind}`).toContain(`| \`${c.kind}\` |`)
      for (const c of row.cells.filter(c => c.state === 'stale'))
        expect(out, `${row.component}/${c.kind}`).toContain(`| \`${c.kind}\` |`)
    }
  })

  it('renders 0 executed AT pairs on every component that owes a run', () => {
    const owed = ev.quality.components.filter(c => c.evidence.includes('at-manual'))
    expect(owed.length).toBeGreaterThan(0)
    for (const quality of owed) {
      const record = publics.find(c => c.name === quality.component)
      if (record === undefined)
        continue
      const out = renderEvidence(record as ComponentMetaRecord, ev).join('\n')
      expect(out, quality.component).toMatch(/\*\*0 of \d+ AT\/browser pairs executed\.\*\*/)
    }
  })

  it('renders every page, with evidence, without markup VitePress would compile', () => {
    const pages = [
      ...publics.map(record => [
        `${record.name}.md`,
        renderComponentPage({ record: record as ComponentMetaRecord, artifact, evidence: ev }),
      ] as const),
      ['evidence/index.md', renderEvidenceIndex(ev)] as const,
      ['evidence/capability-matrix.md', renderCapabilityMatrixPage(ev)] as const,
      ['evidence/at-matrix.md', renderAtMatrixPage(ev)] as const,
      ['evidence/accessibility.md', renderAccessibilityPage(ev)] as const,
      ['evidence/browser-support.md', renderBrowserSupportPage(ev)] as const,
      ['evidence/styling-posture.md', renderStylingPosturePage(ev, artifact)] as const,
    ]
    // One rule, one implementation — `unescapedMarkupLines` in docs-pages.ts.
    // This assertion used to carry its own copy, which is why it went red
    // against a correct page the first time the escaper gained a channel
    // (D3-F6) and again when the page-local import block landed (TASK-R1-O5).
    for (const [name, page] of pages) {
      const offenders = unescapedMarkupLines(page)
      expect(
        offenders,
        `${name} carries unescaped markup: ${
          offenders.map(o => `line ${o.line}: ${o.text}`).join(' · ')}`,
      ).toEqual([])
    }
  })

  it('never prints an evidence badge that reads as a pass for an unrun state', () => {
    // The whole point of the packet, asserted at catalogue scale: wherever the
    // matrix says `unrun`, the page says `unrun` — never blank, never absent,
    // never a tick.
    const unrunTotal = ev.capability.rows.flatMap(r => r.cells).filter(c => c.state === 'unrun').length
    expect(unrunTotal).toBeGreaterThan(0)
    const rendered = ev.capability.rows
      .map((row) => {
        const record = publics.find(c => c.name === row.component)
        return record === undefined ? '' : renderEvidence(record as ComponentMetaRecord, ev).join('\n')
      })
      .join('\n')
    const printed = rendered.split('**`unrun`**').length - 1
    expect(printed).toBe(unrunTotal)
  })
})

// ---------------------------------------------------------------------------
// The browser-floor probe (TASK-R2-O5)
// ---------------------------------------------------------------------------

describe('browser-target probe', () => {
  it('reads a browserslist file and a package.json key as declarations', () => {
    const probe = classifyBrowserTargetSources([
      { path: '.browserslistrc', content: '# comment\nlast 2 versions\nnot dead\n' },
      { path: 'packages/core/package.json', content: '{"browserslist":["chrome >= 120"]}' },
    ])
    expect(probe.declared).toEqual([
      { kind: 'browserslist', where: '.browserslistrc', value: 'last 2 versions, not dead' },
      { kind: 'browserslist', where: 'packages/core/package.json', value: 'chrome >= 120' },
    ])
  })

  it('reads a build target as a declaration and a tsconfig target as a syntax level', () => {
    const probe = classifyBrowserTargetSources([
      { path: 'packages/core/vite.config.ts', content: 'export default {\n  build: {\n    target: \'es2022\',\n  },\n}\n' },
      { path: 'tsconfig.base.json', content: '{\n  "compilerOptions": {\n    "target": "ES2022"\n  }\n}\n' },
    ])
    expect(probe.declared).toEqual([
      { kind: 'build-target', where: 'packages/core/vite.config.ts', value: 'es2022' },
    ])
    expect(probe.syntaxLevels).toEqual([{ where: 'tsconfig.base.json', value: 'ES2022' }])
  })

  // The failure this probe exists to not repeat: the task's own done-check
  // greps `target` in `packages/core/vite.config.ts`, and the two lines it
  // matches are English sentences in a doc comment.
  it('does not mistake the word "target" in a comment for a declaration', () => {
    expect(buildTargetIn([
      '/**',
      ' * copied verbatim to `dist/i18n/locales/`, the target of the',
      ' * asset to `dist/core.css`, the target of the `./styles` export.',
      ' */',
      'export default { build: { lib: {} } }',
    ].join('\n'))).toBeUndefined()
  })

  it('reads the floor the six published packages declare', () => {
    // Until 2026-09-19 this asserted `declared` was EMPTY, which was true and
    // was the point: the probe existed so that the day an owner declared a
    // floor, the published statement would change with it. That day came —
    // owner decision D118 option (a), TASK-R2-O5 — so the assertion is now the
    // other half of the same contract, and it is stricter: every published
    // package must declare, and all of them must declare the SAME range. A
    // floor that is declared in five packages out of six is a floor the build
    // does not actually hold to.
    const probe = probeBrowserTarget()
    const published = ['contracts', 'core', 'mcp', 'nuxt', 'testing', 'tokens']

    expect(probe.declared.map(d => d.where))
      .toEqual(published.map(p => `packages/${p}/package.json`))
    expect(new Set(probe.declared.map(d => d.value)).size).toBe(1)
    expect(probe.declared.every(d => d.kind === 'browserslist')).toBe(true)
    expect(probe.scanned.length).toBeGreaterThan(0)
    // A `compilerOptions.target` is still NOT a browser declaration, and is
    // still reported separately.
    expect(probe.syntaxLevels.length).toBeGreaterThan(0)
  })

  it('states the absence on the page, and states a declaration when there is one', () => {
    const undeclared = renderBrowserSupportPage(makeSources())
    expect(undeclared).toContain('The supported-browser floor is undecided')
    expect(undeclared).toContain('What was searched')

    const declared = renderBrowserSupportPage(makeSources({
      browserTarget: {
        declared: [{ kind: 'browserslist', where: 'package.json', value: 'last 2 versions' }],
        syntaxLevels: [],
        scanned: ['package.json'],
      },
    }))
    expect(declared).toContain('## The supported-browser floor')
    expect(declared).not.toContain('is undecided')
    expect(declared).toContain('last 2 versions')
  })
})
