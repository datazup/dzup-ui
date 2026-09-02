/**
 * The component-metadata artifact — types, schema version and serialization
 * (TASK-N2-A2).
 *
 * ONE extraction pipeline, many renderers. `vue-component-meta` reads the real
 * `.vue` / `.types.ts` sources through a real TypeScript program, so this
 * artifact inherits the repository's "generated truth" property: it cannot
 * drift from the code, only from itself, and `validate:component-meta` closes
 * that door.
 *
 * Every consumer surface — the docs site's prop tables (TASK-N2-D1), the
 * evidence pages (D2), `llms-full.txt` (A3), and the three MCP tools added by
 * this task — reads THIS file. None of them parses a `.vue` or a `.types.ts`
 * on its own. A second extractor is the failure mode this artifact exists to
 * prevent.
 *
 * @module @dzup-ui/tooling/meta/component-meta
 */

/**
 * Bumped when the shape below changes in a way a consumer can observe.
 *
 * `1.1.0` (TASK-N2-A3) — added the component-level `description` /
 * `descriptionSource` pair. Additive: every 1.0.0 field is unchanged, so a
 * 1.0.0 reader keeps working. The field exists because `llms.txt` needs a
 * one-line summary per component and B9 says a missing field is added HERE and
 * regenerated, never re-derived by the consumer that wants it.
 */
export const COMPONENT_META_SCHEMA_VERSION = '1.2.0'

/**
 * Where a description came from. Published per field because the two sources
 * have measurably different coverage and a docs renderer is entitled to know
 * which one it is showing.
 *
 * - `vue-component-meta` — the extractor's own `description`, read from the
 *   JSDoc on the declaring member.
 * - `emits-interface` — recovered from the `Dz{Name}Emits` interface member's
 *   JSDoc through the SAME TypeScript program the extractor owns. Needed
 *   because Vue's `ShortEmits` mapped type erases member JSDoc before
 *   `vue-component-meta` can see it; see the handoff, finding F-1. This is not
 *   a second extractor — it is the same `ts.Program`, the same
 *   `ts.TypeChecker`, and the same symbols.
 * - `none` — no prose exists in source for this member.
 */
export type DescriptionSource = 'vue-component-meta' | 'emits-interface' | 'none'

/**
 * Where a COMPONENT-level description came from (TASK-N2-A3).
 *
 * `vue-component-meta` has no component-level `description` field, so the one
 * line that says what a component *is* — the single most-read string in
 * `llms.txt`, and what `list_components` returns to an AI client — is read from
 * the component's own file header by `componentDescription()`. Both header
 * dialects in this repository are supported:
 *
 * - `sfc-header` — the lead line of the file's documentation header, in the
 *   `DzName — what it is` form, taken from either the leading `<!-- … -->` SFC
 *   comment (the `providers/` dialect) or the first `/** … *\/` block in
 *   `<script setup>` (every other family).
 * - `none` — no header prose exists in source.
 */
export type ComponentDescriptionSource = 'sfc-header' | 'none'

/** One prop, as declared. */
export interface PropMeta {
  name: string
  /** The resolved TypeScript type, printed by the extractor. */
  type: string
  required: boolean
  /**
   * The DECLARED default, verbatim from `withDefaults`/`defineModel`.
   *
   * `null` means no default is declared. The string `"undefined"` means a
   * default is declared and it is literally `undefined` — which is a real and
   * different fact: several families declare `variant: undefined` on purpose so
   * the ADR-20 provider supplies the effective value at runtime. A renderer
   * that collapses the two lies to the reader; see finding F-4.
   */
  default: string | null
  description: string
  descriptionSource: DescriptionSource
  /** `@deprecated` text when the member carries the tag. */
  deprecated?: string
  /** `@example` blocks, verbatim. */
  examples?: string[]
  /** Repo-relative file the prop is declared in, when the extractor resolved one inside the repo. */
  declaredIn?: string
}

