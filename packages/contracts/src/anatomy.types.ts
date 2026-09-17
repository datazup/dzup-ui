/**
 * Component anatomy — the machine-readable half of Contract Spec v1
 * (TASK-OSS-P3-02, ADR-19).
 *
 * Contract Spec v1 already proves props, events, slots and ARIA. What it never
 * carried is the component's *styling surface*: which nodes a consumer may
 * address, which states it advertises, which tokens it reads. Without that in a
 * machine-readable form, "every public component exposes parts or an explicit
 * none" is a claim nothing can check, and the docs have to be written by hand.
 *
 * A component declares its anatomy beside its implementation, in
 * `Dz{Name}.anatomy.ts`:
 *
 * ```ts
 * export const anatomy = {
 *   parts: ['root', 'spinner'],
 *   states: ['idle', 'loading', 'disabled'],
 *   componentTokens: ['--dz-button-md-height'],
 *   recipes: ['variant', 'size', 'tone'],
 *   riskTier: 'A',
 * } as const satisfies ComponentAnatomy
 * ```
 *
 * The declaration is checked three ways, so it cannot become prose:
 * `expectAnatomy` (@dzup-ui/testing) asserts the rendered DOM matches it, the
 * ownership generator copies it into the manifest, and `validate:ownership`
 * counts the components that still have none.
 *
 * @module @dzup-ui/contracts/anatomy
 */

// ---------------------------------------------------------------------------
// Parts
// ---------------------------------------------------------------------------

/**
 * The shared part vocabulary (ADR-19 §3).
 *
 * Not a closed list — a component may name a part outside it when the
 * vocabulary genuinely has no word for the node — but reaching for a word that
 * is already here is how `content` means the same thing on a dialog and on a
 * popover. Names describe the node's ROLE, never its appearance.
 *
 * **Grown once, deliberately, on 2026-09-04** (TASK-R5-O1, resolving N2-S1
 * **S1-D1** / ADR-19 packet **D19-11**). `validate:anatomy-parts` had reported
 * 14 shipped names sitting outside the original 30 across 7 components. Seven
 * of them name a job that recurs across families and are folded in below;
 * the rest are deliberate, component-specific extensions and are recorded in
 * {@link ANATOMY_PART_EXTENSIONS} instead of being renamed — renaming a shipped
 * part name is breaking, so the review had to happen while the cost was low.
 */
export const ANATOMY_PART_VOCABULARY = [
  'root',
  'trigger',
  'content',
  'viewport',
  'overlay',
  'panel',
  'header',
  'footer',
  'title',
  'description',
  'label',
  'input',
  'control',
  'indicator',
  'icon',
  'prefix',
  'suffix',
  'spinner',
  'item',
  'item-label',
  'item-indicator',
  'list',
  'group',
  'group-label',
  'separator',
  'close',
  'action',
  'error',
  'hint',
  'empty',
  'loader',

  // ── Added 2026-09-04 by TASK-R5-O1 (S1-D1). Each one was already shipped by
  // a component below; each names a job that recurs, which is the test for
  // admission. ──
  /** The affordance that empties a control's value — inputs, search fields. */
  'clear',
  /** A two-state affordance that flips the part it governs — reveal, expand. */
  'toggle',
  /** The name of the resource a component displays — a code block, a file row. */
  'filename',
  /** The language or format label of displayed content. */
  'language',
  /** The repeating region of a tabular or sectioned component. */
  'body',
  /** One record in a tabular component. */
  'row',
  /** One field of one record in a tabular component. */
  'cell',
] as const

/** A part name drawn from the shared vocabulary. */
export type VocabularyPart = typeof ANATOMY_PART_VOCABULARY[number]

/**
 * Part names deliberately kept OUTSIDE the shared vocabulary (ADR-19 §3;
 * TASK-R5-O1, 2026-09-04).
 *
 * ADR-19 says the vocabulary grows deliberately and that a validator lists
 * out-of-vocabulary names so that it can. This is the other half of that
 * sentence: a name that was reviewed and deliberately *not* generalised, with
 * the reason recorded, so the next reader does not re-open the question and the
 * report can tell a reviewed extension apart from one nobody has looked at.
 *
 * `status`:
 * - `reviewed` — looked at, kept component-specific on purpose.
 * - `held` — not yet decided, and blocked on a named decision. A `held` name is
 *   counted by `validate:anatomy-parts` under a ceiling that ratchets DOWN.
 */
