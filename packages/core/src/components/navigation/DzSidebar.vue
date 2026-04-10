<script setup lang="ts">
import type { DzSidebarContext, DzSidebarEmits, DzSidebarProps, DzSidebarSlots } from './DzSidebar.types.ts'
/**
 * DzSidebar -- Collapsible navigation sidebar root component.
 *
 * Provides collapsed/mobile context to child components via
 * provide/inject (ADR-08).
 * v-model:collapsed and v-model:mobileOpen via defineModel (ADR-16).
 *
 * @example
 * ```vue
 * <DzSidebar v-model:collapsed="isCollapsed" v-model:mobile-open="isMobileOpen">
 *   <DzSidebarHeader>Logo</DzSidebarHeader>
 *   <DzSidebarSection title="Main">
 *     <DzSidebarItem active>Dashboard</DzSidebarItem>
 *     <DzSidebarItem>Settings</DzSidebarItem>
 *   </DzSidebarSection>
 *   <DzSidebarFooter>User</DzSidebarFooter>
 * </DzSidebar>
 * ```
 */
import { computed, provide, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { DZ_SIDEBAR_KEY } from './DzSidebar.types.ts'
import { sidebarVariants } from './DzSidebar.variants.ts'

const collapsedModel = defineModel<boolean>('collapsed', { default: false })
const mobileOpenModel = defineModel<boolean>('mobileOpen', { default: false })

const props = withDefaults(defineProps<DzSidebarProps>(), {
  width: undefined,
  collapsedWidth: undefined,
  id: undefined,
  ariaLabel: 'Sidebar navigation',
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
  ariaInvalid: undefined,
})

defineEmits<DzSidebarEmits>()
defineSlots<DzSidebarSlots>()

const attrs = useAttrs()

/** Detect mobile viewport via matchMedia */
const isMobile = computed(() => {
  if (typeof window === 'undefined')
    return false
  return window.innerWidth < 1024
})

const context: DzSidebarContext = {
  collapsed: collapsedModel,
  isMobile,
}

provide(DZ_SIDEBAR_KEY, context)

const styles = computed(() =>
  sidebarVariants({
    collapsed: isMobile.value ? false : collapsedModel.value,
    mobile: isMobile.value && mobileOpenModel.value,
  }),
)

const rootClasses = computed(() =>
  cn(styles.value.root(), attrs.class as string | undefined),
)

const overlayClasses = computed(() => styles.value.overlay())

const rootStyles = computed(() => {
  const result: Record<string, string> = {}
  if (props.width) {
    result['--dz-sidebar-width'] = props.width
  }
  if (props.collapsedWidth) {
    result['--dz-sidebar-collapsed-width'] = props.collapsedWidth
  }
  return result
})

const dataState = computed(() =>
  collapsedModel.value ? 'collapsed' : 'expanded',
)

/** Close the mobile overlay */
function handleOverlayClick(): void {
  mobileOpenModel.value = false
}
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <!-- Mobile overlay backdrop -->
  <Teleport to="body">
    <Transition name="dz-sidebar-overlay">
      <div
        v-if="isMobile && mobileOpenModel"
        :class="overlayClasses"
        aria-hidden="true"
        @click="handleOverlayClick"
      />
    </Transition>
  </Teleport>

  <nav
    :id="id"
    :class="rootClasses"
    :style="rootStyles"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    :aria-describedby="ariaDescribedby"
    :data-state="dataState"
    role="navigation"
    style="contain: layout style"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <slot :collapsed="collapsedModel" />
  </nav>
</template>

<style scoped>
.dz-sidebar-overlay-enter-active,
.dz-sidebar-overlay-leave-active {
  transition: opacity var(--dz-transition-normal, 200ms) ease;
}

.dz-sidebar-overlay-enter-from,
.dz-sidebar-overlay-leave-to {
  opacity: 0;
}
</style>