/** One emitted event. */
export interface EventMetaRecord {
  name: string
  /** Payload tuple as printed by the extractor, e.g. `[event: MouseEvent]`. */
  type: string
  /** Full call signature as printed by the extractor. */
  signature: string
  description: string
  descriptionSource: DescriptionSource
  /**
   * True for `update:*` events. These are synthesized by `defineModel`
   * (ADR-16), so there is no authored member to carry prose — an empty
   * description here is a fact about the source, not a gap in extraction.
   */
  modelDerived: boolean
}

/** One slot. */
export interface SlotMetaRecord {
  name: string
  /** The slot-props type as printed by the extractor. */
  type: string
  description: string
  descriptionSource: DescriptionSource
  /**
   * True when the slot carries a non-trivial payload type. `any` and `{}` both
   * mean "no slot props" in the extractor's output and are reported as `false`.
   */
  hasPayload: boolean
}

/** One `defineExpose` member. */
export interface ExposedMetaRecord {
  name: string
  type: string
  description: string
  descriptionSource: DescriptionSource
}

/** The anatomy join (ADR-19). */
export interface AnatomyJoin {
  state: 'declared' | 'absent'
  parts: string[]
  source?: string
}

/** The capability-matrix join, summarised. Cells stay visible by state. */
export interface CapabilityJoin {
  tier: string
  pattern: string
  securityBoundary: string
  traits: string[]
  cells: Record<string, number>
  /** Kinds whose cell is `unrun`, by name — never collapsed into a count alone. */
  unrun: string[]
  /** Kinds whose cell is `stale`, by name. */
  stale: string[]
}

/** One story, as it exists in the stories file. */
export interface StoryRecord {
  /** The export name — Storybook's story id component. */
  id: string
  /** The `name:` override when the story declares one. */
  name?: string
  /** 1-based [start, end] line range of the export in the stories file. */
  lines: [number, number]
}

/**
 * One story published with its verbatim source and, when it has one, its static
 * template literal.
 */
export interface StoryExample {
  id: string
  name?: string
  lines: [number, number]
  /** Verbatim source of the story export, exactly as written. */
  source: string
  /**
   * The story's `template` string literal, verbatim, when it is a static
   * literal. Absent for stories whose template is computed — those still
   * carry `source`.
   */
  template?: string
}

/**
 * The examples join. `source` is a VERBATIM slice of the stories file — real
 * story source, never synthesized markup. When no story is usable the whole
 * `primary` field is absent, which is the honest answer.
 */
export interface StoriesJoin {
  /** Repo-relative stories file, when one exists. */
  file?: string
  /** The Storybook `title` the file declares. */
  titlePath?: string
  stories: StoryRecord[]
  primary?: StoryExample
  /**
   * TASK-N2-D3. The first story — in the same deterministic order `primary`
   * uses — whose `template` is a static literal that references **no** binding
   * the story file supplies from outside the template itself.
   *
   * `primary` is not usable as a runnable example and measuring it says why:
   * 119 of 144 public components' primary story is the Storybook
   * `render: args => ({ template: '<Dz… v-bind="args">' })` shape, and `args` is
   * a Storybook binding that does not exist in a plain Vue sandbox. Only **9**
   * primaries are runnable as written; **132** components have at least one
   * story that is (996 such stories catalogue-wide).
   *
   * This field exists so a playground can be seeded with **real story source**
   * rather than a hand-written example. It is the same parse, the same file and
   * the same verbatim slice as `primary` — a different *pick*, never a
   * different extraction (constraint **B9**). When no story qualifies the field
   * is absent, and the consumer must state the absence rather than invent one.
   */
  runnable?: StoryExample
}

/** Per-component extraction quality. Published so D1 knows its raw-material quality. */
export interface ExtractionQuality {
  props: number
  propsWithDescription: number
  propsWithDeclaredDefault: number
  events: number
  eventsWithDescription: number
  eventsModelDerived: number
  slots: number
  slotsWithDescription: number
  slotsWithPayload: number
  exposed: number
  exposedWithDescription: number
  /** `name: type` for every member whose printed type is unusable (see the generator). */
  unresolvedTypes: string[]
}

