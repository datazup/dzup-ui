/**
 * story-color-tokens transform (TASK-DS-05)
 *
 * Rewrites raw Tailwind color literals and untokenized border utilities in
 * `packages/core/stories/**` into `var(--dz-*)` token references, per ADR-04.
 *
 * Stories are the surface where consumers *learn* the system, so a story that
 * reaches for `text-gray-500` teaches the exact habit ADR-04 exists to prevent.
 * Raw grays are also the dominant source of axe `color-contrast` failures, which
 * is what keeps families from opting into a11y enforcement (TASK-DS-06).
 *
 * ## Two kinds of replacement
 *
 * A raw literal plays one of two roles, and they map to different token tiers:
 *
 * 1. **Semantic role** — secondary text, a subtle surface, a status chip, a
 *    border. These must be *theme-aware* (`--dz-muted-foreground`,
 *    `--dz-success-muted`, …) so they invert correctly in dark mode and are
 *    covered by the contrast gate.
 * 2. **Decorative role** — a gradient image placeholder, a colored swatch, a
 *    deliberately dark demo panel. These must be *theme-invariant*, so they map
 *    to the primitive ramp (`--dz-colors-purple-400`) rather than to a semantic
 *    token whose value flips between themes.
 *
 * ## Palette → intent mapping is derived, not eyeballed
 *
 * The intent assignments below were chosen by measuring OKLCH hue distance
 * between each decorative ramp's 500 shade and each intent's 500 shade in
 * `packages/tokens/dist/tokens.css`:
 *
 * | Decorative | Intent    | Δhue |
 * |------------|-----------|------|
 * | `blue`     | primary   |  2°  |
 * | `red`      | danger    |  2°  |
 * | `violet`   | secondary |  2°  |
 * | `green`    | success   |  5°  |
 * | `sky`      | info      |  5°  |
 * | `yellow`   | warning   |  8°  |
 *
 * `amber` (Δ17° from warning) and `rose` (Δ13° from danger) are mapped by
 * **role** rather than hue: every occurrence in the story corpus is a warning
 * or danger callout respectively. Every other palette — `purple` (Δ20° from
 * secondary), `teal`, `cyan`, `emerald`, `orange`, `pink`, … — has no intent
 * within 10° and stays decorative.
 *
 * ## Unclassified literals fail loudly
 *
 * Where a literal's role cannot be determined from its own class list — an
 * opacity-modified color, a `dark:` variant that a theme-aware token would make
 * redundant, `text-white` over a surface this transform cannot see — the
 * transform leaves the source untouched and reports it. It never guesses.
 * {@link transformStoryColors} returns those in `unclassified`; the CLI exits
 * non-zero on any.
 *
 * This transform is idempotent.
 *
 * @module
 */

import type { API, FileInfo, Options } from 'jscodeshift'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A literal the transform declined to rewrite, and why. */
export interface UnclassifiedLiteral {
  /** The literal exactly as it appears in source, e.g. `bg-white/90`. */
  utility: string
  /** Why the transform could not classify it. */
  reason: string
  /** 1-indexed line in the file, when known. */
  line?: number
  /** The surrounding class list, trimmed for display. */
  context?: string
}

/** Result of rewriting one file. */
export interface TransformStoryColorsResult {
  /** The rewritten source. Identical to the input when nothing changed. */
  code: string
  /** Literals that were deliberately left alone. */
  unclassified: UnclassifiedLiteral[]
  /** Number of literals rewritten. */
  replaced: number
}

// ---------------------------------------------------------------------------
// Palette taxonomy
// ---------------------------------------------------------------------------

/** Tailwind palettes that carry a semantic intent in this design system. */
const INTENT_BY_PALETTE: Readonly<Record<string, string>> = {
  blue: 'primary',
  violet: 'secondary',
  green: 'success',
  emerald: 'success',
  yellow: 'warning',
  amber: 'warning',
  red: 'danger',
  rose: 'danger',
  sky: 'info',
}

/** Tailwind palettes that read as the neutral/gray family. */
const NEUTRAL_PALETTES = new Set(['gray', 'slate', 'zinc', 'neutral', 'stone'])

