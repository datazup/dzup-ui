<script setup lang="ts">
import { DropdownMenuSeparator } from 'reka-ui'
/**
 * DzDropdownMenuSeparator — Visual divider between menu items.
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { dropdownMenuVariants } from './DzDropdownMenu.variants.ts'

defineOptions({
  inheritAttrs: false,
})

const attrs = useAttrs()
const styles = computed(() => dropdownMenuVariants())

const classes = computed(() =>
  cn(styles.value.separator(), attrs.class as string | undefined),
)
</script>

<template>
  <DropdownMenuSeparator :class="classes" v-bind="{ ...$attrs, class: undefined }" />
</template>
