/**
 * Canonical type definitions shared across all component contracts.
 * These enforce Contract Spec v1 taxonomy.
 *
 * @module @dzup-ui/contracts/canonical
 */

// ---------------------------------------------------------------------------
// Size & Tone
// ---------------------------------------------------------------------------

/** Canonical size values -- every sized component must use this exact union */
export type CanonicalSize = 'icon' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/** Canonical semantic tone values */
export type CanonicalTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info'

/** Canonical orientation for components that support horizontal/vertical layout */
export type Orientation = 'horizontal' | 'vertical'

// ---------------------------------------------------------------------------
// Per-family variant taxonomies (frozen per ADR-02)
// ---------------------------------------------------------------------------

/** Button-like family: DzButton, DzIconButton, DzToggleButton */
export type ButtonVariant = 'solid' | 'outline' | 'ghost' | 'text' | 'link'

/** Surface / Card-like family: DzCard */
export type CardVariant = 'elevated' | 'outlined' | 'flat'

/** Field-like family: DzInput, DzTextarea, DzSelect */
export type InputVariant = 'outline' | 'filled' | 'underlined'

/** Alert-like family: DzAlert, DzCallout */
export type AlertVariant = 'filled' | 'outline' | 'subtle' | 'ghost'

/** Badge-like family: DzBadge, DzTag */
export type BadgeVariant = 'solid' | 'outline' | 'subtle'

/** Tabs family: DzTabs */
export type TabsVariant = 'line' | 'enclosed' | 'pills'

/** Progress family: DzProgress */
export type ProgressVariant = 'bar' | 'circular'

/** Chip family: DzChip */
export type ChipVariant = 'solid' | 'outline' | 'subtle'

/** Toolbar family: DzToolbar */
export type ToolbarVariant = 'flat' | 'outlined' | 'elevated'

/** Panel family: DzPanel */
export type PanelVariant = 'outlined' | 'elevated' | 'legend'

// ---------------------------------------------------------------------------
// Union helpers
// ---------------------------------------------------------------------------

/**
 * Union of every family variant type.
 * Useful for generic utilities that accept any variant string.
 */
export type AnyVariant =
  | ButtonVariant
  | CardVariant
  | InputVariant
  | AlertVariant
  | BadgeVariant
  | TabsVariant
  | ProgressVariant
  | ChipVariant
  | ToolbarVariant
  | PanelVariant
