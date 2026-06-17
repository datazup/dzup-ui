<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

import type { DzAffixEmits, DzAffixProps, DzAffixSlots } from './DzAffix.types.ts'
/**
 * DzAffix — Pins its slotted content to the viewport once it would scroll past
 * a threshold.
 *
 * The root element stays in normal flow and acts as a size placeholder, so
 * pinning never causes a layout shift. Content semantics, focus, and tab order
 * are unchanged — only `position: fixed` is applied while affixed (ADR-04: no
 * raw colors, token-driven stacking via `--dz-affix-z-index`).
 *
 * @example
 * ```vue
 * <DzAffix :offset-top="16" @change="onAffix">
 *   <DzToolbar>…</DzToolbar>
 * </DzAffix>
 * ```
 */
import { computed, useAttrs } from 'vue'
import { useAffix } from '../../composables/useAffix/useAffix.ts'
import { cn } from '../../utilities/cn.ts'

const props = withDefaults(defineProps<DzAffixProps>(), {})

const emit = defineEmits<DzAffixEmits>()

defineSlots<DzAffixSlots>()

const attrs = useAttrs()

const { affixed, setRootRef, rootStyle, contentStyle } = useAffix({
  offsetTop: () => props.offsetTop,
  offsetBottom: () => props.offsetBottom,
  target: () => props.target?.() ?? null,
  onChange: value => emit('change', value),
})

/** Bind through an app-local function ref to avoid cross-workspace Vue type skew. */
function setAffixRootRef(el: unknown): void {
  setRootRef(el as Element | null)
}

const classes = computed(() =>
  cn(attrs.class as string | undefined),
)
</script>

<template>
  <div
    :id="id"
    :ref="setAffixRootRef"
    :class="classes"
    :style="rootStyle"
    :data-affixed="affixed ? '' : undefined"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <!--
      The root must NOT use `contain: layout` — it would become the containing
      block for the fixed child and break viewport-relative pinning.
    -->
    <div :style="contentStyle">
      <slot :affixed="affixed" />
    </div>
  </div>
</template>
