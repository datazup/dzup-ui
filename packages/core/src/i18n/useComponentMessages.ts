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

import type { DzMessageArgsOf, DzMessageCatalog, DzMessageValues } from '@dzup-ui/contracts'
import type { ComputedRef } from 'vue'
import { computed } from 'vue'
import { useDzLocale } from '../composables/provider/useDzLocale.ts'
import { useDzMessages } from '../composables/provider/useDzMessages.ts'
import { formatMessage } from './message-format.ts'
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

/** Broken host messages already reported, so a re-render does not repeat the warning. */
const warned = new Set<string>()

/**
 * A formatter for one component's count-bearing messages (TASK-R5-O4).
 *
 * ```ts
 * const dzFormat = useComponentMessageFormat('DzTagsInput')
 * const status = computed(() => dzFormat('count', { count: model.value.length }))
 * ```
 *
 * `values` is typed from the catalog: `DzTagsInput.count` is declared
 * `DzMessage<{ count: number }>`, so a missing or string `count` is a type
 * error here rather than an `{count}` rendered to a user.
 *
 * **A broken translation never breaks the component.** A host message that
 * does not parse, or names an argument the component does not pass, renders
 * the English default instead — the same rule `useComponentMessages` applies
 * to a non-string override — and warns once in development. The English
 * default's branches are chosen by **English** plural rules, whatever the
 * application's locale, while its numbers still group for that locale: an
 * untranslated key in a French application says "0 items", not "0 item".
 */
export function useComponentMessageFormat<K extends keyof DzMessageCatalog>(
  component: K,
): <M extends keyof DzMessageCatalog[K] & string>(key: M, values: DzMessageArgsOf<DzMessageCatalog[K][M]>) => string {
  const messages = useComponentMessages(component)
  const locale = useDzLocale()

  return (key, values) => {
    const defaults = enMessages[component as keyof typeof enMessages] as Record<string, string>
    const english = defaults[key] ?? ''
    const message = (messages.value as Record<string, string>)[key] ?? english
    const args = values as DzMessageValues

    if (message !== english) {
      try {
        return formatMessage(message, args, locale.value)
      }
      catch (error) {
        const report = `${String(component)}.${key}: ${(error as Error).message}`
        if (import.meta.env?.DEV && !warned.has(report)) {
          warned.add(report)
          console.warn(`[dzup-ui] ${report}; rendering the English default.`)
        }
      }
    }
    return formatMessage(english, args, locale.value, { pluralLocale: 'en' })
  }
}
