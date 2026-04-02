/**
 * Button Component Tokens
 *
 * Component-level token mappings that reference semantic tokens.
 * Consumers can override these per-component without affecting the entire system.
 */

export const BUTTON_TOKENS: Record<string, string> = {
  '--dz-button-radius': 'var(--dz-radius-md)',
  '--dz-button-font-weight': '500',
  '--dz-button-font-family': 'var(--dz-font-sans)',
  '--dz-button-transition': 'all var(--dz-duration-fast) var(--dz-ease-default)',
  '--dz-button-focus-ring-width': '2px',
  '--dz-button-focus-ring-offset': '2px',
  '--dz-button-focus-ring-color': 'var(--dz-ring)',
  '--dz-button-disabled-opacity': '0.5',

  /* Size: xs */
  '--dz-button-xs-height': 'var(--dz-spacing-7)',
  '--dz-button-xs-padding-x': 'var(--dz-spacing-2)',
  '--dz-button-xs-font-size': 'var(--dz-text-xs)',
  '--dz-button-xs-gap': 'var(--dz-spacing-1)',

  /* Size: sm */
  '--dz-button-sm-height': 'var(--dz-spacing-8)',
  '--dz-button-sm-padding-x': 'var(--dz-spacing-3)',
  '--dz-button-sm-font-size': 'var(--dz-text-xs)',
  '--dz-button-sm-gap': 'var(--dz-spacing-1_5)',

  /* Size: md */
  '--dz-button-md-height': 'var(--dz-spacing-9)',
  '--dz-button-md-padding-x': 'var(--dz-spacing-4)',
  '--dz-button-md-font-size': 'var(--dz-text-sm)',
  '--dz-button-md-gap': 'var(--dz-spacing-2)',

  /* Size: lg */
  '--dz-button-lg-height': 'var(--dz-spacing-10)',
  '--dz-button-lg-padding-x': 'var(--dz-spacing-6)',
  '--dz-button-lg-font-size': 'var(--dz-text-sm)',
  '--dz-button-lg-gap': 'var(--dz-spacing-2)',

  /* Size: xl */
  '--dz-button-xl-height': 'var(--dz-spacing-12)',
  '--dz-button-xl-padding-x': 'var(--dz-spacing-8)',
  '--dz-button-xl-font-size': 'var(--dz-text-base)',
  '--dz-button-xl-gap': 'var(--dz-spacing-2_5)',
}
