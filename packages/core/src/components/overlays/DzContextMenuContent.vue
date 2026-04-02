<script setup lang="ts">
import type {
  DzContextMenuContentEmits,
  DzContextMenuContentProps,
  DzContextMenuContentSlots,
} from './DzContextMenu.types.ts'
import { ContextMenuContent, ContextMenuPortal } from 'reka-ui'
/**
 * DzContextMenuContent — Content panel for DzContextMenu.
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { contextMenuVariants } from './DzContextMenu.variants.ts'

withDefaults(defineProps<DzContextMenuContentProps>(), {
  side: 'bottom',
  align: 'start',
  sideOffset: 4,
})

const emit = defineEmits<DzContextMenuContentEmits>()
defineSlots<DzContextMenuContentSlots>()

const attrs = useAttrs()
const styles = computed(() => contextMenuVariants())

const classes = computed(() =>
  cn(styles.value.content(), attrs.class as string | undefined),
)

function handleEscapeKeyDown(event: KeyboardEvent): void {
  emit('escapeKeyDown', event)
}

function handlePointerDownOutside(event: Event): void {
  emit('pointerDownOutside', event)
}
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <ContextMenuPortal>
    <ContextMenuContent
      :id="id"
      :side="side"
      :align="align"
      :side-offset="sideOffset"
      :class="classes"
      :aria-label="ariaLabel"
      v-bind="{ ...$attrs, class: undefined }"
      @escape-key-down="handleEscapeKeyDown"
      @pointer-down-outside="handlePointerDownOutside"
    >
      <slot />
    </ContextMenuContent>
  </ContextMenuPortal>
</template>
