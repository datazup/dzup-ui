/**
 * DzImageComparison -- Component-specific token mappings.
 *
 * Maps semantic design tokens to the before/after slider anatomy (ADR-04).
 * The divider, handle grip, and label chip colors are exposed as local custom
 * properties so consumers can theme them:
 *   --dz-image-comparison-divider-color  -- the divider line color
 *   --dz-image-comparison-divider-width  -- the divider line thickness
 *   --dz-image-comparison-handle-size    -- the grip diameter
 *   --dz-image-comparison-handle-bg      -- the grip background
 *   --dz-image-comparison-handle-color   -- the grip icon color
 *   --dz-image-comparison-label-bg       -- the caption chip background
 *   --dz-image-comparison-label-color    -- the caption chip text color
 *
 * @module @dzup-ui/core/components/media/DzImageComparison.tokens
 */

export const imageComparisonTokens = {
  /** Divider line between the two images */
  divider: {
    color: 'var(--dz-image-comparison-divider-color, var(--dz-background))',
    width: 'var(--dz-image-comparison-divider-width, 2px)',
  },

  /** Draggable grip rendered on the divider */
  handle: {
    size: 'var(--dz-image-comparison-handle-size, var(--dz-spacing-9, 36px))',
    background: 'var(--dz-image-comparison-handle-bg, var(--dz-background))',
    color: 'var(--dz-image-comparison-handle-color, var(--dz-foreground))',
  },

  /** Caption chip overlaid on each image */
  label: {
    background: 'var(--dz-image-comparison-label-bg, color-mix(in oklab, var(--dz-foreground) 70%, transparent))',
    color: 'var(--dz-image-comparison-label-color, var(--dz-background))',
  },
} as const
