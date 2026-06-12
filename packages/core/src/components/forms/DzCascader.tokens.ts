/**
 * DzCascader -- Component-specific token mappings.
 * Maps semantic design tokens to component styling (ADR-04).
 *
 * Cascading multi-level select (Reka UI Popover) with an input-like trigger
 * and one or more sliding option columns. Trigger anatomy reuses the shared
 * `--dz-input-*` family; the popover columns reuse the shared menu surface.
 */
export const cascaderTokens = {
  /** Trigger container */
  background: 'var(--dz-background)',
  foreground: 'var(--dz-foreground)',
  border: 'var(--dz-border)',
  radius: 'var(--dz-radius-md)',
  transition: 'var(--dz-transition-fast)',
  focusRingColor: 'var(--dz-input-focus-ring-color)',
  borderFocus: 'var(--dz-input-border-focus)',
  /** Filled variant background */
  filledBackground: 'var(--dz-muted)',
  /** Placeholder + chevron */
  placeholder: 'var(--dz-muted-foreground)',
  iconColor: 'var(--dz-muted-foreground)',
  /** Invalid state */
  invalidBorder: 'var(--dz-danger)',
  /** Disabled state */
  disabledOpacity: 'var(--dz-input-disabled-opacity)',
  /** Popover surface + columns */
  surface: 'var(--dz-background)',
  surfaceShadow: 'var(--dz-shadow-lg)',
  columnBorder: 'var(--dz-border)',
  /** Option cells */
  option: {
    foreground: 'var(--dz-foreground)',
    radius: 'var(--dz-radius-sm)',
    hoverBackground: 'var(--dz-muted)',
    activeBackground: 'var(--dz-primary-muted)',
    activeForeground: 'var(--dz-primary)',
  },
  /** Size scale (trigger heights, shared with inputs) */
  size: {
    xs: {
      height: 'var(--dz-input-xs-height)',
      paddingX: 'var(--dz-input-xs-padding-x)',
      fontSize: 'var(--dz-input-xs-font-size)',
    },
    sm: {
      height: 'var(--dz-input-sm-height)',
      paddingX: 'var(--dz-input-sm-padding-x)',
      fontSize: 'var(--dz-input-sm-font-size)',
    },
    md: {
      height: 'var(--dz-input-md-height)',
      paddingX: 'var(--dz-input-md-padding-x)',
      fontSize: 'var(--dz-input-md-font-size)',
    },
    lg: {
      height: 'var(--dz-input-lg-height)',
      paddingX: 'var(--dz-input-lg-padding-x)',
      fontSize: 'var(--dz-input-lg-font-size)',
    },
    xl: {
      height: 'var(--dz-input-xl-height)',
      paddingX: 'var(--dz-input-xl-padding-x)',
      fontSize: 'var(--dz-input-xl-font-size)',
    },
  },
} as const
