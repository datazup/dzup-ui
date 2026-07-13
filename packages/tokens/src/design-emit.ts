/**
 * DESIGN.md Emitter
 *
 * Pure functions that project `@dzup-ui/tokens` into a portable, single-file
 * `DESIGN.md` (Google design.md format: YAML front matter + Markdown body).
 *
 * This module performs NO file I/O and reads NO globals — every value comes in
 * through {@link DesignMdInput}. `generate.ts` owns reading the narrative and
 * writing the file; keeping the transform pure is what makes it unit-testable
 * (the fs-bound `generate.ts` is excluded from coverage).
 *
 * Design intent (see .claude/docs/DESIGN-md-implementation-plan.md §3):
 *   - Tokens are the source of truth; every *value* here is auto-derived.
 *   - Human voice survives regeneration: prose lives in `design-narrative.md`
 *     and is spliced in via `<!-- dz:section -->` placeholders.
 *   - High-level only — full component APIs are deferred to `@dzup-ui/mcp`.
 */

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------

/** A scale map keyed by step name (e.g. FONT_SIZES, SPACING_SCALE). */
export type ScaleMap = Record<string, string>

/**
 * Filesystem-derived catalog sizes. Counted at generate time by `design-md.ts`
 * so no published number can drift from what is actually on disk.
 */
export interface CatalogCounts {
  /** `.vue` files under `packages/core/src/components`. */
  readonly components: number
  /** Components with a dedicated Storybook page (one `Dz*.stories.ts`). */
  readonly documented: number
  /** `.vue` files under `apps/landing/src/blocks`. */
  readonly blocks: number
  /** `.vue` files under `apps/landing/src/templates`. */
  readonly templates: number
}

/**
 * Two counts, two stated rules — never a bare number.
 *
 * `components` is the **catalog size**: every exported `.vue`, including the
 * compound sub-parts of a Reka-backed family (`DzCardBody`, `DzDialogTitle`).
 * Sub-parts are real, importable, independently-typed components, and there is
 * no mechanical way to tell `DzCardBody` (a sub-part) from `DzButtonGroup` (a
 * standalone component) by name alone — so the catalog counts them and says so.
 *
 * `documented` is the **browsable** count: components with a page of their own.
 * It is what a human evaluating the library actually cares about, and it is the
 * figure the landing page shows.
 *
 * Both are glob-derived. Whichever appears, its rule appears beside it.
 */
export const COMPONENT_COUNT_RULE
  = 'every exported `.vue` component, including compound sub-parts such as `DzCardBody`'

/** The rule behind {@link CatalogCounts.documented}. */
export const DOCUMENTED_COUNT_RULE
  = 'components with a dedicated Storybook page (compound sub-parts are documented through their parent)'

/** Everything the emitter needs, supplied by `generate.ts` from token maps. */
export interface DesignMdInput {
  /** Short library name, e.g. `dzup-ui`. */
  readonly name: string
  /** npm scope, e.g. `@dzup-ui`. */
  readonly packageScope: string
  /** One-line description for the front matter. */
  readonly description: string
  /**
   * The Markdown body with prose and `<!-- dz:section -->` placeholders.
   * Read from `design-narrative.md` by the caller.
   */
  readonly narrative: string

  /** `--dz-colors-*` → `oklch(...)` (primitive palette, fully resolved). */
  readonly primitiveColors: Record<string, string>
  /** Light-theme semantic role map (`--dz-*` → value). */
  readonly lightSemantic: Record<string, string>
  /** Dark-theme semantic role map (`--dz-*` → value). */
  readonly darkSemantic: Record<string, string>

  readonly fontFamilies: ScaleMap
  readonly fontSizes: ScaleMap
  readonly fontWeights: ScaleMap
  readonly lineHeights: ScaleMap
  readonly letterSpacings: ScaleMap

  readonly spacing: ScaleMap
  readonly radius: ScaleMap
  readonly shadows: ScaleMap
  readonly shadowsDark: ScaleMap

