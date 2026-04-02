/**
 * DzButtonGroup — Component-specific token mappings.
 *
 * DzButtonGroup is a layout wrapper that provides context to child buttons.
 * Its own styling is minimal; it primarily influences child DzButton tokens
 * through provide/inject.
 */

/** Token references used by DzButtonGroup */
export const buttonGroupTokens = {
  /**
   * DzButtonGroup itself has no unique visual tokens.
   * Child buttons inherit their styling from the DzButton token tier.
   * The group removes inner border-radius and adjacent borders
   * via CSS selectors, which reference these child tokens:
   */
  childRadius: 'var(--dz-button-radius)',
  childBorder: 'var(--dz-border)',
} as const
