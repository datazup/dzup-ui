<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

import type { CSSProperties } from 'vue'
import type {
  DescriptionsColumns,
  DescriptionsResponsiveColumns,
  DzDescriptionsContext,
  DzDescriptionsProps,
  DzDescriptionsSlots,
} from './DzDescriptions.types.ts'
/**
 * DzDescriptions — read-only label/value detail grid.
 *
 * Renders as a definition list (`<dl>` with `<dt>`/`<dd>` pairs grouped in
 * `<div>` wrappers, which is valid HTML5) so the label↔value relationship is
 * exposed to assistive technology. Supports horizontal/vertical layout, a
 * bordered table-like style, density sizes, responsive columns, and per-entry
 * column spans. Slot-rich values compose via DzDescriptionsItem children, which
 * inherit size / layout / bordered via provide/inject (ADR-08).
 *
 * @example
 * ```vue
 * <DzDescriptions
 *   :columns="{ base: 1, md: 3 }"
 *   bordered
 *   :items="[
 *     { label: 'Name', value: 'Ada Lovelace' },
 *     { label: 'Role', value: 'Engineer' },
 *     { label: 'Bio', value: '…', span: 2 },
 *   ]"
 * />
 * ```
 */
import { computed, provide, toRef, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { DZ_DESCRIPTIONS_KEY } from './DzDescriptions.types.ts'
import { descriptionsVariants } from './DzDescriptions.variants.ts'

const props = withDefaults(defineProps<DzDescriptionsProps>(), {
  items: undefined,
  columns: 3,
  layout: 'horizontal',
  bordered: false,
  size: 'md',
})

defineSlots<DzDescriptionsSlots>()

const attrs = useAttrs()

// Share density context with DzDescriptionsItem children (ADR-08)
const context: DzDescriptionsContext = {
  size: toRef(() => props.size),
  layout: toRef(() => props.layout),
  bordered: toRef(() => props.bordered),
}
provide(DZ_DESCRIPTIONS_KEY, context)

const styles = computed(() =>
  descriptionsVariants({
    layout: props.layout,
    size: props.size,
    bordered: props.bordered,
  }),
)

/** Expand a column spec into a mobile-first set of breakpoint counts. */
function resolveColumns(columns: DescriptionsColumns): Required<DescriptionsResponsiveColumns> {
  if (typeof columns === 'number') {
    const n = Math.max(1, columns)
    return { base: n, sm: n, md: n, lg: n, xl: n }
  }
  const base = Math.max(1, columns.base ?? 1)
  const sm = columns.sm ?? base
  const md = columns.md ?? sm
  const lg = columns.lg ?? md
  const xl = columns.xl ?? lg
  return { base, sm, md, lg, xl }
}

const cols = computed(() => resolveColumns(props.columns))

const rootStyle = computed<CSSProperties>(() => ({
  'contain': 'layout style',
  '--dz-descriptions-cols-base': String(cols.value.base),
  '--dz-descriptions-cols-sm': String(cols.value.sm),
  '--dz-descriptions-cols-md': String(cols.value.md),
  '--dz-descriptions-cols-lg': String(cols.value.lg),
  '--dz-descriptions-cols-xl': String(cols.value.xl),
}))

/** Grid-column span style for an entry (only when spanning > 1). */
function spanStyle(span?: number): CSSProperties | undefined {
  const s = Math.max(1, span ?? 1)
  return s > 1 ? { gridColumn: `span ${s}` } : undefined
}

const rootClasses = computed(() =>
  cn(styles.value.root(), attrs.class as string | undefined),
)
</script>

<template>
  <dl
    :id="id"
    :class="rootClasses"
    :style="rootStyle"
    :data-layout="layout"
    :data-size="size"
    :data-bordered="bordered ? '' : undefined"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    :aria-describedby="ariaDescribedby"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <!-- Declarative entries via the `items` prop -->
    <template v-if="items">
      <div
        v-for="(item, index) in items"
        :key="index"
        :class="styles.group()"
        :style="spanStyle(item.span)"
      >
        <dt :class="styles.term()">
          {{ item.label }}
        </dt>
        <dd :class="styles.detail()">
          {{ item.value }}
        </dd>
      </div>
    </template>

    <!-- Composed DzDescriptionsItem children -->
    <slot v-else />
  </dl>
</template>
