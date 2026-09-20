/**
 * Quality tiers — how much evidence a public component owes (TASK-OSS-P5-01).
 *
 * Quality requirements in this repository have been applied uniformly: a badge
 * and a combobox carried the same expectations, so effort went where it was
 * cheapest to spend rather than where a defect hurts, and a missing lane was
 * invisible because nothing said which lanes a given component owed.
 *
 * This module is the rulebook. It says nothing about any particular component —
 * the assignment lives in `packages/tooling/src/quality/component-tiers.ts` and
 * the joined answer is generated into `packages/core/docs/quality-matrix.json`.
 * Keeping the three apart is deliberate: the rules are a published contract a
 * consumer can read, the assignment is repository policy, and the join is
 * generated output that must never be hand-edited.
 *
 * The tier definitions are transcribed from the 2026-08-11 system reassessment,
 * `06-quality-accessibility-i18n-security-spec.md` §"Quality model". That
 * document is the authority; where this file and it disagree, it wins.
 *
 * @module @dzup-ui/contracts/quality-tiers
 */

import type { RiskTier } from './anatomy.types.js'

// ---------------------------------------------------------------------------
// Evidence
// ---------------------------------------------------------------------------

/**
 * One kind of evidence a component can owe.
 *
 * Named per *artifact that can be pointed at*, not per activity: "we tested
 * keyboard behaviour" is unfalsifiable, `keyboard-spec` is a file that either
 * exists at a commit or does not. The capability matrix (TASK-OSS-P5-06) marks
 * each of these present, passing, stale or unrun, and it can only do that
 * because each one names something on disk.
 */
export type EvidenceKind
  // --- Tier A: everything ships with these ---------------------------------
  /** `Dz{Name}.contract.spec.ts` — Contract Spec v1 props/events/slots/ARIA. */
  = | 'contract-spec'
    /** `Dz{Name}.spec.ts` — render and behaviour units. */
    | 'unit-spec'
    /** An `axe` assertion, colocated or in the family a11y suite. */
    | 'axe'
    /** A story exercising the component in light and dark. */
    | 'story-light-dark'
    /** The component appears in an SSR render sample without DOM access. */
    | 'ssr-sample'
    /** Token/contrast evidence: every colour pair the component ships passes. */
    | 'token-contrast'

    // --- Tier B: interactive primitives add these ---------------------------
    /** An explicit keyboard table asserted in a spec, not narrated in prose. */
    | 'keyboard-spec'
    /** Stories for each state the component declares. */
    | 'state-stories'
    /** Controlled and uncontrolled value paths both asserted. */
    | 'controlled-uncontrolled'
    /** A Storybook `play()` that drives the component in a real engine. */
    | 'browser-play'
    /** RTL contract declared and asserted (TASK-OSS-P4-05). */
    | 'rtl-contract'
    /** The three-engine by five-condition lane (TASK-OSS-P5-03). */
    | 'browser-matrix'
    /** Teleported content survives SSR and hydration. */
    | 'portal-hydration'

    // --- Tier C: composites add these --------------------------------------
    /** Empty, loading, error and large-dataset stories. */
    | 'data-scenarios'
    /** A prose narrative of the APG pattern and expected announcements. */
    | 'a11y-narrative'
    /** A composition story drawn from a real product surface. */
    | 'real-world-story'
    /** A recorded manual screen-reader run (TASK-OSS-P5-04). */
    | 'at-manual'
    /** A render/interaction baseline with measured variance (TASK-OSS-P5-05). */
    | 'perf-baseline'
    /** Every drag interaction has a keyboard or pointer-only equivalent. */
    | 'non-drag-alternative'

    // --- Tier D: data boundaries add these ----------------------------------
    /** A written threat model naming the sink, the source and the policy. */
    | 'threat-model'
    /** A corpus of hostile inputs asserted to fail closed. */
    | 'malicious-corpus'
    /** URL/protocol allowlist behaviour asserted. */
    | 'url-policy'
    /** Behaviour under a restrictive CSP, including nonce propagation. */
    | 'csp-fixture'