/** Every palette this transform recognizes. */
const ALL_PALETTES = [
  'gray',
  'slate',
  'zinc',
  'neutral',
  'stone',
  'red',
  'orange',
  'amber',
  'yellow',
  'lime',
  'green',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'blue',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'rose',
]

/** Utility prefixes that take a color value. */
const COLOR_PREFIXES = [
  'text',
  'bg',
  'border',
  'ring',
  'from',
  'to',
  'via',
  'divide',
  'placeholder',
  'outline',
  'decoration',
  'accent',
  'caret',
  'fill',
  'stroke',
]

/** Shades a decorative ramp exposes, mirroring `primitives/colors.ts`. */
const PRIMITIVE_SHADES = new Set(['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'])

/** `bg-gray-700`+ reads as a deliberately dark demo panel, not a light surface. */
const DARK_SURFACE_SHADES = new Set(['700', '800', '900', '950'])

// ---------------------------------------------------------------------------
// Matchers
// ---------------------------------------------------------------------------

const PALETTE_ALT = ALL_PALETTES.join('|')
const PREFIX_ALT = COLOR_PREFIXES.join('|')

/**
 * One color utility: optional variants (`hover:`, `dark:`, `md:`), a prefix,
 * a palette + shade (or `white`/`black`), and an optional `/opacity` modifier.
 */
const COLOR_UTILITY_RE = new RegExp(
  `(?<variants>(?:[a-z][a-z0-9-]*:)*)(?<prefix>${PREFIX_ALT})-(?:(?<palette>${PALETTE_ALT})-(?<shade>\\d{2,3})|(?<keyword>white|black))(?<opacity>/\\d+)?`,
  'g',
)

/** A bare `border` / `border-t` width utility with no color beside it. */
const BARE_BORDER_RE = /(?<![\w-])(?<variants>(?:[a-z][a-z0-9-]*:)*)border(?<side>-[tbrlxy])?(?![\w[-])/g

/**
 * `RegExp.prototype.test` on a `/g` regex advances `lastIndex`, and
 * `String.prototype.matchAll` seeds its iterator from that same `lastIndex` —
 * so testing a string before scanning it would silently skip every match before
 * the test's stopping point. Reset on both sides.
 */
function matches(re: RegExp, value: string): boolean {
  re.lastIndex = 0
  const found = re.test(value)
  re.lastIndex = 0
  return found
}

/** A token reference already emitted by this transform. */
const TOKENIZED_BORDER_RE = /border(?:-[tbrlxy])?-\[var\(--dz-[^)]*\)\]/

/**
 * A static `class="…"` attribute.
 *
 * Anchored on the attribute name rather than on quote pairing. A template line
 * such as `v-for="day in ['Mo', 'Tu']" class="text-gray-400"` interleaves
 * single and double quotes, so scanning for balanced `"…"` / `'…'` spans
 * mis-associates the delimiters and walks straight past the class list.
 */
const CLASS_ATTR_RE = /(?<!:)\bclass\s*=\s*"([^"]*)"/g

/** A bound `:class="…"` attribute, whose body is a JS expression. */
const BOUND_CLASS_ATTR_RE = /:class\s*=\s*"([^"]*)"/g

/** A single-quoted string inside a `:class` expression. */
const INNER_STRING_RE = /'([^'\n]*)'/g

/** File-level opt-out, matching the convention in `tooling/token-checks/color-lint.ts`. */
const FILE_DISABLE_MARKER = 'token-check-disable-file'

// ---------------------------------------------------------------------------
// Class-list context
// ---------------------------------------------------------------------------

interface ClassListContext {
  /** The intent established by an unmodified `bg-{intent}-*` in this list. */
  bgIntent?: string
  /** True when the list paints a dark panel (`bg-gray-800`, a gradient, …). */
  darkSurface: boolean
  /** True when the list pairs a base `bg-gray-X` with a `hover:bg-gray-Y`, Y > X. */
  grayButtonPair: boolean
}

