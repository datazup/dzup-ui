/**
 * The Storybook manager's colour literals, each tied to the token it mirrors.
 *
 * **Why literals at all.** The manager UI (sidebar, toolbar, brand slot) renders
 * OUTSIDE the preview iframe, so it never loads `@dzup-ui/tokens/css` and cannot
 * read a single `--dz-*` custom property. `create()` from `storybook/theming`
 * also wants real colour values, not `var()` references. The copies are therefore
 * unavoidable.
 *
 * **Why this file exists separately from `manager.ts`.** The copies being
 * unavoidable does not make the DRIFT unavoidable. Previously the hexes sat
 * inline in `manager.ts` under a comment asking the next person to "keep these in
 * sync with packages/tokens/dist/tokens.css if the ramp moves" — and nothing
 * checked that they had. One had not: `neutral.600` was `#717171`, a flat grey,
 * where the token resolves to `#585b60`, the hue-260 tinted grey the rest of the
 * ramp uses. It had been the manager's `barTextColor` in light mode for months.
 *
 * Splitting the palette out of `manager.ts` lets a plain Node spec import it
 * (`manager.ts` pulls in React and `storybook/manager-api`, which a spec cannot
 * load), so `manager-brand-palette.spec.ts` in `@dzup-ui/tooling` can recompute
 * every value below from `tokens.css` and fail when one drifts.
 *
 * **Adding a colour here:** give it the `token` it mirrors and let the spec tell
 * you the hex. Do not eyeball it.
 */

/** One manager literal and the design token it is a copy of. */
export interface BrandColor {
  /** The `#rrggbb` value baked into the manager theme. Lowercase. */
  readonly hex: string
  /** The `--dz-*` custom property in `tokens.css` this must equal. */
  readonly token: string
}

const color = (hex: string, token: string): BrandColor => ({ hex, token })

/**
 * Brand blues. `500` is the anchor used for the logo badge and `colorPrimary` in
 * both themes; `600`/`400` are the light/dark accent pair.
 */
export const BRAND_COLORS = {
  base: color('#0766ee', '--dz-colors-primary-500'),
  strong: color('#004ecb', '--dz-colors-primary-600'),
  light: color('#5195ff', '--dz-colors-primary-400'),
} as const

/**
 * Greys, hue 260 at ~0 chroma — the same ramp the components use, so the chrome
 * and the canvas agree.
 */
export const NEUTRAL_COLORS = {
  50: color('#f5f5f6', '--dz-colors-neutral-50'),
  100: color('#e7e8e9', '--dz-colors-neutral-100'),
  200: color('#d3d4d7', '--dz-colors-neutral-200'),
  300: color('#b5b7bb', '--dz-colors-neutral-300'),
  600: color('#585b60', '--dz-colors-neutral-600'),
  800: color('#2e3034', '--dz-colors-neutral-800'),
  900: color('#1b1d1f', '--dz-colors-neutral-900'),
  950: color('#0a0b0d', '--dz-colors-neutral-950'),
} as const

/**
 * Sidebar component-status badges. The taxonomy and labels come from
 * `_shared/status.ts`; only the ink is duplicated here, for the same
 * outside-the-iframe reason as everything else in this file.
 */
export const STATUS_BADGE_COLORS = {
  experimental: color('#703200', '--dz-colors-amber-700'),
  beta: color('#003d9a', '--dz-colors-blue-700'),
  stable: color('#00590d', '--dz-colors-green-700'),
  deprecated: color('#8a0000', '--dz-colors-red-700'),
} as const

/**
 * Pure white. The one literal with NO token behind it: `#ffffff` is the manager's
 * paper in light mode (`appContentBg`, `barBg`, `inputBg`) and the ink inside the
 * brand-blue logo badge. `--dz-background` is not it — that token is theme-scoped
 * and resolves to a near-black in dark mode, which is wrong for both uses. The
 * spec exempts this deliberately rather than inventing a token to launder it.
 */
export const PAPER = '#ffffff'

/** Every token-backed literal, flattened — what the drift spec iterates. */
export const TOKEN_BACKED_COLORS: readonly (BrandColor & { readonly name: string })[] = [
  ...Object.entries(BRAND_COLORS).map(([name, c]) => ({ ...c, name: `brand.${name}` })),
  ...Object.entries(NEUTRAL_COLORS).map(([name, c]) => ({ ...c, name: `neutral.${name}` })),
  ...Object.entries(STATUS_BADGE_COLORS).map(([name, c]) => ({ ...c, name: `badge.${name}` })),
]
