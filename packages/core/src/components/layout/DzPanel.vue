<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

import type { DzPanelEmits, DzPanelProps, DzPanelSlots } from './DzPanel.types.ts'
/**
 * DzPanel -- titled container with optional header actions and collapse.
 *
 * Groups a form section or settings block under a titled, optionally-
 * collapsible frame. Reuses DzCollapse for the expand/collapse animation.
 * Collapse state is two-way bound via `v-model:collapsed` (defineModel, ADR-16).
 *
 * a11y: when collapsible, the header is a `<button>` exposing `aria-expanded`
 * and `aria-controls` pointing at the region; collapsed content is marked
 * `inert` so it leaves the tab order.
 *
 * @example
 * ```vue
 * <DzPanel header="Billing details" collapsible v-model:collapsed="collapsed">
 *   <template #actions><DzButton size="sm">Edit</DzButton></template>
 *   <p>Section content…</p>
 * </DzPanel>
 * ```
 */
import { computed, useAttrs, useId, useSlots } from 'vue'
import { cn } from '../../utilities/cn.ts'
import DzCollapse from './DzCollapse.vue'
import {
  panelBodyVariants,
  panelChevronVariants,
  panelHeaderVariants,
  panelTitleVariants,
  panelTriggerVariants,
  panelVariants,
} from './DzPanel.variants.ts'

const props = withDefaults(defineProps<DzPanelProps>(), {
  variant: 'outlined',
  size: 'md',
  tone: 'neutral',
  collapsible: false,
  as: 'div',
})

const emit = defineEmits<DzPanelEmits>()

defineSlots<DzPanelSlots>()

/** Two-way collapse state (ADR-16). `true` = collapsed/hidden. */
const collapsed = defineModel<boolean>('collapsed', { default: false })

const attrs = useAttrs()
const slots = useSlots()

/** Stable id linking the toggle (`aria-controls`) to the collapsible region. */
const regionId = useId()

/** DzCollapse models the *expanded* state — the inverse of `collapsed`. */
const expanded = computed({
  get: () => !collapsed.value,
  set: (value: boolean) => {
    collapsed.value = !value
  },
})

/** Whether header-right controls are present. */
const hasActions = computed(() => Boolean(slots.actions))

function toggle(): void {
  if (!props.collapsible)
    return
  collapsed.value = !collapsed.value
  emit('toggle', collapsed.value)
}

const classes = computed(() =>
  cn(
    panelVariants({ variant: props.variant, size: props.size }),
    attrs.class as string | undefined,
  ),
)
</script>

<template>
  <component
    :is="as"
    :id="id"
    :class="classes"
    :data-variant="variant"
    :data-size="size"
    :data-tone="tone"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    :aria-describedby="ariaDescribedby"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <div :class="panelHeaderVariants({ bordered: variant !== 'legend' })">
      <component
        :is="collapsible ? 'button' : 'div'"
        :type="collapsible ? 'button' : undefined"
        :aria-expanded="collapsible ? expanded : undefined"
        :aria-controls="collapsible ? regionId : undefined"
        :class="panelTriggerVariants({ collapsible })"
        @click="toggle"
      >
        <span :class="panelTitleVariants()">
          <slot name="header">{{ header }}</slot>
        </span>
        <svg
          v-if="collapsible"
          :class="panelChevronVariants({ expanded })"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </component>

      <div v-if="hasActions" class="flex shrink-0 items-center gap-[var(--dz-panel-gap)]">
        <slot name="actions" />
      </div>
    </div>

    <DzCollapse v-if="collapsible" :id="regionId" v-model="expanded">
      <div :class="panelBodyVariants()" :inert="collapsed || undefined">
        <slot />
      </div>
    </DzCollapse>
    <div v-else :id="regionId" :class="panelBodyVariants()">
      <slot />
    </div>
  </component>
</template>