/** Every {@link EvidenceKind}, in tier order. Validators iterate this. */
export const EVIDENCE_KINDS: readonly EvidenceKind[] = [
  'contract-spec',
  'unit-spec',
  'axe',
  'story-light-dark',
  'ssr-sample',
  'token-contrast',
  'keyboard-spec',
  'state-stories',
  'controlled-uncontrolled',
  'browser-play',
  'rtl-contract',
  'browser-matrix',
  'portal-hydration',
  'data-scenarios',
  'a11y-narrative',
  'real-world-story',
  'at-manual',
  'perf-baseline',
  'non-drag-alternative',
  'threat-model',
  'malicious-corpus',
  'url-policy',
  'csp-fixture',
]

// ---------------------------------------------------------------------------
// Tier to evidence
// ---------------------------------------------------------------------------

/**
 * What each tier adds on top of the one below it.
 *
 * Stored as the *increment* rather than the full set because that is how the
 * reassessment states it ("Tier A plus …"), and because a reader checking this
 * table against the spec should not have to diff four long lists to see what
 * one tier actually contributes. {@link requiredEvidence} does the accumulation.
 */
export const TIER_EVIDENCE_INCREMENT: Readonly<Record<RiskTier, readonly EvidenceKind[]>> = {
  A: [
    'contract-spec',
    'unit-spec',
    'axe',
    'story-light-dark',
    'ssr-sample',
    'token-contrast',
  ],
  B: [
    'keyboard-spec',
    'state-stories',
    'controlled-uncontrolled',
    'browser-play',
    'rtl-contract',
    'browser-matrix',
    'at-manual',
  ],
  C: [
    'a11y-narrative',
    'real-world-story',
    'perf-baseline',
  ],
  D: [
    'threat-model',
    'malicious-corpus',
    'url-policy',
    'csp-fixture',
  ],
}

/** The tiers in ascending order of what they owe. */
export const RISK_TIER_ORDER: readonly RiskTier[] = ['A', 'B', 'C', 'D']

// ---------------------------------------------------------------------------
// Traits — the rows that follow what a component does, not how complex it is
// ---------------------------------------------------------------------------

/**
 * A behaviour that pulls in evidence on its own, regardless of tier.
 *
 * Three rows in the reassessment's table are qualified "where applicable", and
 * folding them into a tier makes that qualification vanish: `DzButton` and
 * `DzSelect` are both Tier B, and only one of them teleports. Putting
 * portal/hydration in the B increment would leave a permanently-empty cell on
 * the button that a reader has to learn to ignore — which is how a matrix stops
 * being read.
 *
 * So they hang off traits instead. A trait is a fact about the component that a
 * reviewer can check in one look, and the generated matrix records the trait as
 * the reason the row applies.
 *
 * - `teleports` — renders any part of itself outside its own DOM position.
 * - `drags` — has a pointer-drag interaction (WCAG 2.5.7 applies).
 * - `dataset` — accepts a collection whose size the consumer chooses, so
 *   empty/loading/error/large are distinct behaviours rather than styling.
 */
export type ComponentTrait = 'teleports' | 'drags' | 'dataset'

/** Every {@link ComponentTrait}. */
export const COMPONENT_TRAITS: readonly ComponentTrait[] = ['teleports', 'drags', 'dataset']

/** The evidence each trait adds. */
export const TRAIT_EVIDENCE: Readonly<Record<ComponentTrait, readonly EvidenceKind[]>> = {
  teleports: ['portal-hydration'],
  drags: ['non-drag-alternative'],
  dataset: ['data-scenarios'],
}

/** The WCAG criteria each trait adds. */
export const TRAIT_WCAG: Readonly<Record<ComponentTrait, readonly string[]>> = {
  teleports: ['2.4.11'],
  drags: ['2.5.1', '2.5.7'],
  dataset: ['4.1.3'],
}

/**
 * The complete evidence set a tier owes, accumulated from A upward.
 *
 * @example
 * ```ts
 * requiredEvidence('B')  // Tier A's six, then Tier B's seven
 * ```
 */
