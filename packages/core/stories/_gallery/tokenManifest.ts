/**
 * Token manifest for the Design Token Browser (Guides/Design Tokens → Browser).
 *
 * Enumerates every `--dz-*` custom property from the canonical `@dzup-ui/tokens`
 * package, classified by **tier** (primitive → semantic → component) and
 * **category** (color, spacing, radius, shadow, typography, motion, …). The name
 * list is seeded from the package (the source of truth) and then unioned with a
 * live scan of the running stylesheets so decorative palettes and any token the
 * JS barrel hasn't caught up with are never missing from the browser.
 *
 * Resolved *values* are NOT baked in here — the browser reads them live via
 * `getComputedStyle` so they reflect the current theme (light/dark toolbar).
 * The `reference` field carries the *authored* value (e.g. the var() mapping)
 * for cross-linking tiers, which is genuinely useful but static.
 */

import {
  APPSHELL_TOKENS,
  BADGE_TOKENS,
  BREAKPOINTS,
  BUTTON_TOKENS,
  CARD_TOKENS,
  CODEBLOCK_TOKENS,
  CONTROL_TOKENS,
  DIALOG_TOKENS,
  DURATIONS,
  EASINGS,
  FONT_FAMILIES,
  FONT_SIZES,
  FONT_WEIGHTS,
  formatOklch,
  INPUT_TOKENS,
  LETTER_SPACINGS,
  LIGHT_SEMANTIC_TOKENS,
  LINE_HEIGHTS,
  palettes,
  RADIUS_SCALE,
  SHADE_STEPS,
  SHADOW_SCALE,
  SIDEBAR_TOKENS,
  SPACING_SCALE,
  Z_INDEX_SCALE,
} from '@dzup-ui/tokens'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Three-tier taxonomy (ADR-17). */
export type TokenTier = 'primitive' | 'semantic' | 'component'

/** Filterable family used for the category chips + previews. */
export type TokenCategory =
  | 'color'
  | 'spacing'
  | 'radius'
  | 'shadow'
  | 'typography'
  | 'motion'
  | 'zindex'
  | 'other'

/** One design token, fully classified. */
export interface TokenEntry {
  /** CSS custom property name, e.g. `--dz-primary`. */
  name: string
  /** Tier in the three-tier system. */
  tier: TokenTier
  /** Family for filtering + preview rendering. */
  category: TokenCategory
  /** Authored value from the canonical package (`''` for discovered-only names). */
  reference: string
  /** Components whose `*.tokens.ts` references this token (heuristic — see below). */
  components: string[]
}

// ---------------------------------------------------------------------------
// Classification
// ---------------------------------------------------------------------------

const COMPONENT_PREFIXES = [
  'button',
  'card',
  'input',
  'badge',
  'dialog',
  'sidebar',
  'appshell',
  'codeblock',
  'control',
]

/** Which tier does a bare token name belong to (used for discovered names). */
export function tierOfToken(name: string): TokenTier {
  const body = name.replace(/^--dz-/, '')
  if (
    /^(colors-|spacing-|radius-|shadow-|text-|font-|leading-|tracking-|duration-|ease-|transition-|z-|breakpoint-)/.test(
      body,
    )
  ) {
    return 'primitive'
  }
  const seg = body.split('-')[0] ?? ''
  return COMPONENT_PREFIXES.includes(seg) ? 'component' : 'semantic'
}

/** Assign a token to a family for filtering + choosing its preview. */
export function categorizeToken(name: string, tier: TokenTier): TokenCategory {
  const n = name
  if (n.includes('radius')) return 'radius'
  if (n.includes('shadow')) return 'shadow'
  if (/(duration|ease|transition)/.test(n)) return 'motion'
  if (/z-index/.test(n) || /^--dz-z-/.test(n)) return 'zindex'
  if (
    /^--dz-font-/.test(n)
    || /^--dz-text-/.test(n)
    || /(leading|tracking|font-size|font-family|font-weight|line-height|letter-spacing)/.test(n)
  ) {
    return 'typography'
  }
  if (/(height|width|padding|gap|spacing|offset|inset)/.test(n)) return 'spacing'
  if (
    /(colors-|background|foreground|-border($|-)|-color($|-)|-bg($|-)|-text($|-)|placeholder|overlay|scrim|ring|chart|status|link|highlight|disabled|divider|muted|accent|primary|secondary|success|warning|danger|info|surface|popover|card|destructive|input-bg|progress)/.test(
      n,
    )
  ) {
    return 'color'
  }
  if (n.includes('breakpoint')) return 'other'
  return tier === 'semantic' ? 'color' : 'other'
}

