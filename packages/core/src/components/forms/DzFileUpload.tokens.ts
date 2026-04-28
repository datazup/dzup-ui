/**
 * DzFileUpload -- Component-specific token mappings.
 * Maps semantic design tokens to component styling (ADR-04).
 *
 * Built from scratch with drop zone, file list, and
 * per-file item display.
 */
export const fileUploadTokens = {
  /** Root gap between dropzone and file list */
  gap: 'var(--dz-spacing-2)',
  /** Drop zone */
  dropzone: {
    background: 'var(--dz-background)',
    border: 'var(--dz-border)',
    radius: 'var(--dz-radius-lg)',
    hoverBorder: 'var(--dz-primary)',
    hoverBackground: 'var(--dz-muted)',
    focusRingColor: 'var(--dz-input-focus-ring-color)',
    focusRingWidth: 'var(--dz-input-focus-ring-width)',
    focusRingOffset: 'var(--dz-input-focus-ring-offset)',
    invalidBorder: 'var(--dz-danger)',
    /** Drag-over active state */
    dragOverBorder: 'var(--dz-primary)',
    dragOverBackground: 'var(--dz-muted)',
  },
  /** Drop zone icon and text colors */
  iconColor: 'var(--dz-muted-foreground)',
  labelForeground: 'var(--dz-foreground)',
  labelFontSize: 'var(--dz-text-sm)',
  hintColor: 'var(--dz-muted-foreground)',
  hintFontSize: 'var(--dz-text-xs)',
  /** File list item */
  fileItem: {
    background: 'var(--dz-background)',
    border: 'var(--dz-border)',
    radius: 'var(--dz-radius-md)',
    foreground: 'var(--dz-foreground)',
    paddingX: 'var(--dz-spacing-3)',
    paddingY: 'var(--dz-spacing-2)',
    fontSize: 'var(--dz-text-sm)',
  },
  /** File size text */
  fileSizeColor: 'var(--dz-muted-foreground)',
  fileSizeFontSize: 'var(--dz-text-xs)',
  /** Remove button */
  removeButton: {
    color: 'var(--dz-muted-foreground)',
    hoverColor: 'var(--dz-danger)',
    radius: 'var(--dz-radius-sm)',
    focusRingColor: 'var(--dz-button-focus-ring-color)',
  },
  /** Disabled state */
  disabledOpacity: 'var(--dz-input-disabled-opacity)',
  /** Error display */
  errorColor: 'var(--dz-danger)',
  errorFontSize: 'var(--dz-text-xs)',
  /** Size scale -- dropzone padding per size */
  size: {
    xs: { dropzonePadding: 'var(--dz-spacing-3)' },
    sm: { dropzonePadding: 'var(--dz-spacing-4)' },
    md: { dropzonePadding: 'var(--dz-spacing-6)' },
    lg: { dropzonePadding: 'var(--dz-spacing-8)' },
    xl: { dropzonePadding: 'var(--dz-spacing-10)' },
  },
} as const