export const ANATOMY_PART_EXTENSIONS = {
  'copy-button': {
    owners: ['DzCodeBlock'],
    status: 'reviewed',
    reason: 'The copy affordance on a code block. `action` is the generic word and a new component '
      + 'should use it; this name is shipped and renaming it would be breaking.',
  },
  'line-number': {
    owners: ['DzCodeBlock'],
    status: 'reviewed',
    reason: 'The gutter number beside a source line. Nothing else in the catalog has the node.',
  },
  'decrement': {
    owners: ['DzNumberInput'],
    status: 'reviewed',
    reason: 'The two buttons on a stepper are not interchangeable, so one `action` for both would '
      + 'lose the distinction a consumer needs to style or test them apart.',
  },
  'increment': {
    owners: ['DzNumberInput'],
    status: 'reviewed',
    reason: 'See `decrement`.',
  },
  'options-state': {
    owners: [
      'DzCascader',
      'DzCombobox',
      'DzListbox',
      'DzMultiSelect',
      'DzPersonaSelector',
      'DzSelect',
      'DzTransfer',
      'DzTreeSelect',
    ],
    status: 'reviewed',
    reason: 'The tri-state row a selection control shows instead of its list while its options are '
      + 'loading, empty or failed (renderer contract C9). Emitted by DzOptionsState.vue, an '
      + 'UNEXPORTED internal, into every control that imports it. Held until 2026-09-04, when the '
      + 'owner took decision D15 (N2-S1 S1-D4 / ADR-19 packet D19-10) as option (d): EVERY host '
      + 'declares the three parts itself, which is the rule validate:anatomy-parts already '
      + 'implements for an unmanifested internal. Kept component-specific rather than folded into '
      + 'the vocabulary, and that is the deliberate part: `empty`, `error` and `loader` are three '
      + 'separate vocabulary words for what this row renders as ONE node whose state changes, so '
      + 'no combination of them describes it. The name is also shipped — renaming a shipped '
      + 'data-part is breaking (ADR-19 §3).',
  },
  'options-message': {
    owners: [
      'DzCascader',
      'DzCombobox',
      'DzListbox',
      'DzMultiSelect',
      'DzPersonaSelector',
      'DzSelect',
      'DzTransfer',
      'DzTreeSelect',
    ],
    status: 'reviewed',
    reason: 'See `options-state`. The announced text inside that row.',
  },
  'options-retry': {
    owners: [
      'DzCascader',
      'DzCombobox',
      'DzListbox',
      'DzMultiSelect',
      'DzPersonaSelector',
      'DzSelect',
      'DzTransfer',
      'DzTreeSelect',
    ],
    status: 'reviewed',
    reason: 'See `options-state`. The control that re-requests the options after a failure; '
      + '`action` is the generic word and a new component should use it, but this one is shipped.',
  },
} as const satisfies Record<string, {
  owners: readonly string[]
  status: 'reviewed' | 'held'
  reason: string
}>

/** A part name recorded as a deliberate extension rather than vocabulary. */
export type ExtensionPart = keyof typeof ANATOMY_PART_EXTENSIONS

// ---------------------------------------------------------------------------
// Recipes and risk
// ---------------------------------------------------------------------------

/**
 * A recipe axis. Each one is mirrored onto the root as `data-{axis}` carrying
 * the RESOLVED value — after group and provider inheritance, not the raw prop —
 * because that is what `core.css` already selects on
 * (`.dz-panel[data-size=lg]`, `.dz-toolbar[data-variant=elevated]`).
 */
export type RecipeAxis = 'size' | 'variant' | 'tone' | 'density' | 'orientation'

/**
 * How much evidence a component needs before it is trusted (the reassessment's
 * P5 tiers, named here so the tier travels with the component rather than with
 * a spreadsheet).
 *
 * The tiers are **cumulative and ascending**: every tier owes everything the
 * tier below it owes, and `A` is the floor. See `./quality-tiers.ts` for the
 * evidence each one adds, and `packages/core/docs/quality-matrix.json` for the
 * assignment.
 *
 * - `A` — presentational: renders content, takes no focus of its own. A defect
 *   is visible and recoverable. Badges, separators, skeletons, typography.
 * - `B` — interactive primitive: owns focus, keyboard and value. A defect is a
 *   functional or accessibility failure for someone who cannot work around it.
 *   Buttons, inputs, selects, dialogs, menus.
 * - `C` — composite or domain: several primitives with shared state, or data
 *   at a scale where correctness and speed are the same question. Grids,
 *   calendars, trees, editors.
 * - `D` — security or data boundary: host-supplied HTML, files, URLs or
 *   payloads reach a sink. Requires a threat model and a hostile corpus.
 *
 * **This definition was inverted until TASK-OSS-P5-01.** TASK-OSS-P3-02
 * introduced the field with `A` as the *highest* risk and `D` as structural
 * layout, which is the opposite of the 2026-08-11 reassessment's
 * `06-quality-accessibility-i18n-security-spec.md` §"Quality model" that it was
 * implementing — and the opposite of every P5 packet that consumes it, which
 * ask for "Tier B–D" evidence and "Tier A only in chromium default". Eight
 * declarations were written against the inverted reading and were migrated with
 * this change. If a `riskTier` predating that commit turns up anywhere, read it
 * as the mirror of this scale.
 */
