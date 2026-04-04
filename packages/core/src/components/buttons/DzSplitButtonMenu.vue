<script setup lang="ts">
import type { DzSplitButtonMenuProps, DzSplitButtonMenuSlots } from './DzSplitButton.types.ts'
/**
 * DzSplitButtonMenu — Dropdown trigger within DzSplitButton.
 *
 * Renders as a small button with a chevron icon that opens a dropdown.
 * Inherits variant, size, tone, disabled from parent context.
 *
 * @example
 * ```vue
 * <DzSplitButtonMenu aria-label="More actions">
 *   <DzDropdownMenuContent>...</DzDropdownMenuContent>
 * </DzSplitButtonMenu>
 * ```
 */
import { computed, inject, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { buttonVariants } from './DzButton.variants.ts'
import { DZ_SPLIT_BUTTON_KEY } from './DzSplitButton.types.ts'

defineProps<DzSplitButtonMenuProps>()
defineSlots<DzSplitButtonMenuSlots>()

const attrs = useAttrs()
const ctx = inject(DZ_SPLIT_BUTTON_KEY, null)

const classes = computed(() =>
  cn(
    buttonVariants({
      variant: ctx?.variant.value ?? 'solid',
      size: ctx?.size.value ?? 'md',
      tone: ctx?.tone.value ?? 'primary',
    }),
    // Remove left rounding and add left border for split button effect
    'rounded-l-none border-l border-l-[var(--dz-background)]/20 px-2',
    attrs.class as string | undefined,
  ),
)
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <div
    class="relative"
    :data-state="ctx?.loading.value ? 'loading' : ctx?.disabled.value ? 'disabled' : 'idle'"
    :data-tone="ctx?.tone.value"
    :data-disabled="ctx?.disabled.value ? '' : undefined"
    :data-loading="ctx?.loading.value ? '' : undefined"
    style="contain: layout style"
  >
    <slot>
      <button
        type="button"
        :class="classes"
        :disabled="ctx?.disabled.value || undefined"
        :aria-label="ariaLabel ?? 'More options'"
        :aria-haspopup="true"
        v-bind="{ ...$attrs, class: undefined }"
      >
        <svg
          class="h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
    </slot>
  </div>
</template>
