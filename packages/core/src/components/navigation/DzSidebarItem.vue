<script setup lang="ts">
import type { DzSidebarItemEmits, DzSidebarItemProps, DzSidebarItemSlots } from './DzSidebar.types.ts'
/**
 * DzSidebarItem -- Individual navigation item within a sidebar.
 *
 * Supports polymorphic rendering: renders as `<a>` when `href` is provided,
 * as `<RouterLink>` when `to` is provided, or as `<button>` by default.
 * Inherits collapsed state from parent DzSidebar context (ADR-08).
 *
 * @example
 * ```vue
 * <DzSidebarItem active>
 *   <template #icon><HomeIcon /></template>
 *   Dashboard
 *   <template #badge><span class="badge">3</span></template>
 * </DzSidebarItem>
 * ```
 */
import { computed, inject, resolveComponent, useAttrs } from 'vue'
import { useDzUrlGuard } from '../../composables/provider/useDzUrlPolicy.ts'
import { cn } from '../../utilities/cn.ts'
import { DZ_SIDEBAR_KEY } from './DzSidebar.types.ts'
import { sidebarVariants } from './DzSidebar.variants.ts'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DzSidebarItemProps>(), {
  active: false,
  disabled: false,
  as: undefined,
  href: undefined,
  to: undefined,
  id: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
  ariaInvalid: undefined,
})

const emit = defineEmits<DzSidebarItemEmits>()
defineSlots<DzSidebarItemSlots>()

const attrs = useAttrs()
const sidebarContext = inject(DZ_SIDEBAR_KEY, null)

const isCollapsed = computed(() => sidebarContext?.collapsed.value ?? false)
const activeStyle = computed(() => sidebarContext?.activeStyle.value ?? 'filled')

/**
 * The URL policy (ADR-20 §12, TASK-R2-O4).
 *
 * `DzSidebar` declares the `url` boundary and has no sink of its own — this
 * sub-part copies `props.href` into the rendered attribute map (finding U4). A
 * refused URL renders the `<button>` this component already falls back to, so
 * the row keeps its icon, label, badge and click handler and loses only the
 * navigation.
 */
const guardUrl = useDzUrlGuard('DzSidebarItem')
const urlDecision = computed(() => guardUrl(props.href))

/** Determine which HTML element or component to render */
const computedTag = computed(() => {
  if (props.as)
    return props.as
  if (props.href)
    return urlDecision.value.rejected ? 'button' : 'a'
  if (props.to) {
    try {
      return resolveComponent('RouterLink')
    }
    catch {
      return 'a'
    }
  }
  return 'button'
})

const styles = computed(() =>
  sidebarVariants({
    collapsed: isCollapsed.value,
    active: props.active,
    activeStyle: activeStyle.value,
  }),
)

const itemClasses = computed(() =>
  cn(
    styles.value.item(),
    'dz-disabled-control',
    attrs.class as string | undefined,
  ),
)

const dataState = computed(() =>
  urlDecision.value.rejected ? 'url-rejected' : props.active ? 'active' : 'inactive',
)

/** Build link-specific attributes */
const linkAttrs = computed(() => {
  const result: Record<string, unknown> = {}
  if (urlDecision.value.href !== undefined)
    result.href = urlDecision.value.href
  if (props.to)
    result.to = props.to
  return result
})

function handleClick(event: MouseEvent): void {
  if (props.disabled) {
    event.preventDefault()
    return
  }
  emit('click', event)
}
</script>

<template>
  <component
    :is="computedTag"
    :id="id"
    data-part="item"
    :class="itemClasses"
    :data-state="dataState"
    :aria-current="active ? 'page' : undefined"
    :aria-label="ariaLabel"
    :aria-disabled="disabled || undefined"
    :disabled="computedTag === 'button' ? disabled : undefined"
    :tabindex="disabled ? -1 : 0"
    v-bind="{ ...$attrs, class: undefined, ...linkAttrs }"
    @click="handleClick"
  >
    <!-- Icon slot: always visible -->
    <span v-if="$slots.icon" data-part="icon" class="dz-sidebar-item-icon shrink-0" :class="cn(ui?.icon)">
      <slot name="icon" />
    </span>

    <!-- Label: hidden when collapsed -->
    <span
      v-if="!isCollapsed"
      data-part="item-label"
      class="dz-sidebar-item-label truncate"
      :class="cn(ui?.['item-label'])"
    >
      <slot />
    </span>

    <!-- Badge: hidden when collapsed -->
    <span
      v-if="$slots.badge && !isCollapsed"
      data-part="suffix"
      class="dz-sidebar-item-badge ms-auto shrink-0"
      :class="cn(ui?.suffix)"
    >
      <slot name="badge" />
    </span>
  </component>
</template>