// ---------------------------------------------------------------------------
// Seed: enumerate names from the canonical package
// ---------------------------------------------------------------------------

function buildPackageEntries(): TokenEntry[] {
  const out: TokenEntry[] = []
  const add = (name: string, tier: TokenTier, reference: string): void => {
    out.push({ name, tier, category: categorizeToken(name, tier), reference, components: [] })
  }

  // ── Primitive: colors (mirrors generateColorCssVars) ──
  for (const [pal, ramp] of Object.entries(palettes)) {
    for (const step of SHADE_STEPS) {
      add(`--dz-colors-${pal}-${step}`, 'primitive', formatOklch(ramp[step]))
    }
  }
  // ── Primitive: spacing (dot → underscore, per generateSpacingCssVars) ──
  for (const [step, value] of Object.entries(SPACING_SCALE)) {
    add(`--dz-spacing-${step.replace('.', '_')}`, 'primitive', value)
  }
  // ── Primitive: radius ──
  for (const [step, value] of Object.entries(RADIUS_SCALE)) {
    add(`--dz-radius-${step}`, 'primitive', value)
  }
  // ── Primitive: shadow ──
  for (const [step, value] of Object.entries(SHADOW_SCALE)) {
    add(`--dz-shadow-${step}`, 'primitive', value)
  }
  // ── Primitive: typography ──
  for (const [k, v] of Object.entries(FONT_FAMILIES)) add(`--dz-font-${k}`, 'primitive', v)
  for (const [k, v] of Object.entries(FONT_SIZES)) add(`--dz-text-${k}`, 'primitive', v)
  for (const [k, v] of Object.entries(LINE_HEIGHTS)) add(`--dz-leading-${k}`, 'primitive', v)
  for (const [k, v] of Object.entries(FONT_WEIGHTS)) add(`--dz-font-${k}`, 'primitive', v)
  for (const [k, v] of Object.entries(LETTER_SPACINGS)) add(`--dz-tracking-${k}`, 'primitive', v)
  // ── Primitive: motion ──
  for (const [k, v] of Object.entries(DURATIONS)) add(`--dz-duration-${k}`, 'primitive', v)
  for (const [k, v] of Object.entries(EASINGS)) add(`--dz-ease-${k}`, 'primitive', v)
  for (const k of ['fast', 'normal', 'slow']) {
    add(`--dz-transition-${k}`, 'primitive', `var(--dz-duration-${k}) var(--dz-ease-default)`)
  }
  // ── Primitive: z-index ──
  for (const [k, v] of Object.entries(Z_INDEX_SCALE)) add(`--dz-z-${k}`, 'primitive', v)
  // ── Primitive: breakpoints ──
  for (const [k, v] of Object.entries(BREAKPOINTS)) add(`--dz-breakpoint-${k}`, 'primitive', v)

  // ── Semantic (light values are the reference; live value follows the theme) ──
  for (const [name, value] of Object.entries(LIGHT_SEMANTIC_TOKENS)) add(name, 'semantic', value)

  // ── Component (the shared families owned by @dzup-ui/tokens) ──
  const componentMaps: Record<string, string>[] = [
    APPSHELL_TOKENS,
    BADGE_TOKENS,
    BUTTON_TOKENS,
    CARD_TOKENS,
    CODEBLOCK_TOKENS,
    CONTROL_TOKENS,
    DIALOG_TOKENS,
    INPUT_TOKENS,
    SIDEBAR_TOKENS,
  ]
  for (const map of componentMaps) {
    for (const [name, value] of Object.entries(map)) add(name, 'component', value)
  }

  return out
}

