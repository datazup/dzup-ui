<script setup lang="ts">
import type { DzMenuContext, DzMenuProps, DzMenuSlots } from './DzMenu.types.ts'
/**
 * DzMenu — Vertical navigation menu.
 *
 * Provides size and collapsed context to child items via inject (ADR-08).
 *
 * @example
 * ```vue
 * <DzMenu aria-label="Main navigation">
 *   <DzMenuItem active>
 *     <template #icon><HomeIcon /></template>
 *     Home
 *   </DzMenuItem>
 *   <DzMenuItem>
 *     <template #icon><SettingsIcon /></template>
 *     Settings
 *   </DzMenuItem>
 *   <DzMenuSeparator />
 *   <DzMenuItem>Logout</DzMenuItem>
 * </DzMenu>
 * ```
 */
import { computed, provide, toRef, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { DZ_MENU_KEY } from './DzMenu.types.ts'
import { menuVariants } from './DzMenu.variants.ts'

const props = withDefaults(defineProps<DzMenuProps>(), {
  size: 'md',
  collapsed: false,
})

defineSlots<DzMenuSlots>()

const attrs = useAttrs()

const context: DzMenuContext = {
  size: toRef(() => props.size),
  collapsed: toRef(() => props.collapsed),
}

provide(DZ_MENU_KEY, context)

const styles = computed(() => menuVariants({ size: props.size }))

const rootClasses = computed(() =>
  cn(styles.value.root(), attrs.class as string | undefined),
)
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <nav
    :id="id"
    :class="rootClasses"
    :aria-label="ariaLabel"
    data-state="ready"
    role="navigation"
    style="contain: layout style"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <slot />
  </nav>
</template>
