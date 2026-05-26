<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

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
import { computed, onMounted, onUnmounted, provide, ref, useAttrs, watch } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { DZ_SIDEBAR_KEY } from './DzSidebar.types.ts'
import { sidebarVariants } from './DzSidebar.variants.ts'

const collapsedModel = defineModel<boolean>('collapsed', { default: false })
const mobileOpenModel = defineModel<boolean>('mobileOpen', { default: false })

const props = withDefaults(defineProps<DzSidebarProps>(), {
  width: undefined,
  collapsedWidth: undefined,
  position: 'static',
  mobileBreakpoint: 1024,
  isMobile: undefined,
  activeStyle: 'filled',
  id: undefined,
  ariaLabel: 'Sidebar navigation',
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
  ariaInvalid: undefined,
})

defineEmits<DzSidebarEmits>()
defineSlots<DzSidebarSlots>()
const attrs = useAttrs()

// Mobile detection: prop wins; otherwise self-managed matchMedia.
const internalMobile = ref(false)
const canUseMatchMedia = typeof window !== 'undefined' && typeof window.matchMedia === 'function'

let mql: MediaQueryList | null = null
function onMqlChange(e: MediaQueryListEvent | MediaQueryList): void {
  internalMobile.value = e.matches
}
function setupMql(breakpoint: number): void {
  if (!canUseMatchMedia) return
  if (mql) {
    mql.removeEventListener('change', onMqlChange as (e: MediaQueryListEvent) => void)
  }
  mql = window.matchMedia(`(max-width: ${breakpoint - 0.02}px)`)
  internalMobile.value = mql.matches
  mql.addEventListener('change', onMqlChange as (e: MediaQueryListEvent) => void)
}

onMounted(() => {
  if (props.isMobile === undefined) setupMql(props.mobileBreakpoint)
})
onUnmounted(() => {
  if (mql) mql.removeEventListener('change', onMqlChange as (e: MediaQueryListEvent) => void)
})
watch(() => props.mobileBreakpoint, (next) => {
  if (props.isMobile === undefined) setupMql(next)
})

const isMobile = computed(() => (props.isMobile !== undefined ? props.isMobile : internalMobile.value))

const positionRef = computed(() => props.position)
const activeStyleRef = computed(() => props.activeStyle)

const context: DzSidebarContext = {
  collapsed: collapsedModel,
  isMobile,
  position: positionRef,
  activeStyle: activeStyleRef,
}
provide(DZ_SIDEBAR_KEY, context)

const styles = computed(() =>
  sidebarVariants({
    position: isMobile.value ? 'fixed' : props.position,
    collapsed: isMobile.value ? false : collapsedModel.value,
    mobile: isMobile.value && mobileOpenModel.value,
    mobileHidden: isMobile.value && !mobileOpenModel.value,
  }),
)

const rootClasses = computed(() => cn(styles.value.root(), attrs.class as string | undefined))
const overlayClasses = computed(() => styles.value.overlay())
const bodyClasses = computed(() => styles.value.body())

const rootStyles = computed(() => {
  const result: Record<string, string> = {}
  if (props.width) result['--dz-sidebar-width'] = props.width
  if (props.collapsedWidth) result['--dz-sidebar-collapsed-width'] = props.collapsedWidth
  return result
})

const dataState = computed(() => collapsedModel.value ? 'collapsed' : 'expanded')

function handleOverlayClick(): void { mobileOpenModel.value = false }
</script>


<template>
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
    <div :class="bodyClasses">
      <slot :collapsed="collapsedModel" />
    </div>
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
