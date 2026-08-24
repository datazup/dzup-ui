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
] as const

/** A part name drawn from the shared vocabulary. */
export type VocabularyPart = typeof ANATOMY_PART_VOCABULARY[number]

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
