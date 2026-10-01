/**
 * Dev-mode warning for two props that are two spellings of one thing.
 *
 * The sibling of `warnRemovedProp.ts` and deliberately a separate module: that
 * one answers *"this prop is gone"* by looking the value up in `$attrs`, this
 * one answers *"you passed both names for the same setting, and one of them was
 * discarded"* by comparing two declared props. Merging them would give one
 * function two unrelated lookups and one confusing message.
 *
 * ## Why an additive alias needs a warning at all
 *
 * An alias pair is how this repository adds a vocabulary without breaking the
 * one it shipped — `DzStack`'s `row`/`column` beside `horizontal`/`vertical`
 * (TASK-R3-O3), `DzGridItem`'s `colSpan` beside `span` (TASK-S3-O2). Where the
 * aliases are *values of one prop* no conflict is possible. Where they are *two
 * props*, a consumer can pass both, and the component then has to discard one.
 * Discarding it silently is the failure mode this exists to remove: the rendered
 * output is correct by the documented rule and wrong by the author's intent, and
 * nothing anywhere says so.
 *
 * ## Not exported from any barrel
 *
 * Like `warnRemovedProp.ts`. `packages/core/src/utilities/index.ts` exports `cn`
 * and nothing else, and every symbol that reaches the public barrel lands in the
 * ownership manifest — currently in its `unclassified` bucket, whose ceiling of
 * 29 moves down only. A private helper owes that ceiling nothing.
 *
 * @module @dzup-ui/core/utilities/warnConflictingProps
 */

/**
 * `component.winner+loser` triples already warned about, so a list rendering 200
 * rows produces one line rather than 200.
 *
 * Module-scoped and therefore per-session, matching `warnRemovedProps`.
 * {@link resetConflictingPropWarnings} exists so a spec can assert the warning
 * fires at all, which a once-per-session set otherwise makes order-dependent.
 *
 * A module-scoped `let` inside a `<script setup>` block would **not** work:
 * `<script setup>` compiles its whole body into `setup()`, so the flag would be
 * per instance and the gate would not exist. That is why this lives in a module
 * at all rather than in the component that needs it.
 */
const warned = new Set<string>()

/**
 * Warn, once per component and prop pair per session, when both spellings of one
 * setting were passed.
 *
 * No-op outside dev, and the `import.meta.env?.DEV` guard lets a bundler drop
 * the whole body. Both values are compared against `undefined` only: `null`, `0`
 * and `''` are values a consumer may have meant, and treating them as absent
 * would suppress the warning for exactly the ambiguous cases.
 *
 * @param component - The component's public name, e.g. `DzGridItem`.
 * @param winner    - `[name, value]` of the prop that is used.
 * @param loser     - `[name, value]` of the prop that is ignored.
 * @param guidance  - One sentence telling the consumer which name to keep.
 *
 * @example
 * ```ts
 * warnConflictingProps(
 *   'DzGridItem',
 *   ['colSpan', props.colSpan],
 *   ['span', props.span],
 *   '`colSpan` matches the form document field name; `span` is the original spelling.',
 * )
 * ```
 */
export function warnConflictingProps(
  component: string,
  winner: readonly [string, unknown],
  loser: readonly [string, unknown],
  guidance: string,
): void {
  if (import.meta.env?.DEV !== true)
    return
  if (winner[1] === undefined || loser[1] === undefined)
    return
  const key = `${component}.${winner[0]}+${loser[0]}`
  if (warned.has(key))
    return
  warned.add(key)
  console.warn(
    `[dzup-ui] ${component} received both \`${loser[0]}\` and \`${winner[0]}\`, `
    + `which are two spellings of the same setting. \`${winner[0]}\` is used and `
    + `\`${loser[0]}\` is ignored. Pass one: ${guidance}`,
  )
}

/**
 * Clear the once-per-session set. For specs only.
 */
export function resetConflictingPropWarnings(): void {
  warned.clear()
}
