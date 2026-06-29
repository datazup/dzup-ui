<script setup lang="ts">
import { ContextMenuSeparator } from 'reka-ui'
/**
 * DzContextMenuSeparator — Visual divider between context menu items.
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { contextMenuVariants } from './DzContextMenu.variants.ts'

defineOptions({
  inheritAttrs: false,
})

const attrs = useAttrs()
const styles = computed(() => contextMenuVariants())

const classes = computed(() =>
  cn(styles.value.separator(), attrs.class as string | undefined),
)
</script>

<template>
  <ContextMenuSeparator :class="classes" v-bind="{ ...$attrs, class: undefined }" />
</template>