  /** `--dz-duration-*` step → value (e.g. `fast` → `150ms`). */
  readonly durations: ScaleMap
  /** `--dz-ease-*` step → cubic-bezier curve. */
  readonly easings: ScaleMap
  /** `--dz-transition-*` shorthand → composed `duration easing` value. */
  readonly transitions: ScaleMap
  /** `--dz-z-*` layer → stacking value (e.g. `modal` → `1050`). */
  readonly zIndex: ScaleMap
  /** `--dz-breakpoint-*` step → min-width (e.g. `md` → `768px`). */
  readonly breakpoints: ScaleMap

  /**
   * Component token families keyed by family name (`button`, `sidebar`, …).
   * Used only for token counts — the presentation metadata is curated in
   * {@link CURATED_COMPONENT_FAMILIES}.
   */
  readonly componentTokens: Record<string, Record<string, string>>

  /** Glob-derived catalog sizes. Never hand-maintained. */
  readonly catalog: CatalogCounts
}

// --------------------------------------------------------------------------
// Curated presentation metadata
//
// "How to present" lives here (stable, taxonomy-driven); "the data" is passed
// in through DesignMdInput. Variant taxonomies are frozen by ADR-02.
// --------------------------------------------------------------------------

/** Semantic color roles surfaced in the Colors table, in display order. */
export const CURATED_COLOR_ROLES: ReadonlyArray<{ role: string, usage: string }> = [
  { role: 'background', usage: 'Page backdrop' },
  { role: 'foreground', usage: 'Default body text' },
  { role: 'surface', usage: 'Resting cards / panels' },
  { role: 'muted', usage: 'Subtle fills (chips, wells)' },
  { role: 'muted-foreground', usage: 'Secondary / helper text' },
  { role: 'border', usage: 'Component & container borders' },
  { role: 'ring', usage: 'Focus ring' },
  { role: 'primary', usage: 'Primary actions & brand' },
  { role: 'primary-foreground', usage: 'Text on primary fill' },
  { role: 'secondary', usage: 'Secondary actions' },
  { role: 'accent', usage: 'Hover / selected surfaces' },
  { role: 'destructive', usage: 'Destructive actions' },
  { role: 'success', usage: 'Success status' },
  { role: 'warning', usage: 'Warning status' },
  { role: 'danger', usage: 'Error / danger status' },
  { role: 'info', usage: 'Informational status' },
  { role: 'card', usage: 'Card surface' },
  { role: 'popover', usage: 'Floating layers (menus, popovers)' },
  { role: 'input-bg', usage: 'Form control background' },
]

/** Curated component-family presentation, in canonical (alphabetical) order. */
export const CURATED_COMPONENT_FAMILIES: ReadonlyArray<{
  family: string
  components: string
  taxonomy: string
}> = [
  { family: 'appshell', components: 'DzAppShell', taxonomy: 'Header · sidebar slot · main region' },
  { family: 'badge', components: 'DzBadge', taxonomy: 'Variants: solid · outline · subtle — sizes sm–lg' },
  { family: 'button', components: 'DzButton', taxonomy: 'Variants: solid · outline · ghost · text · link — sizes xs–xl' },
  { family: 'card', components: 'DzCard', taxonomy: 'Variants: elevated · outlined · flat' },
  { family: 'codeblock', components: 'DzCodeBlock', taxonomy: 'Mono display with header + line numbers' },
  { family: 'control', components: 'DzCheckbox · DzRadio · DzSwitch', taxonomy: 'Shared focus-ring + disabled tokens for selection controls' },
  { family: 'dialog', components: 'DzDialog / DzModal', taxonomy: 'Sizes sm · md · lg · xl · full' },
  { family: 'input', components: 'DzInput · DzTextarea · DzSelect', taxonomy: 'Variants: outline · filled · underlined — sizes xs–xl' },
  { family: 'sidebar', components: 'DzSidebar', taxonomy: 'Collapsible nav: items · sections · header · footer' },
]

