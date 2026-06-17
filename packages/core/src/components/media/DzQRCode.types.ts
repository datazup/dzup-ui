/**
 * DzQRCode — Type definitions for the QR code renderer.
 *
 * @module @dzup-ui/core/components/media/DzQRCode
 */

import type { BaseAccessibilityProps } from '@dzup-ui/contracts'

// ---------------------------------------------------------------------------
// Data types
// ---------------------------------------------------------------------------

/**
 * QR error-correction level. Higher levels tolerate more damage/occlusion
 * (useful when a centered logo covers part of the code) at the cost of density.
 */
export type DzQRErrorLevel = 'L' | 'M' | 'Q' | 'H'

/** Rendering / lifecycle status of the QR code. */
export type DzQRStatus = 'active' | 'loading' | 'expired'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzQRCode component */
export interface DzQRCodeProps extends BaseAccessibilityProps {
  /** Value to encode (URL, token, contact string, …). Required. */
  value: string
  /** Rendered size in pixels (width and height). */
  size?: number
  /** Error-correction level. */
  errorLevel?: DzQRErrorLevel
  /** Foreground (module) color. Defaults to the `--dz-foreground` token. */
  color?: string
  /** Background color. Defaults to the `--dz-background` token. */
  background?: string
  /**
   * Quiet-zone size in modules around the code (per the QR spec the minimum
   * is 4).
   */
  margin?: number
  /**
   * URL of a logo/icon image rendered centered over the code. Ignored when the
   * `#logo` slot is provided. Prefer `errorLevel="H"` when using a logo.
   */
  icon?: string
  /** Lifecycle status — drives the loading/expired overlays. */
  status?: DzQRStatus
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzQRCode */
export interface DzQRCodeEmits {
  /** Emitted when the refresh action in the expired overlay is activated. */
  refresh: []
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzQRCode */
export interface DzQRCodeSlots {
  /** Custom centered logo content (overrides the `icon` prop). */
  logo?: () => unknown
  /** Custom content for the expired overlay (e.g. a refresh action). */
  expired?: () => unknown
}