export type RiskTier = 'A' | 'B' | 'C' | 'D'

// ---------------------------------------------------------------------------
// The declaration
// ---------------------------------------------------------------------------

/**
 * What a component promises about its styling surface.
 *
 * Every field is a promise a consumer may build on, so every field is checked
 * somewhere. Adding a part is additive; removing or renaming one is breaking.
 */
export interface ComponentAnatomy {
  /**
   * Addressable nodes, emitted as `data-part="<name>"`.
   *
   * `'none'` means the component renders no element of its own — a renderless
   * or pure-slot wrapper. It does NOT mean "has parts but nobody wrote them
   * down": a component with exactly one addressable node declares
   * `['root']`. Keeping those two cases distinct is the whole reason the field
   * is not simply optional.
   */
  readonly parts: readonly string[] | 'none'

  /**
   * Values this component's `data-state` may take, plus the presence-only
   * boolean attributes it may set (`disabled`, `loading`, `invalid`, …).
   *
   * Per-component rather than a shared enum: `DzButton` is
   * `idle`/`loading`/`disabled` and a disclosure is `open`/`closed`, and the
   * global union in {@link module:@dzup-ui/contracts/data-attributes} was
   * already violated by the button before it was widened (ADR-19 §4).
   */
  readonly states: readonly string[]

  /**
   * Custom properties this component reads and a consumer may set, most
   * specific first. These are the supported override points; every other
   * `--dz-*` it happens to inherit is not a promise.
   */
  readonly componentTokens: readonly `--dz-${string}`[]

  /** Recipe axes the component accepts and mirrors onto the root. */
  readonly recipes?: readonly RecipeAxis[]

  /** Evidence tier. */
  readonly riskTier: RiskTier

  /**
   * Provider-level defaults this component honours (P4). Named here so that the
   * provider work has a list to satisfy rather than a survey to run.
   */
  readonly globalDefaults?: readonly string[]

  /**
   * Parts that legitimately render zero or more than one time — a list item, a
   * node behind `v-if`. Every other declared part must appear exactly once, so
   * "sometimes absent" has to be said out loud.
   */
  readonly optionalParts?: readonly string[]

  /**
   * What this component does in a right-to-left document (TASK-OSS-P4-05).
   *
   * Declared rather than inferred because "does it mirror?" has three
   * defensible answers and only the component knows which applies. A dialog
   * mirrors its layout; a code block does not; a media scrubber must not, or
   * the play head runs backwards. Leaving it to whoever writes the CSS is how a
   * catalog ends up mirroring some things and not others for no stated reason.
   */
  readonly rtl?: ComponentRtl

  /**
   * What the keyboard does on this component (TASK-R5-O5).
   *
   * The **only** machine-readable keyboard contract in the repository. Before
   * it, the single generated keyboard signal was `capability-matrix.json`'s
   * `keyboard-spec` cell, which resolves a regex over the unit spec — it records
   * that* some key is asserted, never *which* key does *what* — so all 144
   * generated documentation pages said "Not yet derived" where an accessibility
   * buyer looks first.
   *
   * `'none'` is an explicit claim that the component has no keyboard behaviour
   * of its own, and it is a different fact from the field being absent. A
   * presentational component declares `'none'`; one that has simply not been
   * written down omits the field, and the docs ratchet counts it.
   *
   * @see {@link KeyboardBinding} for what one row promises.
   */
  readonly keyboard?: ComponentKeyboard

