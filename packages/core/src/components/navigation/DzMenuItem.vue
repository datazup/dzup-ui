<script setup lang="ts">
import type { DzMenuItemEmits, DzMenuItemProps, DzMenuItemSlots } from './DzMenu.types.ts'
/**
 * DzMenuItem — A single item within DzMenu.
 */
import { computed, inject, useAttrs } from 'vue'
import { useDzUrlGuard } from '../../composables/provider/useDzUrlPolicy.ts'
import { cn } from '../../utilities/cn.ts'
import { DZ_MENU_KEY } from './DzMenu.types.ts'
import { menuVariants } from './DzMenu.variants.ts'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DzMenuItemProps>(), {
  active: false,
  disabled: false,
})

const emit = defineEmits<DzMenuItemEmits>()
defineSlots<DzMenuItemSlots>()

const attrs = useAttrs()
const ctx = inject(DZ_MENU_KEY, null)

const styles = computed(() =>
  menuVariants({
    size: ctx?.size.value ?? 'md',
    active: props.active || undefined,
  }),
)

const classes = computed(() => cn(styles.value.item(), attrs.class as string | undefined))

/**
 * The URL policy (ADR-20 §12, TASK-R2-O4).
 *
 * `DzMenu` declares the `url` boundary and has no sink of its own — this
 * sub-part carries the `href` (finding U4). A refused URL takes the `<button>`
 * branch this component already has for item entries that are not links, so the
 * item stays focusable and still emits `click`; it simply stops navigating.
 */
const guardUrl = useDzUrlGuard('DzMenuItem')
const urlDecision = computed(() => guardUrl(props.href))

function handleClick(event: MouseEvent): void {
  if (props.disabled)
    return
  emit('click', event)
}
</script>

<template>
  <a
    v-if="urlDecision.href"
    :href="urlDecision.href"
    data-part="item"
    :class="classes"
    :aria-label="ariaLabel"
    :aria-current="active ? 'page' : undefined"
    :aria-disabled="disabled || undefined"
    :data-state="active ? 'active' : undefined"
    :data-disabled="disabled ? '' : undefined"
    :tabindex="disabled ? -1 : 0"
    v-bind="{ ...$attrs, class: undefined }"
    @click="handleClick"
  >
    <slot name="icon" />
    <span v-if="!ctx?.collapsed.value" data-part="item-label" :class="cn(ui?.['item-label'])">
      <slot />
    </span>
  </a>
  <button
    v-else
    type="button"
    data-part="item"
    :class="classes"
    :aria-label="ariaLabel"
    :aria-current="active ? 'page' : undefined"
    :aria-disabled="disabled ? 'true' : undefined"
    :disabled="disabled || undefined"
    :data-state="urlDecision.rejected ? 'url-rejected' : active ? 'active' : undefined"
    :data-disabled="disabled ? '' : undefined"
    v-bind="{ ...$attrs, class: undefined }"
    @click="handleClick"
  >
    <slot name="icon" />
    <span v-if="!ctx?.collapsed.value" data-part="item-label" :class="cn(ui?.['item-label'])">
      <slot />
    </span>
  </button>
</template>