export function requiredEvidence(tier: RiskTier): readonly EvidenceKind[] {
  const upTo = RISK_TIER_ORDER.slice(0, RISK_TIER_ORDER.indexOf(tier) + 1)
  return upTo.flatMap(t => TIER_EVIDENCE_INCREMENT[t])
}

// ---------------------------------------------------------------------------
// Manual AT pairings by tier (TASK-R2-O2)
// ---------------------------------------------------------------------------

/**
 * What each tier adds, on top of the tier below, to the set of AT/browser
 * pairings whose run record it **requires** before its `at-manual` evidence row
 * can read `pass`.
 *
 * **Why this lives here and not in the scaffold.** TASK-N1-O4 §1c measured that
 * the scaffold declared no tier differentiation at all: `AT_PAIRS` was a flat
 * array consumed unconditionally, so `DzFileUpload` — the one Tier D component
 * in the catalog, whose primary job is a data boundary — owed exactly what a
 * Tier B `DzBadge` owed, and the capability matrix stamped `origin: "tier B"` on
 * every Tier C and D row to say so. An obligation that does not vary with risk
 * is not a risk-tiered obligation; it is a constant wearing one's clothes. What
 * a component owes is a *published contract*, the same place
 * {@link TIER_EVIDENCE_INCREMENT} lives, so that a generator continues to
 * report it and never to decide it.
 *
 * **The ladder is monotonic by construction.** {@link requiredAtPairs}
 * accumulates from A upward exactly as {@link requiredEvidence} does, so Tier D
 * ⊇ Tier C ⊇ Tier B is a property of the data structure rather than a rule
 * somebody has to remember. Tier A owes none: it is excluded from the scaffold
 * entirely.
 *
 * **This narrows nothing.** The scaffold still generates a row for all six
 * pairings on all 89 Tier B–D components — 534 cells, unchanged — because
 * `<evidence_rules>` says unrun cells stay visible. What this table changes is
 * only which of those cells a component must have *passed* to be called
 * qualified. A pairing outside a component's required set is still recorded if
 * somebody runs it, and still reads `unrun` if nobody does; it simply does not
 * hold the component's evidence row hostage. Reporting it as a smaller
 * denominator would be the ratchet-gaming this note exists to forbid: quote
 * both, always — `executed n/534 (required m/136)`.
 *
 * The values follow the 2026-08-11 reassessment doc 06 (NVDA first, because it
 * is the pairing the largest share of screen-reader users actually run) and the
 * precedent already set by the Pro repository's `docs/qa/at/README.md`, which
 * tier-differentiates and which the pairing packet for this task proposes to
 * reconcile with.
 */
export const TIER_AT_PAIR_INCREMENT: Readonly<Record<RiskTier, readonly string[]>> = {
  /** Excluded from the manual AT scaffold altogether. */
  A: [],
  /**
   * One pairing. A Tier B component is a single interactive widget with a
   * settled APG pattern; the question a manual run answers for it is "are name,
   * role and state announced", and one competent screen reader answers it.
   */
  B: ['nvda-firefox'],
  /**
   * Two more. Tier C is composite and stateful, where the pairings start to
   * disagree: JAWS applies its own heuristics over ARIA and overrides author
   * intent more often than NVDA, and VoiceOver exposes WebKit's tree and the
   * rotor rather than Gecko's. A component can be correct under NVDA and
   * unusable under either.
   */
  C: ['jaws-chrome', 'voiceover-safari'],
  /**
   * The remaining three. Tier D crosses a data boundary, which is where a
   * mis-announcement stops being an inconvenience: the touch pairings reach a
   * control by gesture rather than by Tab, so a control that is unreachable by
   * keyboard can still be pressed there, and `nvda-chrome` is the same AT over a
   * different engine, which is how virtualized and composite widgets diverge.
   */
  D: ['nvda-chrome', 'voiceover-ios', 'talkback-android'],
}