  /**
   * Where a consumer's `class`, `style` and stray attributes actually land
   * (TASK-R5-O6).
   *
   * Absent means the honest default and the overwhelmingly common case: the
   * component has exactly one root and `$attrs` reaches it. The field exists
   * for the two shapes where that sentence is false and a consumer has no way
   * to find out except by inspecting the DOM:
   *
   * - **A multi-root template.** Vue cannot choose a fallthrough target for a
   *   fragment, so the component picks one with `inheritAttrs: false` and an
   *   explicit `v-bind="$attrs"`. Which node it picked is a public fact — it is
   *   the node the consumer's `class` styles and the node their `id` addresses
   *   — and nothing published it before this field.
   * - **A single root whose `class` is re-pointed inward**, which six controls
   *   do (D24). `class` landing on `control` rather than the outermost node is
   *   defensible, but only if it is written down.
   *
   * @see {@link ComponentFallthrough}
   */
  readonly fallthrough?: ComponentFallthrough
}

/**
 * The attribute-fallthrough declaration (TASK-R5-O6).
 *
 * One field answers two questions that were separate owner decisions — D24
 * ("`class` does not reach the root on six components", which wanted a
 * `classTarget`) and D26 ("a pure wrapper must mark every part optional", which
 * wanted a `delegatesTo`). They are the same question asked from two ends —
 * **which node is this component's outward-facing surface?** A `classTarget`
 * says it is an inner part of mine; a `delegatesTo` says it is another
 * component's root. Two fields would have let a component answer one and not
 * the other, and left a reader with two places to look for one fact.
 */
export interface ComponentFallthrough {
  /**
   * The declared part that receives `$attrs` — `class`, `style`, `id`,
   * `data-*`, `aria-*` and anything else the consumer sets.
   *
   * Must be a name in this component's own {@link ComponentAnatomy.parts}, or
   * `'none'` for a renderless component that binds `$attrs` nowhere. `'root'`
   * is legal and meaningful on a multi-root component: it says the fragment has
   * a designated principal node and which one it is.
   */
  readonly target: string | 'none'

  /**
   * Why the target is what it is. Required whenever {@link target} is not
   * `'root'`, because that is the case a consumer will otherwise get wrong, and
   * rendered on the component's docs page.
   */
  readonly reason?: string

  /**
   * Set when this component renders **no element of its own** and its root is
   * another public component's root.
   *
   * This is D26's `delegatesTo`. It is the difference between "this part is
   * sometimes absent" and "someone else renders this part", which
   * `optionalParts` alone cannot express: a pure wrapper that marks all sixteen
   * of its parts optional is telling a docs reader that a combobox sometimes
   * has no input, which is false. Declaring the delegate says the true thing.
   */
  readonly delegatesTo?: string
}

// ---------------------------------------------------------------------------
// The keyboard contract (TASK-R5-O5)
// ---------------------------------------------------------------------------

/**
 * A component's keyboard contract: an explicit `'none'`, or the ordered rows of
 * its keyboard table.
 *
 * Deliberately a **flat list per component**, not a pattern name the renderer
 * expands from a shared dictionary. A dictionary lookup would publish the APG's
 * table rather than the component's, and the two differ constantly — `DzSelect`
 * implements most of `listbox` and not all of it, and a table that hides the
 * difference is exactly the hand-typed table this contract exists to replace.
 * Each row names the APG pattern it comes from in {@link KeyboardBinding.apg},
 * so provenance survives without inheritance.
 */
export type ComponentKeyboard = 'none' | readonly KeyboardBinding[]

/** A modifier a binding requires, spelled as `KeyboardEvent` spells it. */
export type KeyboardModifier = 'Shift' | 'Control' | 'Alt' | 'Meta'

/**
 * What one key does on one component.
 *
 * Every field is a promise something checks: `expectKeyboardContract`
 * (@dzup-ui/testing) asserts the rows against the rendered component, the
 * ownership generator copies them into the manifest, `generate:component-meta`
 * joins them, and the docs render them as the page's keyboard table. A row
 * nothing can check is a row that should not be written.
 */
export interface KeyboardBinding {
  /**
   * The key, spelled exactly as `KeyboardEvent.key` spells it — `'Enter'`,
   * `'ArrowDown'`, `'Escape'`, `'Home'`, `' '` for the space bar. Character
   * ranges that stand for a class of keys use an angle-bracket placeholder:
   * `'<character>'` for type-ahead, `'<digit>'` for numeric entry.
   */
  readonly key: string

  /** Modifiers held with {@link key}. Absent means "no modifier". */
  readonly modifiers?: readonly KeyboardModifier[]

