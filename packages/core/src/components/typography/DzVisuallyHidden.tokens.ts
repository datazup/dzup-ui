/**
 * DzVisuallyHidden — Component-specific token mappings.
 *
 * Intentionally empty.
 *
 * DzVisuallyHidden is a pure accessibility/structural primitive: it has no
 * visual surface (no color, typography, spacing, radius, or elevation that
 * varies by theme). Its entire job is to remove content from the visual layer
 * while preserving it in the accessibility tree via the fixed clip technique in
 * DzVisuallyHidden.variants.ts. Those geometry values (1px, clip-rect) are
 * invariant constants, not themeable tokens, so no `--dz-*` tokens are defined.
 *
 * This stub is kept to preserve the standard per-component file layout (ADR
 * file-structure convention) and to document the deliberate omission.
 */
export const visuallyHiddenTokens = {} as const
