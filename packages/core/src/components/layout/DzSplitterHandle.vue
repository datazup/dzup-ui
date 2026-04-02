<script setup lang="ts">
import type { DzSplitterHandleProps, DzSplitterHandleSlots } from './DzSplitter.types.ts'
import { SplitterResizeHandle } from 'reka-ui'
/**
 * DzSplitterHandle — Naming alias for DzResizableHandle.
 *
 * Identical to DzResizableHandle; uses the same Reka UI SplitterResizeHandle
 * and the same DZ_RESIZABLE_KEY injection context.
 */
import { computed, inject, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { DZ_RESIZABLE_KEY } from './DzResizable.types.ts'
import { resizableVariants } from './DzResizable.variants.ts'

const props = withDefaults(defineProps<DzSplitterHandleProps>(), {
  withHandle: false,
  disabled: false,
})

defineSlots<DzSplitterHandleSlots>()

const attrs = useAttrs()
const resizableContext = inject(DZ_RESIZABLE_KEY, null)

const direction = computed(() => resizableContext?.direction.value ?? 'horizontal')

const styles = computed(() =>
  resizableVariants({
    direction: direction.value,
    size: resizableContext?.size.value ?? 'md',
  }),
)

const classes = computed(() =>
  cn(styles.value.handle(), attrs.class as string | undefined),
)
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <SplitterResizeHandle
    :disabled="props.disabled"
    :class="classes"
    :data-direction="direction"
    :data-disabled="props.disabled ? '' : undefined"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <slot>
      <div v-if="withHandle" :class="styles.handleIndicator()">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          class="h-2.5 w-2.5"
          aria-hidden="true"
        >
          <circle cx="12" cy="5" r="1" />
          <circle cx="12" cy="12" r="1" />
          <circle cx="12" cy="19" r="1" />
        </svg>
      </div>
    </slot>
  </SplitterResizeHandle>
</template>
