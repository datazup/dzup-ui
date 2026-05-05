/**
 * DzAccordion -- Component-specific token mappings.
 *
 * Maps semantic design tokens to accordion components (ADR-04).
 * All values reference CSS custom properties from the tokens package.
 *
 * @module @dzup-ui/core/components/data/DzAccordion.tokens
 */

export const accordionTokens = {
  /** Item border (default and bordered variants) */
  item: {
    border: 'var(--dz-border)',
  },
  /** Bordered variant container */
  bordered: {
    border: 'var(--dz-border)',
    radius: 'var(--dz-radius-md)',
  },
  /** Separated variant item */
  separated: {
    border: 'var(--dz-border)',
    radius: 'var(--dz-radius-md)',
    gap: 'var(--dz-spacing-2)',
  },
  /** Trigger button */
  trigger: {
    transition: 'var(--dz-transition-fast)',
    focusRing: 'var(--dz-control-focus-ring-color)',
  },
  /** Content panel */
  content: {
    foreground: 'var(--dz-muted-foreground)',
  },
  /** Size scale */
  size: {
    xs: {
      triggerPaddingY: 'var(--dz-spacing-1-5)',
      triggerFontSize: 'var(--dz-text-xs)',
      contentPaddingBottom: 'var(--dz-spacing-1-5)',
      contentFontSize: 'var(--dz-text-xs)',
    },
    sm: {
      triggerPaddingY: 'var(--dz-spacing-2)',
      triggerFontSize: 'var(--dz-text-sm)',
      contentPaddingBottom: 'var(--dz-spacing-2)',
      contentFontSize: 'var(--dz-text-sm)',
    },
    md: {
      triggerPaddingY: 'var(--dz-spacing-4)',
      triggerFontSize: 'var(--dz-text-sm)',
      contentPaddingBottom: 'var(--dz-spacing-4)',
      contentFontSize: 'var(--dz-text-sm)',
    },
    lg: {
      triggerPaddingY: 'var(--dz-spacing-5)',
      triggerFontSize: 'var(--dz-text-base)',
      contentPaddingBottom: 'var(--dz-spacing-5)',
      contentFontSize: 'var(--dz-text-base)',
    },
    xl: {
      triggerPaddingY: 'var(--dz-spacing-6)',
      triggerFontSize: 'var(--dz-text-lg)',
      contentPaddingBottom: 'var(--dz-spacing-6)',
      contentFontSize: 'var(--dz-text-lg)',
    },
  },
} as const