/**
 * The complete set of AT/browser pairings a tier requires, accumulated from A
 * upward — the manual-AT analogue of {@link requiredEvidence}.
 *
 * @example
 * ```ts
 * requiredAtPairs('B')  // ['nvda-firefox']
 * requiredAtPairs('C')  // ['nvda-firefox', 'jaws-chrome', 'voiceover-safari']
 * requiredAtPairs('D')  // all six
 * ```
 */
export function requiredAtPairs(tier: RiskTier): readonly string[] {
  const upTo = RISK_TIER_ORDER.slice(0, RISK_TIER_ORDER.indexOf(tier) + 1)
  return upTo.flatMap(t => TIER_AT_PAIR_INCREMENT[t])
}

// ---------------------------------------------------------------------------
// The security boundary, which is NOT the tier
// ---------------------------------------------------------------------------

/**
 * A data boundary a component crosses, independent of how complex it is.
 *
 * **Why this is not simply "Tier D".** The reassessment's tiers are cumulative:
 * D requires everything C requires. `DzButton` accepts an `href`, so it owes a
 * URL policy and a hostile-input corpus — but tiering it D would also make it
 * owe dataset scenarios, a manual AT task and a performance baseline, none of
 * which a button has any way to satisfy or any reason to. That is exactly the
 * case TASK-OSS-P5-01's stop condition describes: a Tier D requirement the
 * component cannot meet.
 *
 * The stop condition says report, do not downgrade to pass — so the boundary
 * became its own axis. A component keeps the tier its interaction complexity
 * earns, and a declared boundary *adds* the Tier D security rows on top. The
 * requirement is kept, not dropped; it simply stopped dragging six unrelated
 * ones behind it.
 *
 * - `none` — the component renders only text and its own markup.
 * - `url` — a host-supplied URL becomes a navigation or a subresource load.
 * - `file` — the component reads files chosen by the user.
 * - `html` — host-supplied markup reaches a parser or an HTML sink.
 * - `payload` — host-supplied data is encoded into something another system
 *   decodes and acts on. A QR code is a URL a camera will follow.
 */
export type SecurityBoundary = 'none' | 'url' | 'file' | 'html' | 'payload'

/** Every {@link SecurityBoundary} value. */
export const SECURITY_BOUNDARIES: readonly SecurityBoundary[] = [
  'none',
  'url',
  'file',
  'html',
  'payload',
]

/** The evidence a boundary adds, by kind. `none` adds nothing. */
export const BOUNDARY_EVIDENCE: Readonly<Record<SecurityBoundary, readonly EvidenceKind[]>> = {
  none: [],
  url: ['threat-model', 'malicious-corpus', 'url-policy'],
  file: ['threat-model', 'malicious-corpus'],
  html: ['threat-model', 'malicious-corpus', 'csp-fixture'],
  payload: ['threat-model', 'malicious-corpus'],
}

/**
 * The boundaries **one component** crosses (TASK-R2-O4, owner decision O5-2).
 *
 * A set, not a value, because a component can cross two at once and one of them
 * did: `DzQRCode` encodes an arbitrary `value` into a machine-readable code
 * (`payload`) **and** renders a host-supplied `icon` as an `<img src>` (`url`).
 * With a single value it declared `payload`, and the `url-policy` row was
 * therefore never asked for — so the sink existed, was bound and was asserted in
 * `packages/core/security/boundary-bindings.ts`, and the matrix could not say
 * so. TASK-N1-O5 recorded that as finding U3 and routed it here.
 *
 * Invariants, enforced by `validate:quality-tiers`:
 *
 * - the set is **non-empty** and **sorted** in {@link SECURITY_BOUNDARIES}
 *   order, so two runs cannot produce two spellings of one fact;
 * - no duplicates;
 * - `none` is **exclusive** — `['none', 'url']` is not "crosses nothing and also
 *   a URL", it is a contradiction, and a validator that accepted it would let a
 *   real boundary hide behind the word that means there is not one.
 */
export type SecurityBoundarySet = readonly SecurityBoundary[]

