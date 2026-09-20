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
 * ## An external write after a user edit is honoured (defect D8)
 *
 * Writing to both models is what made "prefer the default model" wrong. On a
 * consumer who bound only `v-model:value`, the default model is component-local
 * state; the first user edit latched a value into it, `isEmpty` became false,
 * and from then on every read preferred that local copy and every external
 * write to `value` was silently discarded. Resetting a form field did nothing.
 * Seven public controls shared it — the whole suite stayed green because every
 * test mounted fresh, and on a fresh mount the preference is correct.
 *
 * The fix is to remember the value this composable last wrote. A model whose
 * value differs from that was written by somebody else — the parent — and an
 * outside write always wins over the latched copy. Which model it was does not
 * matter, so the rule holds whichever one (or both) the consumer bound, and it
 * needs no watcher, no flag and no knowledge of what a parent bound.
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
  /**
   * The value the last `set` wrote into both models, and whether there was one.
   *
   * Not a ref: it only ever changes inside `set`, which writes both models and
   * therefore invalidates this computed by itself.
   */
  let written: T | undefined
  let hasWritten = false

  return computed<T>({
    get: () => {
      // Both are read unconditionally so the computed tracks both models
      // whichever branch it takes.
      const p = primary.value
      const q = legacy.value

      if (hasWritten) {
        // Someone other than this composable moved a model since the last
        // user edit. That is the parent, and the parent wins.
        if (!Object.is(q, written))
          return q
        if (!Object.is(p, written))
          return p as T
      }

      return isEmpty(p) ? q : (p as T)
    },
    set: (next) => {
      written = next
      hasWritten = true
      primary.value = next
      legacy.value = next
    },
  })
}
