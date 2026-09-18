<script setup lang="ts">
import type { DzGridItemProps, DzGridItemSlots, GridSpan } from './DzGrid.types.ts'
/**
 * DzGridItem — a `DzGrid` child that says how many columns it occupies.
 *
 * The span is a typed prop rather than a raw `col-span-*` class on the child
 * (TASK-R3-O3, decision D67), so a form renderer's "this field takes six of
 * twelve columns" is an API rather than a class name it has to look up. Classes
 * come from a literal per-breakpoint table, so Tailwind's scanner emits every
 * one of them.
 *
 * Renders one element and nothing else: no `data-part` (it follows its Tier A
 * parent, which declares no anatomy), no provide/inject, no DOM read — the same
 * output on the server and the client. A span is writing-mode relative, so it
 * mirrors under `dir="rtl"` with nothing to configure.
 *
 * @example
 * ```vue
 * <DzGrid :cols="{ sm: 1, md: 12 }">
 *   <DzGridItem :span="{ md: 6 }"><DzInput /></DzGridItem>
 *   <DzGridItem :span="{ md: 6 }"><DzInput /></DzGridItem>
 *   <DzGridItem span="full"><DzTextarea /></DzGridItem>
 * </DzGrid>
 * ```
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { gridItemSpanMap } from './DzGrid.variants.ts'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DzGridItemProps>(), {
  span: undefined,
  as: 'div',
})

defineSlots<DzGridItemSlots>()

const attrs = useAttrs()

/** Clamp a numeric span into 1–12; `'full'` passes through. */
function normalise(span: GridSpan): GridSpan {
  if (span === 'full')
    return span
  const n = Math.trunc(Number(span))
  if (!Number.isFinite(n))
    return 1
  return Math.min(12, Math.max(1, n)) as GridSpan
}

const BREAKPOINTS = ['base', 'sm', 'md', 'lg'] as const

/** The span classes, one per breakpoint that was given. */
const spanClasses = computed(() => {
  const span = props.span
  if (span === undefined || span === null)
    return ''
  if (typeof span !== 'object')
    return gridItemSpanMap.base[normalise(span)]
  const classes: string[] = []
  for (const bp of BREAKPOINTS) {
    const value = span[bp]
    if (value !== undefined)
      classes.push(gridItemSpanMap[bp][normalise(value)])
  }
  return classes.join(' ')
})

/** Merged class string using cn() (ADR-10) — a consumer class still wins. */
const classes = computed(() => cn(spanClasses.value, attrs.class as string | undefined) || undefined)
</script>

<template>
  <component
    :is="as"
    :class="classes"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <slot />
  </component>
</template>