/** One component record. */
export interface ComponentMetaRecord {
  name: string
  kind: 'public-component' | 'compound-part'
  parentComponent?: string
  /**
   * One line saying what the component is, from its file header (TASK-N2-A3).
   * Empty string when source carries none — never fabricated, never inferred
   * from the name.
   */
  description: string
  descriptionSource: ComponentDescriptionSource
  family: string
  status?: string
  subpaths: string[]
  source: string
  typesSource?: string
  componentCommit: string
  /** `class` or `function` — a generic component is a function component. */
  componentType: 'class' | 'function' | 'unknown'
  tier?: string
  anatomy: AnatomyJoin
  capability?: CapabilityJoin
  props: PropMeta[]
  /**
   * How many props the extractor marked `global: true` — Vue's own
   * `key`/`ref`/`class`/`style`/… . They are counted, not listed: they are
   * identical for every component and would be 2,500 rows of noise.
   */
  globalPropCount: number
  events: EventMetaRecord[]
  slots: SlotMetaRecord[]
  exposed: ExposedMetaRecord[]
  stories: StoriesJoin
  extraction: ExtractionQuality
  /**
   * Present only when `vue-component-meta` could not process the component at
   * all. The record then carries no members; the `<stop_conditions>` branch.
   */
  extractionError?: string
}

/** Catalog-wide extraction quality — the numbers TASK-N2-D1 needs before it renders anything. */
export interface CatalogExtractionQuality {
  components: number
  publicComponents: number
  compoundParts: number
  unclassifiable: number
  props: number
  propsWithDescription: number
  propsWithDeclaredDefault: number
  propsWithLiteralUndefinedDefault: number
  events: number
  eventsWithDescription: number
  eventsFromExtractor: number
  eventsFromEmitsInterface: number
  eventsModelDerived: number
  slots: number
  slotsWithDescription: number
  slotsWithPayload: number
  exposed: number
  exposedWithDescription: number
  unresolvedTypes: number
  componentsWithStories: number
  componentsWithPrimaryExample: number
  componentsWithStaticTemplate: number
}

/** Which inputs the generator found, by name. An absent input is reported, never silently skipped. */
export interface MetaInput {
  path: string
  available: boolean
}

/** The whole artifact. */
export interface ComponentMetaArtifact {
  schemaVersion: string
  sourceCommit: string
  /** `vue-component-meta@<version>` — the extractor and its exact version. */
  extractor: string
  generatedFrom: string[]
  inputs: Record<string, MetaInput>
  /**
   * The ADR-02 frozen taxonomies — every exported string-literal-union type
   * alias in `@dzup-ui/contracts`, as `name → members` (TASK-N2-A3, schema
   * 1.1.0). A prop's `type` prints the alias NAME (`ButtonVariant | undefined`),
   * so this is the only generated place a renderer can read the members from.
   */
  taxonomies: Record<string, string[]>
  totals: CatalogExtractionQuality
  components: ComponentMetaRecord[]
}

/**
 * The single serializer. The validator compares bytes against this, so the
 * generator and the gate cannot disagree about formatting.
 */
export function serializeComponentMeta(artifact: ComponentMetaArtifact): string {
  return `${JSON.stringify(artifact, null, 2)}\n`
}

/**
 * Replace the provenance stamp before a freshness comparison.
 *
 * `sourceCommit` records which checkout produced the file. Gating on it would
 * fail this validator on every unrelated commit while proving nothing about the
 * metadata — the reason the ownership and capability validators strip it too,
 * and the reason constraint **B1**'s off-by-one stamping cannot bite here:
 * the field is provenance, and nothing gates on it.
 */
export function stripProvenance(json: string): string {
  return json.replace(/"sourceCommit": "[^"]*"/, '"sourceCommit": "-"')
}
