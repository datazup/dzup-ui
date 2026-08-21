<script setup lang="ts">
import type {
  DzSidebarContext,
  DzSidebarEmits,
  DzSidebarProps,
  DzSidebarSlots,
} from './DzSidebar.types.ts'
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
import { useDzPortalTarget } from '../../composables/provider/useDzEnvironment.ts'
import { useComponentMessages } from '../../i18n/useComponentMessages.ts'
import { cn } from '../../utilities/cn.ts'
import { DZ_SIDEBAR_KEY } from './DzSidebar.types.ts'
import { sidebarVariants } from './DzSidebar.variants.ts'

defineOptions({
  inheritAttrs: false,
})

const collapsedModel = defineModel<boolean>('collapsed', { default: false })
const mobileOpenModel = defineModel<boolean>('mobileOpen', { default: false })

const props = withDefaults(defineProps<DzSidebarProps>(), {
  width: undefined,
  collapsedWidth: undefined,
  position: 'static',
  mobileBreakpoint: 1024,
  isMobile: undefined,
  activeStyle: 'filled',
  storageKey: undefined,
  id: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
  ariaInvalid: undefined,
})

defineEmits<DzSidebarEmits>()
defineSlots<DzSidebarSlots>()
// Portal target: an explicit `portalTo` on this instance, then the application's
// `DzProvider` target, then `body` (ADR-20, TASK-OSS-P4-04). `'body'` is spelled
// out here rather than left to the portal's default because `<Teleport>` requires
// a target and has no default of its own.
const dzPortalTarget = useDzPortalTarget()
const resolvedPortalTo = computed(() => props.portalTo ?? dzPortalTarget.value ?? 'body')

// User-visible strings, resolved against the application's catalog (ADR-20).
// An explicit prop still wins; these are the defaults that used to be literals.
const dzMessages = useComponentMessages('DzSidebar')
const resolvedAriaLabel = computed(() => props.ariaLabel ?? dzMessages.value.ariaLabel)

const canUseStorage = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'

function readStored(key: string): boolean | null {
  if (!canUseStorage)
    return null
  try {
    const raw = window.localStorage.getItem(key)
    if (raw === '1' || raw === 'true')
      return true
    if (raw === '0' || raw === 'false')
      return false
    return null
  }
  catch {
    return null
  }
}

function writeStored(key: string, value: boolean): void {
  if (!canUseStorage)
    return
  try {
    window.localStorage.setItem(key, value ? '1' : '0')
  }
  catch {
    // ignore quota / disabled storage
  }
}

onMounted(() => {
  if (!props.storageKey)
    return
  const stored = readStored(props.storageKey)
  if (stored !== null)
    collapsedModel.value = stored
})

watch(
  () => [props.storageKey, collapsedModel.value] as const,
  ([key, value]) => {
    if (typeof key === 'string' && key.length > 0)
      writeStored(key, value)
  },
)

const attrs = useAttrs()

// Mobile detection: prop wins; otherwise self-managed matchMedia.
const internalMobile = ref(false)
const canUseMatchMedia = typeof window !== 'undefined' && typeof window.matchMedia === 'function'

let mql: MediaQueryList | null = null
function onMqlChange(e: MediaQueryListEvent | MediaQueryList): void {
  internalMobile.value = e.matches
}
function setupMql(breakpoint: number): void {
  if (!canUseMatchMedia)
    return
  if (mql) {
    mql.removeEventListener('change', onMqlChange as (e: MediaQueryListEvent) => void)
  }
  mql = window.matchMedia(`(max-width: ${breakpoint - 0.02}px)`)
  internalMobile.value = mql.matches
  mql.addEventListener('change', onMqlChange as (e: MediaQueryListEvent) => void)
}

onMounted(() => {
  if (props.isMobile === undefined)
    setupMql(props.mobileBreakpoint)
})
onUnmounted(() => {
  if (mql)
    mql.removeEventListener('change', onMqlChange as (e: MediaQueryListEvent) => void)
})
watch(
  () => props.mobileBreakpoint,
  (next) => {
    if (props.isMobile === undefined)
      setupMql(next)
  },
)

const isMobile = computed(() =>
  props.isMobile !== undefined ? props.isMobile : internalMobile.value,
)

const positionRef = computed(() => props.position)
const activeStyleRef = computed(() => props.activeStyle)

const context: DzSidebarContext = {
  collapsed: collapsedModel,
  isMobile,
  position: positionRef,
  activeStyle: activeStyleRef,
}
provide(DZ_SIDEBAR_KEY, context)

// Closed mobile drawer: still in the DOM (transform slide-in animates from
// off-screen), but it must leave the a11y tree + tab order so SR/keyboard
// users are not routed through hidden links. `inert` + `aria-hidden` do this
// without `display:none`/`hidden`, which would break the slide transition.
const mobileClosed = computed(() => isMobile.value && !mobileOpenModel.value)

const styles = computed(() =>
  sidebarVariants({
    position: isMobile.value ? 'fixed' : props.position,
    collapsed: isMobile.value ? false : collapsedModel.value,
    mobile: isMobile.value && mobileOpenModel.value,
    mobileHidden: mobileClosed.value,
  }),
)

const rootClasses = computed(() => cn(styles.value.root(), attrs.class as string | undefined))
const overlayClasses = computed(() => styles.value.overlay())
const bodyClasses = computed(() => styles.value.body())

const rootStyles = computed(() => {
  const result: Record<string, string> = {}
  if (props.width)
    result['--dz-sidebar-width'] = props.width
  if (props.collapsedWidth)
    result['--dz-sidebar-collapsed-width'] = props.collapsedWidth
  return result
})

const dataState = computed(() => (collapsedModel.value ? 'collapsed' : 'expanded'))

function handleOverlayClick(): void {
  mobileOpenModel.value = false
}
</script>

<template>
  <Teleport :to="resolvedPortalTo">
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
    :aria-label="resolvedAriaLabel"
    :aria-labelledby="ariaLabelledby"
    :aria-describedby="ariaDescribedby"
    :aria-hidden="mobileClosed ? 'true' : undefined"
    :inert="mobileClosed || undefined"
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
