/**
 * DzTreeSelect -- Component-specific token mappings.
 *
 * The trigger intentionally reuses the same `--dz-input-*` token family as
 * DzSelect so the two controls are visually identical (ADR-04, ADR-17).
 * Panel + chip indirection is local component anatomy.
 */
export const treeSelectTokens = {
  /** Trigger background */
  triggerBackground: 'var(--dz-background)',
  /** Trigger foreground text color */
  triggerForeground: 'var(--dz-foreground)',
  /** Trigger border color */
  triggerBorder: 'var(--dz-border)',
  /** Trigger border radius */
  triggerRadius: 'var(--dz-radius-md)',
  /** Trigger transition */
  transition: 'var(--dz-transition-fast)',
  /** Placeholder text color */
  placeholder: 'var(--dz-muted-foreground)',
  /** Filled variant background */
  filledBackground: 'var(--dz-muted)',
  /** Invalid border color */
  invalidBorder: 'var(--dz-danger)',
  /** Overlay panel */
  panel: {
    background: 'var(--dz-surface)',
    foreground: 'var(--dz-foreground)',
    border: 'var(--dz-border)',
    radius: 'var(--dz-radius-md)',
    shadow: 'var(--dz-shadow-lg)',
    padding: 'var(--dz-spacing-1)',
  },
  /** Selected-value chip (multiple / checkbox modes) */
  chip: {
    background: 'var(--dz-primary-muted)',
    foreground: 'var(--dz-primary)',
    radius: 'var(--dz-radius-sm)',
  },
  /** Checkbox (checkbox mode) */
  checkbox: {
    border: 'var(--dz-border)',
    checkedBackground: 'var(--dz-primary)',
    checkedForeground: 'var(--dz-primary-foreground)',
    radius: 'var(--dz-radius-sm)',
  },
  /** Icon color */
  iconColor: 'var(--dz-muted-foreground)',
  /** Empty / no-results text */
  emptyColor: 'var(--dz-muted-foreground)',
  /** Size scale -- mirrors DzSelect (`--dz-input-*`) */
  size: {
    xs: {
      triggerHeight: 'var(--dz-input-xs-height)',
      triggerPaddingX: 'var(--dz-input-xs-padding-x)',
      triggerFontSize: 'var(--dz-input-xs-font-size)',
    },
    sm: {
      triggerHeight: 'var(--dz-input-sm-height)',
      triggerPaddingX: 'var(--dz-input-sm-padding-x)',
      triggerFontSize: 'var(--dz-input-sm-font-size)',
    },
    md: {
      triggerHeight: 'var(--dz-input-md-height)',
      triggerPaddingX: 'var(--dz-input-md-padding-x)',
      triggerFontSize: 'var(--dz-input-md-font-size)',
    },
    lg: {
      triggerHeight: 'var(--dz-input-lg-height)',
      triggerPaddingX: 'var(--dz-input-lg-padding-x)',
      triggerFontSize: 'var(--dz-input-lg-font-size)',
    },
    xl: {
      triggerHeight: 'var(--dz-input-xl-height)',
      triggerPaddingX: 'var(--dz-input-xl-padding-x)',
      triggerFontSize: 'var(--dz-input-xl-font-size)',
    },
  },
} as const
