<script setup lang="ts">
import type { DzSidebarHeaderProps, DzSidebarHeaderSlots } from './DzSidebar.types.ts'
/**
 * DzSidebarHeader -- Top section of the sidebar.
 *
 * Provides the collapsed state to its default slot for responsive rendering
 * (e.g., showing a logo icon vs. full logo).
 *
 * @example
 * ```vue
 * <DzSidebarHeader>
 *   <template #default="{ collapsed }">
 *     <LogoIcon v-if="collapsed" />
 *     <LogoFull v-else />
 *   </template>
 * </DzSidebarHeader>
 * ```
 */
import { computed, inject, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { DZ_SIDEBAR_KEY } from './DzSidebar.types.ts'
import { sidebarVariants } from './DzSidebar.variants.ts'

defineProps<DzSidebarHeaderProps>()
defineSlots<DzSidebarHeaderSlots>()

const attrs = useAttrs()
const sidebarContext = inject(DZ_SIDEBAR_KEY, null)

const isCollapsed = computed(() => sidebarContext?.collapsed.value ?? false)

const styles = computed(() =>
  sidebarVariants({
    collapsed: isCollapsed.value,
  }),
)

const headerClasses = computed(() =>
  cn(styles.value.header(), attrs.class as string | undefined),
)
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <div
    :class="headerClasses"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <slot :collapsed="isCollapsed" />
  </div>
</template>
