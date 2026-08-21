import type { ReactNode } from 'react'
/**
 * Reusable MDX doc-block: a component's declared anatomy (TASK-OSS-P3-02, ADR-19).
 *
 * Renders what a consumer may address — parts, states, component tokens, recipe
 * axes, risk tier — from the generated data, never from prose. The table is a
 * projection of `packages/core/manifests/component-ownership.manifest.json`,
 * which the ownership generator writes from each component's
 * `Dz{Name}.anatomy.ts`, so a part that disappears from the DOM disappears from
 * the docs in the same commit. `yarn validate:ownership` fails if the two drift.
 *
 * ```mdx
 * import { Anatomy } from './_blocks/Anatomy.ts'
 *
 * <Anatomy of="DzButton" />
 * ```
 *
 * `of` is the exported component NAME rather than the component itself. The
 * anatomy is not attached to the component object — exporting it publicly would
 * add a symbol to the ownership manifest with no `kind` to classify it under —
 * and reading from the generated table keeps the docs on the same authority the
 * validator uses.
 *
 * A component that has not declared an anatomy renders an honest note saying so
 * rather than an empty table. 142 of 143 are in that state today; the note is
 * what most readers will see until the P3-03 rollout lands.
 *
 * Authored with `createElement` (no JSX) so it compiles without a React-JSX
 * transform in the Storybook Vite pipeline — same approach as `DocTable`.
 */
import type { DocAnatomy } from '../_data/anatomy.generated.ts'
import { Fragment, createElement as h } from 'react'
import { ANATOMY } from '../_data/anatomy.generated.ts'
import { DocTable } from './DocTable.ts'

const RISK_TIER_MEANING: Record<DocAnatomy['riskTier'], string> = {
  A: 'focus-managing or form-bearing — a defect is a functional or accessibility failure',
  B: 'composite and data-heavy — correct alone, breakable in combination',
  C: 'display with variants — wrong output is visible and recoverable',
  D: 'structural — layout primitive with no interactive behaviour of its own',
}

const NOTE_CSS = `
.dz-anatomy-note { margin: 16px 0; padding: 12px 14px; border: 1px solid var(--dz-border); border-left: 3px solid var(--dz-warning, var(--dz-border)); border-radius: 8px; background: var(--dz-muted); color: var(--dz-foreground); font-size: 14px; line-height: 1.5; }
.dz-anatomy-note code { font-family: var(--dz-font-mono, ui-monospace, monospace); font-size: 0.85em; }
`

function note(children: ReactNode): ReactNode {
  return h(
    Fragment,
    null,
    h('style', null, NOTE_CSS),
    h('div', { className: 'dz-anatomy-note' }, children),
  )
}

function list(values: readonly string[] | undefined, empty: string): string {
  if (values === undefined || values.length === 0)
    return empty
  return values.map(value => `\`${value}\``).join(' · ')
}

export interface AnatomyProps {
  /** Exported component name, e.g. `"DzButton"`. */
  of: string
}

export function Anatomy({ of: name }: AnatomyProps): ReactNode {
  const anatomy = ANATOMY[name]

  if (anatomy === undefined) {
    return note([
      h('strong', { key: 'h' }, `${name} has not declared an anatomy yet. `),
      h(
        Fragment,
        { key: 'b' },
        'Its parts, states and component tokens are therefore undocumented and unguaranteed — '
        + 'style it through design tokens and the root class, not by reaching for internal '
        + 'selectors. Declaring one is TASK-OSS-P3-03 work (ADR-19).',
      ),
    ])
  }

  const parts = anatomy.parts === 'none'
    ? '**none** — this component renders no element of its own'
    : anatomy.parts
        .map(part => `\`${part}\`${anatomy.optionalParts?.includes(part) === true ? ' (optional)' : ''}`)
        .join(' · ')

  return h(
    Fragment,
    null,
    h(DocTable, {
      head: ['Surface', 'Declared'],
      align: ['left', 'left'],
      rows: [
        ['**Parts** — `data-part`', parts],
        ['**States** — `data-state` and boolean attributes', list(anatomy.states, 'none')],
        ['**Recipe axes** — `data-{axis}`', list(anatomy.recipes, 'none')],
        ['**Component tokens**', list(anatomy.componentTokens, 'none')],
        ['**Risk tier**', `**${anatomy.riskTier}** — ${RISK_TIER_MEANING[anatomy.riskTier]}`],
        ...(anatomy.globalDefaults === undefined
          ? []
          : [['**Provider defaults honoured**', list(anatomy.globalDefaults, 'none')]]),
      ],
    }),
  )
}
