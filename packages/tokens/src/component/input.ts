/**
 * Input Component Tokens
 *
 * Shared tokens for all input-like components: text input, textarea, select trigger, etc.
 */

export const INPUT_TOKENS: Record<string, string> = {
  '--dz-input-radius': 'var(--dz-radius-md)',
  '--dz-input-font-size': 'var(--dz-text-sm)',
  '--dz-input-font-family': 'var(--dz-font-sans)',
  '--dz-input-transition': 'border-color var(--dz-duration-fast) var(--dz-ease-default), box-shadow var(--dz-duration-fast) var(--dz-ease-default)',
  '--dz-input-focus-ring-width': '1px',
  '--dz-input-focus-ring-color': 'var(--dz-ring)',
  '--dz-input-focus-ring-offset': '1px',
  '--dz-input-disabled-opacity': '0.5',

  /* Size: sm */
  '--dz-input-sm-height': 'var(--dz-spacing-8)',
  '--dz-input-sm-padding-x': 'var(--dz-spacing-2_5)',
  '--dz-input-sm-font-size': 'var(--dz-text-xs)',

  /* Size: md */
  '--dz-input-md-height': 'var(--dz-spacing-9)',
  '--dz-input-md-padding-x': 'var(--dz-spacing-3)',
  '--dz-input-md-font-size': 'var(--dz-text-sm)',

  /* Size: lg */
  '--dz-input-lg-height': 'var(--dz-spacing-10)',
  '--dz-input-lg-padding-x': 'var(--dz-spacing-3_5)',
  '--dz-input-lg-font-size': 'var(--dz-text-base)',
}