/**
 * Accept the single value or the set, and return the canonical set.
 *
 * The authoring file (`component-tiers.ts`) keeps `boundary: 'url'` for the 14
 * components that cross exactly one — a list of one is noise in a review
 * artifact whose whole job is to be read. The *generated* row is always a set,
 * so every consumer has one shape.
 */
export function normaliseBoundaries(
  input: SecurityBoundary | SecurityBoundarySet | undefined,
): SecurityBoundarySet {
  if (input === undefined)
    return ['none']
  const values = typeof input === 'string' ? [input] : input
  if (values.length === 0)
    return ['none']
  const unique = new Set(values)
  return SECURITY_BOUNDARIES.filter(b => unique.has(b))
}

/**
 * **The parent-covers rule** (TASK-R2-O4, owner decision O5-3).
 *
 * Three `url` declarers have **no sink of their own**: `DzMenu`, `DzSidebar`
 * and `DzBreadcrumb` are containers, and the `href` lives on `DzMenuItem`,
 * `DzSidebarItem` and `DzBreadcrumbItem` — compound sub-parts, which are not
 * rows in the quality matrix. `DzAvatarGroup` is the same shape for `src`.
 * TASK-N1-O5 recorded that as finding U4 and left the choice open: either the
 * sub-parts become rows, or the matrix writes down that a parent's boundary
 * covers its parts.
 *
 * **The rule is: a parent's declared boundary covers every sink carried by its
 * own compound sub-parts, and the binding table names which part carries
 * which.** The table is `packages/core/security/boundary-bindings.ts`, one entry
 * per component, and it mounts the parent *with the child inside it* — which is
 * both how the boundary is actually crossed and how a consumer writes it.
 *
 * Making the 65 compound sub-parts rows was the alternative and it was rejected
 * on what it would have cost in truth, not in effort. A row owes its **tier's
 * whole evidence set** — `contract-spec`, `unit-spec`, `axe`, `story-light-dark`
 * and the rest — and `DzMenuItem` has no story of its own, by design: it is not
 * usable outside `DzMenu` and a story that mounted one would be documenting a
 * thing consumers cannot write. So 65 rows would have arrived owing ~400 cells
 * that are `unrun` because the evidence is *unwritable*, not because nobody
 * wrote it, and the matrix's one job is to keep that distinction legible. A
 * rule that is stated and enforced beats rows that are permanently empty.
 *
 * What the rule costs, stated so it is not discovered later: *"which components
 * own a URL sink"* cannot be answered from the matrix alone. It is answered
 * from the binding table, which is a file with one entry per component and a
 * sentence per sink — the artifact a reviewer actually wants.
 */
export const BOUNDARY_COVERS_COMPOUND_PARTS = true

/** `none` · `url` · `payload + url` — one spelling, for a message or a cell. */
export function formatBoundaries(boundaries: SecurityBoundarySet): string {
  return boundaries.length === 0 ? 'none' : boundaries.join(' + ')
}

/** True when the set names a real boundary rather than the absence of one. */
export function crossesBoundary(boundaries: SecurityBoundarySet): boolean {
  return boundaries.some(b => b !== 'none')
}

// ---------------------------------------------------------------------------
// APG patterns
// ---------------------------------------------------------------------------

/**
 * A WAI-ARIA Authoring Practices Guide pattern name, lowercase-hyphenated
 * exactly as the APG URL slug spells it, so a reader can paste it after
 * `https://www.w3.org/WAI/ARIA/apg/patterns/` and land on the pattern.
 *
 * `none` is for components with no interactive pattern at all. `custom` is for
 * a component whose behaviour APG does not describe — it is admitted, but
 * {@link ComponentQuality.patternJustification} becomes required, because
 * "custom" with no reason is indistinguishable from "nobody looked".
 */
