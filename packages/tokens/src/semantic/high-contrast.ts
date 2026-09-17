/**
 * High-Contrast Semantic Tokens (TASK-R5-O7)
 *
 * The third cascade the 08-11 reassessment doc 03 "Layer 1" asks for
 * ("light/dark/high-contrast outputs"). Same 115 ABI names as light and dark,
 * valued in **CSS system colours** so the palette comes from the operating
 * system rather than from this package.
 *
 * ## Why system keywords rather than a hand-picked high-contrast palette
 *
 * A system colour is not a fixed value: `Canvas` / `CanvasText` resolve to the
 * user's OS theme, and when a Windows High Contrast theme (or any forced-colors
 * mode) is active they resolve to *that* theme's pair. A hand-picked palette
 * would be one designer's guess at a contrast the user has already chosen, and
 * would be wrong for every theme but the one it was picked against. The
 * keywords also carry a guarantee no oklch triple can: the OS pairs
 * (`Canvas`/`CanvasText`, `ButtonFace`/`ButtonText`, `Field`/`FieldText`,
 * `Highlight`/`HighlightText`) are legible **by construction** on every theme.
 *
 * ## Why this map is DERIVED, not written out
 *
 * The invariant that matters is "the same token ids as light/dark" — measured,
 * light and dark are exactly 115 keys with zero dark-only names. A second
 * hand-written literal map would hold that invariant only until somebody added
 * a semantic token and updated two files out of three. So the map is built by
 * applying an ordered **role table** to the key set of `LIGHT_SEMANTIC_TOKENS`,
 * and a name that matches no rule **throws at module load**. Adding a semantic
 * token without deciding its high-contrast role is therefore a build failure,
 * not a silently missing declaration.
 *
 * ## Where this cascade applies
 *
 * Emitted to its own opt-in stylesheet, `dist/tokens.high-contrast.css`, under
 * `[data-theme="high-contrast"]` and `@media (forced-colors: active)`. It is
 * NOT part of `dist/tokens.css`: no component implements the theme yet
 * (TASK-R5-O7 changes no component), so shipping it in the default sheet would
 * add declarations nothing reads. Consumers opt in with a second import.
 *
 * Note what forced-colors does and does not do. With `forced-color-adjust: auto`
 * the browser replaces the *used* value of `color`, `background-color` and
 * `border-color` whatever these tokens say — so under a real forced-colors mode
 * this cascade is belt-and-braces. Its load-bearing use is the **application
 * opt-in**, `[data-theme="high-contrast"]`, where nothing is forced and the
 * system keywords still resolve to the OS palette.
 *
 * @see docs/program-2026-09-04/reports/TASK-R5-O7-handoff.md
 */

import { LIGHT_SEMANTIC_TOKENS } from './light.js'

/**
 * The system colours this cascade is allowed to use.
 *
 * Deliberately the long-supported CSS Color 4 set only. `AccentColor`,
 * `AccentColorText`, `SelectedItem`, `SelectedItemText`, `Mark` and `MarkText`
 * are omitted: they are newer, unevenly implemented, and every role below is
 * expressible without them. A value outside this set is rejected by the spec.
 */
export const HIGH_CONTRAST_SYSTEM_COLORS: readonly string[] = [
  'Canvas',
  'CanvasText',
  'LinkText',
  'VisitedText',
  'ActiveText',
  'ButtonFace',
  'ButtonText',
  'ButtonBorder',
  'Field',
  'FieldText',
  'Highlight',
  'HighlightText',
  'GrayText',
]

export interface HighContrastRule {
  /** Matched against the full `--dz-*` ABI name. */
  readonly pattern: RegExp
  /** A keyword from HIGH_CONTRAST_SYSTEM_COLORS, or `null` to keep the light literal. */
  readonly value: string | null
  readonly reason: string
}

/**
 * Ceilings — roles the `--dz-*` ABI cannot express as a system colour.
 *
 * Recorded here rather than worked around, per the TASK-R5-O7 stop condition
 * ("when a high-contrast value cannot be expressed in the token ABI, record the
 * ceiling"). Each is a real limit of the system-colour palette, not of this
 * implementation.
 */
