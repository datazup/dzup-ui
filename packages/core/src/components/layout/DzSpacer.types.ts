/**
 * DzSpacer -- type definitions.
 *
 * Flexible space filler component for layout spacing.
 *
 * @module @dzup-ui/core/components/layout/DzSpacer
 */

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Spacer size options */
export type SpacerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'auto'

/** Props for the DzSpacer component */
export interface DzSpacerProps {
  /** Size of the spacer. 'auto' uses flex: 1 to fill available space */
  size?: SpacerSize
}

// ---------------------------------------------------------------------------
// Slots (none)
// ---------------------------------------------------------------------------

/** DzSpacer has no slots */
export type DzSpacerSlots = Record<string, never>