function readContext(classList: string): ClassListContext {
  const ctx: ClassListContext = { darkSurface: false, grayButtonPair: false }
  let baseGrayShade: number | undefined
  let hoverGrayShade: number | undefined

  COLOR_UTILITY_RE.lastIndex = 0
  for (const m of classList.matchAll(COLOR_UTILITY_RE)) {
    const { variants = '', prefix, palette, shade, keyword } = m.groups as Record<string, string | undefined>
    if (prefix === 'bg' && palette && shade) {
      if (!variants && INTENT_BY_PALETTE[palette])
        ctx.bgIntent ??= INTENT_BY_PALETTE[palette]
      if (NEUTRAL_PALETTES.has(palette)) {
        if (DARK_SURFACE_SHADES.has(shade))
          ctx.darkSurface = true
        if (variants.startsWith('hover:'))
          hoverGrayShade = Number(shade)
        else if (!variants)
          baseGrayShade = Number(shade)
      }
    }
    // A gradient stop paints its own surface; white text over it is legible.
    if ((prefix === 'from' || prefix === 'to') && palette && shade && Number(shade) >= 400)
      ctx.darkSurface = true
    if (prefix === 'bg' && keyword === 'black')
      ctx.darkSurface = true
  }

  if (baseGrayShade !== undefined && hoverGrayShade !== undefined && hoverGrayShade > baseGrayShade)
    ctx.grayButtonPair = true

  return ctx
}

// ---------------------------------------------------------------------------
// Resolution
// ---------------------------------------------------------------------------

interface Resolution {
  /** The replacement utility, or `undefined` when unclassified. */
  replacement?: string
  /** Why it could not be classified. */
  reason?: string
}

function token(prefix: string, variants: string, name: string): string {
  return `${variants}${prefix}-[var(${name})]`
}

