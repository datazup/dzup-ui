<script setup lang="ts">
import type { DzListItemEmits, DzListItemProps, DzListItemSlots } from './DzList.types.ts'
/**
 * DzListItem — Child item within a DzList compound component.
 *
 * Inherits size, variant, and interactive settings from parent DzList
 * via inject (ADR-08).
 *
 * @example
 * ```vue
 * <DzListItem>Simple item</DzListItem>
 * <DzListItem active tone="primary">
 *   <template #prefix><UserIcon /></template>
 *   Active item
 * </DzListItem>
 * ```
 */
import { computed, inject, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { DZ_LIST_KEY } from './DzList.types.ts'
import { listVariants } from './DzList.variants.ts'

const props = withDefaults(defineProps<DzListItemProps>(), {
  disabled: false,
  active: false,
  tone: undefined,
})

const emit = defineEmits<DzListItemEmits>()
defineSlots<DzListItemSlots>()

const attrs = useAttrs()
const listContext = inject(DZ_LIST_KEY, null)

const styles = computed(() =>
  listVariants({
    variant: listContext?.variant.value ?? 'plain',
    size: listContext?.size.value ?? 'md',
    interactive: listContext?.interactive.value ?? false,
  }),
)

const classes = computed(() =>
  cn(
    styles.value.item(),
    props.active ? 'bg-[var(--dz-primary-muted)] text-[var(--dz-primary)]' : '',
    props.disabled ? 'opacity-50 pointer-events-none' : '',
    attrs.class as string | undefined,
  ),
)

function handleClick(event: MouseEvent): void {
  if (props.disabled)
    return
  if (listContext?.interactive.value) {
    emit('click', event)
  }
}
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <li
    :id="id"
    :class="classes"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    :aria-describedby="ariaDescribedby"
    :aria-selected="active || undefined"
    :aria-disabled="disabled || undefined"
    :data-state="active ? 'active' : undefined"
    :data-tone="tone"
    :data-disabled="disabled ? '' : undefined"
    :tabindex="listContext?.interactive.value ? 0 : undefined"
    role="listitem"
    v-bind="{ ...$attrs, class: undefined }"
    @click="handleClick"
  >
    <slot name="prefix" />
    <span class="flex-1"><slot /></span>
    <slot name="suffix" />
  </li>
</template>
