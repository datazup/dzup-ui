/**
 * Compound-component context graph (TASK-OSS-P0-01).
 *
 * The structural authority behind `compound-part`: which component *provides* a
 * piece of context, and which components *consume* it. Two wirings are in use
 * in `packages/core` and both are read here:
 *
 *   1. injection keys — `provide(DZ_TABS_KEY, …)` / `inject(DZ_TABS_KEY)`
 *   2. context composables — `useFormField(…)` provides, `useFormFieldContext()`
 *      consumes, where the composable module exports both names (ADR-08).
 *
 * Pure: sources are handed in as text, so the rules can be tested against a few
 * lines instead of a checkout.
 */

/** `provide(DZ_X_KEY` — the key name is the context token. */
const PROVIDE_KEY_RE = /provide\(\s*(DZ_[A-Z0-9_]+_KEY)/g

/** `inject(DZ_X_KEY` — same token, consumed. */
const INJECT_KEY_RE = /inject\(\s*(DZ_[A-Z0-9_]+_KEY)/g

export interface ContextGraph {
  /** context token → components that provide it. */
  providers: Map<string, string[]>
  /** component → context tokens it consumes. */
  consumes: Map<string, string[]>
}

/**
 * A composable that exports both `useX` and `useXContext` is a compound context
 * pair: `useX()` is the provider call, `useXContext()` the consumer call.
 */
export function contextComposablePairs(composableExports: Iterable<string>): string[] {
  const names = new Set(composableExports)
  return [...names]
    .filter(name => name.endsWith('Context') && names.has(name.slice(0, -'Context'.length)))
    .map(name => name.slice(0, -'Context'.length))
    .sort()
}

function addTo(map: Map<string, string[]>, key: string, value: string): void {
  const existing = map.get(key)
  if (existing === undefined)
    map.set(key, [value])
  else if (!existing.includes(value))
    existing.push(value)
}

/**
 * Build the graph from component sources.
 *
 * @param sources - component symbol → its `.vue` source text
 * @param pairs - base names from {@link contextComposablePairs}, e.g. `useFormField`
 */
export function buildContextGraph(
  sources: ReadonlyMap<string, string>,
  pairs: readonly string[],
): ContextGraph {
  const providers = new Map<string, string[]>()
  const consumes = new Map<string, string[]>()

  for (const [symbol, source] of sources) {
    PROVIDE_KEY_RE.lastIndex = 0
    for (const match of source.matchAll(PROVIDE_KEY_RE))
      addTo(providers, match[1]!, symbol)

    INJECT_KEY_RE.lastIndex = 0
    for (const match of source.matchAll(INJECT_KEY_RE))
      addTo(consumes, symbol, match[1]!)

    for (const base of pairs) {
      // `useFormFieldContext(` must not also register as a `useFormField(` call,
      // hence the explicit `(` boundary on the provider pattern.
      if (new RegExp(`\\b${base}Context\\s*\\(`).test(source))
        addTo(consumes, symbol, `composable:${base}`)
      else if (new RegExp(`\\b${base}\\s*\\(`).test(source))
        addTo(providers, `composable:${base}`, symbol)
    }
  }

  return { providers, consumes }
}

/**
 * Components in `family` that provide a context token `symbol` consumes.
 * Cross-family wiring is ignored on purpose: a compound part lives in its
 * parent's family, and a cross-family hit would be a design defect to report,
 * not a parent to record.
 */
export function contextParentsOf(
  symbol: string,
  familyMembers: readonly string[],
  graph: ContextGraph,
): string[] {
  const tokens = graph.consumes.get(symbol) ?? []
  const parents = new Set<string>()
  for (const token of tokens) {
    for (const provider of graph.providers.get(token) ?? []) {
      if (provider !== symbol && familyMembers.includes(provider))
        parents.add(provider)
    }
  }
  return [...parents].sort()
}