/** Rewrite one color utility, given the class list it lives in. */
export function resolveUtility(
  match: { variants: string, prefix: string, palette?: string, shade?: string, keyword?: string, opacity?: string },
  ctx: ClassListContext,
): Resolution {
  const { variants, prefix, palette, shade, keyword, opacity } = match

  // Alpha-modified colors have no token equivalent: `bg-[var(--dz-card)]/90`
  // does not resolve, because Tailwind cannot apply an alpha channel to an
  // opaque `var()` it never parses. These need a human.
  if (opacity)
    return { reason: 'opacity modifier has no var() equivalent' }

  // A `dark:` variant on top of a theme-aware token is redundant at best and
  // contradictory at worst — resolving it means deciding whether the token or
  // the variant wins.
  if (variants.includes('dark:'))
    return { reason: 'dark: variant is redundant once the token is theme-aware' }

  const isHover = variants.startsWith('hover:')

  // -- white / black ---------------------------------------------------------
  if (keyword === 'white') {
    if (prefix === 'text') {
      if (ctx.bgIntent)
        return { replacement: token(prefix, variants, `--dz-${ctx.bgIntent}-foreground`) }
      if (ctx.darkSurface)
        return { replacement: token(prefix, variants, '--dz-colors-neutral-50') }
      return { reason: 'text-white over a surface this class list does not declare' }
    }
    if (prefix === 'bg')
      return { replacement: token(prefix, variants, '--dz-card') }
    return { reason: `${prefix}-white has no obvious token role` }
  }
  if (keyword === 'black')
    return { reason: 'black has no semantic token; pick a neutral shade by hand' }

  if (!palette || !shade)
    return { reason: 'unrecognized color utility' }

  const intent = INTENT_BY_PALETTE[palette]
  const isNeutral = NEUTRAL_PALETTES.has(palette)
  const n = Number(shade)

  // -- gradients are always decorative ---------------------------------------
  if (prefix === 'from' || prefix === 'to' || prefix === 'via') {
    if (!PRIMITIVE_SHADES.has(shade))
      return { reason: `no --dz-colors-${palette}-${shade} primitive` }
    return { replacement: token(prefix, variants, `--dz-colors-${palette}-${shade}`) }
  }

  // -- focus rings always resolve to the ring token ---------------------------
  if (prefix === 'ring')
    return { replacement: token(prefix, variants, '--dz-ring') }

  // -- neutral family --------------------------------------------------------
  if (isNeutral) {
    if (prefix === 'text') {
      // On a dark demo panel the light grays are decorative and must not flip.
      if (n <= 300 && ctx.darkSurface)
        return { replacement: token(prefix, variants, `--dz-colors-neutral-${shade}`) }
      if (n <= 200)
        return { reason: `text-${palette}-${shade} is only legible on a dark surface, which this class list does not declare` }
      if (n <= 600)
        return { replacement: token(prefix, variants, '--dz-muted-foreground') }
      return { replacement: token(prefix, variants, '--dz-foreground') }
    }
    if (prefix === 'bg') {
      if (DARK_SURFACE_SHADES.has(shade))
        return { replacement: token(prefix, variants, `--dz-colors-neutral-${shade}`) }
      // `bg-gray-200 … hover:bg-gray-300` is a button, not a surface.
      if (ctx.grayButtonPair)
        return { replacement: token(prefix, variants, isHover ? '--dz-secondary-hover' : '--dz-secondary') }
      if (isHover)
        return { replacement: token(prefix, variants, '--dz-muted') }
      if (n <= 200)
        return { replacement: token(prefix, variants, '--dz-muted') }
      return { replacement: token(prefix, variants, '--dz-border') }
    }
    if (prefix === 'border' || prefix === 'divide') {
      if (DARK_SURFACE_SHADES.has(shade))
        return { replacement: token(prefix, variants, `--dz-colors-neutral-${shade}`) }
      return { replacement: token(prefix, variants, '--dz-border') }
    }
    return { reason: `${prefix}-${palette}-${shade} has no neutral token role` }
  }

  // -- intent family ---------------------------------------------------------
  if (intent) {
    if (prefix === 'text') {
      // ADR-04 / CLAUDE.md rule 1b: `--dz-{intent}` is a fill colour, never a
      // text colour — it fails AA on both the page and its own muted fill.
      if (n >= 500)
        return { replacement: token(prefix, variants, `--dz-${intent}-muted-foreground`) }
      if (ctx.darkSurface)
        return { replacement: token(prefix, variants, `--dz-colors-${palette}-${shade}`) }
      return { reason: `text-${palette}-${shade} is too light for body text on an undeclared surface` }
    }
    if (prefix === 'bg') {
      if (n <= 100)
        return { replacement: token(prefix, variants, `--dz-${intent}-muted`) }
      if (n >= 500) {
        // Every intent exposes the same solid-fill pair since TASK-DS-10, so a
        // background maps to `-solid` / `-solid-hover` with no branch on warning.
        // For the five non-warning intents `-solid` resolves to the same shade as
        // `--dz-{intent}`; for warning it resolves to the lighter, AA-legible fill.
        if (isHover)
          return { replacement: token(prefix, variants, `--dz-${intent}-solid-hover`) }
        return { replacement: token(prefix, variants, `--dz-${intent}-solid`) }
      }
      return { reason: `bg-${palette}-${shade} sits between the muted fill and the solid fill` }
    }
    if (prefix === 'border')
      return { replacement: token(prefix, variants, `--dz-${intent}-border`) }
    return { reason: `${prefix}-${palette}-${shade} has no intent token role` }
  }

  // -- decorative palettes ---------------------------------------------------
  if (!PRIMITIVE_SHADES.has(shade))
    return { reason: `no --dz-colors-${palette}-${shade} primitive` }
  return { replacement: token(prefix, variants, `--dz-colors-${palette}-${shade}`) }
}

// ---------------------------------------------------------------------------
// Class-list rewriting
// ---------------------------------------------------------------------------

/**
 * Rewrite one class list.
 *
 * @param classList - The raw contents of a `class="…"` attribute or an inner
 *   `:class` string.
 * @returns The rewritten list plus any literal that could not be classified.
 */
