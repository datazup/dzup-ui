<script setup lang="ts">
import type { DzSidebarSectionProps, DzSidebarSectionSlots } from './DzSidebar.types.ts'
/**
 * DzSidebarSection -- Groups sidebar items with an optional title.
 *
 * Supports collapsible behavior and hides the title label when the
 * sidebar is collapsed (via sr-only class from variants).
 *
 * @example
 * ```vue
 * <DzSidebarSection title="Main Navigation" collapsible>
 *   <DzSidebarItem>Dashboard</DzSidebarItem>
 *   <DzSidebarItem>Reports</DzSidebarItem>
 * </DzSidebarSection>
 * ```
 */
import { computed, inject, ref, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { DZ_SIDEBAR_KEY } from './DzSidebar.types.ts'
import { sidebarVariants } from './DzSidebar.variants.ts'

const props = withDefaults(defineProps<DzSidebarSectionProps>(), {
  title: undefined,
  collapsible: false,
  defaultOpen: true,
})

defineSlots<DzSidebarSectionSlots>()

const attrs = useAttrs()
const sidebarContext = inject(DZ_SIDEBAR_KEY, null)

const isCollapsed = computed(() => sidebarContext?.collapsed.value ?? false)
const isOpen = ref(props.defaultOpen)

const styles = computed(() =>
  sidebarVariants({
    collapsed: isCollapsed.value,
  }),
)

const sectionClasses = computed(() =>
  cn(styles.value.section(), attrs.class as string | undefined),
)

const titleClasses = computed(() => styles.value.sectionTitle())

/** Toggle the section open/closed state */
function toggleSection(): void {
  if (props.collapsible) {
    isOpen.value = !isOpen.value
  }
}

/** Whether section content should be visible */
const showContent = computed(() => !props.collapsible || isOpen.value)
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <div
    :class="sectionClasses"
    role="group"
    :aria-label="title"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <!-- Section title -->
    <template v-if="title || $slots.title">
      <button
        v-if="collapsible && !isCollapsed"
        type="button"
        :class="cn(titleClasses, 'flex w-full items-center justify-between cursor-pointer py-[var(--dz-spacing-1)]')"
        :aria-expanded="isOpen"
        @click="toggleSection"
      >
        <span>
          <slot name="title">{{ title }}</slot>
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
          class="transition-transform duration-200"
          :class="{ 'rotate-180': isOpen }"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <span
        v-else
        :class="cn(titleClasses, 'py-[var(--dz-spacing-1)]')"
      >
        <slot name="title">{{ title }}</slot>
      </span>
    </template>

    <!-- Section items -->
    <div v-if="showContent" class="flex flex-col gap-[var(--dz-spacing-0-5)]">
      <slot />
    </div>
  </div>
</template>
