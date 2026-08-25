<script setup lang="ts">
import type { AsyncOptionsState } from '@dzup-ui/contracts'
/**
 * DzOptionsState — the one row a selection control shows instead of its list
 * while options are loading, empty, or failed (renderer contract C9).
 *
 * **Internal.** Not exported from the family barrel and not a public component:
 * it exists so that seven controls render the *same* row rather than seven
 * near-copies of it. The alternative was pasting a `role="status"` block into
 * `DzSelect`, `DzMultiSelect`, `DzCombobox`, `DzListbox`, `DzCascader`,
 * `DzTreeSelect` and `DzTransfer` and hoping the seventh copy still matched the
 * first a year later — which is the failure this whole program is about.
 *
 * `role="status"` with `aria-live="polite"`, because these arrive *after* first
 * paint: a user who opened a panel and is waiting has no other way to learn
 * that the load finished or failed. Polite rather than assertive — it is
 * information, not an interruption.
 *
 * @module @dzup-ui/core/components/forms/DzOptionsState
 */
import { computed } from 'vue'
import { useComponentMessages } from '../../i18n/useComponentMessages.ts'
import { cn } from '../../utilities/cn.ts'

const props = withDefaults(
  defineProps<{
    /** The resolved state, from `useAsyncOptions`. */
    state: AsyncOptionsState
    /** What the row should say, already resolved against the app catalog. */
    message: string
    /** Whether to render the retry control. */
    canRetry?: boolean
    /** Extra classes for the row, usually the control's `empty` part. */
    rowClass?: string
  }>(),
  { canRetry: false, rowClass: undefined },
)

const emit = defineEmits<{ retry: [] }>()

const dzMessages = useComponentMessages('DzAsyncOptions')

const rowClasses = computed(() =>
  cn(
    'flex flex-col items-center gap-[var(--dz-spacing-2)]',
    'px-[var(--dz-spacing-2)] py-[var(--dz-spacing-4)]',
    'text-center text-[length:var(--dz-text-sm)] text-[var(--dz-muted-foreground)]',
    props.rowClass,
  ),
)

const retryClasses = cn(
  'rounded-[var(--dz-radius-sm)]',
  'px-[var(--dz-spacing-2)] py-[var(--dz-spacing-1)]',
  'text-[length:var(--dz-text-sm)] text-[var(--dz-primary-muted-foreground)]',
  'underline underline-offset-2',
  'dz-focus-ring-control',
  'hover:bg-[var(--dz-muted)]',
  'transition-colors motion-reduce:transition-none',
)
</script>

<template>
  <div
    data-part="options-state"
    :data-options-state="state"
    :class="rowClasses"
    role="status"
    aria-live="polite"
  >
    <span data-part="options-message">{{ message }}</span>
    <button
      v-if="canRetry"
      type="button"
      data-part="options-retry"
      :class="retryClasses"
      @click="emit('retry')"
    >
      {{ dzMessages.retry }}
    </button>
  </div>
</template>