// ---------------------------------------------------------------------------
// Component-usage scan (optional detail — heuristic)
// ---------------------------------------------------------------------------

/**
 * Map every token → the components that reference it, by scanning the raw source
 * of each `*.tokens.ts` anatomy file. This is a heuristic: it reports where a
 * token is *declared/referenced in a component's token map*, which is a strong
 * proxy for "this component consumes it" but not a full styling-layer scan of
 * every `.variants.ts`/`.vue`. Surfaced as an on-card detail, never a hard gate.
 */
function buildComponentUsage(): Record<string, string[]> {
  const sets: Record<string, Set<string>> = {}
  try {
    const raw = import.meta.glob('../../src/components/**/*.tokens.ts', {
      query: '?raw',
      eager: true,
      import: 'default',
    }) as Record<string, string>

    for (const [path, source] of Object.entries(raw)) {
      const file = path.split('/').pop() ?? ''
      const component = file.replace(/\.tokens\.ts$/, '')
      const matches = source.match(/--dz-[a-z0-9_-]+/gi) ?? []
      for (const token of matches) {
        (sets[token] ??= new Set<string>()).add(component)
      }
    }
  }
  catch {
    /* import.meta.glob is unavailable outside the Vite pipeline — skip usage. */
  }

  const out: Record<string, string[]> = {}
  for (const [token, set] of Object.entries(sets)) out[token] = Array.from(set).sort()
  return out
}

// ---------------------------------------------------------------------------
// Live discovery from the running stylesheets
// ---------------------------------------------------------------------------

/**
 * Collect every `--dz-*` custom property actually declared in the loaded
 * stylesheets (recursing through `@layer`/`@media`/`@supports` groups). This is
 * what makes the browser honest: whatever the shipped `tokens.css` registers is
 * discoverable here even if the JS barrel is a step behind (e.g. the decorative
 * color spectrum).
 */
export function discoverCssTokenNames(): string[] {
  if (typeof document === 'undefined') return []
  const names = new Set<string>()

  const visit = (rules?: CSSRuleList): void => {
    if (!rules) return
    for (const rule of Array.from(rules)) {
      const style = (rule as CSSStyleRule).style
      if (style && typeof style.length === 'number') {
        for (let i = 0; i < style.length; i++) {
          const prop = style.item(i)
          if (prop.startsWith('--dz-')) names.add(prop)
        }
      }
      const nested = (rule as CSSGroupingRule).cssRules
      if (nested) visit(nested)
    }
  }

  for (const sheet of Array.from(document.styleSheets)) {
    try {
      visit(sheet.cssRules)
    }
    catch {
      /* cross-origin sheet — cssRules access throws; skip it. */
    }
  }

  return Array.from(names)
}

// ---------------------------------------------------------------------------
// Public: build the full manifest
// ---------------------------------------------------------------------------

const TIER_RANK: Record<TokenTier, number> = { primitive: 0, semantic: 1, component: 2 }

/**
 * The complete, classified token manifest: canonical package names first, then
 * any extra names discovered live in the stylesheets. Each entry is tagged with
 * the components that reference it (heuristic).
 */
export function buildTokenManifest(): TokenEntry[] {
  const usage = buildComponentUsage()
  const byName = new Map<string, TokenEntry>()

  for (const entry of buildPackageEntries()) {
    entry.components = usage[entry.name] ?? []
    byName.set(entry.name, entry)
  }

  for (const name of discoverCssTokenNames()) {
    if (byName.has(name)) continue
    const tier = tierOfToken(name)
    byName.set(name, {
      name,
      tier,
      category: categorizeToken(name, tier),
      reference: '',
      components: usage[name] ?? [],
    })
  }

  return Array.from(byName.values()).sort(
    (a, b) =>
      TIER_RANK[a.tier] - TIER_RANK[b.tier]
      || a.category.localeCompare(b.category)
      || a.name.localeCompare(b.name),
  )
}
