/**
 * Identifier-aware sentinel matching for `tree-shake-check.ts`.
 *
 * Lives in its own module because `tree-shake-check.ts` calls
 * `checkTreeShaking()` at import time: a spec that imported the matcher from
 * there would run four Vite library builds as a side effect of `import`.
 *
 * @module @dzup-ui/tooling/tree-shake-sentinel
 */

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
 */
export function sentinelPresent(bundle: string, sentinel: string): boolean {
  let from = 0
  for (;;) {
    const at = bundle.indexOf(sentinel, from)
    if (at === -1)
      return false

    const before = at === 0 ? '' : bundle[at - 1]!
    const afterIndex = at + sentinel.length
    const after = afterIndex >= bundle.length ? '' : bundle[afterIndex]!

    if (!IDENTIFIER_CHAR.test(before) && !IDENTIFIER_CHAR.test(after))
      return true

    from = at + 1
  }
}
