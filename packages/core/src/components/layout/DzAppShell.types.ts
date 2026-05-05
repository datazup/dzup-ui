/**
 * DzAppShell -- type definitions.
 *
 * @module @dzup-ui/core/components/layout/DzAppShell.types
 */

/** Props accepted by the DzAppShell component. */
export interface DzAppShellProps {
  /** Optional HTML id attribute for the root element. */
  id?: string
  /** Accessible label for the shell landmark. */
  ariaLabel?: string
  /** CSS width of the expanded sidebar. @default '16rem' */
  sidebarWidth?: string
  /** CSS width of the collapsed sidebar. @default '4rem' */
  sidebarCollapsedWidth?: string
  /** CSS height of the header bar. @default '4rem' */
  headerHeight?: string
  /** Whether the sidebar region is visible. @default true */
  hasSidebar?: boolean
  /** Whether the header region is visible. @default true */
  hasHeader?: boolean
}

/** Named slots exposed by DzAppShell. */
export interface DzAppShellSlots {
  /** Sidebar content (navigation, branding, etc.). */
  sidebar?: () => unknown
  /** Header content (breadcrumbs, user menu, etc.). */
  header?: () => unknown
  /** Main content area (default slot). */
  default?: () => unknown
}
