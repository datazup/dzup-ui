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
  /** What must be true for a component to ENTER this tier. */
  entry: string
  /** What must be true for it to LEAVE — and where it goes next. */
  exit: string
}

/** The Storybook tag prefix that marks a status (`status:stable`, …). */
export const STATUS_TAG_PREFIX = 'status:'

/** Build the canonical tag literal for a status. */
export function statusTag(status: ComponentStatus): `status:${ComponentStatus}` {
  return `${STATUS_TAG_PREFIX}${status}`
}

/**
 * Single source of truth: tag → badge presentation + the ladder's entry/exit rules.
 *
 * **The ladder is `experimental → beta → stable`, with `deprecated` as the terminal
 * state reachable from any tier.** Each tier below states what must be true to enter
 * it and what must be true to leave it, so two reviewers reach the same tag.
 *
 * **These criteria are reviewer-applied, not machine-derived** (TASK-DS-08). What CI
 * enforces is narrower and stated here so the distinction is never blurred:
 * `validators/story-status.ts` asserts that every `Core/<Family>/<Component>` story
 * carries exactly one `status:*` tag, and that a `deprecated` component names its
 * replacement. It cannot assert that a `stable` component *deserves* to be stable —
 * that is a judgment, and the point of writing the criteria down is to make the
 * judgment reviewable rather than arbitrary.
 *
 * The one criterion that IS mechanically observable is the `beta → stable` gate:
 * every `stable` component is listed on its family Overview page and no `beta` or
 * `experimental` component is. That correlation is what the exit rule below encodes.
 */
export const STATUS_BADGES: Record<ComponentStatus, StatusMeta> = {
  experimental: {
    label: 'Experimental',
    description: 'API may change without notice. Not recommended for production.',
    color: 'var(--dz-colors-warning)',
    entry: 'The component has merged and its `.contract.spec.ts` passes. This is the '
      + 'default tier for anything newly landed — a component starts here.',
    exit: 'Its public API has been reviewed against at least one real usage (a story '
      + 'composition or an interaction test) and no open contract question remains. '
      + 'Then it becomes `beta`.',
  },
  beta: {
    label: 'Beta',
    description: 'Feature-complete and usable; API is stabilizing.',
    color: 'var(--dz-colors-info)',
    entry: 'Feature-complete against its contract, with no unresolved API question. A '
      + 'breaking change is still possible, but it must ship with a changeset and a '
      + 'migration note — that promise is what separates `beta` from `experimental`.',
    exit: 'It is listed on its family Overview page (so a reader can find it without '
      + 'knowing its name) and its axe audit reports zero violations. Then it becomes '
      + '`stable` and comes under the semver promise.',
  },
  stable: {
    label: 'Stable',
    description: 'Production-ready. Changes follow semver and the deprecation policy.',
    color: 'var(--dz-colors-success)',
    entry: 'Documented on its family Overview page, axe-clean, and its API is frozen: '
      + 'a breaking change now requires a major release.',
    exit: 'Only via `deprecated` — a stable component is never silently removed or '
      + 'demoted.',
  },
  deprecated: {
    label: 'Deprecated',
    description: 'Scheduled for removal. Migrate to the documented replacement.',
    color: 'var(--dz-colors-danger)',
    entry: 'A replacement exists and is itself at least `beta`. The story `meta` must '
      + 'carry a `migration:` string naming that replacement — CI enforces this.',
    exit: 'Removal in the next major release. Nothing leaves this tier by improving.',
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
