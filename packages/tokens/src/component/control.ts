/**
 * Control Component Tokens
 *
 * Shared tokens for non-text interactive controls: checkbox, radio, switch,
 * slider thumbs, calendar cells, and similar focusable selection primitives.
 */

export const CONTROL_TOKENS: Record<string, string> = {
  '--dz-control-transition': 'all var(--dz-duration-fast) var(--dz-ease-default)',
  /**
   * WCAG 2.2 SC 2.5.8 Target Size (Minimum): a pointer target is at least
   * 24x24 CSS px. A token rather than a literal because the floor is a policy,
   * not a component detail -- raising it (SC 2.5.5 Target Size (Enhanced) asks
   * for 44px at AAA) has to be one edit, and a component may not lower it.
   * Consumed through the `.dz-target-min` / `.dz-target-min-tight` utilities.
   */
  '--dz-control-target-min': '24px',
  '--dz-control-focus-ring-width': '2px',
  '--dz-control-focus-ring-color': 'var(--dz-ring)',
  '--dz-control-focus-ring-offset': '2px',
  '--dz-control-disabled-opacity': '0.5',
}
