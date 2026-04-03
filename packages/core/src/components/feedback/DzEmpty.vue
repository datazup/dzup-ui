<script setup lang="ts">
import type { DzEmptyProps, DzEmptySlots } from './DzEmpty.types.ts'
/**
 * DzEmpty — Empty state placeholder component.
 *
 * Displays a centered message with optional icon, title, description,
 * and action buttons when content is unavailable or a list is empty.
 *
 * @example
 * ```vue
 * <DzEmpty
 *   title="No results found"
 *   description="Try adjusting your search criteria."
 *   :icon="SearchIcon"
 * >
 *   <template #actions>
 *     <DzButton @click="reset">Clear filters</DzButton>
 *   </template>
 * </DzEmpty>
 * ```
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { emptyVariants } from './DzEmpty.variants.ts'

defineProps<DzEmptyProps>()
defineSlots<DzEmptySlots>()

const attrs = useAttrs()
const styles = computed(() => emptyVariants())

const rootClasses = computed(() =>
  cn(styles.value.root(), attrs.class as string | undefined),
)
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <div
    :id="id"
    :class="rootClasses"
    data-state="ready"
    role="status"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <slot>
      <!-- Icon -->
      <div v-if="icon || $slots.icon" :class="styles.icon()">
        <slot name="icon">
          <component
            :is="icon"
            class="h-12 w-12"
            aria-hidden="true"
          />
        </slot>
      </div>

      <!-- Title -->
      <p v-if="title" :class="styles.title()">
        {{ title }}
      </p>

      <!-- Description -->
      <p v-if="description" :class="styles.description()">
        {{ description }}
      </p>
    </slot>

    <!-- Actions -->
    <div v-if="$slots.actions" :class="styles.actions()">
      <slot name="actions" />
    </div>
  </div>
</template>
