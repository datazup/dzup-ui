/**
 * DzMention -- Component-specific token mappings.
 * Maps semantic design tokens to component styling (ADR-04).
 *
 * The text control reuses the shared `--dz-input-*` family so the field sits
 * flush with other form controls; the suggestion menu reuses the shared menu
 * surface (background, shadow, muted hover, primary-muted active) so it matches
 * DzMenu / DzDropdownMenu.
 */
export const mentionTokens = {
  /** Text control (shared input family) */
  control: {
    background: 'var(--dz-input-bg)',
    foreground: 'var(--dz-foreground)',
    border: 'var(--dz-input-border)',
    borderFocus: 'var(--dz-input-border-focus)',
    placeholder: 'var(--dz-input-placeholder)',
    transition: 'var(--dz-input-transition)',
    invalidBorder: 'var(--dz-danger)',
    disabledOpacity: 'var(--dz-input-disabled-opacity)',
  },
  /** Suggestion menu surface (shared menu family) */
  menu: {
    surface: 'var(--dz-background)',
    border: 'var(--dz-border)',
    radius: 'var(--dz-radius-lg)',
    shadow: 'var(--dz-shadow-lg)',
  },
  /** Suggestion option cells */
  option: {
    foreground: 'var(--dz-foreground)',
    radius: 'var(--dz-radius-sm)',
    hoverBackground: 'var(--dz-muted)',
    activeBackground: 'var(--dz-primary-muted)',
    activeForeground: 'var(--dz-primary)',
    disabledOpacity: 'var(--dz-input-disabled-opacity)',
  },
  /** Helper / empty / loading copy */
  helper: {
    foreground: 'var(--dz-muted-foreground)',
  },
} as const
