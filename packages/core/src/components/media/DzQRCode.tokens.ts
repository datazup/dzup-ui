/**
 * DzQRCode -- Component-specific token mappings.
 *
 * Maps semantic design tokens to the QR renderer (ADR-04). The QR module and
 * background colors default to these tokens but can be overridden via props.
 *
 * @module @dzup-ui/core/components/media/DzQRCode.tokens
 */

export const qrCodeTokens = {
  /** Default module (foreground) color. */
  color: 'var(--dz-foreground)',
  /** Default background color. */
  background: 'var(--dz-background)',
  /** Container border + radius. */
  container: {
    border: 'var(--dz-border)',
    radius: 'var(--dz-radius-md)',
  },
  /** Centered logo backdrop (keeps the logo legible over modules). */
  logo: {
    background: 'var(--dz-background)',
    radius: 'var(--dz-radius-sm)',
  },
  /** Status overlay scrim + text. */
  overlay: {
    background: 'var(--dz-background)',
    foreground: 'var(--dz-muted-foreground)',
  },
} as const