export const HIGH_CONTRAST_CEILINGS: readonly { readonly id: string, readonly note: string }[] = [
  {
    id: 'HC-1',
    note:
      'Alpha compositing has no system-colour equivalent — the CSS system colours are '
      + 'opaque keywords. --dz-overlay-bg and --dz-scrim therefore keep their light-theme '
      + 'literal (a 60% black). A scrim is the one role where that is safe: it sits BEHIND '
      + 'the dialog, carries no text, and under real forced-colors the browser replaces it '
      + 'anyway. 2 tokens.',
  },
  {
    id: 'HC-2',
    note:
      'Categorical colour is not expressible. The palette offers no set of mutually '
      + 'distinguishable hues a theme is required to keep distinct, so 10 chart series, '
      + '6 status states and 2 progress bands all resolve to CanvasText. This is deliberate '
      + 'and LOUD: a chart that renders as one solid colour is visibly broken, which is the '
      + 'correct signal that it must carry a non-colour encoding (pattern, dash, direct '
      + 'label) to satisfy WCAG 1.4.1 — which it owes in forced-colors regardless of what '
      + 'these tokens say. Wiring that encoding is component work, out of scope here. '
      + '18 tokens.',
  },
  {
    id: 'HC-3',
    note:
      'Hover and active states collapse onto their base keyword. The OS palette has no '
      + 'hover colour, so {intent}-hover, {intent}-active, {intent}-solid-hover, '
      + '--dz-border-hover and --dz-link-hover cannot differ from their base. This matches '
      + 'how browsers themselves behave under forced-colors: state is carried by outline, '
      + 'underline and text, not by fill. 21 tokens.',
  },
  {
    id: 'HC-4',
    note:
      '--dz-muted-foreground is CanvasText, NOT GrayText. GrayText is #808080 against a '
      + 'white Canvas on the default desktop theme = 3.95:1, below WCAG AA 4.5:1 — in a '
      + 'theme whose entire purpose is contrast, "muted" body text must not be the one '
      + 'thing that fails. GrayText is reserved for roles WCAG exempts or the platform '
      + 'itself greys: --dz-disabled-foreground (the 1.4.3 inactive-control exception), '
      + '--dz-input-placeholder and --dz-codeblock-line-number.',
  },
  {
    id: 'HC-5',
    note:
      'The ABI has no --dz-input-foreground. --dz-input-bg maps to Field, but the text an '
      + 'input renders inherits --dz-foreground (CanvasText), so the one pair this cascade '
      + 'cannot state is Field/FieldText. Safe in practice — every shipping OS theme gives '
      + 'Field and Canvas the same value, both being "the content background" — but it is a '
      + 'gap in the token ABI, not a choice made here. Adding --dz-input-foreground is a '
      + 'token addition with an owner decision attached; recorded, not taken.',
  },
  {
    id: 'HC-6',
    note:
      'Import order matters for exactly three names. --dz-appshell-header-bg, '
      + '--dz-appshell-header-border and --dz-appshell-main-bg are declared BOTH by the '
      + 'semantic tier and again by the component tier in a later :root block of '
      + 'tokens.css — the cross-tier shadowing N2-T1 F-1 found and holds at a ceiling of '
      + 'three. [data-theme="high-contrast"] and that component :root block are both '
      + 'specificity (0,1,0), so source order decides: importing tokens.css FIRST (as '
      + 'documented) makes the high-contrast values win, and reversing the two imports '
      + 'silently leaves those three at their light-theme values. Raising this block to '
      + ':root[data-theme="high-contrast"] would win in either order but would drop '
      + 'subtree theming, which [data-theme="dark"] supports — so the order is documented '
      + 'instead. N2-T1 D1 (carried here as D48) removes the hazard at its root by ending '
      + 'the double declaration; when it lands, this ceiling goes with it.',
  },
]