export function resolveClassList(classList: string): { classList: string, unclassified: UnclassifiedLiteral[] } {
  const ctx = readContext(classList)
  const unclassified: UnclassifiedLiteral[] = []

  let out = classList.replace(COLOR_UTILITY_RE, (raw, ...rest) => {
    const groups = rest.at(-1) as Record<string, string | undefined>
    const { replacement, reason } = resolveUtility(
      {
        variants: groups.variants ?? '',
        prefix: groups.prefix as string,
        palette: groups.palette,
        shade: groups.shade,
        keyword: groups.keyword,
        opacity: groups.opacity,
      },
      ctx,
    )
    if (replacement)
      return replacement
    unclassified.push({ utility: raw, reason: reason ?? 'unknown', context: classList.trim() })
    return raw
  })

  // A bare `border` utility sets width but inherits `currentColor`. Give it the
  // border token — unless this list already carries a tokenized border colour.
  if (!TOKENIZED_BORDER_RE.test(out)) {
    out = out.replace(BARE_BORDER_RE, (raw, variants: string, side: string | undefined) => {
      const v = variants ?? ''
      return `${raw} ${v}border${side ?? ''}-[var(--dz-border)]`
    })
  }

  return { classList: out, unclassified }
}

// ---------------------------------------------------------------------------
// File rewriting
// ---------------------------------------------------------------------------

/**
 * Rewrite every class list in a story source file.
 *
 * Pure: takes source, returns source. Honors the `token-check-disable-file`
 * marker used by `tooling/token-checks/color-lint.ts`.
 */
export function transformStoryColors(source: string): TransformStoryColorsResult {
  if (source.includes(FILE_DISABLE_MARKER))
    return { code: source, unclassified: [], replaced: 0 }

  const unclassified: UnclassifiedLiteral[] = []
  let replaced = 0

  /** Rewrite one class list, recording where anything unclassified came from. */
  const rewrite = (body: string, offset: number): string => {
    if (!matches(COLOR_UTILITY_RE, body) && !matches(BARE_BORDER_RE, body))
      return body

    const result = resolveClassList(body)
    if (result.unclassified.length > 0) {
      const line = source.slice(0, offset).split('\n').length
      for (const u of result.unclassified)
        unclassified.push({ ...u, line })
    }
    if (result.classList !== body)
      replaced++
    return result.classList
  }

  /** Swap an attribute's body, keeping the `name="` prefix and `"` suffix. */
  const swapBody = (raw: string, body: string, next: string): string =>
    `${raw.slice(0, raw.length - body.length - 1)}${next}"`

  // Static `class="…"` — the whole body is one class list.
  let code = source.replace(CLASS_ATTR_RE, (raw, body: string, offset: number) =>
    swapBody(raw, body, rewrite(body, offset)))

  // Bound `:class="…"` — a JS expression. Each single-quoted string inside is
  // its own class list; an expression with no string literal (`:class="cls"`)
  // holds no utilities to rewrite.
  code = code.replace(BOUND_CLASS_ATTR_RE, (raw, body: string, offset: number) => {
    if (!matches(INNER_STRING_RE, body))
      return raw
    const next = body.replace(INNER_STRING_RE, (_m, inner: string) => `'${rewrite(inner, offset)}'`)
    return swapBody(raw, body, next)
  })

  return { code, unclassified, replaced }
}

// ---------------------------------------------------------------------------
// jscodeshift entry point
// ---------------------------------------------------------------------------

/**
 * Runner-compatible entry point.
 *
 * Pushes any {@link UnclassifiedLiteral} onto `options.report` when the caller
 * supplies an array, so a CLI can fail the run rather than silently skip.
 *
 * @returns The transformed source, or `null` when nothing changed.
 */
export default function transformer(
  file: FileInfo,
  _api: API,
  options: Options,
): string | null {
  const { code, unclassified } = transformStoryColors(file.source)

  const report = (options as { report?: UnclassifiedLiteral[] }).report
  if (Array.isArray(report)) {
    for (const u of unclassified)
      report.push({ ...u, context: `${file.path}: ${u.context ?? ''}` })
  }

  return code === file.source ? null : code
}

export { transformer }
