/**
 * searchScore — the one weighted-field fuzzy ranker shared by every discovery
 * surface on the site.
 *
 * A document's score against a normalized query is the sum of the weights of the
 * fields the query substring-matches, so a title hit outranks a tag- or
 * description-only hit (the only ordering guarantee the discovery specs ask for).
 * Documents with equal scores keep their source order via a carried index.
 *
 * Extracted from `useBlockSearch` so the block filter (blocks only) and the
 * site-wide ⌘K palette (components + blocks + templates) rank through the SAME
 * code path instead of each re-deriving "title beats description". Pure and
 * dependency-free — no Vue, no DOM — so it is trivially unit-testable.
 */

/** One matchable field and the weight a hit on it contributes. */
export interface WeightedField {
  /** The field's text; matched case-insensitively against the normalized query. */
  value: string
  /** Points added to the score when the query is a substring of `value`. */
  weight: number
}

/**
 * Sum of matched-field weights for `fields` against the already-normalized
 * (trimmed, lowercased) query `q`. Returns 0 when nothing matches. Callers pass
 * `q === ''` at their own discretion — an empty query is a substring of every
 * field, so every field matches; the discovery surfaces short-circuit the
 * empty-query case before scoring rather than relying on that.
 */
export function scoreFields(fields: readonly WeightedField[], q: string): number {
  let score = 0
  for (const field of fields) {
    if (field.value.toLowerCase().includes(q)) score += field.weight
  }
  return score
}

/**
 * Rank `items` by their weighted-field score against `q`, dropping non-matches
 * and keeping source order on ties. `fieldsOf` maps an item to its weighted
 * fields; `q` must already be normalized (trimmed + lowercased). Returns a new
 * array — the input is never mutated.
 */
export function rankBySearch<T>(
  items: readonly T[],
  q: string,
  fieldsOf: (item: T) => readonly WeightedField[],
): T[] {
  return items
    .map((item, index) => ({ item, index, score: scoreFields(fieldsOf(item), q) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((entry) => entry.item)
}