/**
 * One usage rule per easing curve. Keyed by the `--dz-ease-*` step.
 *
 * A curve without a rule is a curve an AI consumer will misuse, so
 * {@link buildMotion} throws on an unmapped step rather than emitting a blank
 * cell — adding an easing to `primitives/transitions.ts` must force a decision
 * about what it is *for*.
 */
export const CURATED_EASING_USAGE: Readonly<Record<string, string>> = {
  'default': 'General purpose. Symmetric, so it reads correctly in both directions.',
  'in': 'Exit. An element leaving accelerates away.',
  'out': 'Enter. An element arriving decelerates into place.',
  'in-out': 'Two-way transitions that both enter and leave. Same curve as `default`.',
  'bounce': 'Overshoot, for playful emphasis. Never for routine state changes.',
}

/**
 * What belongs on each `--dz-z-*` layer, lowest → highest. This is the stacking
 * **contract**, not a survey of current usage: it tells a consumer where to put
 * a new surface instead of inventing `z-index: 9999`.
 *
 * {@link buildLayers} throws on an unmapped layer, so a new step in
 * `primitives/z-index.ts` cannot ship undocumented.
 */
export const CURATED_LAYER_USAGE: Readonly<Record<string, string>> = {
  'base': 'Ordinary in-flow content. The default stacking context.',
  'dropdown': 'Menus and listboxes anchored to a trigger — `DzSelect`, `DzMegaMenu`.',
  'sticky': 'Headers and toolbars pinned while their container scrolls — `DzTable`.',
  'fixed': 'Viewport-pinned chrome — `DzAppShell` header and sidebar.',
  'modal-backdrop': 'The scrim dimming everything behind a modal — `DzBlockUI`, `DzTour`.',
  'modal': 'Modal surfaces that trap focus — `DzDialog`, `DzSheet`.',
  'popover': 'Non-modal floating surfaces anchored to a trigger — `DzPopover`, `DzPopconfirm`.',
  'tooltip': 'Transient hover / focus labels — `DzTooltip`. Above popovers, below toasts.',
  'toast': 'Global notifications — `DzToast`. The top of the stack.',
}

/** Placeholder tokens the narrative must contain, mapped to their builders. */
export const PLACEHOLDERS = {
  overview: '<!-- dz:overview -->',
  colors: '<!-- dz:colors -->',
  typography: '<!-- dz:typography -->',
  spacing: '<!-- dz:spacing -->',
  elevation: '<!-- dz:elevation -->',
  shapes: '<!-- dz:shapes -->',
  motion: '<!-- dz:motion -->',
  layers: '<!-- dz:layers -->',
  breakpoints: '<!-- dz:breakpoints -->',
  catalog: '<!-- dz:catalog -->',
  components: '<!-- dz:components -->',
} as const

// --------------------------------------------------------------------------
// Color resolution
// --------------------------------------------------------------------------

/** Context for resolving a `var(--dz-*)` chain down to a concrete color. */
export interface ColorResolutionContext {
  /** `--dz-colors-*` → concrete `oklch(...)` string. */
  readonly primitives: Record<string, string>
  /** Semantic role map for the theme being resolved. */
  readonly semantic: Record<string, string>
}

/**
 * Resolve a token value to a concrete, portable color string.
 *
 * Follows `var(--dz-*)` references through the primitive palette and the
 * semantic map (recursively) so the emitted DESIGN.md is self-contained — the
 * whole point of the portable channel. Literals (`oklch(...)`) pass through.
 * Unresolvable references are returned verbatim rather than throwing.
 */
export function resolveColor(
  value: string,
  ctx: ColorResolutionContext,
  seen: Set<string> = new Set(),
): string {
  const trimmed = value.trim()
  const varMatch = trimmed.match(/^var\(\s*(--[a-z0-9-]+)\s*\)$/i)
  if (!varMatch) {
    return trimmed
  }
  const ref = varMatch[1] ?? ''
  if (seen.has(ref)) {
    return trimmed // cycle guard
  }
  seen.add(ref)

  if (ref in ctx.primitives) {
    return ctx.primitives[ref] ?? trimmed
  }
  if (ref in ctx.semantic) {
    return resolveColor(ctx.semantic[ref] ?? trimmed, ctx, seen)
  }
  return trimmed
}

