/**
 * DzListbox -- Component-specific token mappings.
 * Maps semantic design tokens to component styling (ADR-04).
 *
 * Wraps Reka UI Listbox with an always-visible, scrollable option list.
 * `--dz-listbox-*` indirections fall back to global semantic tokens so the
 * component themes correctly without requiring a dedicated token layer.
 */
export const listboxTokens = {
  /** Container background */
  background: 'var(--dz-listbox-bg, var(--dz-background))',
  /** Container foreground text */
  foreground: 'var(--dz-listbox-fg, var(--dz-foreground))',
  /** Container border color */
  border: 'var(--dz-listbox-border, var(--dz-border))',
  /** Container border radius */
  radius: 'var(--dz-listbox-radius, var(--dz-radius-md))',
  /** Transition */
  transition: 'var(--dz-transition-fast)',
  /** Active (highlighted) option ring color */
  activeRing: 'var(--dz-listbox-active-ring, var(--dz-ring))',
  /** Invalid border color */
  invalidBorder: 'var(--dz-danger)',
  /** Filter input placeholder */
  placeholder: 'var(--dz-muted-foreground)',
  /** Empty state text */
  emptyColor: 'var(--dz-muted-foreground)',
  /** Group label text */
  groupLabelColor: 'var(--dz-muted-foreground)',
  /** Option styling */
  item: {
    foreground: 'var(--dz-foreground)',
    radius: 'var(--dz-radius-sm)',
    /** Highlighted / active background */
    activeBackground: 'var(--dz-listbox-item-active-bg, var(--dz-muted))',
    /** Selected background */
    selectedBackground: 'var(--dz-listbox-item-selected-bg, var(--dz-primary-muted))',
    /** Selected foreground */
    selectedForeground: 'var(--dz-listbox-item-selected-fg, var(--dz-primary))',
  },
  /** Check indicator color */
  checkIconColor: 'var(--dz-primary)',
  /** Size scale -- option height/padding/font */
  size: {
    xs: {
      itemPaddingX: 'var(--dz-spacing-2)',
      itemPaddingY: 'var(--dz-spacing-1)',
      itemFontSize: 'var(--dz-text-xs)',
      filterHeight: 'var(--dz-input-xs-height)',
    },
    sm: {
      itemPaddingX: 'var(--dz-spacing-2)',
      itemPaddingY: 'var(--dz-spacing-1_5)',
      itemFontSize: 'var(--dz-text-sm)',
      filterHeight: 'var(--dz-input-sm-height)',
    },
    md: {
      itemPaddingX: 'var(--dz-spacing-2_5)',
      itemPaddingY: 'var(--dz-spacing-1_5)',
      itemFontSize: 'var(--dz-text-sm)',
      filterHeight: 'var(--dz-input-md-height)',
    },
    lg: {
      itemPaddingX: 'var(--dz-spacing-3)',
      itemPaddingY: 'var(--dz-spacing-2)',
      itemFontSize: 'var(--dz-text-base)',
      filterHeight: 'var(--dz-input-lg-height)',
    },
    xl: {
      itemPaddingX: 'var(--dz-spacing-3)',
      itemPaddingY: 'var(--dz-spacing-2_5)',
      itemFontSize: 'var(--dz-text-lg)',
      filterHeight: 'var(--dz-input-xl-height)',
    },
  },
} as const
