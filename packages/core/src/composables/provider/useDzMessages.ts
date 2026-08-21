import type { DzMessages } from '@dzup-ui/contracts'
import type { Ref } from 'vue'
import { DZ_MESSAGES_KEY } from '@dzup-ui/contracts'
import { computed, inject, provide, readonly, ref } from 'vue'

/**
 * User-visible strings (TASK-OSS-P4-01, ADR-20).
 *
 * The measured problem: **79 distinct user-visible literals** across the
 * component templates. 50 are static `aria-label` values — `'Clear input'`,
 * `'Back to top'`, `'Close lightbox'` — that no application can change at all.
 * The other 29 are literal defaults on `*Text`/`*Label`/`*Message` props, which
 * is why several components carry a `noResultsText`, a `loadingLabel` and a
 * `cancelText` that only a per-instance prop can change and no application can
 * set once.
 *
 * This composable is the read side. Replacing the hard-coded strings component
 * by component is TASK-OSS-P4-03; nothing here changes an existing component's
 * behaviour, which is why it can land first.
 */

/** Read one message by dotted path, falling back to the supplied default. */
export type DzMessageReader = (path: string, fallback: string) => string

function lookup(messages: DzMessages, path: string): string | undefined {
  let current: string | DzMessages | undefined = messages
  for (const segment of path.split('.')) {
    if (typeof current !== 'object')
      return undefined
    current = current[segment]
  }
  return typeof current === 'string' ? current : undefined
}

/**
 * Deep-merge two catalogs, with `override` winning per leaf.
 *
 * Deep rather than shallow, and this is the rule ADR-20 fixes: a host that
 * wants to change `select.noResults` must not have to restate every other
 * message under `select`. Shallow merging is the same trap as replacing a
 * config object wholesale.
 */
export function mergeMessages(base: DzMessages, override: DzMessages): DzMessages {
  const merged: Record<string, string | DzMessages> = { ...base }

  for (const [key, value] of Object.entries(override)) {
    const existing = merged[key]
    merged[key] = typeof value === 'object' && typeof existing === 'object'
      ? mergeMessages(existing, value)
      : value
  }

  return merged
}

/**
 * The active message catalog.
 *
 * Empty with no provider mounted, so `read('select.noResults', 'No results
 * found')` returns the fallback — which is exactly the string the component
 * hard-codes today. That is the property that makes the migration in P4-03
 * mechanical and non-breaking.
 */
export function useDzMessages(): {
  messages: Readonly<Ref<DzMessages>>
  read: DzMessageReader
} {
  const injected = inject(DZ_MESSAGES_KEY, null)
  const messages = readonly(injected ?? ref<DzMessages>({}))

  return {
    messages,
    read: (path, fallback) => lookup(messages.value, path) ?? fallback,
  }
}

/**
 * The write half, used by `DzProvider` (TASK-OSS-P4-02) and by tests.
 *
 * A nested provider **merges with** its ancestor rather than replacing it —
 * the one place in this contract where a child does not simply override, and
 * the reason `mergeMessages` is exported and tested on its own.
 */
export function provideDzMessages(messages: Ref<DzMessages>): void {
  const parent = inject(DZ_MESSAGES_KEY, null)
  provide(
    DZ_MESSAGES_KEY,
    parent === null
      ? messages
      : computed(() => mergeMessages(parent.value, messages.value)),
  )
}