// --------------------------------------------------------------------------
// Markdown table builders (each returns the block that replaces a placeholder)
// --------------------------------------------------------------------------

function mdTable(headers: string[], rows: string[][]): string {
  const head = `| ${headers.join(' | ')} |`
  const sep = `| ${headers.map(() => '---').join(' | ')} |`
  const body = rows.map(r => `| ${r.join(' | ')} |`).join('\n')
  return `${head}\n${sep}\n${body}`
}

/** Overview stat line — counts derived from the live maps. */
export function buildOverview(input: DesignMdInput): string {
  const paletteNames = new Set<string>()
  for (const key of Object.keys(input.primitiveColors)) {
    const m = key.match(/^--dz-colors-([a-z]+)-\d+$/i)
    if (m?.[1]) {
      paletteNames.add(m[1])
    }
  }
  const componentTokenCount = Object.values(input.componentTokens).reduce(
    (sum, map) => sum + Object.keys(map).length,
    0,
  )
  return [
    `- **Components:** ${input.catalog.components} across 11 families — counted as ${COMPONENT_COUNT_RULE}`,
    `- **Documented:** ${input.catalog.documented} — ${DOCUMENTED_COUNT_RULE}`,
    `- **Blocks:** ${input.catalog.blocks} · **templates:** ${input.catalog.templates}`,
    `- **Color palettes:** ${paletteNames.size} (OKLCH), 11 shades each`,
    `- **Semantic roles:** ${Object.keys(input.lightSemantic).length} (light + dark)`,
    `- **Type scale:** ${Object.keys(input.fontSizes).length} sizes · **spacing:** ${Object.keys(input.spacing).length} steps · **radius:** ${Object.keys(input.radius).length} · **elevation:** ${Object.keys(input.shadows).length}`,
    `- **Motion:** ${Object.keys(input.durations).length} durations · ${Object.keys(input.easings).length} easing curves · **layers:** ${Object.keys(input.zIndex).length} · **breakpoints:** ${Object.keys(input.breakpoints).length}`,
    `- **Component token families:** ${CURATED_COMPONENT_FAMILIES.length} (${componentTokenCount} tokens)`,
  ].join('\n')
}

/** Colors table: each semantic role resolved to light + dark OKLCH. */
export function buildColors(input: DesignMdInput): string {
  const lightCtx: ColorResolutionContext = {
    primitives: input.primitiveColors,
    semantic: input.lightSemantic,
  }
  const darkCtx: ColorResolutionContext = {
    primitives: input.primitiveColors,
    semantic: input.darkSemantic,
  }
  const rows: string[][] = []
  for (const { role, usage } of CURATED_COLOR_ROLES) {
    const varName = `--dz-${role}`
    const lightRaw = input.lightSemantic[varName]
    if (lightRaw === undefined) {
      continue // role not present — skip rather than emit a broken row
    }
    const darkRaw = input.darkSemantic[varName] ?? lightRaw
    const light = resolveColor(lightRaw, lightCtx)
    const dark = resolveColor(darkRaw, darkCtx)
    rows.push([`\`${varName}\``, `\`${light}\``, `\`${dark}\``, usage])
  }
  return mdTable(['Role', 'Light', 'Dark', 'Usage'], rows)
}

