/**
 * Runtime ownership lookup emitter (TASK-OSS-P1-02).
 *
 * Renders `packages/core/src/generated/component-ownership.ts`: the compact
 * table the auto-import resolver reads instead of guessing from a `Dz` prefix.
 *
 * Only `public-component` and `compound-part` entries are emitted. Types,
 * composables, recipes, token modules and unclassified symbols are *not*
 * components and must never resolve as one — a resolver that answered
 * `DzButtonProps` would generate an import for a type.
 *
 * The output contains names and package strings only. Core does not import Pro
 * at build time or at runtime; the Pro half of the table, when present, comes
 * from a JSON manifest a Pro checkout produced.
 */

import type { OwnershipMap } from './build-ownership-map.ts'
import { compareSymbols } from './ownership-manifest.types.ts'

/** The two kinds a consumer can actually mount. */
const RESOLVABLE_KINDS = new Set(['public-component', 'compound-part'])

const HEADER = `/**
 * AUTO-GENERATED — do not edit.
 *
 * Written by \`yarn generate:ownership\` from the cross-tier ownership map
 * (packages/tooling/src/ownership/). \`yarn validate:ownership\` fails if this
 * file drifts from its source.
 *
 * It replaced a hand-maintained prefix list that had gone wrong in both
 * directions: it routed \`DzAppShell\` and \`DzCalendar\` — Core components — to
 * Pro, and it named Pro components (\`DzScheduler\`, \`DzComment\`,
 * \`DzVirtualTable\`) that Pro does not export. A prefix cannot distinguish two
 * tiers that share the \`Dz\` prefix; an exact name can.
 */
`

/**
 * Render the module.
 *
 * @param map - merged ownership map; its `inputs` decide which tiers appear
 */
export function renderRuntimeLookup(map: OwnershipMap): string {
  const tiers = map.inputs.map(input => input.tier).sort(compareSymbols)

  const rows = Object.keys(map.symbols)
    .sort(compareSymbols)
    .filter(symbol => RESOLVABLE_KINDS.has(map.symbols[symbol]!.kind))
    .map((symbol) => {
      const entry = map.symbols[symbol]!
      return `  ${symbol}: { from: '${entry.package}', kind: '${entry.kind}' },`
    })

  const tierList = tiers.map(tier => `'${tier}'`).join(', ')
  const proNote = tiers.includes('pro')
    ? ''
    : `\n *\n * The Pro tier is ABSENT from this table: no Pro ownership manifest was\n`
      + ` * available when it was generated, so every Pro component name resolves to\n`
      + ` * \`undefined\`. That is the honest answer — the previous behaviour pointed\n`
      + ` * those names at a package that has never been publishable.`

  return `${HEADER}
/** Which package a component name is imported from. */
export type OwningPackage = '@dzup-ui/core' | '@dzup-ui-pro/pro'

/** What the name is. Only these two kinds are mountable, so only these resolve. */
export type OwnedKind = 'public-component' | 'compound-part'

export interface OwnedComponent {
  from: OwningPackage
  kind: OwnedKind
}

/**
 * Tiers whose manifests contributed to this table.${proNote}
 */
export const OWNERSHIP_TIERS = [${tierList}] as const

/**
 * Exact component name → owner. A name absent from this table is not a
 * component this library owns, and the resolver answers \`undefined\` for it.
 */
export const COMPONENT_OWNERSHIP: Readonly<Record<string, OwnedComponent>> = {
${rows.join('\n')}
}
`
}
