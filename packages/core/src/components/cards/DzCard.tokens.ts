/**
 * DzCard — Component-specific token mappings.
 *
 * Documents which design tokens are consumed by DzCard and its
 * sub-parts (DzCardHeader, DzCardBody, DzCardFooter).
 * This file serves as the contract between the token system and the component.
 */

/** Token references used by DzCard */
export const cardTokens = {
  /** Border radius for the card container */
  radius: 'var(--dz-card-radius)',
  /** Default internal padding (used by sub-parts) */
  padding: 'var(--dz-card-padding)',
  /** Background color */
  background: 'var(--dz-card)',
  /** Text color */
  foreground: 'var(--dz-card-foreground)',
  /** Border color for the outlined variant */
  borderColor: 'var(--dz-card-border-color)',
  /** Card-level transition timing */
  transition: {
    duration: 'var(--dz-duration-fast)',
    easing: 'var(--dz-ease-default)',
  },

  /** Shadow per visual variant */
  shadow: {
    elevated: 'var(--dz-shadow-md)',
    hover: 'var(--dz-shadow-lg)',
  },

  /** Focus ring for clickable cards */
  focus: {
    ringColor: 'var(--dz-ring)',
  },

  /** Padding variants */
  paddingScale: {
    none: '0',
    sm: 'var(--dz-spacing-3)',
    md: 'var(--dz-card-padding)',
    lg: 'var(--dz-spacing-8)',
  },

  /** Sub-part spacing */
  subParts: {
    innerGap: 'var(--dz-spacing-2)',
  },
} as const