/** Typography: font families, sizes, weights, leading, tracking. */
export function buildTypography(input: DesignMdInput): string {
  const families = mdTable(
    ['Token', 'Stack'],
    Object.entries(input.fontFamilies).map(([k, v]) => [`\`--dz-font-${k}\``, `\`${v}\``]),
  )
  const sizes = mdTable(
    ['Token', 'Size'],
    Object.entries(input.fontSizes).map(([k, v]) => [`\`--dz-text-${k}\``, v]),
  )
  const weights = Object.entries(input.fontWeights)
    .map(([k, v]) => `\`${k}\` ${v}`)
    .join(' · ')
  const leading = Object.entries(input.lineHeights)
    .map(([k, v]) => `\`${k}\` ${v}`)
    .join(' · ')
  const tracking = Object.entries(input.letterSpacings)
    .map(([k, v]) => `\`${k}\` ${v}`)
    .join(' · ')
  return [
    '**Font families**',
    '',
    families,
    '',
    '**Font sizes** (`--dz-text-*`)',
    '',
    sizes,
    '',
    `**Weights** (\`--dz-font-*\`): ${weights}`,
    '',
    `**Line height** (\`--dz-leading-*\`): ${leading}`,
    '',
    `**Tracking** (\`--dz-tracking-*\`): ${tracking}`,
  ].join('\n')
}

/** Spacing: the 4px base scale (compact inline list — 30+ steps). */
export function buildSpacing(input: DesignMdInput): string {
  // Sort numerically — object key order puts integer-like keys before
  // fractional ones (0.5, 1.5, …), which reads as out-of-order.
  const items = Object.entries(input.spacing)
    .sort(([a], [b]) => Number.parseFloat(a) - Number.parseFloat(b))
    .map(([k, v]) => `\`${k}\` → ${v}`)
    .join(' · ')
  return `4px base unit (\`0.25rem\`). Steps (\`--dz-spacing-*\`):\n\n${items}`
}

/** Elevation: shadow ramp with light + dark values. */
export function buildElevation(input: DesignMdInput): string {
  const rows = Object.keys(input.shadows).map((k) => {
    const light = input.shadows[k] ?? ''
    const dark = input.shadowsDark[k] ?? light
    return [`\`--dz-shadow-${k}\``, `\`${light}\``, `\`${dark}\``]
  })
  return mdTable(['Token', 'Light', 'Dark'], rows)
}

/** Shapes: border-radius ramp. */
export function buildShapes(input: DesignMdInput): string {
  const rows = Object.entries(input.radius).map(([k, v]) => [`\`--dz-radius-${k}\``, v])
  return mdTable(['Token', 'Radius'], rows)
}

/**
 * The Depth-channel catalog sentence fragment. Counts are glob-derived, so this
 * sentence cannot drift from the filesystem the way a typed literal does.
 */
export function buildCatalog(input: DesignMdInput): string {
  const { components, documented, blocks, templates } = input.catalog
  return (
    `${components} components (${documented} with a dedicated docs page), `
    + `${blocks} blocks, ${templates} full-page templates`
  )
}

/**
 * Motion: durations, easing curves with their usage rule, and the composed
 * shorthands. Throws if an easing has no entry in {@link CURATED_EASING_USAGE}.
 */
export function buildMotion(input: DesignMdInput): string {
  const durations = mdTable(
    ['Token', 'Duration'],
    Object.entries(input.durations).map(([k, v]) => [`\`--dz-duration-${k}\``, v]),
  )

  const easings = mdTable(
    ['Token', 'Curve', 'Use for'],
    Object.entries(input.easings).map(([k, v]) => {
      const usage = CURATED_EASING_USAGE[k]
      if (usage === undefined) {
        throw new Error(
          `design-emit: no usage rule for easing \`${k}\`. Add one to CURATED_EASING_USAGE.`,
        )
      }
      return [`\`--dz-ease-${k}\``, `\`${v}\``, usage]
    }),
  )

  const shorthands = Object.entries(input.transitions)
    .map(([k, v]) => `\`--dz-transition-${k}\` → \`${v}\``)
    .join(' · ')

  const values = Object.values(input.durations)
    .map(v => Number.parseInt(v, 10))
    .filter(n => Number.isFinite(n))
  const min = Math.min(...values)
  const max = Math.max(...values)

  return [
    `Durations span **${min}–${max} ms**. Reach for \`fast\`/\`normal\` for the`,
    'transitions users see most; `slower` is for large surface changes.',
    '',
    durations,
    '',
    '**Easing** — pick by direction, not by taste.',
    '',
    easings,
    '',
    `**Shorthands**: ${shorthands}`,
    '',
    'A global `@media (prefers-reduced-motion: reduce)` rule in `tokens.css`',
    'collapses every animation and transition to ~0 ms. Honor it; never re-enable',
    'motion behind it.',
  ].join('\n')
}

