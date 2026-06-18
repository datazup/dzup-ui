/**
 * DzInputMask -- Component-specific token mappings.
 *
 * Maps semantic design tokens to component styling (ADR-04). DzInputMask
 * deliberately reuses the DzInput token surface (`--dz-input-*`) so masked and
 * plain text fields render identically; only the slot-character color is
 * mask-specific. This follows the hybrid token model (ADR-17): shared families
 * stay centralized while component anatomy is mapped locally.
 *
 * Tokens referenced by DzInputMask.variants.ts and DzInputMask.vue.
 */
export const inputMaskTokens = {
  /** Background for the outline variant (shared with DzInput) */
  background: 'var(--dz-input-bg)',
  /** Foreground text color */
  foreground: 'var(--dz-foreground)',
  /** Border color (default state) */
  border: 'var(--dz-input-border)',
  /** Border color when focused */
  borderFocus: 'var(--dz-input-border-focus)',
  /** Placeholder text color */
  placeholder: 'var(--dz-input-placeholder)',
  /** Color of the slot character shown for unfilled positions */
  slotChar: 'var(--dz-input-placeholder)',
  /** Default border radius */
  radius: 'var(--dz-input-radius)',
  /** Font family */
  fontFamily: 'var(--dz-input-font-family)',
  /** Transition for border/ring changes */
  transition: 'var(--dz-input-transition)',
  /** Invalid border color */
  invalidBorder: 'var(--dz-danger)',
  /** Error text color */
  errorColor: 'var(--dz-danger)',
  /** Error text size */
  errorFontSize: 'var(--dz-text-xs)',
  /** Error message top spacing */
  errorGap: 'var(--dz-spacing-1)',
  /** Addon/icon color */
  addonColor: 'var(--dz-colors-neutral-400)',
} as const
