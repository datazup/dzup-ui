/**
 * Storybook anatomy data emitter (TASK-OSS-P3-02, ADR-19).
 *
 * Renders `apps/storybook/stories/_data/anatomy.generated.ts`: the declared
 * anatomy of every component that has one, for the `<Anatomy>` doc block.
 *
 * **Why a projection and not the manifest itself.** The docs could import
 * `component-ownership.manifest.json` directly, but that file is 440 KB of
 * ownership bookkeeping — 1,303 entries, evidence paths, subpath maps — of
 * which the docs need one field on 143 of them. Vite inlines a JSON import
 * whole, so every docs page would carry the entire ownership pipeline's output
 * to render one table.
 *
 * The projection is generated from the manifest in the same run that writes it,
 * and `validate:ownership` fails when the two disagree, so this is a narrowing
 * rather than a second source of truth.
 */

import type { OwnershipManifest } from './ownership-manifest.types.ts'
import { compareSymbols } from './ownership-manifest.types.ts'

const HEADER = `/**
 * AUTO-GENERATED — do not edit.
 *
 * Written by \`yarn generate:ownership\` from
 * packages/core/manifests/component-ownership.manifest.json.
 * \`yarn validate:ownership\` fails if this file drifts from it.
 *
 * A narrowing of the ownership manifest to the field the docs render: the
 * declared styling surface (ADR-19). Components absent from this table have not
 * declared one yet, and the count is ratcheted in
 * packages/tooling/src/ownership/unclassified-ceiling.json.
 */
`

function literal(values: readonly string[]): string {
  return `[${values.map(value => `'${value}'`).join(', ')}]`
}

/** Render the module. */
export function renderAnatomyData(manifest: OwnershipManifest): string {
  const declared = manifest.entries
    .filter(entry => entry.kind === 'public-component' && entry.anatomy !== undefined)
    .sort((a, b) => compareSymbols(a.symbol, b.symbol))

  const total = manifest.entries.filter(entry => entry.kind === 'public-component').length

  const rows = declared.map((entry) => {
    const anatomy = entry.anatomy!
    const fields = [
      `    parts: ${anatomy.parts === 'none' ? `'none'` : literal(anatomy.parts)},`,
      `    states: ${literal(anatomy.states)},`,
      `    componentTokens: ${literal(anatomy.componentTokens)},`,
      `    riskTier: '${anatomy.riskTier}',`,
    ]
    if (anatomy.recipes !== undefined)
      fields.push(`    recipes: ${literal(anatomy.recipes)},`)
    if (anatomy.optionalParts !== undefined)
      fields.push(`    optionalParts: ${literal(anatomy.optionalParts)},`)
    if (anatomy.globalDefaults !== undefined)
      fields.push(`    globalDefaults: ${literal(anatomy.globalDefaults)},`)
    if (anatomy.rtl !== undefined) {
      const icons = anatomy.rtl.icons === undefined
        ? ''
        : `, icons: ${literal(anatomy.rtl.icons)}`
      fields.push(
        `    rtl: { mirrors: '${anatomy.rtl.mirrors}', `
        + `keyboard: '${anatomy.rtl.keyboard}'${icons} },`,
      )
    }

    return `  ${entry.symbol}: {\n${fields.join('\n')}\n  },`
  })

  return `${HEADER}
/** One component's declared styling surface, as the docs render it. */
export interface DocAnatomy {
  readonly parts: readonly string[] | 'none'
  readonly states: readonly string[]
  readonly componentTokens: readonly string[]
  readonly riskTier: 'A' | 'B' | 'C' | 'D'
  readonly recipes?: readonly string[]
  readonly optionalParts?: readonly string[]
  readonly globalDefaults?: readonly string[]
  /** RTL contract (TASK-OSS-P4-05). */
  readonly rtl?: {
    readonly mirrors: 'layout' | 'none'
    readonly keyboard: 'swap-horizontal' | 'none'
    readonly icons?: readonly string[]
  }
}

/** Public components in the catalog, declared or not. */
export const PUBLIC_COMPONENT_COUNT = ${total}

/** Components that have declared an anatomy, by exported name. */
export const ANATOMY: Readonly<Record<string, DocAnatomy>> = {
${rows.join('\n')}
}
`
}