export type ApgPattern
  = | 'accordion'
    | 'alert'
    | 'alertdialog'
    | 'breadcrumb'
    | 'button'
    | 'carousel'
    | 'checkbox'
    | 'combobox'
    | 'dialog'
    | 'disclosure'
    | 'feed'
    | 'grid'
    | 'landmarks'
    | 'link'
    | 'listbox'
    | 'menu'
    | 'menubar'
    | 'menu-button'
    | 'meter'
    | 'radio-group'
    | 'slider'
    | 'slider-multithumb'
    | 'spinbutton'
    | 'switch'
    | 'table'
    | 'tabs'
    | 'toolbar'
    | 'tooltip'
    | 'treegrid'
    | 'treeview'
    | 'window-splitter'
    | 'custom'
    | 'none'

/** Every {@link ApgPattern}, alphabetical, with `custom` and `none` last. */
export const APG_PATTERNS: readonly ApgPattern[] = [
  'accordion',
  'alert',
  'alertdialog',
  'breadcrumb',
  'button',
  'carousel',
  'checkbox',
  'combobox',
  'dialog',
  'disclosure',
  'feed',
  'grid',
  'landmarks',
  'link',
  'listbox',
  'menu',
  'menubar',
  'menu-button',
  'meter',
  'radio-group',
  'slider',
  'slider-multithumb',
  'spinbutton',
  'switch',
  'table',
  'tabs',
  'toolbar',
  'tooltip',
  'treegrid',
  'treeview',
  'window-splitter',
  'custom',
  'none',
]

// ---------------------------------------------------------------------------
// WCAG 2.2
// ---------------------------------------------------------------------------

/** Conformance level of a success criterion. */
export type WcagLevel = 'A' | 'AA' | 'AAA'

export interface WcagCriterion {
  /** Success-criterion number, e.g. `2.4.11`. */
  readonly id: string
  readonly name: string
  readonly level: WcagLevel
  /** `2.2` for criteria new in WCAG 2.2; `2.0` or `2.1` otherwise. */
  readonly since: '2.0' | '2.1' | '2.2'
}

/**
 * The WCAG 2.2 success criteria a component library can actually fail.
 *
 * Deliberately not the full 87. Criteria that belong to a *page* rather than to
 * a component — 2.4.1 Bypass Blocks, 2.4.2 Page Titled, 3.1.1 Language of Page,
 * 3.2.3 Consistent Navigation — are the consumer's to satisfy, and listing them
 * here would produce a matrix where two thirds of the cells belong to somebody
 * else and the ones that are ours are harder to find.
 *
 * 4.1.1 Parsing is absent because WCAG 2.2 removed it.
 */
