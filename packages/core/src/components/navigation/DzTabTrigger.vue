<script setup lang="ts">
import type { DzTabTriggerProps, DzTabTriggerSlots } from './DzTabs.types.ts'
import { TabsTrigger } from 'reka-ui'
/**
 * DzTabTrigger — Individual tab button using Reka UI TabsTrigger.
 *
 * Inherits variant/size from parent DzTabs context (ADR-08).
 * Supports `closable` prop to render a close button for tab removal.
 *
 * @example
 * ```vue
 * <DzTabTrigger value="settings">Settings</DzTabTrigger>
 * <DzTabTrigger value="temp" closable>Temporary</DzTabTrigger>
 * ```
 */
import { computed, inject, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { DZ_TABS_KEY } from './DzTabs.types.ts'
import { tabsVariants } from './DzTabs.variants.ts'

const props = withDefaults(defineProps<DzTabTriggerProps>(), {
  disabled: false,
  closable: false,
})

defineSlots<DzTabTriggerSlots>()

const attrs = useAttrs()
const tabsContext = inject(DZ_TABS_KEY, null)

if (!tabsContext && import.meta.env?.DEV) {
  console.warn('[DzTabTrigger] must be used inside a <DzTabs> parent.')
}

const styles = computed(() =>
  tabsVariants({
    variant: tabsContext?.variant.value ?? 'line',
    size: tabsContext?.size.value ?? 'md',
    orientation: tabsContext?.orientation.value ?? 'horizontal',
  }),
)

const classes = computed(() =>
  cn(styles.value.trigger(), attrs.class as string | undefined),
)

/** Handle close button click — stops propagation to prevent tab activation */
function handleCloseClick(event: MouseEvent): void {
  event.stopPropagation()
  event.preventDefault()
  tabsContext?.onClose?.(props.value)
}

/** Handle keydown on the trigger — Delete/Backspace emits close when closable */
function handleKeydown(event: KeyboardEvent): void {
  if (
    props.closable
    && !props.disabled
    && (event.key === 'Delete' || event.key === 'Backspace')
  ) {
    event.preventDefault()
    tabsContext?.onClose?.(props.value)
  }
}
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <TabsTrigger
    :value="value"
    :disabled="disabled"
    :class="classes"
    :data-disabled="disabled ? '' : undefined"
    :data-closable="closable ? '' : undefined"
    v-bind="{ ...$attrs, class: undefined }"
    @keydown="handleKeydown"
  >
    <span class="dz-tab-trigger-content">
      <slot />
    </span>
    <button
      v-if="closable"
      type="button"
      class="dz-tab-close-btn"
      :tabindex="-1"
      aria-label="Close tab"
      :disabled="disabled"
      @click="handleCloseClick"
      @pointerdown.stop
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  </TabsTrigger>
</template>

<style scoped>
.dz-tab-trigger-content {
  display: inline-flex;
  align-items: center;
}

.dz-tab-close-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: var(--dz-spacing-1, 0.25rem);
  padding: var(--dz-spacing-0-5, 0.125rem);
  border: none;
  background: transparent;
  color: currentColor;
  border-radius: var(--dz-radius-sm, 0.125rem);
  cursor: pointer;
  opacity: 0;
  transition: opacity var(--dz-transition-fast, 150ms), background var(--dz-transition-fast, 150ms);
}

/* Show close button on trigger hover or when tab is active */
:deep([data-closable]) .dz-tab-close-btn,
:deep([data-state="active"][data-closable]) .dz-tab-close-btn {
  opacity: 0.5;
}

/* Direct parent selectors for hover/active */
[data-closable]:hover .dz-tab-close-btn,
[data-state="active"] .dz-tab-close-btn {
  opacity: 0.5;
}

.dz-tab-close-btn:hover {
  opacity: 1 !important;
  background: var(--dz-muted);
}

.dz-tab-close-btn:disabled {
  pointer-events: none;
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .dz-tab-close-btn {
    transition: none;
  }
}
</style>
