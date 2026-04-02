/**
 * DzSwitch -- Component-specific token mappings.
 * Maps semantic design tokens to component styling (ADR-04).
 *
 * Wraps Reka UI SwitchRoot + SwitchThumb with track,
 * thumb, and label styling.
 */
export const switchTokens = {
  /** Root label gap between track and text */
  gap: 'var(--dz-spacing-2)',
  /** Disabled state opacity */
  disabledOpacity: 'var(--dz-button-disabled-opacity)',
  /** Track (slider rail) */
  track: {
    background: 'var(--dz-muted)',
    checkedBackground: 'var(--dz-primary)',
    transition: 'var(--dz-transition-fast)',
    focusRingColor: 'var(--dz-primary)',
    focusRingWidth: '2px',
    focusRingOffset: '2px',
  },
  /** Thumb (slider knob) */
  thumb: {
    background: 'var(--dz-background)',
    shadow: 'var(--dz-shadow-sm)',
  },
  /** Label text */
  label: {
    foreground: 'var(--dz-foreground)',
  },
  /** Size scale -- track dimensions, thumb size, label font-size */
  size: {
    xs: {
      trackHeight: '1rem',
      trackWidth: '1.75rem',
      thumbSize: '0.75rem',
      thumbTranslate: '0.75rem',
      labelFontSize: 'var(--dz-text-xs)',
    },
    sm: {
      trackHeight: '1.25rem',
      trackWidth: '2.25rem',
      thumbSize: '1rem',
      thumbTranslate: '1rem',
      labelFontSize: 'var(--dz-text-sm)',
    },
    md: {
      trackHeight: '1.5rem',
      trackWidth: '2.75rem',
      thumbSize: '1.25rem',
      thumbTranslate: '1.25rem',
      labelFontSize: 'var(--dz-text-sm)',
    },
    lg: {
      trackHeight: '1.75rem',
      trackWidth: '3.25rem',
      thumbSize: '1.5rem',
      thumbTranslate: '1.5rem',
      labelFontSize: 'var(--dz-text-base)',
    },
    xl: {
      trackHeight: '2rem',
      trackWidth: '3.75rem',
      thumbSize: '1.75rem',
      thumbTranslate: '1.75rem',
      labelFontSize: 'var(--dz-text-lg)',
    },
  },
} as const