/**
 * Layering: the `--dz-z-*` scale, lowest → highest, with what occupies each
 * layer. Throws if a layer has no entry in {@link CURATED_LAYER_USAGE}.
 */
export function buildLayers(input: DesignMdInput): string {
  const rows = Object.entries(input.zIndex)
    .sort(([, a], [, b]) => Number.parseInt(a, 10) - Number.parseInt(b, 10))
    .map(([step, value]) => {
      const usage = CURATED_LAYER_USAGE[step]
      if (usage === undefined) {
        throw new Error(
          `design-emit: no usage entry for layer \`${step}\`. Add one to CURATED_LAYER_USAGE.`,
        )
      }
      return [`\`--dz-z-${step}\``, value, usage]
    })
  return mdTable(['Token', 'Value', 'What belongs here'], rows)
}

/** Breakpoints: the min-width scale plus the mobile-first authoring rule. */
export function buildBreakpoints(input: DesignMdInput): string {
  const rows = Object.entries(input.breakpoints)
    .sort(([, a], [, b]) => Number.parseInt(a, 10) - Number.parseInt(b, 10))
    .map(([step, value]) => [`\`--dz-breakpoint-${step}\``, `\`${value}\``, `≥ ${value}`])
  const table = mdTable(['Token', 'Min-width', 'Applies'], rows)
  const steps = Object.keys(input.breakpoints)
  const smallest = steps[0] ?? 'sm'
  return [
    table,
    '',
    `**Mobile-first.** Author the base case with no prefix, then layer`,
    `\`${smallest}:\` and up. Every breakpoint is a \`min-width\` — there are no`,
    'max-width variants, so styles only ever add as the viewport grows.',
  ].join('\n')
}

/** Components: the 9 token families, high-level. Full APIs deferred to MCP. */
export function buildComponents(input: DesignMdInput): string {
  const rows = CURATED_COMPONENT_FAMILIES.map(({ family, components, taxonomy }) => {
    const tokenCount = Object.keys(input.componentTokens[family] ?? {}).length
    return [components, `\`--dz-${family}-*\``, String(tokenCount), taxonomy]
  })
  return mdTable(['Component(s)', 'Token prefix', 'Tokens', 'Notes'], rows)
}

// --------------------------------------------------------------------------
// Front matter (YAML)
// --------------------------------------------------------------------------

/** Serialize a string as a safely-quoted double-quoted YAML scalar. */
function yamlScalar(value: string): string {
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
}

