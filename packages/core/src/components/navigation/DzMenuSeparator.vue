<script setup lang="ts">
/**
 * DzMenuSeparator — Visual divider between menu items.
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { menuVariants } from './DzMenu.variants.ts'

const attrs = useAttrs()
const styles = computed(() => menuVariants())

const classes = computed(() =>
  cn(styles.value.separator(), attrs.class as string | undefined),
)
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <div
    :class="classes"
    role="separator"
    aria-orientation="horizontal"
    v-bind="{ ...$attrs, class: undefined }"
  />
</template>
