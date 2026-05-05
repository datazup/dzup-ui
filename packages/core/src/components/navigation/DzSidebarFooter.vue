<script setup lang="ts">
import type { DzSidebarFooterProps, DzSidebarFooterSlots } from './DzSidebar.types.ts'
/**
 * DzSidebarFooter -- Bottom section of the sidebar.
 *
 * Automatically pushed to the bottom via `mt-auto`. Provides the
 * collapsed state to its default slot for responsive rendering.
 *
 * @example
 * ```vue
 * <DzSidebarFooter>
 *   <template #default="{ collapsed }">
 *     <UserAvatar v-if="collapsed" />
 *     <UserProfile v-else />
 *   </template>
 * </DzSidebarFooter>
 * ```
 */
import { computed, inject, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { DZ_SIDEBAR_KEY } from './DzSidebar.types.ts'
import { sidebarVariants } from './DzSidebar.variants.ts'

defineProps<DzSidebarFooterProps>()
defineSlots<DzSidebarFooterSlots>()

const attrs = useAttrs()
const sidebarContext = inject(DZ_SIDEBAR_KEY, null)

const isCollapsed = computed(() => sidebarContext?.collapsed.value ?? false)

const styles = computed(() =>
  sidebarVariants({
    collapsed: isCollapsed.value,
  }),
)

const footerClasses = computed(() =>
  cn(styles.value.footer(), attrs.class as string | undefined),
)
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <div
    :class="footerClasses"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <slot :collapsed="isCollapsed" />
  </div>
</template>
