/**
 * useDualModel — one value, two v-model names, no breaking change.
 *
 * Seven Core controls bind their value to a **named** model:
 * `DzCascader`, `DzKnob`, `DzMention`, `DzRating`, `DzTagsInput`,
 * `DzTreeSelect` and `DzInplace` all take `v-model:value`. Every other control
 * takes the default `v-model`.
 *
 * That inconsistency is invisible until something binds a control it does not
 * know the name of. A schema-driven form renderer holds a registry entry — a
 * component and a codec — and binds `v-model` to whatever the entry names. On
 * these seven that binds nothing: no error, no warning, no value. The control
 * renders, the user types, and the form stays empty.
 *
 * The fix cannot be a rename. `v-model:value` is in every consumer template
 * that uses these components, and removing it is a major. So a control gets
 * **both**: the default model becomes the contract-conforming one, and the
 * named model keeps working. Whichever the consumer bound is the one that
 * carries the value; if they bind both, both stay in step.
 *
 * @example
 * ```ts
 * const legacy = defineModel<string[]>('value', { default: () => [] })
 * const primary = defineModel<string[] | undefined>({ default: undefined })
 * const model = useDualModel(primary, legacy)
 * // read and write `model.value` everywhere the component used to use the
 * // named model; both stay in sync.
 * ```
 *
 * @module @dzup-ui/core/composables/useDualModel
 */

import type { ModelRef, WritableComputedRef } from 'vue'
import { computed } from 'vue'

/**
 * Merge a default model and a legacy named model into one writable ref.
 *
 * Reads prefer the default model and fall back to the named one, so a consumer
 * who binds only `v-model:value` is unaffected: the default model is local
 * state that nobody wrote, it holds `undefined`, and the read falls through.
 *
 * Writes go to both, which is what keeps a consumer binding both from seeing
 * them diverge. Writing to a model nobody bound is harmless — Vue emits an
 * `update:` event with no listener.
 *
 * @param primary - the default model, `defineModel<T | undefined>()`
 * @param legacy - the named model, `defineModel<T>('value', …)`
 * @param isEmpty - optional test for "the default model holds nothing".
 *   Defaults to `undefined`-only, which is right whenever `undefined` is not a
 *   meaningful value. Pass one when it is.
 */
export function useDualModel<T>(
  primary: ModelRef<T | undefined>,
  legacy: ModelRef<T>,
  isEmpty: (value: T | undefined) => boolean = value => value === undefined,
): WritableComputedRef<T> {
  return computed<T>({
    get: () => (isEmpty(primary.value) ? legacy.value : (primary.value as T)),
    set: (next) => {
      primary.value = next
      legacy.value = next
    },
  })
}
