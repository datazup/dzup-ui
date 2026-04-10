/**
 * DzSidebar -- Component-specific token mappings.
 *
 * Maps semantic design tokens to sidebar styling (ADR-04).
 * All values reference CSS custom properties from the tokens package.
 *
 * @module @dzup-ui/core/components/navigation/DzSidebar.tokens
 */

export const sidebarTokens = {
  /** Root sidebar container tokens */
  root: {
    bg: 'var(--dz-sidebar-bg)',
    border: 'var(--dz-sidebar-border)',
    foreground: 'var(--dz-sidebar-foreground)',
    width: 'var(--dz-sidebar-width)',
    collapsedWidth: 'var(--dz-sidebar-collapsed-width)',
    transition: 'var(--dz-sidebar-transition)',
  },
  /** Sidebar item tokens */
  item: {
    radius: 'var(--dz-sidebar-item-radius)',
    paddingX: 'var(--dz-sidebar-item-padding-x)',
    paddingY: 'var(--dz-sidebar-item-padding-y)',
    gap: 'var(--dz-sidebar-item-gap)',
    fontSize: 'var(--dz-sidebar-item-font-size)',
    fontWeight: 'var(--dz-sidebar-item-font-weight)',
    hoverBg: 'var(--dz-sidebar-item-hover-bg)',
    hoverText: 'var(--dz-sidebar-item-hover-text)',
    activeBg: 'var(--dz-sidebar-item-active-bg)',
    activeText: 'var(--dz-sidebar-item-active-text)',
  },
  /** Section tokens */
  section: {
    paddingY: 'var(--dz-sidebar-section-padding-y)',
    titleFontSize: 'var(--dz-sidebar-section-title-font-size)',
    titleColor: 'var(--dz-sidebar-section-title-color)',
    titleLetterSpacing: 'var(--dz-sidebar-section-title-letter-spacing)',
  },
  /** Header tokens */
  header: {
    padding: 'var(--dz-sidebar-header-padding)',
    border: 'var(--dz-sidebar-header-border)',
    bg: 'var(--dz-sidebar-header-bg)',
  },
  /** Footer tokens */
  footer: {
    padding: 'var(--dz-sidebar-footer-padding)',
    border: 'var(--dz-sidebar-footer-border)',
    bg: 'var(--dz-sidebar-footer-bg)',
  },
  /** Mobile overlay tokens */
  overlay: {
    bg: 'var(--dz-sidebar-overlay-bg)',
    zIndex: 'var(--dz-sidebar-overlay-z-index)',
  },
} as const
