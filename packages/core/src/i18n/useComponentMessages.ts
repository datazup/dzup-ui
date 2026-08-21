/**
 * One component's messages, resolved against the application's catalog
 * (TASK-OSS-P4-03, ADR-20).
 *
 * The read side of {@link module:@dzup-ui/core/i18n/messages}. A component asks
 * once in `setup` and reads plain properties in its template:
 *
 * ```vue
 * <script setup lang="ts">
 * const dzMessages = useComponentMessages('DzInput')
 * </script>
 *
 * <template>
 *   <button :aria-label="dzMessages.clear" />
 * </template>
 * ```
 *
 * **Why not `read('DzInput.clear', 'Clear input')` at each site.** That form is
 * what `useDzMessages` offers and it works, but it keeps the English string in
 * the component — which is the thing this packet exists to remove. Every call
 * site would still have to be edited to change a default, and nothing could
 * enumerate what strings the library ships.
 *
 * **Not exported from the package barrel.** It would classify cleanly as a
 * `composable` — the `use*` convention is the authority and there is no ratchet
 * cost — but nothing outside Core needs it: a Pro component augments
 * `DzMessageCatalog` and reads its own keys through `useDzMessages()`, which is
 * public. Adding a second public way to read messages would be a second thing
 * to document and keep consistent.
 *
 * @module @dzup-ui/core/i18n/useComponentMessages
 */

import type { DzMessageCatalog } from '@dzup-ui/contracts'
import type { ComputedRef } from 'vue'
import { computed } from 'vue'
import { useDzMessages } from '../composables/provider/useDzMessages.ts'
import { enMessages } from './messages.ts'

/**
 * Messages for `component`, with the application's overrides applied per key.
 *
 * Returns a `computed` so a locale change mid-session re-renders every label
 * without a component subscribing to anything. In a template Vue unwraps it, so
 * `dzMessages.clear` reads as a plain property.
 *
 * Resolution is **per key, not per component**: a host overriding
 * `DzTimePicker.confirm` keeps the shipped `cancel`, `hours` and the other
 * eight. Overriding a whole component would mean a host that adds one string
 * silently loses the rest, which is the failure `mergeMessages` exists to
 * prevent one level up.
 *
 * A non-string override — a nested object where a string belongs, the usual
 * shape of a mistyped catalog — is ignored in favour of the English default
 * rather than rendered as `[object Object]`.
 */
export function useComponentMessages<K extends keyof DzMessageCatalog>(
  component: K,
): ComputedRef<DzMessageCatalog[K]> {
  const { messages } = useDzMessages()

  return computed(() => {
    const defaults = enMessages[component as keyof typeof enMessages] as DzMessageCatalog[K]
    const override = messages.value[component as string]

    if (override === undefined || typeof override !== 'object')
      return defaults

    const resolved: Record<string, string> = { ...(defaults as Record<string, string>) }
    for (const key of Object.keys(resolved)) {
      const value = (override as Record<string, unknown>)[key]
      if (typeof value === 'string')
        resolved[key] = value
    }
    return resolved as DzMessageCatalog[K]
  })
}