export const WCAG_22_CRITERIA = [
  { id: '1.1.1', name: 'Non-text Content', level: 'A', since: '2.0' },
  { id: '1.3.1', name: 'Info and Relationships', level: 'A', since: '2.0' },
  { id: '1.3.2', name: 'Meaningful Sequence', level: 'A', since: '2.0' },
  { id: '1.3.4', name: 'Orientation', level: 'AA', since: '2.1' },
  { id: '1.3.5', name: 'Identify Input Purpose', level: 'AA', since: '2.1' },
  { id: '1.4.1', name: 'Use of Color', level: 'A', since: '2.0' },
  { id: '1.4.3', name: 'Contrast (Minimum)', level: 'AA', since: '2.0' },
  { id: '1.4.4', name: 'Resize Text', level: 'AA', since: '2.0' },
  { id: '1.4.10', name: 'Reflow', level: 'AA', since: '2.1' },
  { id: '1.4.11', name: 'Non-text Contrast', level: 'AA', since: '2.1' },
  { id: '1.4.12', name: 'Text Spacing', level: 'AA', since: '2.1' },
  { id: '1.4.13', name: 'Content on Hover or Focus', level: 'AA', since: '2.1' },
  { id: '2.1.1', name: 'Keyboard', level: 'A', since: '2.0' },
  { id: '2.1.2', name: 'No Keyboard Trap', level: 'A', since: '2.0' },
  { id: '2.1.4', name: 'Character Key Shortcuts', level: 'A', since: '2.1' },
  { id: '2.2.1', name: 'Timing Adjustable', level: 'A', since: '2.0' },
  { id: '2.2.2', name: 'Pause, Stop, Hide', level: 'A', since: '2.0' },
  { id: '2.3.1', name: 'Three Flashes or Below Threshold', level: 'A', since: '2.0' },
  { id: '2.4.3', name: 'Focus Order', level: 'A', since: '2.0' },
  { id: '2.4.6', name: 'Headings and Labels', level: 'AA', since: '2.0' },
  { id: '2.4.7', name: 'Focus Visible', level: 'AA', since: '2.0' },
  { id: '2.4.11', name: 'Focus Not Obscured (Minimum)', level: 'AA', since: '2.2' },
  { id: '2.5.1', name: 'Pointer Gestures', level: 'A', since: '2.1' },
  { id: '2.5.2', name: 'Pointer Cancellation', level: 'A', since: '2.1' },
  { id: '2.5.3', name: 'Label in Name', level: 'A', since: '2.1' },
  { id: '2.5.4', name: 'Motion Actuation', level: 'A', since: '2.1' },
  { id: '2.5.7', name: 'Dragging Movements', level: 'AA', since: '2.2' },
  { id: '2.5.8', name: 'Target Size (Minimum)', level: 'AA', since: '2.2' },
  { id: '3.2.1', name: 'On Focus', level: 'A', since: '2.0' },
  { id: '3.2.2', name: 'On Input', level: 'A', since: '2.0' },
  { id: '3.2.6', name: 'Consistent Help', level: 'A', since: '2.2' },
  { id: '3.3.1', name: 'Error Identification', level: 'A', since: '2.0' },
  { id: '3.3.2', name: 'Labels or Instructions', level: 'A', since: '2.0' },
  { id: '3.3.3', name: 'Error Suggestion', level: 'AA', since: '2.0' },
  { id: '3.3.7', name: 'Redundant Entry', level: 'A', since: '2.2' },
  { id: '3.3.8', name: 'Accessible Authentication (Minimum)', level: 'AA', since: '2.2' },
  { id: '4.1.2', name: 'Name, Role, Value', level: 'A', since: '2.0' },
  { id: '4.1.3', name: 'Status Messages', level: 'AA', since: '2.1' },
] as const satisfies readonly WcagCriterion[]

/** Fast membership test for a criterion id. */
export const WCAG_CRITERION_IDS: ReadonlySet<string> = new Set(
  WCAG_22_CRITERIA.map(c => c.id),
)

/**
 * The criteria every tier owes regardless of what the component does.
 *
 * A component that renders any content at all can fail these, so they are not
 * a per-component judgment: name, structure, colour independence, contrast,
 * reflow and text spacing apply to a separator as much as to a data grid.
 */
export const BASELINE_WCAG: readonly string[] = [
  '1.1.1',
  '1.3.1',
  '1.4.1',
  '1.4.3',
  '1.4.4',
  '1.4.10',
  '1.4.11',
  '1.4.12',
  '4.1.2',
]

/**
 * The criteria an interactive component adds — anything that takes focus.
 *
 * Tier B and above always carry these; a Tier A component that turns out to be
 * focusable declares it by raising its tier, which is the point of the tier.
 */
export const INTERACTIVE_WCAG: readonly string[] = [
  '2.1.1',
  '2.1.2',
  '2.4.3',
  '2.4.7',
  '2.4.11',
  '2.5.3',
  '2.5.8',
  '3.2.1',
  '3.2.2',
]

// ---------------------------------------------------------------------------
// The per-component record
// ---------------------------------------------------------------------------

/**
 * One public component's quality requirements — the row the generator writes
 * into `quality-matrix.json` and the capability matrix reads back.
 */
