/**
 * Reusable MDX doc-blocks for rendering the dzup-ui color system.
 *
 * Every swatch reads its color **live** from a `var(--dz-*)` custom property, so
 * these grids can never drift from the shipped tokens — toggle the Storybook
 * **Theme** toolbar and the semantic blocks remap in place.
 *
 * Authored with `createElement` (no JSX) so it compiles without a React-JSX
 * transform in the Storybook Vite pipeline — same approach as `DocTable`.
 *
 * ```mdx
 * import { PaletteGrid, SwatchRow, SemanticGrid } from './_blocks/ColorScale.ts'
 *
 * <PaletteGrid names={['primary', 'blue', 'rose']} />
 * <SemanticGrid groups={[{ title: 'Primary', tokens: ['--dz-primary', '--dz-primary-hover'] }]} />
 * ```
 */
import type { ReactNode } from 'react'
import { createElement as h } from 'react'

/** The 11 canonical shade steps shipped for every primitive hue. */
export const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const

const CSS = `
.dz-pal { margin: 16px 0; font-family: var(--dz-font-sans, system-ui, sans-serif); }
.dz-pal__row { display: grid; grid-template-columns: 96px repeat(11, 1fr); gap: 4px; align-items: stretch; margin-bottom: 4px; }
.dz-pal__label { display: flex; align-items: center; font-size: 12px; font-weight: 600; color: var(--dz-foreground); padding-right: 8px; }
.dz-pal__label code { font-family: var(--dz-font-mono, ui-monospace, monospace); font-size: 11px; color: var(--dz-muted-foreground); font-weight: 400; }
.dz-pal__head { font-size: 11px; color: var(--dz-muted-foreground); text-align: center; padding-bottom: 2px; }
.dz-pal__swatch { height: 44px; border-radius: 6px; border: 1px solid color-mix(in oklch, var(--dz-border) 60%, transparent); display: flex; align-items: flex-end; justify-content: center; padding-bottom: 4px; font-size: 10px; font-variant-numeric: tabular-nums; }
.dz-sem { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; margin: 16px 0; }
.dz-sem__group { border: 1px solid var(--dz-border); border-radius: 10px; overflow: hidden; background: var(--dz-surface); }
.dz-sem__title { font-size: 13px; font-weight: 600; color: var(--dz-foreground); padding: 10px 12px; border-bottom: 1px solid var(--dz-border); background: var(--dz-muted); }
.dz-sem__row { display: flex; align-items: center; gap: 10px; padding: 8px 12px; }
.dz-sem__chip { width: 28px; height: 28px; border-radius: 6px; border: 1px solid color-mix(in oklch, var(--dz-border) 70%, transparent); flex: none; }
.dz-sem__meta { display: flex; flex-direction: column; min-width: 0; }
.dz-sem__name { font-family: var(--dz-font-mono, ui-monospace, monospace); font-size: 11px; color: var(--dz-foreground); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dz-sem__note { font-size: 11px; color: var(--dz-muted-foreground); }
`

let injected = false
function style(): ReactNode {
  if (injected)
    return null
  injected = true
  return h('style', { key: 'dz-pal-css' }, CSS)
}

/** Pick legible label text for a swatch given its shade step. */
function labelColor(shade: number): string {
  return shade <= 400 ? 'oklch(0.2 0 0)' : 'oklch(0.98 0 0)'
}

/** One hue rendered as its full 50→950 ramp. */
export function SwatchRow({ name, prefix = '--dz-colors' }: { name: string, prefix?: string }): ReactNode {
  return h(
    'div',
    { className: 'dz-pal__row' },
    h('div', { className: 'dz-pal__label' }, name),
    ...SHADES.map((shade) => {
      const v = `var(${prefix}-${name}-${shade})`
      return h(
        'div',
        {
          key: shade,
          className: 'dz-pal__swatch',
          style: { background: v, color: labelColor(shade) },
          title: `${prefix}-${name}-${shade}`,
        },
        String(shade),
      )
    }),
  )
}

/** A labelled grid of full hue ramps with a shade-number header. */
export function PaletteGrid({ names, prefix = '--dz-colors' }: { names: string[], prefix?: string }): ReactNode {
  return h(
    'div',
    { className: 'dz-pal' },
    style(),
    h(
      'div',
      { className: 'dz-pal__row' },
      h('div', { className: 'dz-pal__label' }, ''),
      ...SHADES.map(s => h('div', { key: s, className: 'dz-pal__head' }, String(s))),
    ),
    ...names.map(name => h(SwatchRow, { key: name, name, prefix })),
  )
}

export interface SemanticToken {
  /** CSS custom property name, e.g. `--dz-primary`. */
  token: string
  /** Short description of the role. */
  note?: string
}

export interface SemanticGroup {
  title: string
  tokens: (string | SemanticToken)[]
}

/** Card grid of semantic role swatches that remap with the Theme toolbar. */
export function SemanticGrid({ groups }: { groups: SemanticGroup[] }): ReactNode {
  return h(
    'div',
    null,
    style(),
    h(
      'div',
      { className: 'dz-sem' },
      ...groups.map(group =>
        h(
          'div',
          { key: group.title, className: 'dz-sem__group' },
          h('div', { className: 'dz-sem__title' }, group.title),
          ...group.tokens.map((entry) => {
            const t = typeof entry === 'string' ? { token: entry } : entry
            return h(
              'div',
              { key: t.token, className: 'dz-sem__row' },
              h('div', { className: 'dz-sem__chip', style: { background: `var(${t.token})` } }),
              h(
                'div',
                { className: 'dz-sem__meta' },
                h('span', { className: 'dz-sem__name' }, t.token),
                t.note ? h('span', { className: 'dz-sem__note' }, t.note) : null,
              ),
            )
          }),
        ),
      ),
    ),
  )
}
