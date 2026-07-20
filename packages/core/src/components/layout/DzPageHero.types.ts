/**
 * DzPageHero -- type definitions.
 *
 * Dark gradient hero band for top-level views: eyebrow, gradient h1,
 * description, meta row, and a glass-treated actions cluster.
 *
 * @module @dzup-ui/core/components/layout/DzPageHero
 */

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzPageHero component. */
export interface DzPageHeroProps {
  /** Main heading, rendered as a level-1 DzHeading with gradient text. */
  title: string
  /** Supporting copy under the heading; the description slot overrides it. */
  description?: string
  /** Uppercase kicker above the heading. */
  eyebrow?: string
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzPageHero */
export interface DzPageHeroSlots {
  /** Rich description content; overrides the description prop. */
  description?: () => unknown
  /** Meta row under the description (chips, counts, breadcrumbs). */
  meta?: () => unknown
  /** Right-aligned action cluster; buttons get the glass treatment. */
  actions?: () => unknown
}
