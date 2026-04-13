<script setup lang="ts">
import type { DzAppShellProps, DzAppShellSlots } from './DzAppShell.types.ts'
/**
 * DzAppShell -- Application shell layout.
 *
 * Provides a standard app layout with optional sidebar, header,
 * and main content area. Handles overflow and viewport sizing.
 *
 * @example
 * ```vue
 * <DzAppShell>
 *   <template #sidebar>Navigation</template>
 *   <template #header>Top bar</template>
 *   Main content here
 * </DzAppShell>
 * ```
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { appShellVariants } from './DzAppShell.variants.ts'

const props = withDefaults(defineProps<DzAppShellProps>(), {
  hasSidebar: true,
  hasHeader: true,
  sidebarWidth: '16rem',
  sidebarCollapsedWidth: '4rem',
  headerHeight: '4rem',
})

defineSlots<DzAppShellSlots>()

const attrs = useAttrs()

const styles = computed(() =>
  appShellVariants({
    hasSidebar: props.hasSidebar,
    hasHeader: props.hasHeader,
  }),
)

/** Merged class string using cn() (ADR-10) */
const rootClasses = computed(() =>
  cn(styles.value.root(), attrs.class as string | undefined),
)

/** CSS custom property for sidebar content offset + containment */
const rootStyles = computed(() => {
  const base: Record<string, string> = { contain: 'layout style' }
  base['--dz-appshell-sidebar-width'] = props.hasSidebar ? props.sidebarWidth : '0px'
  return base
})
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <div
    :id="id"
    :class="rootClasses"
    :style="rootStyles"
    :aria-label="ariaLabel"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <!-- Sidebar slot -->
    <slot v-if="hasSidebar" name="sidebar" />

    <!-- Content area (header + main) -->
    <div :class="styles.content()">
      <!-- Header -->
      <header
        v-if="hasHeader"
        :class="styles.header()"
      >
        <slot name="header" />
      </header>

      <!-- Main content -->
      <main :class="styles.main()">
        <slot />
      </main>
    </div>
  </div>
</template>
