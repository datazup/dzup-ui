/**
 * In-preview customiser — the shared contract between the detail page's toolbar
 * (which writes `?primary=` / `?dir=` onto the iframe src) and the chromeless
 * preview page (which reads them and re-skins its own document).
 * (docs/templates.md §2 #9, #10 — the live primary-colour + RTL differentiator.)
 *
 * ── How the primary re-skin works ──────────────────────────────────────────
 * Every primary-derived semantic token resolves through the primary colour ramp
 * — `--dz-primary` (and its `-hover/-active/-muted/-foreground/-border` set),
 * `--dz-ring`, `--dz-link`, `--dz-highlight`, `--dz-input-border-focus` — each
 * is defined as `var(--dz-colors-primary-<shade>)` in @dzup-ui/tokens, and the
 * light/dark semantic layers already pick the correct shade per theme (light
 * leans on 500/600/700, dark on 400/300/200; @dzup-ui/tokens semantic/*.ts).
 *
 * So we never touch the semantic tokens or any per-component value. We remap the
 * whole `--dz-colors-primary-*` PRIMITIVE ramp on the document root to alias a
 * decorative spectrum palette (`--dz-colors-<palette>-<shade>`). Because the
 * intent → primitive indirection is preserved, the swap is automatically correct
 * in BOTH themes and every component that reads any primary token follows along
 * — all from token vars, never a raw hex. The ramp lives in `@layer dz-tokens`,
 * so an inline (unlayered) `style.setProperty` on <html> reliably wins; Reset
 * just removes those inline properties to restore the template's native colour.
 */

import { SHADE_STEPS } from '@dzup-ui/tokens'

/** A selectable primary-colour preset (a decorative-spectrum palette name). */
export interface PreviewPalette {
  /** Palette key — matches `--dz-colors-<value>-*` in @dzup-ui/tokens. */
  readonly value: string
  /** Human label for the swatch button + aria announcement. */
  readonly label: string
}

/**
 * Curated subset of the decorative spectrum offered as live primary presets.
 * Hues are spread around the wheel so the picker reads as a spectrum; each is a
 * real `@dzup-ui/tokens` palette, so its swatch and the remap stay token-only.
 */
export const PREVIEW_PALETTES: readonly PreviewPalette[] = [
  { value: 'rose', label: 'Rose' },
  { value: 'orange', label: 'Orange' },
  { value: 'amber', label: 'Amber' },
  { value: 'emerald', label: 'Emerald' },
  { value: 'teal', label: 'Teal' },
  { value: 'cyan', label: 'Cyan' },
  { value: 'blue', label: 'Blue' },
  { value: 'violet', label: 'Violet' },
  { value: 'fuchsia', label: 'Fuchsia' },
] as const

const PALETTE_VALUES = new Set(PREVIEW_PALETTES.map(p => p.value))

/** Narrow an unknown query value to a supported palette key. */
export function isPreviewPalette(value: unknown): value is string {
  return typeof value === 'string' && PALETTE_VALUES.has(value)
}

/** The CSS background a swatch uses to preview a palette (token var, no hex). */
export function paletteSwatchColor(value: string): string {
  return `var(--dz-colors-${value}-500)`
}

/**
 * Remap the document's primary ramp to a decorative palette, or reset to native.
 * Passing `null`/an unknown palette removes the overrides so the template falls
 * back to its own `--dz-colors-primary-*` (the native colour, exactly as today).
 */
export function applyPrimaryPalette(palette: string | null): void {
  if (typeof document === 'undefined')
    return
  const { style } = document.documentElement
  const remap = palette !== null && PALETTE_VALUES.has(palette)
  for (const shade of SHADE_STEPS) {
    const prop = `--dz-colors-primary-${shade}`
    if (remap) {
      style.setProperty(prop, `var(--dz-colors-${palette}-${shade})`)
    }
    else {
      style.removeProperty(prop)
    }
  }
}

/** Apply text direction to <html>; anything but `rtl` resets to native LTR. */
export function applyDir(dir: unknown): void {
  if (typeof document === 'undefined')
    return
  document.documentElement.setAttribute('dir', dir === 'rtl' ? 'rtl' : 'ltr')
}
