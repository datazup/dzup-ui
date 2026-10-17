/**
 * Identifier-aware sentinel matching for `tree-shake-check.ts`.
 *
 * Lives in its own module because `tree-shake-check.ts` calls
 * `checkTreeShaking()` at import time: a spec that imported the matcher from
 * there would run four Vite library builds as a side effect of `import`.
 *
 * @module @dzup-ui/tooling/tree-shake-sentinel
 */

import { enMessages } from '../../core/src/i18n/messages.ts'

/**
 * The i18n catalog's message-group keys (`DzDataGrid`, `DzDataGridHeader`, …).
 * Only these may be excused as object-literal keys: they are the one place a
 * component name legitimately appears as a key in every bundle.
 */
export const CATALOG_GROUP_KEYS: ReadonlySet<string> = new Set(Object.keys(enMessages))

/** Characters that may not sit either side of a sentinel for it to count. */
const IDENTIFIER_CHAR = /[\w$]/

/**
 * Is `sentinel` present in `bundle` as a whole identifier?
 *
 * `bundle.includes('DzDataGrid')` is true for `DzDataGridHeader`, which is a
 * different symbol and is not evidence that `DzDataGrid` leaked into the
 * bundle. The i18n catalog carries message-group keys named after compound
 * parts (`DzDataGridHeader`, `DzDataGridPagination` —
 * `packages/core/src/i18n/messages.ts`), and those keys are plain strings that
 * travel with the catalog into every bundle, so the substring test reported all
 * three sentinels as "leaked" from a bundle that had tree-shaken them
 * perfectly.
 *
 * The sentinel counts only when neither neighbouring character could extend it
 * into a longer identifier — so `DzDataGrid`, `"DzDataGrid"` and `.DzDataGrid`
 * match, while `DzDataGridHeader` and `MyDzDataGrid` do not.
 *
 * It also does not count as an object-literal KEY (`{ DzDataGrid: {…} }` or
 * `, "DzDataGrid": {…}`). The root DataGrid has a catalog group of its own,
 * `DzDataGrid: { loading, empty }`, and like the compound-part groups above it
 * is a plain key that ships with the catalog in every bundle. A component that
 * really leaked still matches: its compiled definition carries
 * `__name: "DzDataGrid"` (a quoted VALUE, followed by `,` or `}`, never by `:`),
 * and its import or export binding is a bare identifier.
 *
 * The key exemption applies only to a sentinel that IS a catalog group key
 * ({@link CATALOG_GROUP_KEYS}); any other component name seen as an object key
 * (a leaked registry such as `{ DzButton: DzButton }`) still counts.
 */
export function sentinelPresent(
  bundle: string,
  sentinel: string,
  catalogKeys: ReadonlySet<string> = CATALOG_GROUP_KEYS,
): boolean {
  const keyExempt = catalogKeys.has(sentinel)
  let from = 0
  for (;;) {
    const at = bundle.indexOf(sentinel, from)
    if (at === -1)
      return false

    const before = at === 0 ? '' : bundle[at - 1]!
    const afterIndex = at + sentinel.length
    const after = afterIndex >= bundle.length ? '' : bundle[afterIndex]!

    if (!IDENTIFIER_CHAR.test(before) && !IDENTIFIER_CHAR.test(after) && !(keyExempt && isObjectKey(bundle, at, afterIndex)))
      return true

    from = at + 1
  }
}

/** Quote characters an object-literal key may be wrapped in. */
const QUOTE = /["'`]/

/**
 * Is the occurrence at `[start, end)` an object-literal key: preceded by `{` or
 * `,` and followed by `:`, ignoring whitespace and one pair of quotes?
 */
function isObjectKey(bundle: string, start: number, end: number): boolean {
  let i = start - 1
  if (i >= 0 && QUOTE.test(bundle[i]!))
    i--
  while (i >= 0 && /\s/.test(bundle[i]!))
    i--
  if (i < 0 || (bundle[i] !== '{' && bundle[i] !== ','))
    return false
  let j = end
  if (j < bundle.length && QUOTE.test(bundle[j]!))
    j++
  while (j < bundle.length && /\s/.test(bundle[j]!))
    j++
  return bundle[j] === ':'
}
