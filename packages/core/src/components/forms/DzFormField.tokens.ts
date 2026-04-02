/**
 * DzFormField -- Component-specific token mappings.
 * Maps semantic design tokens to component styling (ADR-04).
 *
 * Compound wrapper that provides form field context (ID, validation,
 * ARIA relationships) to child sub-parts: DzFormLabel,
 * DzFormDescription, DzFormMessage.
 */
export const formFieldTokens = {
  /** Gap between children (label, input, description, message) */
  gap: 'var(--dz-spacing-1_5)',
  /** Label sub-part */
  label: {
    foreground: 'var(--dz-foreground)',
    fontSize: 'var(--dz-text-sm)',
    fontWeight: '500',
    requiredIndicatorColor: 'var(--dz-danger)',
    requiredIndicatorGap: 'var(--dz-spacing-0_5)',
  },
  /** Description sub-part */
  description: {
    foreground: 'var(--dz-muted-foreground)',
    fontSize: 'var(--dz-text-xs)',
  },
  /** Message sub-part (error or helper) */
  message: {
    fontSize: 'var(--dz-text-xs)',
    errorColor: 'var(--dz-danger)',
    helperColor: 'var(--dz-muted-foreground)',
  },
} as const
