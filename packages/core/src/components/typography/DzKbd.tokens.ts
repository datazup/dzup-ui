/**
 * DzKbd — Component-specific token mappings.
 *
 * Documents which design tokens are consumed by the DzKbd chip surface.
 * The size-dependent values (`--dz-kbd-min-size`, `--dz-kbd-padding-x`,
 * `--dz-kbd-font-size`) are assigned per `data-size` in `styles/base.css`;
 * this file records their default (md) resolution.
 */

/** Token references used by DzKbd */
export const kbdTokens = {
  /** Chip background surface */
  background: 'var(--dz-kbd-bg)',
  /** Chip text color */
  color: 'var(--dz-kbd-fg)',
  /** Chip border color */
  border: 'var(--dz-kbd-border)',
  /** Corner radius */
  radius: 'var(--dz-kbd-radius)',
  /** Resting elevation */
  shadow: 'var(--dz-kbd-shadow)',
  /** Gap between chips and separators */
  gap: 'var(--dz-kbd-gap)',
  /** Square minimum size (height + min-width) */
  minSize: 'var(--dz-kbd-min-size)',
  /** Horizontal padding for multi-character keys */
  paddingX: 'var(--dz-kbd-padding-x)',
  /** Chip font size */
  fontSize: 'var(--dz-kbd-font-size)',
  /** Monospace font family */
  fontFamily: 'var(--dz-font-mono)',
  /** Separator color */
  separator: 'var(--dz-muted-foreground)',
} as const
