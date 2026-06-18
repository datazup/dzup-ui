/**
 * DzRelativeTime — Component-specific token mappings.
 *
 * Documents which design tokens DzRelativeTime consumes (ADR-04, ADR-17). The
 * `--dz-relative-time-*` custom property is declared on the `.dz-relative-time`
 * root in `styles/base.css` and consumed by `DzRelativeTime.variants.ts`; tone
 * colours map directly to the shared semantic text tokens.
 */

/** Token references used by DzRelativeTime */
export const relativeTimeTokens = {
  /** Font size (inherits the shared small text scale) */
  fontSize: 'var(--dz-relative-time-font-size)',
  /** Line height */
  leading: 'var(--dz-leading-normal)',

  /** Colours per tone variant */
  tone: {
    default: 'var(--dz-foreground)',
    muted: 'var(--dz-muted-foreground)',
    success: 'var(--dz-success)',
    warning: 'var(--dz-warning)',
    danger: 'var(--dz-danger)',
    info: 'var(--dz-info)',
  },
} as const