/**
 * Background / foreground pairs the cascade must keep OS-guaranteed.
 *
 * The whole reason to use system keywords is that the OS promises certain pairs
 * are legible on every theme. That promise only holds pair-wise: `ButtonText`
 * on `Canvas` is not a guarantee, it is a coincidence of the default desktop
 * theme. Stating the pairs as data lets `high-contrast.spec.ts` assert them,
 * which is what caught `--dz-accent-foreground` resolving to `ButtonText` over
 * a `Canvas` background while this table was being written.
 *
 * `GrayText` pairs are excluded deliberately — they are the WCAG-exempt and
 * platform-greyed roles of ceiling HC-4, and the OS makes no contrast promise
 * about them.
 */
export const HIGH_CONTRAST_PAIRS: readonly {
  readonly background: string
  readonly foreground: string
}[] = [
  { background: '--dz-background', foreground: '--dz-foreground' },
  { background: '--dz-surface', foreground: '--dz-surface-foreground' },
  { background: '--dz-muted', foreground: '--dz-muted-foreground' },
  { background: '--dz-accent', foreground: '--dz-accent-foreground' },
  { background: '--dz-card', foreground: '--dz-card-foreground' },
  { background: '--dz-popover', foreground: '--dz-popover-foreground' },
  { background: '--dz-highlight', foreground: '--dz-highlight-foreground' },
  { background: '--dz-codeblock-bg', foreground: '--dz-codeblock-text' },
  { background: '--dz-codeblock-header-bg', foreground: '--dz-codeblock-header-text' },
  { background: '--dz-destructive', foreground: '--dz-destructive-foreground' },
  ...['primary', 'secondary', 'success', 'warning', 'danger', 'info'].flatMap(intent => [
    { background: `--dz-${intent}`, foreground: `--dz-${intent}-foreground` },
    { background: `--dz-${intent}-solid`, foreground: `--dz-${intent}-foreground` },
    { background: `--dz-${intent}-muted`, foreground: `--dz-${intent}-muted-foreground` },
  ]),
]

/**
 * The pairs the OS guarantees legible, as `background -> foreground`.
 * Anything not in this table is a pairing this cascade may not create.
 */
export const GUARANTEED_SYSTEM_PAIRS: Readonly<Record<string, string>> = {
  Canvas: 'CanvasText',
  ButtonFace: 'ButtonText',
  Field: 'FieldText',
  Highlight: 'HighlightText',
}

/**
 * Ordered role table — FIRST match wins, so exact names precede suffix rules.
 *
 * The trailing block is the per-intent state set shared by primary, secondary,
 * success, warning, danger and info (and the two-token accent/destructive
 * pairs). Its shape follows the contract documented in `light.ts`:
 * `{intent}-foreground` is guaranteed-legible text on `{intent}` and
 * `{intent}-solid`, so those three map to the ButtonFace/ButtonText pair, which
 * the OS guarantees legible. `{intent}-muted` is a subtle background carrying
 * `{intent}-muted-foreground`, which becomes the Canvas/CanvasText pair (21:1).
 */
