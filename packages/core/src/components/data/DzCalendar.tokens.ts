/**
 * DzCalendar -- Component-specific token mappings.
 * Maps semantic design tokens to component styling (ADR-04, ADR-17).
 *
 * The `--dz-calendar-*` custom properties are declared on the `.dz-calendar`
 * root in `styles/base.css` (mapped to semantic tokens) and consumed by
 * `DzCalendar.variants.ts`. This file documents that anatomy mapping.
 */
export const calendarTokens = {
  /** Calendar surface container */
  surface: {
    background: 'var(--dz-background)',
    foreground: 'var(--dz-foreground)',
    border: 'var(--dz-border)',
    radius: 'var(--dz-radius-md)',
    padding: 'var(--dz-spacing-3)',
  },
  /** Header (period heading + nav controls) */
  header: {
    foreground: 'var(--dz-calendar-header-foreground)',
    navButtonColor: 'var(--dz-muted-foreground)',
    navButtonHoverBackground: 'var(--dz-muted)',
    navButtonHoverForeground: 'var(--dz-foreground)',
    navButtonRadius: 'var(--dz-radius-sm)',
  },
  /** Weekday header row */
  weekday: {
    foreground: 'var(--dz-calendar-weekday-foreground)',
    fontSize: 'var(--dz-text-xs)',
  },
  /** Day cell trigger */
  cell: {
    size: 'var(--dz-calendar-cell-size)',
    radius: 'var(--dz-calendar-cell-radius)',
    foreground: 'var(--dz-calendar-cell-foreground)',
    hoverBackground: 'var(--dz-calendar-cell-hover-bg)',
    todayRing: 'var(--dz-calendar-today-ring)',
    selectedBackground: 'var(--dz-calendar-selected-bg)',
    selectedForeground: 'var(--dz-calendar-selected-foreground)',
    rangeBackground: 'var(--dz-calendar-range-bg)',
    outsideForeground: 'var(--dz-calendar-outside-foreground)',
    outsideOpacity: 'var(--dz-calendar-outside-opacity)',
    disabledOpacity: 'var(--dz-calendar-disabled-opacity)',
    transition: 'var(--dz-transition-fast)',
    focusRingColor: 'var(--dz-control-focus-ring-color)',
  },
} as const
