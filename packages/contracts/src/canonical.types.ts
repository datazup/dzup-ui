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

/**
 * Canonical information-density values.
 *
 * `density` is the vertical-rhythm axis: row height, cell padding, tile
 * height. It is ORTHOGONAL to `CanonicalSize`, which is the type-scale /
 * control-footprint axis. A `size="lg"` grid may legitimately be
 * `density="compact"` (large type, tight rows) and vice versa.
 *
 * `normal` — not `default` — is the middle value: `default` names a position
 * in a fallback chain rather than a visual property, and reads wrongly next
 * to `compact` / `comfortable`, which are both descriptive.
 */
export type CanonicalDensity = 'compact' | 'normal' | 'comfortable'

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
export type AnyVariant
  = | ButtonVariant
    | CardVariant
    | InputVariant
    | AlertVariant
    | BadgeVariant
    | TabsVariant
    | ProgressVariant
    | ChipVariant
    | ToolbarVariant
    | PanelVariant
