/**
 * DzStatCard — Type definitions for the statistics display card.
 *
 * @module @dzup-ui/core/components/cards/DzStatCard
 */

import type { Component } from 'vue'

/** Trend direction */
export type StatTrend = 'up' | 'down' | 'neutral'

/** Card variant */
export type StatCardVariant = 'elevated' | 'outlined'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzStatCard component */
export interface DzStatCardProps {
  /** Stat label/title */
  title: string
  /** Primary value to display */
  value: string | number
  /** Additional description text */
  description?: string
  /** Icon component */
  icon?: Component
  /** Trend direction */
  trend?: StatTrend
  /** Trend value text (e.g., "+12%") */
  trendValue?: string
  /** Visual style variant */
  variant?: StatCardVariant
  /** Unique element ID */
  id?: string
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzStatCard */
export interface DzStatCardSlots {
  /** Custom icon content */
  icon?: () => unknown
  /** Custom value display */
  value?: () => unknown
  /** Custom footer content */
  footer?: () => unknown
}
