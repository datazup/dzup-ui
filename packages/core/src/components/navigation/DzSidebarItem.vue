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
import { cn } from '../../utilities/cn.ts'
import { DZ_SIDEBAR_KEY } from './DzSidebar.types.ts'
import { sidebarVariants } from './DzSidebar.variants.ts'

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

/** Determine which HTML element or component to render */
const computedTag = computed(() => {
  if (props.as)
    return props.as
  if (props.href)
    return 'a'
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
  }),
)

const itemClasses = computed(() =>
  cn(
    styles.value.item(),
    props.active && 'bg-[var(--dz-muted)] text-[var(--dz-foreground)] border-l-[3px] border-l-[var(--dz-primary)] !pl-[calc(var(--dz-spacing-3)-3px)]',
    props.disabled && 'pointer-events-none opacity-50',
    attrs.class as string | undefined,
  ),
)

const dataState = computed(() => (props.active ? 'active' : 'inactive'))

/** Build link-specific attributes */
const linkAttrs = computed(() => {
  const result: Record<string, unknown> = {}
  if (props.href)
    result.href = props.href
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

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <component
    :is="computedTag"
    :id="id"
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
    <span v-if="$slots.icon" class="dz-sidebar-item-icon shrink-0">
      <slot name="icon" />
    </span>

    <!-- Label: hidden when collapsed -->
    <span
      v-if="!isCollapsed"
      class="dz-sidebar-item-label truncate"
    >
      <slot />
    </span>

    <!-- Badge: hidden when collapsed -->
    <span
      v-if="$slots.badge && !isCollapsed"
      class="dz-sidebar-item-badge ml-auto shrink-0"
    >
      <slot name="badge" />
    </span>
  </component>
</template>
