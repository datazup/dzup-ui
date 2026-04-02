<script setup lang="ts">
import type { DzMenuItemEmits, DzMenuItemProps, DzMenuItemSlots } from './DzMenu.types.ts'
/**
 * DzMenuItem — A single item within DzMenu.
 */
import { computed, inject, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { DZ_MENU_KEY } from './DzMenu.types.ts'
import { menuVariants } from './DzMenu.variants.ts'

const props = withDefaults(defineProps<DzMenuItemProps>(), {
  active: false,
  disabled: false,
})

const emit = defineEmits<DzMenuItemEmits>()
defineSlots<DzMenuItemSlots>()

const attrs = useAttrs()
const ctx = inject(DZ_MENU_KEY, null)

const styles = computed(() =>
  menuVariants({
    size: ctx?.size.value ?? 'md',
    active: props.active || undefined,
    disabled: props.disabled || undefined,
  }),
)

const classes = computed(() =>
  cn(styles.value.item(), attrs.class as string | undefined),
)

function handleClick(event: MouseEvent): void {
  if (props.disabled)
    return
  emit('click', event)
}
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <a
    v-if="href"
    :href="href"
    :class="classes"
    :aria-label="ariaLabel"
    :aria-current="active ? 'page' : undefined"
    :aria-disabled="disabled || undefined"
    :data-state="active ? 'active' : undefined"
    :data-disabled="disabled ? '' : undefined"
    :tabindex="disabled ? -1 : 0"
    v-bind="{ ...$attrs, class: undefined }"
    @click="handleClick"
  >
    <slot name="icon" />
    <span v-if="!ctx?.collapsed.value">
      <slot />
    </span>
  </a>
  <button
    v-else
    type="button"
    :class="classes"
    :aria-label="ariaLabel"
    :aria-current="active ? 'page' : undefined"
    :disabled="disabled || undefined"
    :data-state="active ? 'active' : undefined"
    :data-disabled="disabled ? '' : undefined"
    v-bind="{ ...$attrs, class: undefined }"
    @click="handleClick"
  >
    <slot name="icon" />
    <span v-if="!ctx?.collapsed.value">
      <slot />
    </span>
  </button>
</template>
