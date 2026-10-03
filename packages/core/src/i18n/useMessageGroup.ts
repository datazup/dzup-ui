import type { DzMessageCatalog } from '@dzup-ui/contracts'
import type { ComputedRef } from 'vue'
import { computed } from 'vue'
import { useDzMessages } from '../composables/provider/useDzMessages.ts'

/** Resolve one group's overrides without importing unrelated English defaults. */
export function useMessageGroup<K extends keyof DzMessageCatalog>(
  component: K,
  defaults: DzMessageCatalog[K],
): ComputedRef<DzMessageCatalog[K]> {
  const { messages } = useDzMessages()
  return computed(() => {
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
