/**
 * Component status taxonomy (TASK-0.13).
 *
 * A component's maturity is declared as a Storybook **tag** on its `meta`, e.g.
 * `tags: ['autodocs', 'status:stable']`. This module is the single source that
 * maps a `status:*` tag to its label/description/color, consumed by the docs
 * header badge and the sidebar badge renderer.
 */

export type ComponentStatus = 'experimental' | 'beta' | 'stable' | 'deprecated'

export interface StatusMeta {
  /** Human-readable label rendered in the badge. */
  label: string
  /** One-line meaning, shown as the badge tooltip / docs caption. */
  description: string
  /** Token-driven accent used for the badge background/border. */
  color: string
}

/** The Storybook tag prefix that marks a status (`status:stable`, …). */
export const STATUS_TAG_PREFIX = 'status:'

/** Build the canonical tag literal for a status. */
export function statusTag(status: ComponentStatus): `status:${ComponentStatus}` {
  return `${STATUS_TAG_PREFIX}${status}`
}

/** Single source of truth: tag → badge presentation. */
export const STATUS_BADGES: Record<ComponentStatus, StatusMeta> = {
  experimental: {
    label: 'Experimental',
    description: 'API may change without notice. Not recommended for production.',
    color: 'var(--dz-colors-warning)',
  },
  beta: {
    label: 'Beta',
    description: 'Feature-complete and usable; API is stabilizing.',
    color: 'var(--dz-colors-info)',
  },
  stable: {
    label: 'Stable',
    description: 'Production-ready. Changes follow semver and the deprecation policy.',
    color: 'var(--dz-colors-success)',
  },
  deprecated: {
    label: 'Deprecated',
    description: 'Scheduled for removal. Migrate to the documented replacement.',
    color: 'var(--dz-colors-danger)',
  },
}

/** Extract the `ComponentStatus` from a list of Storybook tags, if present. */
export function statusFromTags(tags: readonly string[] | undefined): ComponentStatus | undefined {
  const tag = tags?.find(t => t.startsWith(STATUS_TAG_PREFIX))
  if (!tag)
    return undefined
  const value = tag.slice(STATUS_TAG_PREFIX.length) as ComponentStatus
  return value in STATUS_BADGES ? value : undefined
}