export interface ComponentQuality {
  /** Exported symbol, exactly as consumers import it. */
  readonly component: string
  /** Owning family directory (`overlays`, `forms`, …) or `providers`. */
  readonly family: string
  readonly tier: RiskTier
  readonly pattern: ApgPattern
  /**
   * Why this pattern — required when `pattern` is `custom`, and required when
   * the tier is C or D, per TASK-OSS-P5-01's validator rule.
   */
  readonly patternJustification?: string
  /**
   * Every boundary this component crosses, sorted and non-empty
   * (TASK-R2-O4). `['none']` when it crosses none.
   */
  readonly securityBoundary: SecurityBoundarySet
  /** Why the boundary is what it is. Required when it is not `none`. */
  readonly boundaryJustification?: string
  /** Behaviours that add evidence on their own. */
  readonly traits: readonly ComponentTrait[]
  /** WCAG 2.2 success criteria this component can fail, sorted. */
  readonly wcag: readonly string[]
  /** Evidence owed: tier, trait and boundary evidence, de-duplicated. */
  readonly evidence: readonly EvidenceKind[]
  /**
   * Requirements this component provably cannot meet, with the reason.
   *
   * An escape hatch that leaves a mark: the requirement stays in `evidence`,
   * the capability matrix still shows the cell, and the reason travels with it.
   * Deleting the row would have hidden the gap, which is what P5 exists to stop.
   */
  readonly exceptions?: Readonly<Record<string, string>>
}

/**
 * Compute the evidence set for a tier, its traits and its boundary —
 * de-duplicated and in {@link EVIDENCE_KINDS} order, so two runs on two
 * machines cannot produce different orderings of the same set.
 */
export function evidenceFor(
  tier: RiskTier,
  boundary: SecurityBoundary | SecurityBoundarySet = 'none',
  traits: readonly ComponentTrait[] = [],
): readonly EvidenceKind[] {
  // The UNION across the set, so a component that crosses two boundaries owes
  // what both ask for. `DzQRCode` is the case: `payload` owes a threat model and
  // a corpus, `url` adds the url-policy row that its `icon` sink needs, and
  // taking the union is the only reading under which declaring the second
  // boundary is not a way to owe less.
  const owed = new Set<EvidenceKind>([
    ...requiredEvidence(tier),
    ...normaliseBoundaries(boundary).flatMap(b => BOUNDARY_EVIDENCE[b]),
    ...traits.flatMap(t => TRAIT_EVIDENCE[t]),
  ])
  return EVIDENCE_KINDS.filter(kind => owed.has(kind))
}

/**
 * Which rule put an evidence row on a component — the reason the matrix prints
 * next to the cell, so nobody has to re-derive it from four tables.
 */
export function evidenceOrigin(
  kind: EvidenceKind,
  tier: RiskTier,
  boundary: SecurityBoundary | SecurityBoundarySet,
  traits: readonly ComponentTrait[],
): string {
  for (const t of RISK_TIER_ORDER.slice(0, RISK_TIER_ORDER.indexOf(tier) + 1)) {
    if (TIER_EVIDENCE_INCREMENT[t].includes(kind))
      return `tier ${t}`
  }
  for (const trait of traits) {
    if (TRAIT_EVIDENCE[trait].includes(kind))
      return `trait ${trait}`
  }
  // Names EVERY boundary that asks for this kind, not the first. `DzQRCode`'s
  // `threat-model` is owed by `payload` and by `url`; attributing it to one of
  // them would make deleting the other look free.
  const from = normaliseBoundaries(boundary).filter(b => BOUNDARY_EVIDENCE[b].includes(kind))
  if (from.length > 0)
    return `boundary ${from.join(' + ')}`
  return 'unattributed'
}

/**
 * The WCAG criteria a tier and its traits imply, before per-component
 * additions.
 *
 * Additions are per-component and live in the assignment: only a date picker
 * knows it owes 1.3.5 Identify Input Purpose, and only a password field knows
 * it owes 3.3.8.
 */
export function baselineWcagFor(
  tier: RiskTier,
  traits: readonly ComponentTrait[] = [],
): readonly string[] {
  const owed = new Set(BASELINE_WCAG)
  if (tier !== 'A') {
    for (const id of INTERACTIVE_WCAG)
      owed.add(id)
  }
  for (const trait of traits) {
    for (const id of TRAIT_WCAG[trait])
      owed.add(id)
  }
  return WCAG_22_CRITERIA.map(c => c.id).filter(id => owed.has(id))
}
