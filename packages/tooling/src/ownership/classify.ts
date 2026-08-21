/**
 * Component classification rules (TASK-OSS-P0-01).
 *
 * Pure: every input is passed in, so the rules are unit-testable without a
 * checkout and the generator stays a thin I/O shell around them.
 *
 * The one rule that matters is the one that is *not* here: nothing guesses from
 * a `Dz` prefix. A symbol is a `public-component` because a story declares it
 * one, and a `compound-part` because two independent authorities — the family's
 * own export list and the provide/inject wiring in the `.vue` sources — agree on
 * its parent. When they disagree, the entry is `unclassified` and both pieces of
 * evidence are recorded for a maintainer. See `./README.md` for the full table.
 */

import type { OwnershipKind } from './ownership-manifest.types.ts'

export interface ComponentClassificationInput {
  symbol: string
  /** Family directory name, e.g. `buttons`. */
  family: string
  /** The other component symbols the same family barrel exports. */
  siblings: readonly string[]
  /** Repo-relative path of the component's `.vue` file, when one exists. */
  vuePath?: string
  /** Repo-relative path of a `*.stories.ts` file named after this symbol. */
  storyPath?: string
  /**
   * Components in the same family that provide a context token this symbol
   * consumes — via `provide(DZ_X_KEY)`/`inject(DZ_X_KEY)`, or a
   * `useX()`/`useXContext()` composable pair.
   */
  contextParents: readonly string[]
}

export interface Classification {
  kind: OwnershipKind
  parentComponent?: string
  evidence: string[]
}

/**
 * The longest other export in the same family that is a strict prefix of
 * `symbol` — `DzCardBody` → `DzCard`. Longest wins so `DzSplitButtonMenu`
 * resolves to `DzSplitButton`, not to `DzSplitButtonM…`'s shorter ancestors.
 */
export function prefixParent(symbol: string, siblings: readonly string[]): string | undefined {
  return siblings
    .filter(candidate => candidate !== symbol && symbol.startsWith(candidate))
    .sort((a, b) => b.length - a.length)[0]
}

/**
 * The barrel that exports this symbol.
 *
 * Derived from the component's own path rather than assembled from
 * `packages/core/src/components/${family}` — a convention that held for every
 * component until `DzProvider` shipped from `packages/core/src/providers`, at
 * which point the generator recorded evidence pointing at a file that does not
 * exist. Nothing validated it, because evidence is prose to every consumer of
 * the manifest. Reading the path off the `.vue` makes the evidence a fact
 * instead of a guess, and it produces the identical string for every component
 * that does live under `src/components`.
 *
 * The old shape stays as the fallback for a symbol with no `.vue` of its own.
 */
export function barrelFor(family: string, vuePath?: string): string {
  if (vuePath === undefined)
    return `packages/core/src/components/${family}/index.ts`
  return `${vuePath.slice(0, vuePath.lastIndexOf('/'))}/index.ts`
}

/**
 * Classify one symbol exported by a component family barrel.
 *
 * Precedence, in order:
 *   1. it has its own story         → public-component
 *   2. naming and wiring agree      → compound-part
 *   3. exactly one authority speaks → compound-part
 *   4. anything else                → unclassified, with both readings recorded
 */
export function classifyComponent(input: ComponentClassificationInput): Classification {
  const { symbol, family, siblings, vuePath, storyPath, contextParents } = input
  const base = [barrelFor(family, vuePath)]
  if (vuePath !== undefined)
    base.push(vuePath)

  if (storyPath !== undefined) {
    return {
      kind: 'public-component',
      evidence: [...base, storyPath],
    }
  }

  const named = prefixParent(symbol, siblings)
  const wired = [...contextParents].filter(parent => parent !== symbol).sort()

  if (named !== undefined && wired.length > 0) {
    // Agreement is either literal (the named parent provides the context) or
    // structural (the providers are themselves parts of the named compound, as
    // DzToastProvider is of DzToast). Both resolve to the root-most name.
    const agrees = wired.includes(named) || wired.every(parent => parent.startsWith(named))
    if (agrees) {
      return {
        kind: 'compound-part',
        parentComponent: named,
        evidence: [...base, `name prefix of ${named}`, `consumes context provided by ${wired.join(', ')}`],
      }
    }
    return {
      kind: 'unclassified',
      evidence: [
        ...base,
        `authorities disagree: the export list makes it a part of ${named}, `
        + `the provide/inject wiring makes it a part of ${wired.join(', ')}`,
      ],
    }
  }

  if (named !== undefined) {
    return {
      kind: 'compound-part',
      parentComponent: named,
      evidence: [...base, `name prefix of ${named}`, 'no story of its own'],
    }
  }

  if (wired.length === 1) {
    return {
      kind: 'compound-part',
      parentComponent: wired[0]!,
      evidence: [...base, `consumes context provided by ${wired[0]}`, 'no story of its own'],
    }
  }

  if (wired.length > 1) {
    return {
      kind: 'unclassified',
      evidence: [
        ...base,
        `ambiguous parent: consumes context provided by ${wired.join(', ')} and no export name disambiguates them`,
      ],
    }
  }

  return {
    kind: 'unclassified',
    evidence: [
      ...base,
      'no story declares it a component, no export name makes it part of another, '
      + 'and it consumes no family context',
    ],
  }
}

/**
 * Second pass: point every `compound-part` at the nearest ancestor that is a
 * `public-component`.
 *
 * `parentComponent` is the name a consumer would look up in the docs, and the
 * validator enforces that it is a public component — so a part whose immediate
 * parent is itself a part (DzToastViewport → DzToastProvider → DzToast) must
 * resolve upward. A chain that never reaches a public component is downgraded
 * to `unclassified` rather than left pointing at nothing.
 */
export function resolveCompoundParents(classifications: Map<string, Classification>): void {
  for (const [symbol, classification] of classifications) {
    if (classification.kind !== 'compound-part')
      continue

    const chain: string[] = []
    let current = classification.parentComponent
    while (current !== undefined) {
      const parent = classifications.get(current)
      if (parent === undefined || chain.includes(current))
        break
      if (parent.kind === 'public-component')
        break
      if (parent.kind !== 'compound-part') {
        current = undefined
        break
      }
      chain.push(current)
      current = parent.parentComponent
    }

    const resolved = current !== undefined && classifications.get(current)?.kind === 'public-component'
      ? current
      : undefined

    if (resolved === undefined) {
      classifications.set(symbol, {
        kind: 'unclassified',
        evidence: [
          ...classification.evidence,
          `parent chain ${[classification.parentComponent, ...chain].join(' → ')} `
          + 'never reaches a public component',
        ],
      })
      continue
    }

    if (resolved !== classification.parentComponent) {
      classifications.set(symbol, {
        ...classification,
        parentComponent: resolved,
        evidence: [
          ...classification.evidence,
          `resolved through ${chain.join(' → ')} to the public component ${resolved}`,
        ],
      })
    }
  }
}