export const HIGH_CONTRAST_ROLE_RULES: readonly HighContrastRule[] = [
  // ── Ceiling HC-1: alpha, kept literal ──
  { pattern: /^--dz-(overlay-bg|scrim)$/, value: null, reason: 'HC-1 alpha compositing' },

  // ── Surfaces: one page colour, because "elevation" is not a contrast ──
  {
    pattern: /^--dz-(background|surface|surface-sunken|surface-raised|surface-overlay|muted|accent|disabled|card|popover|ring-offset|appshell-header-bg|appshell-main-bg|codeblock-bg|codeblock-header-bg)$/,
    value: 'Canvas',
    reason: 'page/panel background — the OS canvas',
  },
  {
    pattern: /^--dz-(foreground|surface-foreground|muted-foreground|accent-foreground|card-foreground|popover-foreground|codeblock-text|codeblock-header-text)$/,
    value: 'CanvasText',
    reason: 'text on the canvas (HC-4: muted-foreground is NOT GrayText)',
  },

  // ── Borders: a border is the one thing that survives forced-colors, so it
  //    takes the full-contrast text colour rather than a tint. HC-3 folds
  //    border-hover onto border. ──
  {
    pattern: /^--dz-(border|border-hover|divider|appshell-header-border|codeblock-border)$/,
    value: 'CanvasText',
    reason: 'structural line at full contrast (HC-3 folds -hover)',
  },

  // ── Focus and selection: the OS highlight pair ──
  { pattern: /^--dz-(ring|input-border-focus)$/, value: 'Highlight', reason: 'focus indicator' },
  { pattern: /^--dz-highlight$/, value: 'Highlight', reason: 'selected row background' },
  { pattern: /^--dz-highlight-foreground$/, value: 'HighlightText', reason: 'text on selection' },

  // ── Links (HC-3 folds -hover; the underline carries the state) ──
  { pattern: /^--dz-(link|link-hover)$/, value: 'LinkText', reason: 'hyperlink (HC-3 folds -hover)' },

  // ── GrayText, only where WCAG exempts it or the platform greys it (HC-4) ──
  {
    pattern: /^--dz-(disabled-foreground|input-placeholder|codeblock-line-number)$/,
    value: 'GrayText',
    reason: 'HC-4 inactive / platform-greyed roles',
  },

  // ── Form fields get the OS field pair, distinct from the canvas ──
  { pattern: /^--dz-input-bg$/, value: 'Field', reason: 'editable field background' },
  { pattern: /^--dz-input-border$/, value: 'ButtonBorder', reason: 'control border' },

  // ── Ceiling HC-2: categorical colour is not expressible ──
  {
    pattern: /^--dz-(chart-\d+|status-[a-z]+|progress-[a-z]+)$/,
    value: 'CanvasText',
    reason: 'HC-2 categorical colour collapses',
  },

  // ── Per-intent state set. Suffix rules, so they must come last. ──
  { pattern: /-muted-foreground$/, value: 'CanvasText', reason: 'emphasis text on a subtle background' },
  { pattern: /-muted$/, value: 'Canvas', reason: 'subtle tinted background' },
  { pattern: /-border$/, value: 'ButtonBorder', reason: 'intent-tinted container border' },
  { pattern: /-foreground$/, value: 'ButtonText', reason: 'guaranteed-legible text on the intent fill' },
  {
    pattern: /^--dz-[a-z]+(-(hover|active|solid|solid-hover))?$/,
    value: 'ButtonFace',
    reason: 'intent fill (HC-3 folds -hover/-active/-solid-hover)',
  },
]

function buildHighContrastTokens(): Record<string, string> {
  const built: Record<string, string> = {}
  const unmatched: string[] = []
  for (const name of Object.keys(LIGHT_SEMANTIC_TOKENS)) {
    const rule = HIGH_CONTRAST_ROLE_RULES.find(candidate => candidate.pattern.test(name))
    if (rule === undefined) {
      unmatched.push(name)
      continue
    }
    // `null` means "no system colour expresses this role" — keep the light
    // literal so the declaration still exists and the three cascades stay
    // key-identical. The reason is recorded in HIGH_CONTRAST_CEILINGS.
    built[name] = rule.value ?? (LIGHT_SEMANTIC_TOKENS[name] as string)
  }
  if (unmatched.length > 0) {
    throw new Error(
      `high-contrast: ${unmatched.length} semantic token(s) have no role rule: `
      + `${unmatched.join(', ')}. Every --dz-* semantic token needs a high-contrast `
      + `role — add a rule to HIGH_CONTRAST_ROLE_RULES in `
      + `packages/tokens/src/semantic/high-contrast.ts, or a ceiling if none applies.`,
    )
  }
  return built
}

/**
 * The high-contrast cascade: the same ABI names as `LIGHT_SEMANTIC_TOKENS`,
 * valued in system colours. Derived — see the module comment.
 */
export const HIGH_CONTRAST_SEMANTIC_TOKENS: Record<string, string> = buildHighContrastTokens()