  /**
   * Where the key applies — a declared `parts` name, a declared `states` value,
   * or a short phrase for a condition neither expresses (`'list open'`).
   * Absent means the binding applies wherever the component has focus.
   *
   * Named against the anatomy on purpose: a keyboard table whose context column
   * invents its own vocabulary cannot be cross-checked against the parts the
   * component actually emits.
   */
  readonly when?: string

  /** What the key does, imperative and specific. Rendered verbatim. */
  readonly action: string

  /**
   * WCAG 2.2 success criteria this binding is the mechanism for, as bare ids
   * (`'2.1.1'`). Joined to the published dictionary by the docs renderer, so a
   * criterion id that is not in it shows unresolved rather than silently.
   */
  readonly wcag?: readonly string[]

  /**
   * The WAI-ARIA APG pattern whose *Keyboard Interaction* section this row
   * implements, when one does. A row without it is a component-specific
   * affordance, which is a fact worth publishing rather than hiding.
   */
  readonly apg?: string

  /**
   * Whether the key's meaning follows the writing direction.
   *
   * - `mirrored` — ArrowLeft and ArrowRight exchange meaning in a RTL document.
   *   Only ever meaningful on a component whose {@link ComponentRtl.keyboard}
   *   is `swap-horizontal`, and `validate:rtl` is where that agreement is
   *   checked; declaring `mirrored` on a `keyboard: 'none'` component is a
   *   contradiction, not a detail.
   * - `fixed` — the key maps to a physical direction the user can see, so it
   *   does not swap. A volume scrubber, a media timeline.
   *
   * Absent on a non-directional key (`Enter`, `Escape`), where the question
   * does not arise.
   */
  readonly rtl?: 'mirrored' | 'fixed'
}

/**
 * A component's right-to-left contract.
 *
 * Three independent axes, because they fail independently: a component can
 * mirror its layout correctly and still move the selection the wrong way on
 * ArrowRight, and it can get both right and still show a chevron pointing away
 * from the panel it opens.
 */
export interface ComponentRtl {
  /**
   * Whether the component's box layout follows the writing direction.
   *
   * - `layout` — margins, padding, borders and insets are logical, so the
   *   component flips with the document. The default for anything that reads
   *   as text or as a list.
   * - `none` — the geometry is physical on purpose. Source code, a media
   *   timeline, a slider whose direction the author set explicitly. Declaring
   *   `none` is a claim that the physical properties are deliberate, which is
   *   why `validate:rtl` only accepts them here.
   */
  readonly mirrors: 'layout' | 'none'

  /**
   * Whether ArrowLeft and ArrowRight swap meaning.
   *
   * `swap-horizontal` for anything where the keys move along the inline axis —
   * tabs, a horizontal menu, a tree's expand/collapse. `none` where they map to
   * a physical direction the user can see, such as a volume scrubber.
   */
  readonly keyboard: 'swap-horizontal' | 'none'

  /**
   * Icons that carry direction and must be mirrored with the layout, named by
   * the part or slot that renders them.
   *
   * A chevron that points at the panel it opens is direction-bearing; a
   * magnifying glass is not. Enumerated rather than "mirror every icon",
   * because mirroring a logo or a checkmark is a defect a reviewer notices
   * and a rule cannot.
   */
  readonly icons?: readonly string[]
}

// ---------------------------------------------------------------------------
// Derived types for component authors
// ---------------------------------------------------------------------------

/**
 * The part union of a declared anatomy, for typing a `ui` override prop
 * (ADR-19 §5).
 *
 * @example
 * ```ts
 * type DzButtonPart = AnatomyPart<typeof anatomy>   // 'root' | 'spinner'
 * ```
 */
export type AnatomyPart<TAnatomy extends ComponentAnatomy>
  = TAnatomy['parts'] extends readonly string[] ? TAnatomy['parts'][number] : never

/**
 * A class value, declared structurally rather than imported from `clsx`.
 *
 * `@dzup-ui/contracts` has zero runtime dependencies and no reason to know
 * which styling library merges the classes it types. This is structurally
 * compatible with `clsx`'s `ClassValue`, so `cn()` accepts it unchanged.
 */
export type DzClassValue
  = | string
    | number
    | null
    | boolean
    | undefined
    | Record<string, boolean | null | undefined>
    | DzClassValue[]

/**
 * The per-instance override map: part name → classes (ADR-19 §5).
 *
 * `class` continues to apply to the root only; `ui` addresses parts by name,
 * and a typo is a type error rather than a class that silently lands nowhere.
 */
export type UiOverrides<TAnatomy extends ComponentAnatomy>
  = Partial<Record<AnatomyPart<TAnatomy>, DzClassValue>>
