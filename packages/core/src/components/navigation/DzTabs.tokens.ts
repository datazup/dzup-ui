/**
 * DzTabs -- Component-specific token mappings.
 *
 * Maps semantic design tokens to tabbed interface styling (ADR-04).
 * Covers line, enclosed, and pills variants across all size tiers.
 * All values reference CSS custom properties from the tokens package.
 *
 * @module @dzup-ui/core/components/navigation/DzTabs.tokens
 */

export const tabsTokens = {
  /** Tab list border (line and enclosed variants) */
  list: {
    borderColor: 'var(--dz-border)',
    textColor: 'var(--dz-muted-foreground)',
  },
  /** Tab trigger styling */
  trigger: {
    /** Active trigger text color */
    activeColor: 'var(--dz-foreground)',
    /** Hover text color */
    hoverColor: 'var(--dz-foreground)',
    /** Focus ring color */
    focusRing: 'var(--dz-control-focus-ring-color)',
    /** Disabled state opacity */
    disabledOpacity: 'var(--dz-control-disabled-opacity)',
    transition: 'var(--dz-transition-fast)',
  },
  /** Line variant tokens */
  line: {
    /** Active indicator color (bottom/right border) */
    indicatorColor: 'var(--dz-primary)',
  },
  /** Enclosed variant tokens */
  enclosed: {
    /** Active tab border */
    borderColor: 'var(--dz-border)',
    /** Active tab background */
    activeBackground: 'var(--dz-background)',
    radius: 'var(--dz-radius-md)',
  },
  /** Pills variant tokens */
  pills: {
    /** Gap between pill triggers */
    gap: 'var(--dz-spacing-1)',
    /** Active pill background */
    activeBackground: 'var(--dz-primary)',
    /** Active pill text color */
    activeForeground: 'var(--dz-primary-foreground)',
    /** Active pill hover background */
    activeHoverBackground: 'var(--dz-primary-hover)',
    /** Inactive pill hover background */
    hoverBackground: 'var(--dz-muted)',
    radius: 'var(--dz-radius-md)',
  },
  /** Content area */
  content: {
    marginTop: 'var(--dz-spacing-2)',
    focusRing: 'var(--dz-control-focus-ring-color)',
  },
  /** Size scale for trigger height, padding, and font size */
  size: {
    xs: {
      height: 'var(--dz-button-xs-height)',
      paddingX: 'var(--dz-spacing-2)',
      fontSize: 'var(--dz-text-xs)',
    },
    sm: {
      height: 'var(--dz-button-sm-height)',
      paddingX: 'var(--dz-spacing-3)',
      fontSize: 'var(--dz-text-sm)',
    },
    md: {
      height: 'var(--dz-button-md-height)',
      paddingX: 'var(--dz-spacing-4)',
      fontSize: 'var(--dz-text-sm)',
    },
    lg: {
      height: 'var(--dz-button-lg-height)',
      paddingX: 'var(--dz-spacing-6)',
      fontSize: 'var(--dz-text-base)',
    },
    xl: {
      height: 'var(--dz-button-xl-height)',
      paddingX: 'var(--dz-spacing-8)',
      fontSize: 'var(--dz-text-lg)',
    },
  },
} as const