function buildFrontMatter(input: DesignMdInput): string {
  const lightCtx: ColorResolutionContext = {
    primitives: input.primitiveColors,
    semantic: input.lightSemantic,
  }
  const darkCtx: ColorResolutionContext = {
    primitives: input.primitiveColors,
    semantic: input.darkSemantic,
  }

  const lines: string[] = ['---']
  lines.push(`name: ${input.name}`)
  lines.push(`package: ${yamlScalar(input.packageScope)}`)
  lines.push(`description: ${yamlScalar(input.description)}`)
  lines.push(`token_contract: ${yamlScalar('--dz-*')}`)
  lines.push('generated_by: "@dzup-ui/tokens generate"')
  lines.push('themes: [light, dark]')

  // Colors (resolved, portable)
  lines.push('colors:')
  for (const theme of ['light', 'dark'] as const) {
    const ctx = theme === 'light' ? lightCtx : darkCtx
    const map = theme === 'light' ? input.lightSemantic : input.darkSemantic
    lines.push(`  ${theme}:`)
    for (const { role } of CURATED_COLOR_ROLES) {
      const varName = `--dz-${role}`
      const raw = map[varName] ?? input.lightSemantic[varName]
      if (raw === undefined) {
        continue
      }
      lines.push(`    ${role}: ${yamlScalar(resolveColor(raw, ctx))}`)
    }
  }

  // Typography
  lines.push('typography:')
  lines.push('  fonts:')
  for (const [k, v] of Object.entries(input.fontFamilies)) {
    lines.push(`    ${k}: ${yamlScalar(v)}`)
  }
  lines.push('  sizes:')
  for (const [k, v] of Object.entries(input.fontSizes)) {
    lines.push(`    ${yamlScalar(k)}: ${yamlScalar(v)}`)
  }

  // Radius
  lines.push('radius:')
  for (const [k, v] of Object.entries(input.radius)) {
    lines.push(`  ${yamlScalar(k)}: ${yamlScalar(v)}`)
  }

  // Motion — durations + easing curves, so a machine consumer gets the motion
  // policy without parsing the Markdown table.
  lines.push('motion:')
  lines.push('  durations:')
  for (const [k, v] of Object.entries(input.durations)) {
    lines.push(`    ${yamlScalar(k)}: ${yamlScalar(v)}`)
  }
  lines.push('  easings:')
  for (const [k, v] of Object.entries(input.easings)) {
    lines.push(`    ${yamlScalar(k)}: ${yamlScalar(v)}`)
  }

  // Layers — emitted lowest → highest so the order carries meaning.
  lines.push('layers:')
  for (const [k, v] of Object.entries(input.zIndex).sort(
    ([, a], [, b]) => Number.parseInt(a, 10) - Number.parseInt(b, 10),
  )) {
    lines.push(`  ${yamlScalar(k)}: ${v}`)
  }

  // Breakpoints — min-widths, ascending.
  lines.push('breakpoints:')
  for (const [k, v] of Object.entries(input.breakpoints).sort(
    ([, a], [, b]) => Number.parseInt(a, 10) - Number.parseInt(b, 10),
  )) {
    lines.push(`  ${yamlScalar(k)}: ${yamlScalar(v)}`)
  }

  lines.push('spacing_base: 4px')
  lines.push('---')
  return lines.join('\n')
}

// --------------------------------------------------------------------------
// Assembly
// --------------------------------------------------------------------------

const DO_NOT_EDIT_BANNER = [
  '<!--',
  '  DO NOT EDIT MANUALLY.',
  '  Generated by: yarn workspace @dzup-ui/tokens generate',
  '  Source: packages/tokens/src/ (values) + packages/tokens/src/design-narrative.md (prose)',
  '  Edit the narrative or tokens, then regenerate. Hand edits are overwritten.',
  '-->',
].join('\n')

/**
 * Build the complete `DESIGN.md` string: front matter + banner + narrative
 * with every `<!-- dz:section -->` placeholder replaced by a generated block.
 *
 * @throws if the narrative is missing any known placeholder — this fails the
 *   build loudly rather than silently shipping an incomplete DESIGN.md.
 */
export function emitDesignMd(input: DesignMdInput): string {
  const builders: Record<keyof typeof PLACEHOLDERS, (i: DesignMdInput) => string> = {
    overview: buildOverview,
    colors: buildColors,
    typography: buildTypography,
    spacing: buildSpacing,
    elevation: buildElevation,
    shapes: buildShapes,
    motion: buildMotion,
    layers: buildLayers,
    breakpoints: buildBreakpoints,
    catalog: buildCatalog,
    components: buildComponents,
  }

  let body = input.narrative
  for (const key of Object.keys(PLACEHOLDERS) as (keyof typeof PLACEHOLDERS)[]) {
    const placeholder = PLACEHOLDERS[key]
    if (!body.includes(placeholder)) {
      throw new Error(`design-narrative.md is missing the ${placeholder} placeholder`)
    }
    body = body.replace(placeholder, builders[key](input))
  }

  const frontMatter = buildFrontMatter(input)
  return `${frontMatter}\n\n${DO_NOT_EDIT_BANNER}\n\n${body.trimStart()}\n`
}
